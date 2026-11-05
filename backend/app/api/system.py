from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, PlainTextResponse
import json
import os
import shutil
from datetime import datetime

from app.core.config import settings
from app.storage.database import db
from app.services.ollama_service import ollama_client

router = APIRouter(prefix="/system", tags=["system"])

@router.get("/status")
async def get_system_status():
    ollama_info = await ollama_client.check_health()
    models = await ollama_client.list_models()
    
    # Check disk usage
    db_size = os.path.getsize(settings.DB_PATH) if os.path.exists(settings.DB_PATH) else 0
    uploads_size = sum(os.path.getsize(os.path.join(settings.UPLOAD_DIR, f)) for f in os.listdir(settings.UPLOAD_DIR)) if os.path.exists(settings.UPLOAD_DIR) else 0
    
    return {
        "ollama": ollama_info,
        "available_models": models,
        "active_model": settings.DEFAULT_MODEL,
        "storage": {
            "db_size_bytes": db_size,
            "uploads_size_bytes": uploads_size,
            "total_size_mb": round((db_size + uploads_size) / (1024 * 1024), 2)
        }
    }

@router.post("/set-model")
def set_active_model(payload: dict):
    model_name = payload.get("model")
    if not model_name:
        raise HTTPException(status_code=400, detail="Model name required")
    settings.DEFAULT_MODEL = model_name
    db.execute_commit("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('default_model', ?)", (model_name,))
    return {"message": "Active model updated", "model": model_name}

@router.get("/export/all")
def export_full_backup():
    """Exports full database as structured JSON backup."""
    docs = db.execute_query("SELECT * FROM documents")
    flashcards = db.execute_query("SELECT * FROM flashcards")
    quizzes = db.execute_query("SELECT * FROM quizzes")
    quiz_questions = db.execute_query("SELECT * FROM quiz_questions")
    quiz_results = db.execute_query("SELECT * FROM quiz_results")
    smart_notes = db.execute_query("SELECT * FROM smart_notes")
    study_sessions = db.execute_query("SELECT * FROM study_sessions")
    
    backup_data = {
        "app": "NoteForge",
        "version": "1.0.0",
        "exported_at": datetime.now().isoformat(),
        "documents": [dict(d) for d in docs],
        "flashcards": [dict(f) for f in flashcards],
        "quizzes": [dict(q) for q in quizzes],
        "quiz_questions": [dict(qq) for qq in quiz_questions],
        "quiz_results": [dict(qr) for qr in quiz_results],
        "smart_notes": [dict(n) for n in smart_notes],
        "study_sessions": [dict(s) for s in study_sessions]
    }
    return backup_data

@router.post("/import/all")
async def import_full_backup(payload: dict):
    """Restores database from structured JSON backup."""
    if payload.get("app") != "NoteForge":
        raise HTTPException(status_code=400, detail="Invalid NoteForge backup payload format.")
        
    for d in payload.get("documents", []):
        db.execute_commit("""
            INSERT OR REPLACE INTO documents 
            (id, title, filename, file_path, extracted_text_path, file_size, page_count, collection, processed_status, summary, topics, created_at, updated_at, last_studied_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            d.get("id"), d.get("title"), d.get("filename"), d.get("file_path"), d.get("extracted_text_path"),
            d.get("file_size", 0), d.get("page_count", 0), d.get("collection", "General"),
            d.get("processed_status", "completed"), d.get("summary"), d.get("topics", "[]"),
            d.get("created_at"), d.get("updated_at"), d.get("last_studied_at")
        ))
        
    for f in payload.get("flashcards", []):
        db.execute_commit("""
            INSERT OR REPLACE INTO flashcards
            (id, document_id, front, back, card_type, difficulty, topic, is_bookmarked, status, review_count, repetition_interval, ease_factor, next_review_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f.get("id"), f.get("document_id"), f.get("front"), f.get("back"), f.get("card_type"), f.get("difficulty"),
            f.get("topic"), f.get("is_bookmarked", 0), f.get("status", "new"), f.get("review_count", 0),
            f.get("repetition_interval", 1), f.get("ease_factor", 2.5), f.get("next_review_at"), f.get("created_at")
        ))
        
    for q in payload.get("quizzes", []):
        db.execute_commit("""
            INSERT OR REPLACE INTO quizzes (id, document_id, title, difficulty, times_taken, highest_score, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (q.get("id"), q.get("document_id"), q.get("title"), q.get("difficulty"), q.get("times_taken", 0), q.get("highest_score"), q.get("created_at")))
        
    for qq in payload.get("quiz_questions", []):
        db.execute_commit("""
            INSERT OR REPLACE INTO quiz_questions (id, quiz_id, question, question_type, options, correct_answer, explanation, difficulty, topic)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (qq.get("id"), qq.get("quiz_id"), qq.get("question"), qq.get("question_type"), qq.get("options"), qq.get("correct_answer"), qq.get("explanation"), qq.get("difficulty"), qq.get("topic")))
        
    return {"message": "Backup restored successfully"}

@router.get("/export/markdown/{note_id}")
def export_note_markdown(note_id: str):
    rows = db.execute_query("SELECT * FROM smart_notes WHERE id = ?", (note_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Note not found")
    note = dict(rows[0])
    sections = json.loads(note["sections"]) if note.get("sections") else []
    
    md_lines = [
        f"# {note['title']}",
        f"*Generated on {note['created_at'][:10]} via NoteForge*",
        "",
        "## Executive Summary",
        note.get("summary", ""),
        ""
    ]
    for s in sections:
        md_lines.append(f"### {s.get('heading', 'Section')}")
        md_lines.append(s.get("content", ""))
        md_lines.append("")
        if s.get("key_points"):
            md_lines.append("**Key Takeaways:**")
            for kp in s["key_points"]:
                md_lines.append(f"- {kp}")
            md_lines.append("")
        if s.get("definitions"):
            md_lines.append("**Definitions:**")
            for df in s["definitions"]:
                md_lines.append(f"- **{df.get('term')}**: {df.get('definition')}")
            md_lines.append("")
        if s.get("exam_tips"):
            md_lines.append("**Exam Tips:**")
            for et in s["exam_tips"]:
                md_lines.append(f"> 💡 {et}")
            md_lines.append("")
            
    return PlainTextResponse(content="\n".join(md_lines), media_type="text/markdown")
