import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Swords, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  Sliders, 
  ArrowRight
} from 'lucide-react';
import { DocumentItem } from '../types';
import { api } from '../services/api';

interface GeneratorViewProps {
  documents: DocumentItem[];
  selectedDocId: string;
  setSelectedDocId: (id: string) => void;
  onNavigate: (tab: string) => void;
  activeModel: string;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  documents,
  selectedDocId,
  setSelectedDocId,
  onNavigate,
  activeModel
}) => {
  const [toolType, setToolType] = useState<'flashcards' | 'quiz' | 'notes'>('flashcards');
  const [flashcardCount, setFlashcardCount] = useState(8);
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const handleGenerate = async () => {
    if (!selectedDocId) {
      setErrorMsg('Please choose a document to synthesize.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (toolType === 'flashcards') {
        const res = await api.generateFlashcards(selectedDocId, flashcardCount);
        setSuccessMsg(`Successfully synthesized ${res.generated_count || flashcardCount} offline flashcards!`);
      } else if (toolType === 'quiz') {
        const res = await api.generateQuiz(selectedDocId, quizQuestionCount, difficulty);
        setSuccessMsg(`Generated quiz "${res.title}" with ${res.questions?.length || quizQuestionCount} questions.`);
      } else if (toolType === 'notes') {
        const res = await api.generateSmartNotes(selectedDocId);
        setSuccessMsg(`Synthesized smart structured notes "${res.title}".`);
      }
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Generation failed. Please ensure Ollama is accessible or review document content.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Engine Status Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-violet-900/30 via-slate-900/40 to-cyan-900/20 border border-violet-500/20 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold tracking-wider uppercase">
            <Cpu size={14} />
            <span>Local AI Generation Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Curriculum Synthesis Matrix</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Powered by locally running <span className="text-cyan-400 font-mono">{activeModel}</span> through Ollama. Strictly grounded in your notes.
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            100% Offline & Private
          </span>
          <span className="text-[10px] mt-0.5">Zero external API dependencies</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button
            onClick={() => onNavigate(toolType === 'flashcards' ? 'flashcards' : toolType === 'quiz' ? 'quizzes' : 'notes')}
            className="font-bold underline hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View Generated Output</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Document */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <span>1. Choose Document</span>
          </h2>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {documents.length > 0 ? (
              documents.map(doc => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col gap-1
                      ${isSelected
                        ? 'border-violet-500 bg-violet-500/10 shadow-sm'
                        : 'border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-violet-500/40 text-[var(--text-muted)]'
                      }`}
                  >
                    <span className="font-bold text-[var(--text-primary)] truncate">{doc.title}</span>
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                      <span>{doc.collection}</span>
                      <span>{doc.page_count} Pages</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[var(--text-muted)] py-4">No documents available. Upload a PDF first.</p>
            )}
          </div>
        </div>

        {/* Step 2: Choose Output Format */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            2. Learning Modality
          </h2>

          <div className="space-y-2">
            {[
              { id: 'flashcards', title: 'Interactive Flashcards', desc: 'Concept, definition, & formula cards for spaced repetition', icon: Layers },
              { id: 'quiz', title: 'Quiz Assessment', desc: 'Multiple choice & conceptual questions with explanations', icon: Swords },
              { id: 'notes', title: 'Smart Study Notes', desc: 'Structured chapter outlines, exam tips, & summaries', icon: FileText },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = toolType === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setToolType(item.id as any)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3
                    ${isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-cyan-500/40 text-[var(--text-muted)]'
                    }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-[var(--text-muted)]'}`} />
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Configure Parameters & Synthesize */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-4">
              <Sliders size={14} />
              <span>3. Parameters</span>
            </h2>

            {toolType === 'flashcards' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--text-muted)]">
                  Deck Size: <span className="text-violet-400 font-bold">{flashcardCount} cards</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="20"
                  step="2"
                  value={flashcardCount}
                  onChange={(e) => setFlashcardCount(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <p className="text-[11px] text-[var(--text-muted)]">
                  Covers key definitions, formulas, and critical concepts.
                </p>
              </div>
            )}

            {toolType === 'quiz' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Question Count: <span className="text-cyan-400 font-bold">{quizQuestionCount}</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={quizQuestionCount}
                    onChange={(e) => setQuizQuestionCount(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                  >
                    <option value="easy">Easy (Definitions & Recall)</option>
                    <option value="medium">Medium (Application & Mechanics)</option>
                    <option value="hard">Hard (Conceptual Synthesis)</option>
                  </select>
                </div>
              </div>
            )}

            {toolType === 'notes' && (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">
                  Generates an executive summary, thematic sections, definitions list, formula collection, and exam preparation tips.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedDocId}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-500/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Running Gemma 2 Inference...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Synthesize with AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
