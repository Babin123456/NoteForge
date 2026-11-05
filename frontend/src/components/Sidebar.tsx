import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Sparkles, 
  Layers, 
  Swords, 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Radio
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  ollamaConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  ollamaConnected
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'My Library', icon: FolderKanban },
    { id: 'generator', label: 'AI Generator', icon: Sparkles, badge: 'Gemma 2' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quizzes', label: 'Quiz Arena', icon: Swords },
    { id: 'notes', label: 'Smart Notes', icon: FileText },
    { id: 'analytics', label: 'Learning Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`relative flex flex-col border-r transition-all duration-300 z-20 select-none
        ${collapsed ? 'w-20' : 'w-64'} 
        bg-[var(--surface)] border-[var(--border-color)]`}
    >
      {/* Brand Header */}
      <div className="h-18 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                NoteForge
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium -mt-1 tracking-wider uppercase">
                Offline AI Academy
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800/20 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-gradient-to-r from-violet-600/15 to-cyan-500/10 text-violet-400 border border-violet-500/20 shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-slate-800/10 dark:hover:bg-slate-800/40'
                }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'text-violet-400 scale-110' : 'group-hover:scale-110'}`} />
              
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-slate-100 text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Offline Status Badge */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-colors
          ${ollamaConnected 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
        >
          <Radio className={`w-4 h-4 shrink-0 ${ollamaConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="truncate">{ollamaConnected ? 'Gemma 2 Ready' : 'Ollama Standby'}</span>
              <span className="text-[10px] opacity-75 font-normal">100% Offline Engine</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
