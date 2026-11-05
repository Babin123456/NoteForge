import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  HardDrive, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  CheckCircle, 
  AlertCircle,
  Database,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { SystemStatusData } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  systemStatus: SystemStatusData | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onRefreshSystem: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  systemStatus,
  darkMode,
  setDarkMode,
  onRefreshSystem
}) => {
  const [modelInput, setModelInput] = useState(systemStatus?.active_model || 'gemma2');
  const [savingModel, setSavingModel] = useState(false);
  const [modelMsg, setModelMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  const isConnected = systemStatus?.ollama.status === 'connected';

  const handleSaveModel = async () => {
    setSavingModel(true);
    setModelMsg(null);
    try {
      await api.setActiveModel(modelInput);
      setModelMsg('Active local model updated successfully.');
      onRefreshSystem();
    } catch {
      setModelMsg('Failed to update active model.');
    }
    setSavingModel(false);
  };

  const handleExportBackup = async () => {
    setExporting(true);
    setBackupMsg(null);
    try {
      const data = await api.exportFullBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `noteforge_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMsg('Full JSON workspace backup generated.');
    } catch {
      setBackupMsg('Export failed.');
    }
    setExporting(false);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setImporting(true);
    setBackupMsg(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await api.importFullBackup(parsed);
      setBackupMsg('Workspace backup restored successfully! Refreshing data.');
      onRefreshSystem();
    } catch (err: any) {
      setBackupMsg('Invalid backup file format or restoration error.');
    }
    setImporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-extrabold text-[var(--text-primary)]">System Architecture & Settings</h1>
        <p className="text-xs text-[var(--text-muted)]">Local Ollama runtime configuration, offline storage limits, and full workspace backup</p>
      </div>

      {backupMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{backupMsg}</span>
        </div>
      )}

      {/* Ollama Runtime Section */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-400 flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Ollama Local AI Runtime</h2>
              <p className="text-xs text-[var(--text-muted)]">Direct native communication via {systemStatus?.ollama.base_url || 'http://127.0.0.1:11434'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5
              ${isConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isConnected ? 'Ollama Online' : 'Ollama Standby'}
            </span>
            <button
              onClick={onRefreshSystem}
              title="Ping Ollama Status"
              className="p-1.5 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Active LLM Model Identifier
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="e.g. gemma2, gemma2:2b"
                className="flex-1 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleSaveModel}
                disabled={savingModel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shrink-0"
              >
                {savingModel ? 'Saving...' : 'Save'}
              </button>
            </div>
            {modelMsg && <p className="text-[11px] text-emerald-400 mt-1">{modelMsg}</p>}
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface-elevated)] text-xs text-[var(--text-muted)] space-y-1">
            <span className="font-bold text-[var(--text-primary)] block">Available Local Models:</span>
            {systemStatus?.available_models && systemStatus.available_models.length > 0 ? (
              <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px]">
                {systemStatus.available_models.map((m, idx) => (
                  <li key={idx} className="cursor-pointer hover:text-cyan-400" onClick={() => setModelInput(m.name)}>
                    {m.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-[11px]">
                No models currently downloaded. Run <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">ollama pull gemma2</code> or <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">ollama pull gemma2:2b</code> in your terminal. NoteForge automatically uses high-accuracy grounded extraction fallback when Ollama models are pending.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Local Storage & Cache */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-color)]">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/10 text-cyan-400 flex items-center justify-center">
            <HardDrive size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Offline Filesystem & Database</h2>
            <p className="text-xs text-[var(--text-muted)]">Encapsulated in local SQLite database and protected local directory</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] space-y-1">
            <span className="text-[var(--text-muted)]">Database Size</span>
            <p className="text-sm font-black text-[var(--text-primary)] font-mono">
              {((systemStatus?.storage.db_size_bytes || 0) / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] space-y-1">
            <span className="text-[var(--text-muted)]">PDF Uploads Cache</span>
            <p className="text-sm font-black text-[var(--text-primary)] font-mono">
              {((systemStatus?.storage.uploads_size_bytes || 0) / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] space-y-1">
            <span className="text-[var(--text-muted)]">Total Footprint</span>
            <p className="text-sm font-black text-cyan-400 font-mono">
              {systemStatus?.storage.total_size_mb || 0} MB
            </p>
          </div>
        </div>
      </div>

      {/* Backup and Data Export */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-color)]">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
            <Database size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Backup, Export & Restoration</h2>
            <p className="text-xs text-[var(--text-muted)]">Complete data sovereignty: export your full study corpus to JSON or restore from backup</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleExportBackup}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download size={14} />
            <span>{exporting ? 'Generating...' : 'Export Full JSON Backup'}</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:border-violet-500/40 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload size={14} className="text-violet-400" />
            <span>{importing ? 'Restoring...' : 'Restore from Backup File'}</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
