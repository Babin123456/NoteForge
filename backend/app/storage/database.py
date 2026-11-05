import sqlite3
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os
from app.core.config import settings

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Documents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        extracted_text_path TEXT,
        file_size INTEGER NOT NULL,
        page_count INTEGER DEFAULT 0,
        collection TEXT DEFAULT 'General',
        processed_status TEXT DEFAULT 'pending',
        summary TEXT,
        topics TEXT, -- JSON array
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_studied_at TEXT
    )
    """)
    
    # Flashcards table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        card_type TEXT DEFAULT 'concept',
        difficulty TEXT DEFAULT 'medium',
        topic TEXT,
        is_bookmarked INTEGER DEFAULT 0,
        status TEXT DEFAULT 'new',
        review_count INTEGER DEFAULT 0,
        repetition_interval INTEGER DEFAULT 1,
        ease_factor REAL DEFAULT 2.5,
        next_review_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)
    
    # Quizzes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        title TEXT NOT NULL,
        difficulty TEXT DEFAULT 'medium',
        times_taken INTEGER DEFAULT 0,
        highest_score REAL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)
    
    # Quiz questions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        question TEXT NOT NULL,
        question_type TEXT DEFAULT 'multiple_choice',
        options TEXT NOT NULL, -- JSON array
        correct_answer TEXT NOT NULL,
        explanation TEXT NOT NULL,
        difficulty TEXT DEFAULT 'medium',
        topic TEXT,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
    )
    """)
    
    # Quiz Results table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_results (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        accuracy_percentage REAL NOT NULL,
        time_taken_seconds INTEGER NOT NULL,
        breakdown TEXT NOT NULL, -- JSON detailed responses
        created_at TEXT NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
    )
    """)
    
    # Smart Notes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS smart_notes (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        sections TEXT NOT NULL, -- JSON structured sections
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)
    
    # Study Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY,
        session_type TEXT NOT NULL,
        document_id TEXT,
        item_count INTEGER NOT NULL,
        duration_seconds INTEGER NOT NULL,
        accuracy_percentage REAL,
        created_at TEXT NOT NULL
    )
    """)
    
    # App Settings / Preferences table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

class DatabaseManager:
    @staticmethod
    def execute_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        conn.close()
        return result

    @staticmethod
    def execute_commit(query: str, params: tuple = ()) -> int:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        last_id = cursor.lastrowid
        conn.close()
        return last_id

    @staticmethod
    def execute_many(query: str, params_list: List[tuple]) -> None:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.executemany(query, params_list)
        conn.commit()
        conn.close()

db = DatabaseManager()
