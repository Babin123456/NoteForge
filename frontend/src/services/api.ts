import { 
  DocumentItem, 
  FlashcardItem, 
  QuizItem, 
  QuizResultReport, 
  SmartNoteItem, 
  AnalyticsOverviewData, 
  SystemStatusData 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Documents
  async getDocuments(collection?: string): Promise<DocumentItem[]> {
    const url = collection ? `${API_BASE}/documents?collection=${encodeURIComponent(collection)}` : `${API_BASE}/documents`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async getDocument(id: string): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch document');
    return res.json();
  },

  async uploadDocument(file: File, title?: string, collection?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (collection) formData.append('collection', collection);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async updateDocument(id: string, payload: { title?: string; collection?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async deleteDocument(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async reprocessDocument(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/${id}/reprocess`, { method: 'POST' });
    return res.json();
  },

  // Flashcards
  async getFlashcards(params?: { document_id?: string; status?: string; bookmarked?: boolean }): Promise<FlashcardItem[]> {
    const query = new URLSearchParams();
    if (params?.document_id) query.append('document_id', params.document_id);
    if (params?.status) query.append('status', params.status);
    if (params?.bookmarked !== undefined) query.append('bookmarked', String(params.bookmarked));

    const res = await fetch(`${API_BASE}/flashcards?${query.toString()}`);
    return res.json();
  },

  async reviewFlashcard(cardId: string, result: 'known' | 'review'): Promise<any> {
    const res = await fetch(`${API_BASE}/flashcards/${cardId}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result })
    });
    return res.json();
  },

  async toggleFlashcardBookmark(cardId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/flashcards/${cardId}/bookmark`, { method: 'PUT' });
    return res.json();
  },

  async deleteFlashcard(cardId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/flashcards/${cardId}`, { method: 'DELETE' });
    return res.json();
  },

  // Quizzes
  async getQuizzes(documentId?: string): Promise<QuizItem[]> {
    const url = documentId ? `${API_BASE}/quizzes?document_id=${documentId}` : `${API_BASE}/quizzes`;
    const res = await fetch(url);
    return res.json();
  },

  async getQuiz(quizId: string): Promise<QuizItem> {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}`);
    return res.json();
  },

  async submitQuiz(quizId: string, answers: { question_id: string; selected_answer: string }[], timeTakenSeconds: number): Promise<QuizResultReport> {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quizId,
        answers,
        time_taken_seconds: timeTakenSeconds
      })
    });
    return res.json();
  },

  async deleteQuiz(quizId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}`, { method: 'DELETE' });
    return res.json();
  },

  // Smart Notes
  async getSmartNotes(documentId?: string): Promise<SmartNoteItem[]> {
    const url = documentId ? `${API_BASE}/notes?document_id=${documentId}` : `${API_BASE}/notes`;
    const res = await fetch(url);
    return res.json();
  },

  async getSmartNote(noteId: string): Promise<SmartNoteItem> {
    const res = await fetch(`${API_BASE}/notes/${noteId}`);
    return res.json();
  },

  async deleteSmartNote(noteId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, { method: 'DELETE' });
    return res.json();
  },

  // AI Generator
  async generateFlashcards(documentId: string, count = 8, model?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/generator/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, count, model })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Generation failed');
    }
    return res.json();
  },

  async generateQuiz(documentId: string, count = 5, difficulty = 'medium', model?: string): Promise<QuizItem> {
    const res = await fetch(`${API_BASE}/generator/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, count, difficulty, model })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Generation failed');
    }
    return res.json();
  },

  async generateSmartNotes(documentId: string, model?: string): Promise<SmartNoteItem> {
    const res = await fetch(`${API_BASE}/generator/smart-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, model })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Generation failed');
    }
    return res.json();
  },

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverviewData> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    return res.json();
  },

  // System & Settings
  async getSystemStatus(): Promise<SystemStatusData> {
    const res = await fetch(`${API_BASE}/system/status`);
    return res.json();
  },

  async setActiveModel(model: string): Promise<any> {
    const res = await fetch(`${API_BASE}/system/set-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model })
    });
    return res.json();
  },

  async exportFullBackup(): Promise<any> {
    const res = await fetch(`${API_BASE}/system/export/all`);
    return res.json();
  },

  async importFullBackup(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/system/import/all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getMarkdownExportUrl(noteId: string): string {
    return `${API_BASE}/system/export/markdown/${noteId}`;
  }
};
