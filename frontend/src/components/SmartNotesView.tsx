import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  Lightbulb, 
  ExternalLink,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { SmartNoteItem } from '../types';
import { api } from '../services/api';

interface SmartNotesViewProps {
  notes: SmartNoteItem[];
  onRefresh: () => void;
  onNavigateToGenerator: () => void;
}

export const SmartNotesView: React.FC<SmartNotesViewProps> = ({
  notes,
  onRefresh,
  onNavigateToGenerator
}) => {
  const [selectedNote, setSelectedNote] = useState<SmartNoteItem | null>(notes[0] || null);

  const handleDownloadMarkdown = (noteId: string) => {
    window.open(api.getMarkdownExportUrl(noteId), '_blank');
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="p-16 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4 max-w-xl mx-auto my-12 animate-in fade-in duration-300">
        <FileText className="w-12 h-12 text-violet-400 mx-auto opacity-40" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">No Smart Notes Generated</h2>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Smart notes transform dense, unstructured slides and textbook chapters into executive summaries, definition matrices, and high-yield examination tips.
        </p>
        <button
          onClick={onNavigateToGenerator}
          className="mt-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/25 transition-all flex items-center gap-2 mx-auto"
        >
          <Sparkles size={14} />
          <span>Synthesize Smart Notes</span>
        </button>
      </div>
    );
  }

  const activeNote = selectedNote || notes[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
      {/* Notes Sidebar List */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Curated Notes</h2>
          <button
            onClick={onNavigateToGenerator}
            className="text-xs font-semibold text-violet-400 hover:underline flex items-center gap-1"
          >
            <Sparkles size={12} />
            <span>New</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
          {notes.map((note) => {
            const isSelected = activeNote?.id === note.id;
            return (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col gap-1.5
                  ${isSelected 
                    ? 'border-violet-500 bg-violet-500/10 shadow-sm' 
                    : 'border-[var(--border-color)] bg-[var(--surface)] hover:border-violet-500/40 text-[var(--text-muted)]'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-mono">{note.created_at.slice(0, 10)}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{note.sections.length} Sections</span>
                </div>
                <h3 className="font-bold text-[var(--text-primary)] line-clamp-1">{note.title}</h3>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">{note.summary}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Note Reader Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border-color)] shadow-sm space-y-6">
          {/* Note Title & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                AI Structured Synthesized Notes
              </span>
              <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] mt-2">{activeNote.title}</h1>
              <p className="text-xs text-[var(--text-muted)] mt-1">Source: {activeNote.doc_title || 'Document Material'}</p>
            </div>

            <button
              onClick={() => handleDownloadMarkdown(activeNote.id)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:border-violet-500/40 flex items-center gap-2 transition-colors shrink-0"
            >
              <Download size={14} className="text-cyan-400" />
              <span>Export Markdown</span>
            </button>
          </div>

          {/* Executive Summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/20 to-cyan-950/20 border border-violet-500/20 space-y-2">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen size={15} />
              <span>Executive Synthesis</span>
            </div>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">{activeNote.summary}</p>
          </div>

          {/* Detailed Thematic Sections */}
          <div className="space-y-6">
            {activeNote.sections.map((sec, sIdx) => (
              <div key={sIdx} className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-4">
                <h2 className="text-base font-bold text-[var(--text-primary)]">{sec.heading}</h2>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{sec.content}</p>

                {/* Key Points */}
                {sec.key_points && sec.key_points.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Key Takeaways:</span>
                    <ul className="space-y-1.5 pl-2">
                      {sec.key_points.map((kp, kpIdx) => (
                        <li key={kpIdx} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                          <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Definitions Matrix */}
                {sec.definitions && sec.definitions.length > 0 && (
                  <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] space-y-2">
                    <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">Formal Definitions:</span>
                    <div className="space-y-2">
                      {sec.definitions.map((def, dIdx) => (
                        <div key={dIdx} className="text-xs">
                          <span className="font-bold text-[var(--text-primary)]">{def.term}: </span>
                          <span className="text-[var(--text-muted)]">{def.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Tips */}
                {sec.exam_tips && sec.exam_tips.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <Lightbulb size={14} />
                      <span>Exam Preparation Highlight</span>
                    </div>
                    {sec.exam_tips.map((tip, tIdx) => (
                      <p key={tIdx} className="text-[11px] text-amber-200/90 leading-relaxed">• {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
