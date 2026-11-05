import React, { useState } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [collection, setCollection] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.pdf')) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
        setError(null);
      } else {
        setError('Only PDF documents are supported for processing.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.toLowerCase().endsWith('.pdf')) {
        setFile(selected);
        if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''));
        setError(null);
      } else {
        setError('Only PDF documents are supported.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a valid PDF file.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.uploadDocument(file, title, collection);
      setLoading(false);
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to upload document.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <UploadCloud size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Import Educational PDF</h2>
            <p className="text-xs text-[var(--text-muted)]">Upload lectures, textbooks, or research papers for offline extraction</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
              ${dragOver 
                ? 'border-violet-500 bg-violet-500/10' 
                : file 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-[var(--border-color)] hover:border-violet-500/50 hover:bg-slate-800/10'
              }`}
            onClick={() => document.getElementById('pdf-upload-input')?.click()}
          >
            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-[var(--text-muted)] font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <span className="text-[11px] text-violet-400 hover:underline">Click or drop to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Drop your PDF lecture notes here</p>
                <p className="text-xs text-[var(--text-muted)]">Supports OCR & Native PDF formatting (up to 100MB)</p>
                <span className="mt-2 px-3 py-1 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg text-xs font-medium text-violet-400">
                  Browse Files
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Computing - Lecture 04"
              className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
              Collection / Folder
            </label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
            >
              <option value="General">General</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Biology & Medicine">Biology & Medicine</option>
              <option value="Physics & Engineering">Physics & Engineering</option>
              <option value="Economics & Business">Economics & Business</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              <span>{loading ? 'Processing Text...' : 'Import & Process'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
