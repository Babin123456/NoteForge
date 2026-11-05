from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import List, Optional
import os
import uuid
import shutil
import json
from datetime import datetime

from app.core.config import settings
from app.storage.database import db
from app.services.pdf_processor import PDFProcessor
from app.services.generator_service import GeneratorService

router = APIRouter(prefix="/documents", tags=["documents"])

def process_document_background(doc_id: str, file_path: str, filename: str):
    try:
        # Extract text & metadata using PyMuPDF
        extracted = PDFProcessor.extract_metadata_and_text(file_path)
        
        # Save extracted text to a text file for fast retrieval
        text_filename = f"{doc_id}_extracted.txt"
        text_path = os.path.join(settings.UPLOAD_DIR, text_filename)
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(extracted["full_text"])
            
        page_count = extracted["page_count"]
        # Basic auto-topics detection
        words = extracted["full_text"].split()
        sample_topics = ["General Learning", "Lecture Notes"]
        
        now = datetime.now().isoformat()
        db.execute_commit(
            """
            UPDATE documents 
            SET page_count = ?, extracted_text_path = ?, processed_status = 'completed', 
                topics = ?, updated_at = ?
            WHERE id = ?
            """,
            (page_count, text_path, json.dumps(sample_topics), now, doc_id)
        )
    except Exception as e:
        now = datetime.now().isoformat()
        db.execute_commit(
            "UPDATE documents SET processed_status = 'error', updated_at = ? WHERE id = ?",
            (now, doc_id)
        )

@router.get("/")
def list_documents(collection: Optional[str] = None):
    if collection and collection != "All":
        rows = db.execute_query("SELECT * FROM documents WHERE collection = ? ORDER BY created_at DESC", (collection,))
    else:
        rows = db.execute_query("SELECT * FROM documents ORDER BY created_at DESC")
    
    docs = []
    for r in rows:
        item = dict(r)
        item["topics"] = json.loads(item["topics"]) if item.get("topics") else []
        docs.append(item)
    return docs

@router.get("/{document_id}")
def get_document(document_id: str):
    rows = db.execute_query("SELECT * FROM documents WHERE id = ?", (document_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = dict(rows[0])
    doc["topics"] = json.loads(doc["topics"]) if doc.get("topics") else []
    
    # Load extracted text preview if available
    text_content = ""
    if doc.get("extracted_text_path") and os.path.exists(doc["extracted_text_path"]):
        with open(doc["extracted_text_path"], "r", encoding="utf-8") as f:
            text_content = f.read()
    doc["full_text"] = text_content
    return doc

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    collection: Optional[str] = Form("General")
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    doc_id = str(uuid.uuid4())
    stored_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)
    
    # Write to local disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)
    now = datetime.now().isoformat()
    doc_title = title.strip() if title and title.strip() else os.path.splitext(file.filename)[0]
    
    db.execute_commit(
        """
        INSERT INTO documents (
            id, title, filename, file_path, file_size, collection, 
            processed_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'processing', ?, ?)
        """,
        (doc_id, doc_title, file.filename, file_path, file_size, collection or "General", now, now)
    )
    
    # Process PDF in background
    background_tasks.add_task(process_document_background, doc_id, file_path, file.filename)
    
    return {
        "id": doc_id,
        "title": doc_title,
        "filename": file.filename,
        "file_size": file_size,
        "collection": collection,
        "status": "processing"
    }

@router.put("/{document_id}")
def update_document(document_id: str, payload: dict):
    title = payload.get("title")
    collection = payload.get("collection")
    now = datetime.now().isoformat()
    
    if title and collection:
        db.execute_commit("UPDATE documents SET title = ?, collection = ?, updated_at = ? WHERE id = ?", (title, collection, now, document_id))
    elif title:
        db.execute_commit("UPDATE documents SET title = ?, updated_at = ? WHERE id = ?", (title, now, document_id))
    elif collection:
        db.execute_commit("UPDATE documents SET collection = ?, updated_at = ? WHERE id = ?", (collection, now, document_id))
        
    return {"message": "Document updated successfully"}

@router.delete("/{document_id}")
def delete_document(document_id: str):
    rows = db.execute_query("SELECT * FROM documents WHERE id = ?", (document_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = rows[0]
    
    # Delete files on disk
    if os.path.exists(doc["file_path"]):
        try:
            os.remove(doc["file_path"])
        except Exception:
            pass
    if doc["extracted_text_path"] and os.path.exists(doc["extracted_text_path"]):
        try:
            os.remove(doc["extracted_text_path"])
        except Exception:
            pass
            
    db.execute_commit("DELETE FROM documents WHERE id = ?", (document_id,))
    return {"message": "Document deleted successfully"}

@router.post("/{document_id}/reprocess")
def reprocess_document(document_id: str, background_tasks: BackgroundTasks):
    rows = db.execute_query("SELECT * FROM documents WHERE id = ?", (document_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = rows[0]
    
    db.execute_commit("UPDATE documents SET processed_status = 'processing' WHERE id = ?", (document_id,))
    background_tasks.add_task(process_document_background, document_id, doc["file_path"], doc["filename"])
    return {"message": "Document queued for reprocessing"}
