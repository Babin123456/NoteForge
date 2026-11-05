from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Document models
class DocumentBase(BaseModel):
    title: str
    filename: str
    file_size: int
    page_count: int = 0
    collection: Optional[str] = "General"

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: str
    file_path: str
    extracted_text_path: Optional[str] = None
    processed_status: str = "pending"  # pending, processing, completed, error
    summary: Optional[str] = None
    topics: List[str] = []
    created_at: str
    updated_at: str
    last_studied_at: Optional[str] = None

# Flashcard models
class FlashcardBase(BaseModel):
    document_id: str
    front: str
    back: str
    card_type: str = "concept"  # q_and_a, definition, concept, formula, terminology
    difficulty: str = "medium"  # easy, medium, hard
    topic: Optional[str] = None

class FlashcardCreate(FlashcardBase):
    pass

class Flashcard(FlashcardBase):
    id: str
    is_bookmarked: bool = False
    status: str = "new"  # new, known, review
    review_count: int = 0
    repetition_interval: int = 1  # in days
    ease_factor: float = 2.5
    next_review_at: Optional[str] = None
    created_at: str

# Quiz models
class QuizQuestionOption(BaseModel):
    id: str
    text: str

class QuizQuestionBase(BaseModel):
    question: str
    question_type: str = "multiple_choice"  # multiple_choice, true_false, fill_blank, conceptual
    options: List[str] = []
    correct_answer: str
    explanation: str
    difficulty: str = "medium"
    topic: Optional[str] = None

class QuizQuestion(QuizQuestionBase):
    id: str
    quiz_id: str

class QuizBase(BaseModel):
    document_id: str
    title: str
    difficulty: str = "medium"

class Quiz(QuizBase):
    id: str
    questions: List[QuizQuestion] = []
    created_at: str
    times_taken: int = 0
    highest_score: Optional[float] = None

class QuizResultQuestionAnswer(BaseModel):
    question_id: str
    question_text: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str
    topic: Optional[str] = None

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: List[Dict[str, str]]  # list of {question_id: ..., selected_answer: ...}
    time_taken_seconds: int

class QuizResult(BaseModel):
    id: str
    quiz_id: str
    score: int
    total_questions: int
    accuracy_percentage: float
    time_taken_seconds: int
    breakdown: List[QuizResultQuestionAnswer]
    created_at: str

# Smart Notes models
class SmartNoteSection(BaseModel):
    heading: str
    content: str
    key_points: List[str] = []
    definitions: List[Dict[str, str]] = []
    formulas: List[str] = []
    exam_tips: List[str] = []

class SmartNote(BaseModel):
    id: str
    document_id: str
    title: str
    summary: str
    sections: List[SmartNoteSection] = []
    created_at: str
    updated_at: str

# Study Session & Analytics models
class StudySession(BaseModel):
    id: str
    session_type: str  # flashcards, quiz, notes
    document_id: Optional[str] = None
    item_count: int
    duration_seconds: int
    accuracy_percentage: Optional[float] = None
    created_at: str

class AnalyticsOverview(BaseModel):
    total_documents: int
    total_flashcards: int
    total_quizzes_completed: int
    learning_streak_days: int
    overall_accuracy: float
    total_study_duration_minutes: int
    flashcards_known: int
    flashcards_need_review: int
    weekly_activity: List[Dict[str, Any]]
    recent_sessions: List[StudySession]
    recent_documents: List[Document]
    topic_performance: List[Dict[str, Any]]
    incorrect_concepts: List[Dict[str, Any]]
