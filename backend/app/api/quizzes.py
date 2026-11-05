from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime

from app.storage.database import db
from app.models.schemas import QuizSubmission, QuizResult

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

@router.get("/")
def list_quizzes(document_id: Optional[str] = None):
    query = "SELECT q.*, (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count FROM quizzes q"
    params = []
    if document_id:
        query += " WHERE q.document_id = ?"
        params.append(document_id)
    query += " ORDER BY q.created_at DESC"
    rows = db.execute_query(query, tuple(params))
    return [dict(r) for r in rows]

@router.get("/{quiz_id}")
def get_quiz(quiz_id: str):
    rows = db.execute_query("SELECT * FROM quizzes WHERE id = ?", (quiz_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz = dict(rows[0])
    
    # Get questions
    q_rows = db.execute_query("SELECT * FROM quiz_questions WHERE quiz_id = ?", (quiz_id,))
    questions = []
    for qr in q_rows:
        item = dict(qr)
        item["options"] = json.loads(item["options"]) if item.get("options") else []
        questions.append(item)
    quiz["questions"] = questions
    return quiz

@router.post("/{quiz_id}/submit")
def submit_quiz(quiz_id: str, submission: QuizSubmission):
    rows = db.execute_query("SELECT * FROM quizzes WHERE id = ?", (quiz_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz = dict(rows[0])
    
    q_rows = db.execute_query("SELECT * FROM quiz_questions WHERE quiz_id = ?", (quiz_id,))
    questions_map = {r["id"]: dict(r) for r in q_rows}
    
    score = 0
    total = len(q_rows)
    breakdown = []
    
    # User submission answers list of {question_id: ..., selected_answer: ...}
    user_answers_map = {a.get("question_id"): a.get("selected_answer") for a in submission.answers}
    
    for q_id, q_data in questions_map.items():
        user_ans = user_answers_map.get(q_id, "")
        correct_ans = q_data["correct_answer"]
        is_correct = (user_ans.strip().lower() == correct_ans.strip().lower())
        if is_correct:
            score += 1
            
        breakdown.append({
            "question_id": q_id,
            "question_text": q_data["question"],
            "user_answer": user_ans,
            "correct_answer": correct_ans,
            "is_correct": is_correct,
            "explanation": q_data["explanation"],
            "topic": q_data.get("topic") or "General"
        })
        
    accuracy = round((score / total) * 100, 1) if total > 0 else 0.0
    result_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    # Save quiz result
    db.execute_commit(
        """
        INSERT INTO quiz_results (
            id, quiz_id, score, total_questions, accuracy_percentage, 
            time_taken_seconds, breakdown, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (result_id, quiz_id, score, total, accuracy, submission.time_taken_seconds, json.dumps(breakdown), now)
    )
    
    # Update quiz stats
    highest = max(quiz.get("highest_score") or 0.0, accuracy)
    times = (quiz.get("times_taken") or 0) + 1
    db.execute_commit("UPDATE quizzes SET times_taken = ?, highest_score = ? WHERE id = ?", (times, highest, quiz_id))
    
    # Update document last_studied_at
    db.execute_commit("UPDATE documents SET last_studied_at = ? WHERE id = ?", (now, quiz["document_id"]))
    
    # Log study session
    db.execute_commit(
        """
        INSERT INTO study_sessions (id, session_type, document_id, item_count, duration_seconds, accuracy_percentage, created_at)
        VALUES (?, 'quiz', ?, ?, ?, ?, ?)
        """,
        (str(uuid.uuid4()), quiz["document_id"], total, submission.time_taken_seconds, accuracy, now)
    )
    
    return {
        "id": result_id,
        "quiz_id": quiz_id,
        "score": score,
        "total_questions": total,
        "accuracy_percentage": accuracy,
        "time_taken_seconds": submission.time_taken_seconds,
        "breakdown": breakdown,
        "created_at": now
    }

@router.get("/{quiz_id}/history")
def get_quiz_history(quiz_id: str):
    rows = db.execute_query("SELECT * FROM quiz_results WHERE quiz_id = ? ORDER BY created_at DESC", (quiz_id,))
    results = []
    for r in rows:
        item = dict(r)
        item["breakdown"] = json.loads(item["breakdown"]) if item.get("breakdown") else []
        results.append(item)
    return results

@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: str):
    db.execute_commit("DELETE FROM quizzes WHERE id = ?", (quiz_id,))
    return {"message": "Quiz deleted"}
