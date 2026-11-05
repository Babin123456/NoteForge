export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  file_size: number;
  page_count: number;
  collection: string;
  processed_status: 'pending' | 'processing' | 'completed' | 'error';
  summary?: string;
  topics: string[];
  created_at: string;
  updated_at: string;
  last_studied_at?: string;
  full_text?: string;
}

export interface FlashcardItem {
  id: string;
  document_id: string;
  front: string;
  back: string;
  card_type: 'q_and_a' | 'definition' | 'concept' | 'formula' | 'terminology';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  is_bookmarked: boolean | number;
  status: 'new' | 'known' | 'review';
  review_count: number;
  repetition_interval: number;
  ease_factor: number;
  next_review_at?: string;
  created_at: string;
}

export interface QuizQuestionItem {
  id: string;
  quiz_id: string;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'conceptual';
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  topic?: string;
}

export interface QuizItem {
  id: string;
  document_id: string;
  title: string;
  difficulty: string;
  times_taken: number;
  highest_score?: number;
  question_count?: number;
  created_at: string;
  questions?: QuizQuestionItem[];
}

export interface QuizResultAnswer {
  question_id: string;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  topic?: string;
}

export interface QuizResultReport {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  accuracy_percentage: number;
  time_taken_seconds: number;
  breakdown: QuizResultAnswer[];
  created_at: string;
}

export interface SmartNoteSection {
  heading: string;
  content: string;
  key_points: string[];
  definitions: { term: string; definition: string }[];
  formulas: string[];
  exam_tips: string[];
}

export interface SmartNoteItem {
  id: string;
  document_id: string;
  doc_title?: string;
  title: string;
  summary: string;
  sections: SmartNoteSection[];
  created_at: string;
  updated_at: string;
}

export interface StudySessionItem {
  id: string;
  session_type: string;
  document_id?: string;
  document_title?: string;
  item_count: number;
  duration_seconds: number;
  accuracy_percentage?: number;
  created_at: string;
}

export interface AnalyticsOverviewData {
  total_documents: number;
  total_flashcards: number;
  total_quizzes_completed: number;
  learning_streak_days: number;
  overall_accuracy: number;
  total_study_duration_minutes: number;
  flashcards_known: number;
  flashcards_need_review: number;
  weekly_activity: { date: string; day: string; sessions: number; minutes: number; accuracy: number }[];
  recent_sessions: StudySessionItem[];
  recent_documents: DocumentItem[];
  topic_performance: { topic: string; total_questions: number; accuracy: number }[];
  incorrect_concepts: { question: string; user_answer: string; correct_answer: string; explanation: string; topic: string }[];
}

export interface SystemStatusData {
  ollama: {
    status: 'connected' | 'disconnected';
    version: string | null;
    base_url: string;
  };
  available_models: { name: string; size: number }[];
  active_model: string;
  storage: {
    db_size_bytes: number;
    uploads_size_bytes: number;
    total_size_mb: number;
  };
}
