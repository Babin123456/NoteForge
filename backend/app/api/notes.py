from fastapi import APIRouter, HTTPException
from typing import List, Optional
import json
import uuid
from datetime import datetime

from app.storage.database import db

router = APIRouter(prefix="/notes", tags=["notes"])

@router.get("/")
def list_notes(document_id: Optional[str] = None):
    query = "SELECT n.*, d.title as doc_title FROM smart_notes n JOIN documents d ON n.document_id = d.id"
    params = []
    if document_id:
        query += " WHERE n.document_id = ?"
        params.append(document_id)
    query += " ORDER BY n.created_at DESC"
    rows = db.execute_query(query, tuple(params))
    notes = []
    for r in rows:
        item = dict(r)
        item["sections"] = json.loads(item["sections"]) if item.get("sections") else []
        notes.append(item)
    return notes

@router.get("/{note_id}")
def get_note(note_id: str):
    rows = db.execute_query(
        "SELECT n.*, d.title as doc_title FROM smart_notes n JOIN documents d ON n.document_id = d.id WHERE n.id = ?",
        (note_id,)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Smart notes not found")
    item = dict(rows[0])
    item["sections"] = json.loads(item["sections"]) if item.get("sections") else []
    return item

@router.delete("/{note_id}")
def delete_note(note_id: str):
    db.execute_commit("DELETE FROM smart_notes WHERE id = ?", (note_id,))
    return {"message": "Smart notes deleted"}
