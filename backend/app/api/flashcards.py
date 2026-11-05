from fastapi import APIRouter, HTTPException
from typing import List, Optional
import json
import uuid
from datetime import datetime, timedelta

from app.storage.database import db
from app.models.schemas import Flashcard

router = APIRouter(prefix="/flashcards", tags=["flashcards"])

@router.get("/")
def get_flashcards(document_id: Optional[str] = None, status: Optional[str] = None, bookmarked: Optional[bool] = None):
    query = "SELECT * FROM flashcards WHERE 1=1"
    params = []
    
    if document_id:
        query += " AND document_id = ?"
        params.append(document_id)
    if status:
        query += " AND status = ?"
        params.append(status)
    if bookmarked is not None:
        query += " AND is_bookmarked = ?"
        params.append(1 if bookmarked else 0)
        
    query += " ORDER BY created_at DESC"
    rows = db.execute_query(query, tuple(params))
    return [dict(r) for r in rows]

@router.post("/")
def create_flashcard(payload: dict):
    card_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    db.execute_commit(
        """
        INSERT INTO flashcards (
            id, document_id, front, back, card_type, difficulty, topic, 
            is_bookmarked, status, review_count, repetition_interval, ease_factor, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            card_id,
            payload.get("document_id"),
            payload.get("front"),
            payload.get("back"),
            payload.get("card_type", "concept"),
            payload.get("difficulty", "medium"),
            payload.get("topic", "General"),
            1 if payload.get("is_bookmarked") else 0,
            payload.get("status", "new"),
            payload.get("review_count", 0),
            payload.get("repetition_interval", 1),
            payload.get("ease_factor", 2.5),
            now
        )
    )
    return {"id": card_id, "message": "Flashcard created"}

@router.put("/{card_id}/review")
def review_flashcard(card_id: str, payload: dict):
    """
    Spaced repetition update:
    - result: 'known' or 'review'
    """
    rows = db.execute_query("SELECT * FROM flashcards WHERE id = ?", (card_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    card = dict(rows[0])
    
    result = payload.get("result", "known") # 'known' or 'review'
    review_count = card["review_count"] + 1
    current_interval = card["repetition_interval"]
    ease_factor = card["ease_factor"]
    
    if result == "known":
        status = "known"
        if review_count == 1:
            next_interval = 1
        elif review_count == 2:
            next_interval = 3
        else:
            next_interval = max(1, int(current_interval * ease_factor))
        ease_factor = min(3.0, ease_factor + 0.1)
    else:
        status = "review"
        next_interval = 1
        ease_factor = max(1.3, ease_factor - 0.2)
        
    next_review_at = (datetime.now() + timedelta(days=next_interval)).isoformat()
    
    db.execute_commit(
        """
        UPDATE flashcards 
        SET status = ?, review_count = ?, repetition_interval = ?, ease_factor = ?, next_review_at = ?
        WHERE id = ?
        """,
        (status, review_count, next_interval, ease_factor, next_review_at, card_id)
    )
    
    # Record study session
    db.execute_commit(
        """
        INSERT INTO study_sessions (id, session_type, document_id, item_count, duration_seconds, accuracy_percentage, created_at)
        VALUES (?, 'flashcards', ?, 1, 15, ?, ?)
        """,
        (str(uuid.uuid4()), card["document_id"], 100.0 if result == "known" else 0.0, datetime.now().isoformat())
    )
    
    return {
        "id": card_id,
        "status": status,
        "review_count": review_count,
        "repetition_interval": next_interval,
        "next_review_at": next_review_at
    }

@router.put("/{card_id}/bookmark")
def toggle_bookmark(card_id: str):
    rows = db.execute_query("SELECT is_bookmarked FROM flashcards WHERE id = ?", (card_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    current_val = rows[0]["is_bookmarked"]
    new_val = 0 if current_val == 1 else 1
    db.execute_commit("UPDATE flashcards SET is_bookmarked = ? WHERE id = ?", (new_val, card_id))
    return {"id": card_id, "is_bookmarked": bool(new_val)}

@router.delete("/{card_id}")
def delete_flashcard(card_id: str):
    db.execute_commit("DELETE FROM flashcards WHERE id = ?", (card_id,))
    return {"message": "Flashcard deleted"}
