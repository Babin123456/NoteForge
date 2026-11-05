import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Award, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Flame
} from 'lucide-react';
import { AnalyticsOverviewData } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

interface AnalyticsViewProps {
  analytics: AnalyticsOverviewData | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  const weeklyData = analytics?.weekly_activity || [];
  
  const retentionData = [
    { name: 'Mastered', value: analytics?.flashcards_known || 0, color: '#10B981' },
    { name: 'Needs Review', value: analytics?.flashcards_need_review || 0, color: '#F59E0B' },
    { name: 'New Cards', value: Math.max(0, (analytics?.total_flashcards || 0) - (analytics?.flashcards_known || 0) - (analytics?.flashcards_need_review || 0)), color: '#8B5CF6' },
  ];

  const topicPerf = analytics?.topic_performance || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Learning Analytics Engine</h1>
        <p className="text-xs text-[var(--text-muted)]">Real, grounded metrics analyzing knowledge retention and exam readiness</p>
      </div>

      {/* Top Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            <span>Overall Accuracy</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">{analytics?.overall_accuracy ?? 0}%</p>
          <span className="text-[10px] text-emerald-400 font-medium">Computed across all assessment submissions</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            <span>Total Study Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">{analytics?.total_study_duration_minutes ?? 0}m</p>
          <span className="text-[10px] text-cyan-400 font-medium">Tracked offline revision duration</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            <span>Retention Rate</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">
            {analytics?.total_flashcards ? Math.round(((analytics.flashcards_known || 0) / analytics.total_flashcards) * 100) : 0}%
          </p>
          <span className="text-[10px] text-violet-400 font-medium">{analytics?.flashcards_known ?? 0} cards retained</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            <span>Learning Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">{analytics?.learning_streak_days ?? 0} Days</p>
          <span className="text-[10px] text-amber-400 font-medium">Continuous consecutive study days</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Activity Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Daily Study Time (Minutes)</h2>
              <p className="text-xs text-[var(--text-muted)]">Historical breakdown over the past 7 days</p>
            </div>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="minutes" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flashcard Memory Retention Breakdown */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Flashcard Retention Ratio</h2>
            <p className="text-xs text-[var(--text-muted)]">Spaced repetition distribution</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={retentionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4}>
                  {retentionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {retentionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--text-muted)]">{item.name}</span>
                </div>
                <span className="font-bold text-[var(--text-primary)]">{item.value} cards</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frequently Missed Concepts / Questions */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Challenging Concepts & Incorrect Exam Items</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)]">Extracted from your actual quiz results to target high-impact revision</p>
        </div>

        {analytics?.incorrect_concepts && analytics.incorrect_concepts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.incorrect_concepts.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-2">
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">{item.topic}</span>
                <p className="text-xs font-bold text-[var(--text-primary)]">{item.question}</p>
                <div className="text-[11px] space-y-1 pt-1">
                  <p className="text-red-400">Your prior answer: {item.user_answer || '(None)'}</p>
                  <p className="text-emerald-400">Correct solution: {item.correct_answer}</p>
                  <p className="text-[var(--text-muted)] italic">{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[var(--surface-elevated)] rounded-xl text-xs text-[var(--text-muted)]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-[var(--text-primary)]">Zero persistent error patterns detected!</p>
            <p>Complete quizzes in the Quiz Arena to populate precision diagnostic concept analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};
