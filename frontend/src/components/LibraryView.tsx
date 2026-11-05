import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  RefreshCw, 
  Search, 
  Eye, 
  FolderPlus, 
  Sparkles, 
  Calendar, 
  HardDrive,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { DocumentItem } from '../types';
import { api } from '../services/api';

interface LibraryViewProps {
  documents: DocumentItem[];
  onRefresh: () => void;
  onOpenUpload: () => void;
  onSelectForGeneration: (docId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  documents,
  onRefresh,
  onOpenUpload,
  onSelectForGeneration
}) => {
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);
  const [previewText, setPreviewText] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const collections = ['All', ...Array.from(new Set(documents.map(d => d.collection).filter(Boolean)))];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                          doc.filename.toLowerCase().includes(search.toLowerCase());
    const matchesColl = selectedCollection === 'All' || doc.collection === selectedCollection;
    return matchesSearch && matchesColl;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document and associated files?')) {
      await api.deleteDocument(id);
      onRefresh();
    }
  };

  const handleReprocess = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.reprocessDocument(id);
    onRefresh();
  };

  const handlePreview = async (doc: DocumentItem) => {
    setSelectedDocForPreview(doc);
    setLoadingPreview(true);
    try {
      const fullDoc = await api.getDocument(doc.id);
      setPreviewText(fullDoc.full_text || 'No extracted text available for this document.');
    } catch {
      setPreviewText('Failed to load text preview.');
    }
    setLoadingPreview(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Document Library</h1>
          <p className="text-xs text-[var(--text-muted)]">Organize, preview, and process offline educational resources</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 shrink-0"
          >
            Upload PDF
          </button>
        </div>
      </div>

      {/* Collection Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {collections.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCollection(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0
              ${selectedCollection === c
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map(doc => {
            const isProcessing = doc.processed_status === 'processing';
            const isError = doc.processed_status === 'error';
            return (
              <div
                key={doc.id}
                onClick={() => handlePreview(doc)}
                className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] hover:border-violet-500/40 transition-all cursor-pointer group flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                      {doc.collection}
                    </span>

                    {/* Status Badge */}
                    {isProcessing ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                        <Clock size={10} className="animate-spin" />
                        <span>Processing</span>
                      </span>
                    ) : isError ? (
                      <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 font-medium">
                        <AlertCircle size={10} />
                        <span>Error</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                        <CheckCircle2 size={10} />
                        <span>Ready</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20 group-hover:scale-105 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-violet-400 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{doc.filename}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
                    <span>{doc.page_count} Pages</span>
                    <span>•</span>
                    <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectForGeneration(doc.id);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300"
                  >
                    <Sparkles size={13} />
                    <span>Generate AI Tools</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleReprocess(doc.id, e)}
                      title="Reprocess Document text"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-slate-800/20 transition-colors"
                    >
                      <RefreshCw size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      title="Delete Document"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] space-y-3">
          <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No matching documents found</h3>
          <p className="text-xs text-[var(--text-muted)]">Upload new PDFs or try clearing your search query.</p>
        </div>
      )}

      {/* PDF Text Preview Slide-over Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">{selectedDocForPreview.title}</h2>
                <p className="text-xs text-[var(--text-muted)]">Extracted text analysis & content ground truth</p>
              </div>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 font-mono text-xs leading-relaxed text-[var(--text-muted)] whitespace-pre-wrap select-text">
              {loadingPreview ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                previewText
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">{selectedDocForPreview.page_count} pages extracted</span>
              <button
                onClick={() => {
                  const id = selectedDocForPreview.id;
                  setSelectedDocForPreview(null);
                  onSelectForGeneration(id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors flex items-center gap-2"
              >
                <Sparkles size={14} />
                <span>Open in AI Generator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
