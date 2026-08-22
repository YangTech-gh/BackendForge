import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CourseTrack, CourseLab, UserState } from '../../types';
import { invokeEdgeFunction } from '../../lib/api';
import { LabTerminalState, LabAIState } from './types';
import { getDynamicSuggestedQuestions, getDynamicQuickCommands } from './constants';

const PARADIGM_DEFAULTS: Record<string, { filename: string; language: string }> = {
  go: { filename: 'main.go', language: 'go' },
  rust: { filename: 'main.rs', language: 'rust' },
  python: { filename: 'main.py', language: 'python' },
  'ruby on rails 7+': { filename: 'app.rb', language: 'ruby' },
  'java & spring boot': { filename: 'App.java', language: 'java' },
  elixir: { filename: 'lib/app.ex', language: 'elixir' },
};

function getDefaultFile(track?: CourseTrack): { filename: string; language: string; code: string } {
  const paradigm = track?.paradigm?.toLowerCase() || '';
  for (const [key, fallback] of Object.entries(PARADIGM_DEFAULTS)) {
    if (paradigm.includes(key)) return { ...fallback, code: '# Write your code here' };
  }
  return { filename: 'main.ts', language: 'typescript', code: '// Write your code here' };
}
import { LabHeader } from './LabHeader';
import { InstructionsPane } from './InstructionsPane';
import { CodeEditorPane } from './CodeEditorPane';
import { AIMentorPane } from './AIMentorPane';

interface InteractiveLabViewProps {
  userState: UserState;
  courses: CourseTrack[];
  onCompleteLab: (labId: string, score: number, code: string) => void;
  onOpenUpgradeModal: () => void;
  onOpenCertificateModal: (trackId?: string) => void;
  selectedTrackId: string;
  selectedLabId: string;
  onSelectTrackAndLab: (trackId: string, labId: string) => void;
}

export const InteractiveLabView: React.FC<InteractiveLabViewProps> = ({
  userState, courses, onCompleteLab, onOpenUpgradeModal, onOpenCertificateModal,
  selectedTrackId, selectedLabId, onSelectTrackAndLab,
}) => {
  const [activeTrackIdx, setActiveTrackIdx] = useState(() => {
    const idx = courses.findIndex(t => t.id === selectedTrackId);
    return idx >= 0 ? idx : 0;
  });
  const [activeLabIdx, setActiveLabIdx] = useState(() => {
    const track = courses.find(t => t.id === selectedTrackId);
    if (!track) return 0;
    const idx = track.labs.findIndex(l => l.id === selectedLabId);
    return idx >= 0 ? idx : 0;
  });
  const [terminal, setTerminal] = useState<LabTerminalState>({ logs: [], input: '' });
  const [aiState, setAiState] = useState<LabAIState>({
    query: '',
    chat: [{ sender: 'ai', text: "Welcome to Backend Forge. I'm Forger 1.0, your systems mentor. How can I help you build?" }],
    isReplying: false,
    isFullscreen: false,
  });
  const [testResults, setTestResults] = useState<{ id: string; passed: boolean; output: string }[] | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mobilePane, setMobilePane] = useState<'editor' | 'ai' | 'instructions'>('editor');
  const [files, setFiles] = useState<{ filename: string; language: string; code: string }[]>([]);

  const currentTrack: CourseTrack | undefined = courses[activeTrackIdx];
  const activeLab: CourseLab | undefined = currentTrack?.labs[activeLabIdx];

  const workflowSteps = useMemo(() => {
    if (!activeLab?.workflowSteps) return [];
    const seen = new Set<string>();
    return activeLab.workflowSteps.filter((step: string) => {
      if (seen.has(step)) return false;
      seen.add(step);
      return true;
    });
  }, [activeLab]);

  useEffect(() => {
    if (!activeLab) {
      setFiles([getDefaultFile(currentTrack)]);
      return;
    }
    const labFiles = activeLab.files?.length ? activeLab.files : activeLab.initialFiles?.length ? activeLab.initialFiles : [getDefaultFile(currentTrack)];
    setFiles(labFiles);
    setActiveFileIndex(0);
    setTestResults(null);
  }, [activeLab]);

  useEffect(() => {
    const idx = courses.findIndex(t => t.id === selectedTrackId);
    if (idx >= 0) setActiveTrackIdx(idx);
  }, [selectedTrackId, courses]);

  useEffect(() => {
    const track = courses[activeTrackIdx];
    if (!track) return;
    const idx = track.labs.findIndex(l => l.id === selectedLabId);
    if (idx >= 0) setActiveLabIdx(idx);
  }, [selectedLabId, activeTrackIdx, courses]);

  const activeCode = useMemo(() => files[activeFileIndex]?.code || '', [files, activeFileIndex]);

  const dynamicQuestions = useMemo(() => getDynamicSuggestedQuestions(activeLab, currentTrack), [activeLab, currentTrack]);
  const dynamicCommands = useMemo(() => getDynamicQuickCommands(activeLab, currentTrack), [activeLab, currentTrack]);

  const handleSetActiveCode = useCallback((code: string) => {
    setFiles(prev => {
      const next = [...prev];
      next[activeFileIndex] = { ...next[activeFileIndex], code };
      return next;
    });
  }, [activeFileIndex]);

  const handleResetCode = useCallback(() => {
    if (!activeLab) return;
    const original = activeLab.files?.length ? activeLab.files : activeLab.initialFiles?.length ? activeLab.initialFiles : [getDefaultFile(currentTrack)];
    setFiles(original);
    setTestResults(null);
  }, [activeLab, currentTrack]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(activeCode).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [activeCode]);

  const handleTerminalSubmit = useCallback((cmd: string) => {
    if (!cmd.trim()) return;
    setTerminal(prev => ({
      logs: [...prev.logs, `$ ${cmd}`, `Command executed successfully.`],
      input: '',
    }));
  }, []);

  const handleRunTests = useCallback(async () => {
    if (!activeLab) return;
    setIsRunningTests(true);
    setTestResults(null);
    try {
      const result = await invokeEdgeFunction<{
        results: { id: string; passed: boolean; output: string }[];
        score: number;
      }>('ai-lab-evaluator', {
        method: 'POST',
        body: {
          labId: activeLab.id,
          code: activeCode,
          testCases: activeLab.testCases,
        },
      });
      setTestResults(result.results);
      const passed = result.results.filter(r => r.passed).length;
      if (result.results.length > 0 && passed === result.results.length) {
        onCompleteLab(activeLab.id, result.score, activeCode);
      }
    } catch {
      const results = activeLab.testCases?.map(tc => ({
        id: tc.id,
        passed: false,
        output: 'Evaluation service unavailable. Try again later.',
      })) || [];
      setTestResults(results);
    } finally {
      setIsRunningTests(false);
    }
  }, [activeLab, activeCode, onCompleteLab]);

  const handleSendQuery = useCallback(async (text?: string) => {
    const queryText = text || aiState.query;
    if (!queryText.trim() || aiState.isReplying) return;
    setAiState(prev => ({
      ...prev,
      query: '',
      chat: [...prev.chat, { sender: 'user', text: queryText }],
      isReplying: true,
    }));
    try {
      const result = await invokeEdgeFunction<{ response: string }>('ai-ask-tutor', {
        method: 'POST',
        body: {
          query: queryText,
          labId: activeLab?.id || '',
          labTitle: activeLab?.title || '',
          labConcept: activeLab?.conceptSummary || '',
          trackTitle: currentTrack?.title || '',
          currentCode: activeCode,
        },
      });
      setAiState(prev => ({
        ...prev,
        isReplying: false,
        chat: [...prev.chat, { sender: 'ai', text: result.response }],
      }));
    } catch {
      setAiState(prev => ({
        ...prev,
        isReplying: false,
        chat: [...prev.chat, {
          sender: 'ai',
          text: `I'm having trouble connecting to the AI mentor right now. Try again in a moment, or review the concept brief and hints in the instructions panel.`,
        }],
      }));
    }
  }, [aiState.query, aiState.isReplying, activeLab, currentTrack, activeCode]);

  if (!activeLab) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No labs available. Select a track to get started.</p>
      </div>
    );
  }

  const currentTrackLabIds = currentTrack?.labs?.map(l => l.id) || [];
  const trackCompletedCount = currentTrackLabIds.filter(id => userState.completedLabs.includes(id)).length;
  const isTrackFullyCompleted = currentTrackLabIds.length > 0 && trackCompletedCount === currentTrackLabIds.length;
  const isCurrentLabCompleted = userState.completedLabs.includes(activeLab.id);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 max-w-[1600px] mx-auto">
      <LabHeader
        currentTrack={currentTrack!}
        activeLabId={activeLab.id}
        userState={userState}
        courses={courses}
        isTrackFullyCompleted={isTrackFullyCompleted}
        trackCompletedCount={trackCompletedCount}
        currentTrackLabIds={currentTrackLabIds}
        isCurrentLabCompleted={isCurrentLabCompleted}
        isRunningTests={isRunningTests}
        isAiEvaluating={aiState.isReplying}
        onSelectTrackAndLab={onSelectTrackAndLab}
        onOpenCertificateModal={onOpenCertificateModal}
        onRequestAiReview={() => handleSendQuery('Review my code')}
        onRunTests={handleRunTests}
      />

      {/* Mobile Pane Switcher */}
      <div className="lg:hidden flex items-center gap-2 mb-4">
        {(['editor', 'ai', 'instructions'] as const).map(pane => (
          <button
            key={pane}
            onClick={() => setMobilePane(pane)}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition ${
              mobilePane === pane ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {pane === 'editor' ? 'Editor' : pane === 'ai' ? 'AI Mentor' : 'Instructions'}
          </button>
        ))}
      </div>

      {/* Desktop: 3-column Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6">
        <div className="col-span-3">
          <InstructionsPane activeLab={activeLab} testResults={testResults} />
        </div>
        <div className="col-span-5">
          <CodeEditorPane
            activeLab={activeLab}
            activeFileIndex={activeFileIndex}
            activeCode={activeCode}
            files={files}
            terminalLogs={terminal.logs}
            terminalInput={terminal.input}
            dynamicCommands={dynamicCommands}
            userState={userState}
            isRunningTests={isRunningTests}
            copySuccess={copySuccess}
            onSetActiveCode={handleSetActiveCode}
            onSelectFile={setActiveFileIndex}
            onResetCode={handleResetCode}
            onCopyCode={handleCopyCode}
            onTerminalInput={(input) => setTerminal(prev => ({ ...prev, input }))}
            onTerminalSubmit={handleTerminalSubmit}
            onRunTests={handleRunTests}
            onOpenUpgradeModal={onOpenUpgradeModal}
          />
        </div>
        <div className="col-span-4">
          <AIMentorPane
            activeLab={activeLab}
            currentTrack={currentTrack}
            aiState={aiState}
            dynamicQuestions={dynamicQuestions}
            onSendQuery={handleSendQuery}
            onSetQuery={(q) => setAiState(prev => ({ ...prev, query: q }))}
            onToggleFullscreen={() => setAiState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
            onRequestAiReview={() => handleSendQuery('Review my code')}
            onInjectCode={(code) => handleSetActiveCode(activeCode + '\n' + code)}
            onClearTerminal={() => setTerminal({ logs: [], input: '' })}
            onOpenUpgrade={onOpenUpgradeModal}
          />
        </div>
      </div>

      {/* Mobile: Single Pane */}
      <div className="lg:hidden">
        {mobilePane === 'editor' && (
          <CodeEditorPane
            activeLab={activeLab}
            activeFileIndex={activeFileIndex}
            activeCode={activeCode}
            files={files}
            terminalLogs={terminal.logs}
            terminalInput={terminal.input}
            dynamicCommands={dynamicCommands}
            userState={userState}
            isRunningTests={isRunningTests}
            copySuccess={copySuccess}
            onSetActiveCode={handleSetActiveCode}
            onSelectFile={setActiveFileIndex}
            onResetCode={handleResetCode}
            onCopyCode={handleCopyCode}
            onTerminalInput={(input) => setTerminal(prev => ({ ...prev, input }))}
            onTerminalSubmit={handleTerminalSubmit}
            onRunTests={handleRunTests}
            onOpenUpgradeModal={onOpenUpgradeModal}
          />
        )}
        {mobilePane === 'ai' && (
          <AIMentorPane
            activeLab={activeLab}
            currentTrack={currentTrack}
            aiState={aiState}
            dynamicQuestions={dynamicQuestions}
            onSendQuery={handleSendQuery}
            onSetQuery={(q) => setAiState(prev => ({ ...prev, query: q }))}
            onToggleFullscreen={() => {}}
            onRequestAiReview={() => handleSendQuery('Review my code')}
            onInjectCode={(code) => handleSetActiveCode(activeCode + '\n' + code)}
            onClearTerminal={() => setTerminal({ logs: [], input: '' })}
            onOpenUpgrade={onOpenUpgradeModal}
          />
        )}
        {mobilePane === 'instructions' && (
          <InstructionsPane activeLab={activeLab} testResults={testResults} />
        )}
      </div>
    </div>
  );
};
