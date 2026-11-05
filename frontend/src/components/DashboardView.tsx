import React from 'react';
import { 
  FileText, 
  Layers, 
  Swords, 
  Flame, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  CheckCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import { AnalyticsOverviewData } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardViewProps {
  analytics: AnalyticsOverviewData | null;
  onNavigate: (tab: string) => void;
  onOpenUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  onNavigate,
  onOpenUpload
}) => {
  const stats = [
    {
      label: 'Documents Analyzed',
      value: analytics?.total_documents ?? 0,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Library',
      tab: 'library'
    },
    {
      label: 'Flashcards Active',
      value: analytics?.total_flashcards ?? 0,
      icon: Layers,
      color: 'from-violet-500 to-purple-500',
      badge: `${analytics?.flashcards_known ?? 0} Mastered`,
      tab: 'flashcards'
    },
    {
      label: 'Quizzes Completed',
      value: analytics?.total_quizzes_completed ?? 0,
      icon: Swords,
      color: 'from-emerald-500 to-teal-500',
      badge: `${analytics?.overall_accuracy ?? 0}% Accuracy`,
      tab: 'quizzes'
    },
    {
      label: 'Learning Streak',
      value: `${analytics?.learning_streak_days ?? 0} Days`,
      icon: Flame,
      color: 'from-amber-500 to-orange-500',
      badge: 'Continuous Habit',
      tab: 'analytics'
    },
  ];

  const weeklyData = analytics?.weekly_activity || [
    { day: 'Mon', minutes: 0 },
    { day: 'Tue', minutes: 0 },
    { day: 'Wed', minutes: 0 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 0 },
    { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-violet-900/30 via-slate-900/40 to-cyan-900/20 border border-violet-500/20 backdrop-blur-xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Local Gemma 2 Synthesis Engine Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Transform Notes. <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Forge Knowledge.</span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Upload your lecture materials and research papers. NoteForge parses, extracts, and generates intelligent spaced repetition flashcards, realistic quizzes, and smart summaries 100% offline.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-500/25 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <span>Import Document</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate('generator')}
              className="px-5 py-2.5 rounded-xl font-medium text-xs text-[var(--text-primary)] bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:border-violet-500/40 transition-all flex items-center gap-2"
            >
              <Sparkles size={14} className="text-violet-400" />
              <span>Open AI Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(s.tab)}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] shadow-sm hover:border-violet-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{s.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{s.value}</span>
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {s.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Learning Activity Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">Weekly Study Momentum</h2>
              <p className="text-xs text-[var(--text-muted)]">Active study minutes over the past 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total: {analytics?.total_study_duration_minutes ?? 0} mins</span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="activityColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#activityColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Revision Recommendations */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">Targeted Revision</h2>
            <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
              Spaced Repetition
            </span>
          </div>

          <div className="flex-1 space-y-3">
            {analytics?.flashcards_need_review ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <HelpCircle size={15} />
                  <span>{analytics.flashcards_need_review} Cards Need Review</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  These cards were flagged as challenging during past sessions. Review them today to solidify memory retention.
                </p>
                <button
                  onClick={() => onNavigate('flashcards')}
                  className="w-full mt-2 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Review Priority Cards</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-[var(--text-primary)]">All Caught Up!</p>
                <p className="text-[11px] text-[var(--text-muted)]">No overdue revision cards right now. Generate new decks or test your knowledge in the Quiz Arena.</p>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onNavigate('quizzes')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:border-violet-500/40 text-xs font-semibold text-[var(--text-primary)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Swords size={16} className="text-cyan-400" />
                  <span>Enter Quiz Assessment</span>
                </div>
                <ArrowRight size={14} className="text-[var(--text-muted)]" />
              </button>

              <button
                onClick={() => onNavigate('notes')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:border-violet-500/40 text-xs font-semibold text-[var(--text-primary)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className="text-violet-400" />
                  <span>Browse Smart Notes</span>
                </div>
                <ArrowRight size={14} className="text-[var(--text-muted)]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploaded Documents & Continue Learning */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">Recently Uploaded Documents</h2>
            <p className="text-xs text-[var(--text-muted)]">Your processed educational assets available for offline generation</p>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>View All Library</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {analytics?.recent_documents && analytics.recent_documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.recent_documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:border-violet-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      {doc.collection}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">{doc.page_count} Pages</span>
                  </div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">{doc.title}</h3>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                    {doc.summary || 'Document ready for flashcard and quiz synthesis.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[10px] text-[var(--text-muted)]">{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                  <button
                    onClick={() => onNavigate('generator')}
                    className="text-xs font-semibold text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <span>Synthesize</span>
                    <Sparkles size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">No documents in your library yet</p>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Upload your lecture notes, course syllabus, or research papers to unlock automated study tool generation.
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              Import First PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
