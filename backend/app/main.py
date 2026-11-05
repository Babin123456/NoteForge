from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.core.config import settings
from app.storage.database import init_db
from app.api import documents, flashcards, quizzes, notes, generator, analytics, system

app = FastAPI(
    title="NoteForge Backend API",
    description="Offline-First Intelligent Learning Platform Engine with Local Gemma 2 AI",
    version="1.0.0"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Mount API Routers
app.include_router(documents.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(generator.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(system.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": "NoteForge",
        "version": "1.0.0",
        "offline_ready": True
    }
