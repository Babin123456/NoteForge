import React, { useState } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  HardDrive, 
  Bell, 
  UploadCloud,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenUpload: () => void;
  ollamaConnected: boolean;
  activeModel: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  onOpenUpload,
  ollamaConnected,
  activeModel
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-18 border-b border-[var(--border-color)] bg-[var(--surface)] px-6 flex items-center justify-between sticky top-0 z-10 select-none">
      {/* Global Search Bar */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, flashcards, questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Upload CTA */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-sm shadow-violet-500/25 transition-all transform active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Import PDF</span>
        </button>

        {/* Local Hardware Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">{activeModel}</span>
          {ollamaConnected ? (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
        </button>

        {/* Notification Status */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500"></span>
          </button>
        </div>

        {/* User avatar indicator */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[var(--border-color)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            NF
          </div>
        </div>
      </div>
    </header>
  );
};
