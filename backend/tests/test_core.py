import pytest
import os
import json
import fitz
from app.services.pdf_processor import PDFProcessor
from app.services.generator_service import GeneratorService
from app.storage.database import init_db, db

def test_database_init():
    init_db()
    rows = db.execute_query("SELECT name FROM sqlite_master WHERE type='table'")
    table_names = [r["name"] for r in rows]
    assert "documents" in table_names
    assert "flashcards" in table_names
    assert "quizzes" in table_names
    assert "quiz_questions" in table_names
    assert "smart_notes" in table_names
    assert "study_sessions" in table_names

def test_pdf_creation_and_extraction(tmp_path):
    pdf_file = tmp_path / "sample_lecture.pdf"
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Distributed Systems Architecture and Raft Consensus.")
    page.insert_text((50, 100), "Raft is defined as a consensus algorithm designed for state machine replication.")
    page.insert_text((50, 130), "Leader Election: If a follower receives no communication, it becomes a candidate.")
    page.insert_text((50, 160), "Log Replication: The leader accepts log entries from clients and broadcasts them.")
    doc.save(str(pdf_file))
    doc.close()

    result = PDFProcessor.extract_metadata_and_text(str(pdf_file))
    assert result["page_count"] == 1
    assert "Distributed Systems Architecture" in result["full_text"]
    assert "Raft is defined as" in result["full_text"]

@pytest.mark.asyncio
async def test_grounded_heuristic_flashcard_generation():
    text = (
        "Distributed Hash Tables: A decentralized storage system that provides a lookup service similar to a hash table.\n\n"
        "Consistent Hashing is a distributed hashing scheme that operates independently of the number of servers.\n\n"
        "Byzantine Fault Tolerance: The dependability of a fault-tolerant system where components may fail and provide imperfect information."
    )
    cards = await GeneratorService.generate_flashcards(
        document_id="test_doc_1",
        context_text=text,
        count=3
    )
    assert len(cards) >= 1
    assert any("Distributed Hash Tables" in c["front"] or "Consistent Hashing" in c["front"] for c in cards)
    assert cards[0]["document_id"] == "test_doc_1"

@pytest.mark.asyncio
async def test_grounded_quiz_generation():
    text = (
        "Paxos is a family of protocols for solving consensus in a network of unreliable processors.\n\n"
        "The safety properties of Paxos require that only a proposed value may be chosen and only a single value is chosen."
    )
    quiz_data = await GeneratorService.generate_quiz(
        document_id="test_doc_2",
        title="Paxos Protocol",
        context_text=text,
        question_count=2
    )
    assert quiz_data["document_id"] == "test_doc_2"
    assert len(quiz_data["questions"]) >= 1
    for q in quiz_data["questions"]:
        assert q["correct_answer"] != ""
        assert len(q["options"]) > 0
        assert q["explanation"] != ""

@pytest.mark.asyncio
async def test_smart_notes_generation():
    text = (
        "Machine Learning Optimization Principles.\n\n"
        "Gradient Descent is an optimization algorithm used to minimize loss functions.\n\n"
        "Stochastic Gradient Descent computes the gradient on random mini-batches for faster iteration."
    )
    notes = await GeneratorService.generate_smart_notes(
        document_id="test_doc_3",
        title="ML Optimization",
        context_text=text
    )
    assert notes["document_id"] == "test_doc_3"
    assert len(notes["summary"]) > 20
    assert len(notes["sections"]) > 0
