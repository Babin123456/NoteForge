# NoteForge — Offline-First Intelligent Learning Platform

> **Transform Notes. Forge Knowledge.**

NoteForge is an offline-first learning platform that converts uploaded lecture notes, educational slide decks, and textbooks into spaced repetition flashcards, realistic quizzes, structured study notes, and analytics.

---

## 🏗️ Architecture Overview

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide Icons + Recharts
- **Backend:** FastAPI + Uvicorn + SQLite + PyMuPDF (fitz)
- **Local AI:** Locally hosted Gemma 2 via Ollama (100% offline, zero cloud API dependencies)

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Ollama installed locally (for Gemma 2 local AI inference):
  ```bash
  ollama pull gemma2
  # or lighter model:
  ollama pull gemma2:2b
  ```

### 2. Start the Backend API
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API and Swagger docs will be accessible at `http://127.0.0.1:8000/docs`.

### 3. Start the Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run backend unit and integration tests:
```bash
$env:PYTHONPATH="d:\Projects\NoteForge\backend"
.\backend\venv\Scripts\pytest backend\tests\test_core.py -v
```

Build and test frontend TypeScript compilation:
```bash
cd frontend
npm run build
```

---

## 📦 Key Capabilities
1. **Interactive Dashboard:** Live metrics, learning streak, weekly study minutes area chart, and spaced repetition review targets.
2. **Document Library:** Drag-and-drop PDF ingestion, page extraction, preview modal, collections, and reprocessing.
3. **Curriculum Synthesis Matrix (AI Generator):** Generates question-and-answer cards, multiple-choice quizzes, and thematic smart notes strictly grounded in the uploaded document.
4. **3D Flashcards:** 3D flip card animations, keyboard shortcuts (`Space` to flip, `K` for known, `R` for review, `Arrow keys` for navigation), shuffle, and Leitner spaced repetition scheduling.
5. **Quiz Arena:** Timed assessments, multiple choice options, instant score reports, and question-by-question reviews.
6. **Smart Notes & Markdown Export:** Clean summaries, definitions, and one-click markdown exports.
7. **Offline Backup & Restore:** Full JSON workspace export and import.
