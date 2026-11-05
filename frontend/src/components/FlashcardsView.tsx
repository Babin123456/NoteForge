import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  RotateCw, 
  Check, 
  X, 
  Bookmark, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  Keyboard
} from 'lucide-react';
import { FlashcardItem } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface FlashcardsViewProps {
  cards: FlashcardItem[];
  onRefresh: () => void;
  onNavigateToGenerator: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  cards,
  onRefresh,
  onNavigateToGenerator
}) => {
  const [deck, setDeck] = useState<FlashcardItem[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    let filtered = cards;
    if (filterDifficulty !== 'all') {
      filtered = cards.filter(c => c.difficulty === filterDifficulty);
    }
    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards, filterDifficulty]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (deck.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'KeyK') {
        handleReview('known');
      } else if (e.code === 'KeyR') {
        handleReview('review');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, currentIndex, isFlipped]);

  const currentCard = deck[currentIndex];

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleToggleBookmark = async () => {
    if (!currentCard) return;
    await api.toggleFlashcardBookmark(currentCard.id);
    onRefresh();
  };

  const handleReview = async (result: 'known' | 'review') => {
    if (!currentCard) return;
    if (result === 'known') {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
    await api.reviewFlashcard(currentCard.id, result);
    onRefresh();
    handleNext();
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="p-16 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4 max-w-xl mx-auto my-12 animate-in fade-in duration-300">
        <Layers className="w-12 h-12 text-violet-400 mx-auto opacity-40" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">No Active Flashcards</h2>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          You haven't generated any flashcards yet. Head over to the AI Generator to produce question-and-answer, concept, formula, and terminology cards grounded in your uploaded documents.
        </p>
        <button
          onClick={onNavigateToGenerator}
          className="mt-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/25 transition-all flex items-center gap-2 mx-auto"
        >
          <Sparkles size={14} />
          <span>Generate Flashcard Deck</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 select-none">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Flashcard Revision Suite</h1>
          <p className="text-xs text-[var(--text-muted)]">3D Interactive Spaced Repetition Study Experience</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Shuffle size={13} />
            <span>Shuffle</span>
          </button>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Progress & Deck Status */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span className="font-semibold text-violet-400">Card {currentIndex + 1} of {deck.length}</span>
        <div className="flex-1 max-w-xs mx-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          />
        </div>
        <span className="font-mono">{Math.round(((currentIndex + 1) / deck.length) * 100)}% Complete</span>
      </div>

      {/* 3D Interactive Card Flip Container */}
      <div className="perspective-1000 w-full min-h-[340px]">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full min-h-[340px] relative cursor-pointer transform-style-3d transition-transform duration-500 rounded-3xl shadow-xl
            ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 backface-hidden p-8 rounded-3xl bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] border border-[var(--border-color)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                {currentCard?.card_type} • {currentCard?.difficulty}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleBookmark(); }}
                className={`p-2 rounded-xl transition-colors ${currentCard?.is_bookmarked ? 'text-amber-400 bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-amber-400'}`}
              >
                <Bookmark size={18} fill={currentCard?.is_bookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="py-6 text-center space-y-3">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Question / Concept</span>
              <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)] leading-snug">
                {currentCard?.front}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Topic: {currentCard?.topic}</span>
              <span className="text-[11px] text-violet-400 flex items-center gap-1 font-medium">
                <RotateCw size={12} />
                Click or Space to Flip
              </span>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-3xl bg-gradient-to-br from-violet-950/20 via-[var(--surface)] to-cyan-950/20 border border-violet-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Solution & Explanation
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">Interval: {currentCard?.repetition_interval}d</span>
            </div>

            <div className="py-6 text-center space-y-3">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Explanation</span>
              <p className="text-base md:text-lg text-[var(--text-primary)] leading-relaxed">
                {currentCard?.back}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Card Status: {currentCard?.status}</span>
              <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
                <RotateCw size={12} />
                Click to Flip Back
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Actions (Need Revision vs Known) */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={() => handleReview('review')}
          className="flex-1 max-w-xs py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <X size={16} />
          <span>Needs Revision (Key: R)</span>
        </button>

        <button
          onClick={() => handleReview('known')}
          className="flex-1 max-w-xs py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Check size={16} />
          <span>Mastered & Known (Key: K)</span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Previous Card</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <Keyboard size={13} />
          <span>[Space] Flip • [←/→] Navigate</span>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next Card</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
