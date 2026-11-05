import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LibraryView } from './components/LibraryView';
import { GeneratorView } from './components/GeneratorView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizArenaView } from './components/QuizArenaView';
import { SmartNotesView } from './components/SmartNotesView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { UploadModal } from './components/UploadModal';

import { 
  DocumentItem, 
  FlashcardItem, 
  QuizItem, 
  SmartNoteItem, 
  AnalyticsOverviewData, 
  SystemStatusData 
} from './types';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [collapsedSidebar, setCollapsedSidebar] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Core Data States
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [smartNotes, setSmartNotes] = useState<SmartNoteItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverviewData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);
  
  // Cross-view selection
  const [selectedDocIdForGeneration, setSelectedDocIdForGeneration] = useState<string>('');

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial Data Fetch
  const loadAllData = async () => {
    try {
      const [docs, cards, qz, notes, overview, sys] = await Promise.all([
        api.getDocuments().catch(() => []),
        api.getFlashcards().catch(() => []),
        api.getQuizzes().catch(() => []),
        api.getSmartNotes().catch(() => []),
        api.getAnalyticsOverview().catch(() => null),
        api.getSystemStatus().catch(() => null),
      ]);

      setDocuments(docs);
      setFlashcards(cards);
      setQuizzes(qz);
      setSmartNotes(notes);
      setAnalytics(overview);
      setSystemStatus(sys);

      if (docs.length > 0 && !selectedDocIdForGeneration) {
        setSelectedDocIdForGeneration(docs[0].id);
      }
    } catch (e) {
      console.error("Data load error:", e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSelectDocForGen = (docId: string) => {
    setSelectedDocIdForGeneration(docId);
    setCurrentTab('generator');
  };

  const ollamaOnline = systemStatus?.ollama.status === 'connected';

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${darkMode ? 'dark' : ''} bg-[var(--bg-main)] text-[var(--text-primary)]`}>
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={collapsedSidebar}
        setCollapsed={setCollapsedSidebar}
        ollamaConnected={ollamaOnline}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          ollamaConnected={ollamaOnline}
          activeModel={systemStatus?.active_model || 'gemma2'}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              onNavigate={setCurrentTab}
              onOpenUpload={() => setIsUploadModalOpen(true)}
            />
          )}

          {currentTab === 'library' && (
            <LibraryView
              documents={documents}
              onRefresh={loadAllData}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onSelectForGeneration={handleSelectDocForGen}
            />
          )}

          {currentTab === 'generator' && (
            <GeneratorView
              documents={documents}
              selectedDocId={selectedDocIdForGeneration}
              setSelectedDocId={setSelectedDocIdForGeneration}
              onNavigate={setCurrentTab}
              activeModel={systemStatus?.active_model || 'gemma2'}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              cards={flashcards}
              onRefresh={loadAllData}
              onNavigateToGenerator={() => setCurrentTab('generator')}
            />
          )}

          {currentTab === 'quizzes' && (
            <QuizArenaView
              quizzes={quizzes}
              onRefresh={loadAllData}
              onNavigateToGenerator={() => setCurrentTab('generator')}
            />
          )}

          {currentTab === 'notes' && (
            <SmartNotesView
              notes={smartNotes}
              onRefresh={loadAllData}
              onNavigateToGenerator={() => setCurrentTab('generator')}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              analytics={analytics}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              systemStatus={systemStatus}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onRefreshSystem={loadAllData}
            />
          )}
        </main>
      </div>

      {/* Upload PDF Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={loadAllData}
      />
    </div>
  );
}

export default App;
