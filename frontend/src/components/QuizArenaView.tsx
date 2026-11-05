import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronRight, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { QuizItem, QuizResultReport } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface QuizArenaViewProps {
  quizzes: QuizItem[];
  onRefresh: () => void;
  onNavigateToGenerator: () => void;
}

export const QuizArenaView: React.FC<QuizArenaViewProps> = ({
  quizzes,
  onRefresh,
  onNavigateToGenerator
}) => {
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizReport, setQuizReport] = useState<QuizResultReport | null>(null);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartQuiz = async (quizId: string) => {
    const fullQuiz = await api.getQuiz(quizId);
    setActiveQuiz(fullQuiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeElapsed(0);
    setIsTimerRunning(true);
    setQuizReport(null);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsTimerRunning(false);
    setSubmitting(true);

    const formattedAnswers = Object.entries(userAnswers).map(([qId, ans]) => ({
      question_id: qId,
      selected_answer: ans
    }));

    try {
      const report = await api.submitQuiz(activeQuiz.id, formattedAnswers, timeElapsed);
      setQuizReport(report);
      setSubmitting(false);
      onRefresh();

      if (report.accuracy_percentage >= 70) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch {
      setSubmitting(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // View: Completed Report
  if (quizReport && activeQuiz) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] border border-[var(--border-color)] shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-violet-500/25">
            <Award size={32} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Quiz Completed</span>
            <h1 className="text-2xl font-black text-[var(--text-primary)] mt-1">{activeQuiz.title}</h1>
          </div>

          <div className="flex items-center justify-center gap-8 py-4 border-y border-[var(--border-color)]">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Score</p>
              <p className="text-2xl font-black text-[var(--text-primary)]">{quizReport.score} / {quizReport.total_questions}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Accuracy</p>
              <p className={`text-2xl font-black ${quizReport.accuracy_percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {quizReport.accuracy_percentage}%
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Time Taken</p>
              <p className="text-2xl font-black text-[var(--text-primary)]">{formatSeconds(quizReport.time_taken_seconds)}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartQuiz(activeQuiz.id)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span>Retake Assessment</span>
            </button>
            <button
              onClick={() => { setActiveQuiz(null); setQuizReport(null); }}
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors"
            >
              Back to Arena
            </button>
          </div>
        </div>

        {/* Detailed Breakdown Review */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">Question-by-Question Analysis</h2>
          {quizReport.breakdown.map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${item.is_correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'} space-y-3`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                  {idx + 1}. {item.question_text}
                </span>
                {item.is_correct ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 shrink-0">
                    <CheckCircle2 size={16} /> Correct
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 shrink-0">
                    <XCircle size={16} /> Incorrect
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Your Answer:</span>
                  <span className={item.is_correct ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                    {item.user_answer || '(No answer provided)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Correct Answer:</span>
                  <span className="text-emerald-400 font-medium">{item.correct_answer}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-elevated)] text-xs text-[var(--text-muted)] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">Explanation:</span>
                <p>{item.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // View: Active Quiz in progress
  if (activeQuiz && activeQuiz.questions && activeQuiz.questions.length > 0) {
    const q = activeQuiz.questions[currentQuestionIndex];
    const totalQ = activeQuiz.questions.length;
    const isAnswered = Boolean(userAnswers[q.id]);
    const isLastQuestion = currentQuestionIndex === totalQ - 1;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Active Quiz Nav Header */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)]">
          <div>
            <h2 className="text-xs font-bold text-[var(--text-primary)] truncate max-w-xs">{activeQuiz.title}</h2>
            <span className="text-[10px] text-[var(--text-muted)]">Question {currentQuestionIndex + 1} of {totalQ}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs font-mono text-cyan-400">
            <Clock size={14} />
            <span>{formatSeconds(timeElapsed)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border-color)] shadow-xl space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
              {q.question_type.replace('_', ' ')} • {q.difficulty}
            </span>
            <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)] leading-relaxed">
              {q.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, oIdx) => {
              const isSelected = userAnswers[q.id] === opt;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(q.id, opt)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between
                    ${isSelected 
                      ? 'border-violet-500 bg-violet-500/10 shadow-sm text-violet-300' 
                      : 'border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-violet-500/30 text-[var(--text-primary)]'
                    }`}
                >
                  <span className="font-medium">{opt}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0
                    ${isSelected ? 'border-violet-400 bg-violet-500' : 'border-[var(--text-muted)]'}`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                <span>{submitting ? 'Submitting...' : 'Finish & Review Quiz'}</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQ - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Quiz Selection List
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Quiz Arena</h1>
          <p className="text-xs text-[var(--text-muted)]">Timed offline interactive assessments grounded in your course materials</p>
        </div>

        <button
          onClick={onNavigateToGenerator}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-sm shadow-violet-500/25 flex items-center gap-1.5"
        >
          <Sparkles size={14} />
          <span>New Quiz</span>
        </button>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] hover:border-violet-500/40 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 uppercase">
                    {quiz.difficulty}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{quiz.question_count || 5} Questions</span>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2">{quiz.title}</h3>

                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  <span>Taken: {quiz.times_taken} times</span>
                  {quiz.highest_score !== null && quiz.highest_score !== undefined && (
                    <span className="text-emerald-400 font-semibold">High: {quiz.highest_score}%</span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                <button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Swords size={13} />
                  <span>Enter Arena</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4 max-w-xl mx-auto my-12">
          <Swords className="w-12 h-12 text-cyan-400 mx-auto opacity-40" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">No Quizzes Ready</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Assessments test your comprehension and identify tricky concepts before real exams. Synthesize your first custom quiz using the local Gemma 2 engine.
          </p>
          <button
            onClick={onNavigateToGenerator}
            className="mt-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/25 transition-all flex items-center gap-2 mx-auto"
          >
            <Sparkles size={14} />
            <span>Create Quiz from PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};
