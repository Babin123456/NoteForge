from fastapi import APIRouter, HTTPException
from typing import Optional
import os
import json
from datetime import datetime, timedelta

from app.storage.database import db
from app.services.generator_service import GeneratorService

router = APIRouter(prefix="/generator", tags=["generator"])

@router.post("/flashcards")
async def generate_flashcards(payload: dict):
    document_id = payload.get("document_id")
    count = payload.get("count", 8)
    model = payload.get("model")
    
    rows = db.execute_query("SELECT * FROM documents WHERE id = ?", (document_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = rows[0]
    
    # Read text
    text_content = ""
    if doc["extracted_text_path"] and os.path.exists(doc["extracted_text_path"]):
        with open(doc["extracted_text_path"], "r", encoding="utf-8") as f:
            text_content = f.read()
    else:
        raise HTTPException(status_code=400, detail="Document text has not been processed yet")
        
    cards = await GeneratorService.generate_flashcards(document_id, text_content, count=count, model=model)
    
    now = datetime.now().isoformat()
    # Save cards into DB
    for c in cards:
        db.execute_commit(
            """
            INSERT INTO flashcards (
                id, document_id, front, back, card_type, difficulty, topic, 
                is_bookmarked, status, review_count, repetition_interval, ease_factor, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                c["id"], c["document_id"], c["front"], c["back"], c["card_type"], c["difficulty"],
                c["topic"], c["is_bookmarked"], c["status"], c["review_count"],
                c["repetition_interval"], c["ease_factor"], now
            )
        )
        
    # Update document timestamp
    db.execute_commit("UPDATE documents SET last_studied_at = ? WHERE id = ?", (now, document_id))
    
    return {"generated_count": len(cards), "cards": cards}

@router.post("/quiz")
async def generate_quiz(payload: dict):
    document_id = payload.get("document_id")
    question_count = payload.get("count", 5)
    difficulty = payload.get("difficulty", "medium")
    model = payload.get("model")
    
    rows = db.execute_query("SELECT * FROM documents WHERE id = ?", (document_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = rows[0]
    
    text_content = ""
    if doc["extracted_text_path"] and os.path.exists(doc["extracted_text_path"]):
        with open(doc["extracted_text_path"], "r", encoding="utf-8") as f:
            text_content = f.read()
    else:
        raise HTTPException(status_code=400, detail="Document text has not been extracted yet")
        
    quiz_data = await GeneratorService.generate_quiz(
        document_id=document_id,
        title=doc["title"],
        context_text=text_content,
        question_count=question_count,
        difficulty=difficulty,
        model=model
    )
    
    now = datetime.now().isoformat()
    # Save quiz header
    db.execute_commit(
        "INSERT INTO quizzes (id, document_id, title, difficulty, times_taken, created_at) VALUES (?, ?, ?, ?, 0, ?)",
        (quiz_data["id"], document_id, quiz_data["title"], difficulty, now)
    )
    
    # Save questions
    for q in quiz_data["questions"]:
        db.execute_commit(
            """
            INSERT INTO quiz_questions (id, quiz_id, question, question_type, options, correct_answer, explanation, difficulty, topic)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (q["id"], quiz_data["id"], q["question"], q["question_type"], json.dumps(q["options"]), q["correct_answer"], q["explanation"], q["difficulty"], q["topic"])
        )
        
    db.execute_commit("UPDATE documents SET last_studied_at = ? WHERE id = ?", (now, document_id))
    return quiz_data

@router.post("/smart-notes")
async def generate_smart_notes(payload: dict):
    document_id = payload.get("document_id")
    model = payload.get("model")
    
    rows = db.execute_query("SELECT * FROM documents WHERE id = ?", (document_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = rows[0]
    
    text_content = ""
    if doc["extracted_text_path"] and os.path.exists(doc["extracted_text_path"]):
        with open(doc["extracted_text_path"], "r", encoding="utf-8") as f:
            text_content = f.read()
    else:
        raise HTTPException(status_code=400, detail="Document text has not been extracted yet")
        
    note_data = await GeneratorService.generate_smart_notes(
        document_id=document_id,
        title=doc["title"],
        context_text=text_content,
        model=model
    )
    
    now = datetime.now().isoformat()
    db.execute_commit(
        """
        INSERT INTO smart_notes (id, document_id, title, summary, sections, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (note_data["id"], document_id, note_data["title"], note_data["summary"], json.dumps(note_data["sections"]), now, now)
    )
    
    # Update document summary
    db.execute_commit("UPDATE documents SET summary = ?, last_studied_at = ? WHERE id = ?", (note_data["summary"], now, document_id))
    
    return note_data
