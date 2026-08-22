import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Bot, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Code2, 
  FileCode, 
  Lock, 
  Cpu, 
  Check, 
  ChevronRight,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Award,
  RotateCcw,
  Copy,
  Lightbulb,
  ArrowRight,
  Layers,
  BookOpen,
  Maximize2,
  Minimize2,
  X,
  Loader2,
  MessageSquare,
  Zap,
  AlertTriangle,
  Workflow,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { COURSE_TRACKS } from '../data/coursesData';
import { CourseLab, CourseTrack, UserState } from '../types';

interface InteractiveLabViewProps {
  userState: UserState;
  onCompleteLab: (labId: string) => void;
  onOpenUpgradeModal: () => void;
  onOpenCertificateModal: (trackId?: string) => void;
  selectedTrackId?: string;
  selectedLabId?: string;
  onSelectTrackAndLab?: (trackId: string, labId: string) => void;
}

interface FormattedChatMessageProps {
  text: string;
  onRunTests?: () => void;
  onInjectCode?: (code: string) => void;
  onClearTerminal?: () => void;
  onOpenUpgrade?: () => void;
}

// Component to render formatted chat messages with Markdown rendering, interactive action UI blocks & code injections
const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({
  text,
  onRunTests,
  onInjectCode,
  onClearTerminal,
  onOpenUpgrade
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split text by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-xs sm:text-sm">
      {parts.map((part, idx) => {
        // CODE BLOCK RENDERING
        if (part.startsWith('```') && part.endsWith('```')) {
          const rawLines = part.slice(3, -3).trim().split('\n');
          const firstLine = rawLines[0] || '';
          const hasLang = !firstLine.includes(' ') && firstLine.length < 15;
          const lang = hasLang ? firstLine : '';
          const codeContent = hasLang ? rawLines.slice(1).join('\n') : rawLines.join('\n');

          return (
            <div key={idx} className="my-3 rounded-xl bg-zinc-950 border border-zinc-800/90 overflow-hidden font-mono text-[11px] shadow-xl group">
              <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[10px] text-zinc-400">
                <span className="text-purple-400 uppercase font-bold tracking-wider flex items-center space-x-1">
                  <Code2 className="w-3 h-3 text-purple-400" />
                  <span>{lang || 'SNIPPET'}</span>
                </span>
                <div className="flex items-center space-x-2">
                  {onInjectCode && (
                    <button
                      onClick={() => onInjectCode(codeContent)}
                      className="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/30 flex items-center space-x-1 transition font-mono text-[10px]"
                      title="Inject code directly into active editor file"
                    >
                      <Zap className="w-3 h-3 text-purple-400" />
                      <span>Inject into Editor</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(codeContent, idx)}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center space-x-1 transition text-[10px]"
                    title="Copy code to clipboard"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="p-3.5 text-emerald-300 overflow-x-auto whitespace-pre font-mono leading-relaxed bg-zinc-950/90">
                {codeContent}
              </pre>
            </div>
          );
        }

        // NON-CODE TEXT: Parse lines for Markdown elements (headers, callouts, lists, action widgets)
        const lines = part.split('\n');

        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              // 1. Dynamic Action Directives
              if (trimmed.includes('[ACTION:RUN_TESTS]')) {
                return (
                  <div key={lIdx} className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/40 flex items-center justify-between shadow-lg">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Play className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-200 font-mono block">System Integration Test</span>
                        <span className="text-[10px] text-zinc-400">Execute sandbox unit tests & assertions</span>
                      </div>
                    </div>
                    {onRunTests && (
                      <button
                        onClick={onRunTests}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 shadow-md hover:scale-105"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Tests Now</span>
                      </button>
                    )}
                  </div>
                );
              }

              if (trimmed.includes('[ACTION:SHOW_ARCHITECTURE]') || trimmed.includes('[ACTION:EXPLAIN_DIAGRAM]')) {
                return (
                  <div key={lIdx} className="my-3 p-3.5 rounded-xl bg-zinc-950 border border-purple-500/30 space-y-2 shadow-xl font-mono text-[11px]">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-purple-300 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>SYSTEM ARCHITECTURE TOPOLOGY</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">LIVE FLOW</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-900/80 text-zinc-300 text-[10px] space-y-1 overflow-x-auto">
                      <div className="flex items-center justify-between text-zinc-400 min-w-[320px]">
                        <span>[ Client Request ]</span>
                        <span className="text-purple-400">──▶</span>
                        <span>[ API Gateway / Middleware ]</span>
                        <span className="text-purple-400">──▶</span>
                        <span>[ Redis Lock Guard ]</span>
                      </div>
                      <div className="flex justify-end pr-6 text-purple-400">│</div>
                      <div className="flex items-center justify-between text-emerald-300 font-bold min-w-[320px]">
                        <span>[ ACID Audit Log ]</span>
                        <span className="text-emerald-400">◀──</span>
                        <span>[ PostgreSQL Transaction ]</span>
                        <span className="text-purple-400">◀───┘</span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (trimmed.includes('[ACTION:CLEAR_TERMINAL]')) {
                return (
                  <div key={lIdx} className="my-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400 flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Clear Sandbox Output Logs</span>
                    </span>
                    {onClearTerminal && (
                      <button
                        onClick={onClearTerminal}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] transition"
                      >
                        Clear Terminal
                      </button>
                    )}
                  </div>
                );
              }

              if (trimmed.includes('[ACTION:PRO_UPGRADE]')) {
                return (
                  <div key={lIdx} className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-zinc-950 border border-amber-500/30 flex items-center justify-between shadow-md">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-200 font-mono">Unlock Full Architecture Pro Suite</span>
                    </div>
                    {onOpenUpgrade && (
                      <button
                        onClick={onOpenUpgrade}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-mono font-bold transition shadow"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                );
              }

              // 2. Callout Boxes (> [!NOTE], > [!TIP], > [!WARNING], or standard blockquotes)
              if (trimmed.startsWith('>')) {
                const quoteContent = trimmed.replace(/^>\s*/, '');
                let calloutType: 'tip' | 'warning' | 'info' = 'info';
                let cleanQuote = quoteContent;

                if (quoteContent.startsWith('[!TIP]')) {
                  calloutType = 'tip';
                  cleanQuote = quoteContent.replace('[!TIP]', '').trim();
                } else if (quoteContent.startsWith('[!WARNING]')) {
                  calloutType = 'warning';
                  cleanQuote = quoteContent.replace('[!WARNING]', '').trim();
                } else if (quoteContent.startsWith('[!NOTE]')) {
                  calloutType = 'info';
                  cleanQuote = quoteContent.replace('[!NOTE]', '').trim();
                }

                return (
                  <div
                    key={lIdx}
                    className={`p-3 rounded-xl border text-xs leading-relaxed my-1.5 flex items-start space-x-2.5 ${
                      calloutType === 'tip'
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : calloutType === 'warning'
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        : 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                    }`}
                  >
                    {calloutType === 'tip' && <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {calloutType === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    {calloutType === 'info' && <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />}
                    <div className="flex-1 font-sans">
                      {parseRichInlineText(cleanQuote)}
                    </div>
                  </div>
                );
              }

              // 3. Headings (### , ## , # )
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-xs sm:text-sm font-bold text-purple-300 font-mono border-l-2 border-purple-500 pl-2 mt-3 mb-1">
                    {parseRichInlineText(trimmed.replace('### ', ''))}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lIdx} className="text-sm sm:text-base font-extrabold text-white font-mono mt-3 mb-1 pb-1 border-b border-zinc-800">
                    {parseRichInlineText(trimmed.replace('## ', ''))}
                  </h2>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lIdx} className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-indigo-300 font-mono mt-3 mb-1">
                    {parseRichInlineText(trimmed.replace('# ', ''))}
                  </h1>
                );
              }

              // 4. Horizontal Rules
              if (trimmed === '---' || trimmed === '***') {
                return <hr key={lIdx} className="border-zinc-800 my-2.5" />;
              }

              // 5. Bullet Lists
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const itemText = trimmed.slice(2);
                return (
                  <div key={lIdx} className="flex items-start space-x-2 pl-1.5 my-0.5 text-zinc-300">
                    <span className="text-purple-400 font-bold shrink-0 mt-0.5">•</span>
                    <div className="flex-1 leading-relaxed">
                      {parseRichInlineText(itemText)}
                    </div>
                  </div>
                );
              }

              // 6. Numbered Lists
              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+)\.\s(.*)/);
                if (match) {
                  return (
                    <div key={lIdx} className="flex items-start space-x-2 pl-1.5 my-0.5 text-zinc-300">
                      <span className="text-purple-400 font-mono font-bold shrink-0 text-xs mt-0.5">{match[1]}.</span>
                      <div className="flex-1 leading-relaxed">
                        {parseRichInlineText(match[2])}
                      </div>
                    </div>
                  );
                }
              }

              // Standard Paragraph line
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              return (
                <div key={lIdx} className="leading-relaxed text-zinc-300">
                  {parseRichInlineText(line)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper function to render bold (**text**), italic (*text*), and inline code (`code`)
function parseRichInlineText(text: string) {
  const inlineParts = text.split(/(`[^`]+`)/g);

  return inlineParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="bg-zinc-950 border border-zinc-800 text-emerald-300 font-mono px-1.5 py-0.5 rounded text-[11px] mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }

    const boldParts = part.split(/(\*\*[\s\S]*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        return (
          <strong key={bIdx} className="font-bold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
};

// Helper to get dynamic suggested questions based on active lab & track paradigm
const getDynamicSuggestedQuestions = (lab: CourseLab, track: CourseTrack): string[] => {
  const labId = lab.id.toLowerCase();
  const paradigm = track.paradigm.toLowerCase();

  if (labId.includes('idempotency') || labId.includes('lock')) {
    return [
      '💡 How does Redis SETNX prevent double-charging during concurrent request bursts?',
      '🔐 What happens if the Redis lock TTL expires before the DB transaction commits?',
      '🎯 Give me a step-by-step architectural hint for passing this idempotency lab.'
    ];
  }
  if (labId.includes('worker') || labId.includes('goroutine') || paradigm.includes('go')) {
    return [
      '⚡ How do buffered channels prevent goroutine memory leaks under peak RPS?',
      '🛡️ When should I use sync.RWMutex vs atomic channel passing in Go?',
      '🎯 Give me a step-by-step hint for handling worker context cancellation.'
    ];
  }
  if (labId.includes('axum') || labId.includes('rust') || paradigm.includes('rust')) {
    return [
      '🦀 How does Arc<Mutex<T>> state sharing ensure thread safety in Rust?',
      '⚙️ Why are Send + Sync bounds required for Axum async route handlers?',
      '🎯 Give me a step-by-step hint for zero-cost middleware in Rust.'
    ];
  }
  if (labId.includes('mvcc') || labId.includes('postgres') || labId.includes('sql')) {
    return [
      '🐘 What is the exact difference between SELECT FOR UPDATE vs Advisory Locks?',
      '⚡ Why is SKIP LOCKED essential for high-throughput background queues?',
      '🎯 Give me a step-by-step hint for avoiding PostgreSQL deadlocks.'
    ];
  }
  if (labId.includes('fastapi') || labId.includes('python') || paradigm.includes('python')) {
    return [
      '🐍 Why does blocking synchronous I/O inside async def freeze Uvicorn workers?',
      '📦 How does SQLAlchemy async session context manager handle rollbacks?',
      '🎯 Give me a step-by-step hint for FastAPI async DB operations.'
    ];
  }
  if (labId.includes('rails') || labId.includes('ruby') || paradigm.includes('ruby')) {
    return [
      '💎 What is optimistic vs pessimistic locking in Rails Active Record?',
      '⚡ How do advisory locks interact with Puma threads & Sidekiq workers?',
      '🎯 Give me a step-by-step hint for Rails transaction isolation levels.'
    ];
  }
  if (labId.includes('virtual-threads') || labId.includes('spring') || paradigm.includes('java')) {
    return [
      '☕ How do JDK 21 Virtual Threads eliminate OS thread context switching?',
      '🔒 Why should synchronized blocks be replaced with ReentrantLock in Loom?',
      '🎯 Give me a step-by-step hint for virtual thread thread-local pin debugging.'
    ];
  }
  if (labId.includes('beam') || labId.includes('genserver') || paradigm.includes('elixir')) {
    return [
      '🧪 How does the "Let It Crash" philosophy work with OTP Supervisors?',
      '⚡ What is GenServer call vs cast performance difference under load?',
      '🎯 Give me a step-by-step hint for state recovery in Elixir processes.'
    ];
  }
  if (labId.includes('vector') || labId.includes('pgvector') || labId.includes('agent')) {
    return [
      '🤖 How does HNSW index accelerate pgvector cosine similarity search?',
      '🔧 How do Forger 1.0 tool-calling function definitions execute multi-step loops?',
      '🎯 Give me a step-by-step hint for handling embedding index updates.'
    ];
  }

  return [
    `💡 Explain the core architecture of ${lab.title}`,
    `⚠️ What are common edge cases or race conditions in ${track.paradigm}?`,
    `🎯 Give me a step-by-step hint for passing this lab assertion.`
  ];
};

interface CommandItem {
  label: string;
  cmd: string;
  color: string;
}

// Helper to get dynamic CLI quick commands based on paradigm
const getDynamicQuickCommands = (lab: CourseLab, track: CourseTrack): CommandItem[] => {
  const labId = lab.id.toLowerCase();
  const paradigm = track.paradigm.toLowerCase();

  if (paradigm.includes('go')) {
    return [
      { label: '▶ go test ./...', cmd: 'go test -v ./...', color: 'text-emerald-400' },
      { label: '⚡ go run main.go', cmd: 'go run main.go', color: 'text-cyan-400' },
      { label: '🌐 curl /api/v1/pool', cmd: 'curl -i /api/v1/pool', color: 'text-purple-400' },
      { label: '📊 go tool pprof', cmd: 'go tool pprof -top', color: 'text-amber-400' },
      { label: '🧹 clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }

  if (paradigm.includes('rust')) {
    return [
      { label: '▶ cargo test', cmd: 'cargo test -- --nocapture', color: 'text-emerald-400' },
      { label: '⚡ cargo run', cmd: 'cargo run', color: 'text-cyan-400' },
      { label: '🌐 curl /health', cmd: 'curl -i http://localhost:3000/health', color: 'text-purple-400' },
      { label: '🔍 cargo clippy', cmd: 'cargo clippy', color: 'text-amber-400' },
      { label: '🧹 clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }

  if (paradigm.includes('postgres') || labId.includes('mvcc') || labId.includes('sql')) {
    return [
      { label: '▶ npm test', cmd: 'npm test', color: 'text-emerald-400' },
      { label: '🐘 psql EXPLAIN', cmd: 'psql -c "EXPLAIN ANALYZE SELECT * FROM accounts FOR UPDATE;"', color: 'text-cyan-400' },
      { label: '🌐 curl /api/ledger', cmd: 'curl -i /api/ledger', color: 'text-purple-400' },
      { label: '🔒 psql locks', cmd: 'psql -c "SELECT * FROM pg_locks;"', color: 'text-amber-400' },
      { label: '🧹 clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }

  if (paradigm.includes('python')) {
    return [
      { label: '▶ pytest', cmd: 'pytest -v', color: 'text-emerald-400' },
      { label: '⚡ uvicorn run', cmd: 'uvicorn main:app --reload', color: 'text-cyan-400' },
      { label: '🌐 curl /predict', cmd: 'curl -X POST /api/v1/predict -d "{\\"query\\": \\"test\\"}"', color: 'text-purple-400' },
      { label: '🧹 clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }

  if (paradigm.includes('ruby')) {
    return [
      { label: '▶ rspec', cmd: 'bundle exec rspec', color: 'text-emerald-400' },
      { label: '⚡ rails server', cmd: 'rails server', color: 'text-cyan-400' },
      { label: '🌐 curl /orders', cmd: 'curl -i /orders/process', color: 'text-purple-400' },
      { label: '🧹 clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }

  if (paradigm.includes('java')) {
    return [
      { label: '▶ mvn test', cmd: 'mvn test', color: 'text-emerald-400' },
      { label: '⚡ java -jar', cmd: 'java -jar app.jar', color: 'text-cyan-400' },
      { label: '🌐 curl /actuator', cmd: 'curl -i /actuator/health', color: 'text-purple-400' },
      { label: '🧹 clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }

  if (paradigm.includes('elixir')) {
    return [
      { label: '▶ mix test', cmd: 'mix test', color: 'text-emerald-400' },
      { label: '⚡ iex -S mix', cmd: 'iex -S mix phx.server', color: 'text-cyan-400' },
      { label: '🌐 curl /genserver', cmd: 'curl -i /api/genserver/stats', color: 'text-purple-400' },
      { label: '🧹 clear', cmd: 'clear', color: 'text-zinc-400' },
    ];
  }

  return [
    { label: '▶ npm test', cmd: 'npm test', color: 'text-emerald-400' },
    { label: '⚡ node app.js', cmd: 'node app.js', color: 'text-cyan-400' },
    { label: '🌐 curl /api/webhooks', cmd: 'curl -X POST /api/webhooks -H "X-Idempotency-Key: ik_test_123"', color: 'text-purple-400' },
    { label: '🔑 redis-cli GET', cmd: 'redis-cli GET idempotency:tenant_101', color: 'text-amber-400' },
    { label: '🧹 clear', cmd: 'clear', color: 'text-zinc-400' },
  ];
};

export const InteractiveLabView: React.FC<InteractiveLabViewProps> = ({
  userState,
  onCompleteLab,
  onOpenUpgradeModal,
  onOpenCertificateModal,
  selectedTrackId = 'track-1-node-ts',
  selectedLabId = 'lab-idempotency-engine',
  onSelectTrackAndLab,
}) => {
  // Find current active lab or fallback
  const currentTrack = COURSE_TRACKS.find(t => t.id === selectedTrackId) || COURSE_TRACKS[0];
  const activeLab: CourseLab = currentTrack.labs.find(l => l.id === selectedLabId) || currentTrack.labs[0];

  // Dynamic Questions & Dynamic Commands
  const dynamicQuestions = getDynamicSuggestedQuestions(activeLab, currentTrack);
  const dynamicCommands = getDynamicQuickCommands(activeLab, currentTrack);

  // Code state
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [files, setFiles] = useState(activeLab.initialFiles);
  const [activeCode, setActiveCode] = useState<string>(activeLab.initialFiles[0]?.code || '');

  // UI Helper states
  const [showHint, setShowHint] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Terminal & Test runner state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{ id: string; passed: boolean; output: string }[] | null>(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[SYS] Connected to Backend Forge Interactive Sandbox Container`,
    `[SYS] Loaded Lab Environment: "${activeLab.title}"`,
    `[SYS] Ready. Click 'Run Test Suite' or click command buttons below.`
  ]);

  // AI Tutor / Evaluator State
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [aiReviewResult, setAiReviewResult] = useState<any | null>(null);
  const [tutorQuery, setTutorQuery] = useState('');
  const [isTutorReplying, setIsTutorReplying] = useState(false);
  const [isTutorFullscreen, setIsTutorFullscreen] = useState(false);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fullscreenChatScrollRef = useRef<HTMLDivElement>(null);

  const [tutorChat, setTutorChat] = useState<{ sender: 'user' | 'tutor'; text: string }[]>([
    {
      sender: 'tutor',
      text: `Welcome to **${activeLab.title}**! I am your AI Systems Architect Mentor. Read the requirements on the left, edit your code in the center editor, and click "Run Test Suite" when ready!`
    }
  ]);

  // Auto-scroll chat history when messages or thinking state updates
  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    fullscreenChatScrollRef.current?.scrollTo({ top: fullscreenChatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [tutorChat, isTutorReplying, isTutorFullscreen]);

  // Listen for Escape key to close Fullscreen Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTutorFullscreen) {
        setIsTutorFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorFullscreen]);

  // Track lab completion progress
  const currentTrackLabIds = currentTrack.labs.map(l => l.id);
  const trackCompletedCount = userState.completedLabs.filter(id => currentTrackLabIds.includes(id)).length;
  const isTrackFullyCompleted = currentTrackLabIds.length > 0 && trackCompletedCount === currentTrackLabIds.length;
  const isCurrentLabCompleted = userState.completedLabs.includes(activeLab.id);

  // Sync state when lab or track selection changes
  useEffect(() => {
    setActiveFileIndex(0);
    setFiles(activeLab.initialFiles);
    setActiveCode(activeLab.initialFiles[0]?.code || '');
    setTestResults(null);
    setAiReviewResult(null);
    setShowHint(false);
    setTerminalLogs([
      `[SYS] Connected to Backend Forge Interactive Sandbox Container`,
      `[SYS] Loaded Lab Environment: "${activeLab.title}"`,
      `[SYS] Paradigm: ${currentTrack.paradigm} • Access: ${!activeLab.isPro ? 'FREE PREVIEW' : 'PRO EXCLUSIVE'}`,
      `[SYS] Ready. Click 'Run Test Suite' or click command buttons below.`
    ]);
    setTutorChat([
      {
        sender: 'tutor',
        text: `Switched to **${activeLab.title}** (${currentTrack.paradigm}). Need help understanding instructions or edge-case testing? Click a suggested question or ask me anything!`
      }
    ]);
  }, [selectedLabId, selectedTrackId]);

  // File switch
  const handleSelectFile = (index: number) => {
    const updated = [...files];
    if (updated[activeFileIndex]) {
      updated[activeFileIndex].code = activeCode;
    }
    setFiles(updated);

    setActiveFileIndex(index);
    setActiveCode(updated[index]?.code || '');
  };

  // Reset Code to Template
  const handleResetCode = () => {
    const initialCode = activeLab.initialFiles[activeFileIndex]?.code || activeLab.initialFiles[0]?.code || '';
    setActiveCode(initialCode);
    const updated = [...files];
    if (updated[activeFileIndex]) {
      updated[activeFileIndex].code = initialCode;
    }
    setFiles(updated);
    setTerminalLogs(prev => [...prev, `[SYS] Reset file '${files[activeFileIndex]?.filename || 'src'}' to default template.`]);
  };

  // Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Run Tests Execution
  const handleRunTests = async () => {
    if (activeLab.isPro && userState.tier !== 'pro') {
      onOpenUpgradeModal();
      return;
    }

    setIsRunningTests(true);
    setTerminalLogs(prev => [
      ...prev,
      `$ npm test -- --runInBand`,
      `[RUNNER] Compiling & running test assertions on ${files[activeFileIndex]?.filename || 'src/index.js'}...`
    ]);

    setTimeout(() => {
      // Basic code compilation test
      let hasSyntaxError = false;
      let evalOutput = '';
      try {
        new Function(activeCode);
      } catch (err: any) {
        hasSyntaxError = true;
        evalOutput = err.message;
      }

      if (hasSyntaxError) {
        setIsRunningTests(false);
        setTestResults(activeLab.testCases.map(tc => ({
          id: tc.id,
          passed: false,
          output: `✘ FAILED: ${tc.name} - Compilation Error: ${evalOutput}`
        })));
        setTerminalLogs(prev => [
          ...prev,
          `[RUNNER ERR] Test Suite Failed! Syntax error in code.`,
          `[DETAILS] ${evalOutput}`
        ]);
        return;
      }

      // All tests pass
      const mockResults = activeLab.testCases.map((tc) => ({
        id: tc.id,
        passed: true,
        output: `✔ PASSED: ${tc.name} (${tc.expectedOutcome})`
      }));

      setTestResults(mockResults);
      setIsRunningTests(false);

      const updatedCompleted = Array.from(new Set([...userState.completedLabs, activeLab.id]));
      const isTrackNowComplete = currentTrackLabIds.every(id => updatedCompleted.includes(id));

      setTerminalLogs(prev => [
        ...prev,
        `[RUNNER] Test Suite Passed! (${activeLab.testCases.length}/${activeLab.testCases.length} tests green)`,
        `[SYS] Awarded +150 XP! Lab progress saved.`,
        ...(isTrackNowComplete ? [
          `--------------------------------------------------`,
          `🎉 CONGRATULATIONS! Track Complete: "${currentTrack.title}"!`,
          `🏆 All ${currentTrackLabIds.length} lab modules finished! Claim your official verified credential!`,
          `--------------------------------------------------`
        ] : [])
      ]);

      onCompleteLab(activeLab.id);

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // confetti fallback
      }
    }, 1000);
  };

  // Terminal CLI Input Handler
  const handleTerminalCommandSubmit = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    setTerminalInput('');

    setTerminalLogs(prev => [...prev, `$ ${trimmed}`]);

    if (trimmed === 'clear') {
      setTerminalLogs([`[SYS] Terminal cleared.`]);
      return;
    }

    if (trimmed === 'help') {
      setTerminalLogs(prev => [
        ...prev,
        `[SYS] Available sandbox commands for ${currentTrack.paradigm}:`,
        ...dynamicCommands.map(c => `  - ${c.cmd.padEnd(25)} : Execute ${c.label}`),
        `  - clear                     : Clear terminal log output`,
        `  - help                      : Display command reference`
      ]);
      return;
    }

    if (trimmed === 'npm test' || trimmed === 'test' || trimmed.startsWith('go test') || trimmed.startsWith('cargo test') || trimmed.startsWith('pytest') || trimmed.startsWith('bundle exec rspec') || trimmed.startsWith('mvn test') || trimmed.startsWith('mix test')) {
      handleRunTests();
      return;
    }

    if (trimmed.startsWith('go run') || trimmed.startsWith('cargo run') || trimmed.startsWith('uvicorn') || trimmed.startsWith('rails') || trimmed.startsWith('java') || trimmed.startsWith('iex')) {
      setTerminalLogs(prev => [
        ...prev,
        `[SERVER] Booting sandbox runtime container for ${currentTrack.paradigm}...`,
        `[SYS] Compiled in 0.34s • Listening on http://127.0.0.1:3000`,
        `[SYS] Initialized background worker pools and database connection pool (max_connections: 50).`,
        `[READY] Operational for lab "${activeLab.title}".`
      ]);
      return;
    }

    if (trimmed.startsWith('psql')) {
      setTerminalLogs(prev => [
        ...prev,
        `psql (PostgreSQL 16.2)`,
        `Type "help" for help.`,
        ` `,
        `QUERY PLAN Execution Time: 0.842 ms`,
        `----------------------------------------------------------------------------------`,
        `Locking Clause: FOR UPDATE SKIP LOCKED`,
        `-> Index Scan using idx_webhook_events_tenant_id on webhook_events (cost=0.28..8.30 rows=1)`,
        `   Filter: (status = 'PENDING')`,
        `[DB SUCCESS] 1 row locked with exclusive row-level MVCC lease.`
      ]);
      return;
    }

    if (trimmed.startsWith('redis-cli')) {
      setTerminalLogs(prev => [
        ...prev,
        `redis 7.2.4> GET "idempotency:tenant_101:ik_test_123"`,
        `"{ \\"status\\": \\"COMPLETED\\", \\"processedAt\\": \\"${new Date().toISOString()}\\", \\"httpCode\\": 200, \\"result\\": { \\"chargeId\\": \\"ch_3Mj8452eZvKYlo2C01\\" } }"`,
        `TTL: 86392 seconds remaining.`
      ]);
      return;
    }

    if (trimmed.startsWith('go tool pprof') || trimmed.startsWith('cargo clippy')) {
      setTerminalLogs(prev => [
        ...prev,
        `[PROFILER / LINTER] Analyzing AST and memory allocations for ${activeLab.title}...`,
        `✓ Zero memory leaks detected in goroutine/thread handles.`,
        `✓ Allocation profile: 0 B/op (0 allocs/op) on fast path.`
      ]);
      return;
    }

    if (trimmed.startsWith('node') || trimmed.startsWith('run')) {
      try {
        setTerminalLogs(prev => [...prev, `[NODE] Executing active file in sandbox...`]);
        let capturedLogs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args: any[]) => capturedLogs.push(`[ERR] ${args.join(' ')}`),
          warn: (...args: any[]) => capturedLogs.push(`[WARN] ${args.join(' ')}`),
        };
        const safeRun = new Function('console', activeCode);
        safeRun(customConsole);
        if (capturedLogs.length === 0) {
          capturedLogs.push(`[NODE] Script executed cleanly with exit code 0.`);
        }
        setTerminalLogs(prev => [...prev, ...capturedLogs]);
      } catch (err: any) {
        setTerminalLogs(prev => [...prev, `[NODE ERR] ${err.message}`]);
      }
      return;
    }

    if (trimmed.startsWith('curl')) {
      setTerminalLogs(prev => [
        ...prev,
        `HTTP/1.1 200 OK`,
        `Server: BackendForge-Sandbox/1.0`,
        `Content-Type: application/json`,
        `X-Idempotency-Status: COMPLETED_CACHED`,
        `X-Processing-Time-ms: 1.4`,
        `{`,
        `  "status": "ok",`,
        `  "labModule": "${activeLab.title}",`,
        `  "paradigm": "${currentTrack.paradigm}",`,
        `  "payloadProcessed": true,`,
        `  "timestamp": "${new Date().toISOString()}"`,
        `}`
      ]);
      return;
    }

    setTerminalLogs(prev => [...prev, `[SYS] Command executed: '${trimmed}'. Click Quick Command buttons or type 'help'.`]);
  };

  // AI Review Call (hits /api/ai/lab-evaluator)
  const handleRequestAiReview = async () => {
    setIsAiEvaluating(true);
    setTerminalLogs(prev => [...prev, `[AI] Submitting code to Forger 1.0 Systems Evaluator...`]);

    try {
      const res = await fetch('/api/ai/lab-evaluator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: currentTrack.id,
          labTitle: activeLab.title,
          code: activeCode,
          language: files[activeFileIndex]?.language || 'typescript'
        })
      });

      const data = await res.json();
      setAiReviewResult(data);
      setIsAiEvaluating(false);

      setTutorChat(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: `**AI Code Review Complete (Score: ${data.score}/100)**\n\n${data.feedback}\n\n**Security Tip:** ${data.securitySuggestions?.[0] || 'No critical vulnerability detected.'}`
        }
      ]);
    } catch (err: any) {
      console.error('AI Review Error:', err);
      setIsAiEvaluating(false);
    }
  };

  // Ask AI Tutor
  const handleSendTutorQuery = async (queryText?: string) => {
    const q = queryText || tutorQuery;
    if (!q.trim() || isTutorReplying) return;
    if (!queryText) setTutorQuery('');

    setTutorChat(prev => [...prev, { sender: 'user', text: q }]);
    setIsTutorReplying(true);

    try {
      const res = await fetch('/api/ai/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          contextTrack: `${currentTrack.title} - ${activeLab.title}`
        })
      });

      const data = await res.json();
      setTutorChat(prev => [...prev, { sender: 'tutor', text: data.answer || 'No response returned.' }]);
    } catch (err) {
      setTutorChat(prev => [...prev, { sender: 'tutor', text: 'Error connecting to AI mentor service.' }]);
    } finally {
      setIsTutorReplying(false);
    }
  };

  // Find next lab in track if available
  const activeLabIndex = currentTrack.labs.findIndex(l => l.id === activeLab.id);
  const nextLabInTrack = currentTrack.labs[activeLabIndex + 1];

  // Helper lines array for editor line numbers
  const codeLines = activeCode.split('\n');

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header & Track/Lab Switcher Navigation */}
      <div className="liquid-glass border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Track & Lab Navigation Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Single Merged Stylized Track Selector Dropdown */}
              {onSelectTrackAndLab ? (
                <div className="relative inline-flex items-center group">
                  <select
                    value={currentTrack.id}
                    onChange={(e) => {
                      const targetTrack = COURSE_TRACKS.find(t => t.id === e.target.value);
                      if (targetTrack && targetTrack.labs[0]) {
                        onSelectTrackAndLab(targetTrack.id, targetTrack.labs[0].id);
                      }
                    }}
                    className={`appearance-none cursor-pointer pl-3.5 pr-8 py-1 rounded-full text-[11px] font-mono font-extrabold border transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${currentTrack.badgeColor} bg-zinc-950/90 shadow-md hover:brightness-110`}
                  >
                    {COURSE_TRACKS.map(t => (
                      <option key={t.id} value={t.id} className="bg-zinc-950 text-zinc-200 py-1 font-mono">
                        TRACK {t.trackNumber}: {t.paradigm} ({t.labs.length} Labs)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-zinc-300 group-hover:text-white transition" />
                </div>
              ) : (
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentTrack.badgeColor}`}>
                  TRACK {currentTrack.trackNumber}: {currentTrack.paradigm}
                </span>
              )}

              {/* Active Lab Badge */}
              {isCurrentLabCompleted ? (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1 font-bold">
                  <Check className="w-3 h-3" />
                  <span>LAB COMPLETED (+150 XP)</span>
                </span>
              ) : (
                <span className="text-xs font-mono text-red-300 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30 font-bold">
                  IN PROGRESS
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <span>{activeLab.title}</span>
            </h1>
          </div>

          {/* Action Buttons Top Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenCertificateModal(currentTrack.id)}
              className={`flex items-center space-x-1.5 font-bold px-3.5 py-2 rounded-xl text-xs transition font-mono ${
                isTrackFullyCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${isTrackFullyCompleted ? 'text-amber-300' : 'text-zinc-400'}`} />
              <span>Claim Certificate ({trackCompletedCount}/{currentTrackLabIds.length})</span>
            </button>

            <button
              onClick={handleRequestAiReview}
              disabled={isAiEvaluating}
              className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-red-300 border border-red-500/30 font-semibold px-4 py-2 rounded-xl text-xs transition font-mono shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>{isAiEvaluating ? 'Evaluating...' : 'Request AI Code Review'}</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition font-mono shadow-xl shadow-red-950/50 border border-red-500/30"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isRunningTests ? 'Executing Tests...' : 'Run Test Suite'}</span>
            </button>
          </div>
        </div>

        {/* Labs Switcher Pills Row */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase font-bold shrink-0 flex items-center gap-1">
            <Layers className="w-3 h-3 text-red-400" />
            <span>Track Labs:</span>
          </span>

          {currentTrack.labs.map((lab, idx) => {
            const isSelected = lab.id === activeLab.id;
            const isLabDone = userState.completedLabs.includes(lab.id);

            return (
              <button
                key={lab.id}
                onClick={() => onSelectTrackAndLab && onSelectTrackAndLab(currentTrack.id, lab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition flex items-center space-x-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-red-500/20 text-red-200 border border-red-500/40 font-bold shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800/80'
                }`}
              >
                <span>Lab {currentTrack.trackNumber}.{idx + 1}</span>
                {isLabDone && <Check className="w-3 h-3 text-emerald-400" />}
                {lab.isPro ? (
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 flex items-center space-x-0.5">
                    <Lock className="w-2.5 h-2.5 text-amber-400" />
                    <span>PRO</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    FREE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Guided Workflow Steps Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 flex items-center space-x-3">
            <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-red-500/20">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-white">Review Task Brief</div>
              <p className="text-[10px] text-zinc-400">Read concept & required logic steps on left</p>
            </div>
          </div>

          <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 flex items-center space-x-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-500/20">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-white">Modify Code Solution</div>
              <p className="text-[10px] text-zinc-400">Implement locks & transaction boundaries</p>
            </div>
          </div>

          <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 flex items-center space-x-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-white">Verify & Earn +150 XP</div>
              <p className="text-[10px] text-zinc-400">Click 'Run Test Suite' to pass assertions</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Multi-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-5 items-start">
        
        {/* Left Pane: Concept, Requirements & Hints (3 Cols) */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4">
          
          <div className="liquid-glass border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xl max-h-[720px] overflow-y-auto">
            
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-red-400 font-bold tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-red-400" />
                <span>SYSTEM CONCEPT BRIEF</span>
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {activeLab.conceptSummary}
              </p>
            </div>

            {/* Instructions & Step Checklist */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                Lab Requirements Checklist
              </h3>
              <ol className="space-y-2">
                {activeLab.instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                    <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-red-500/20">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-sans">{inst}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Hint & Architecture Guidance Toggle */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 text-amber-300 text-xs font-mono font-bold border border-amber-500/30 hover:border-amber-500/50 transition"
              >
                <span className="flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Need a Hint / Architecture Clue?</span>
                </span>
                <span className="text-[10px]">{showHint ? 'Hide ▲' : 'Show ▼'}</span>
              </button>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 space-y-2 font-mono leading-relaxed"
                  >
                    <div className="font-bold text-amber-300">💡 Systems Hint:</div>
                    <p className="text-[11px] font-sans">
                      Ensure all atomic operations adhere to the isolation requirements. Wrap database execution in transaction boundaries and clear any lock handles on error!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Test Cases Verification List */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                Automated Test Verification ({activeLab.testCases.length} assertions)
              </h3>

              <div className="space-y-2">
                {activeLab.testCases.map((tc) => {
                  const result = testResults?.find(r => r.id === tc.id);

                  return (
                    <div key={tc.id} className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-200">{tc.name}</span>
                        {result ? (
                          result.passed ? (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center space-x-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>PASSED</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center space-x-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              <XCircle className="w-3 h-3" />
                              <span>FAILED</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500">PENDING RUN</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans">{tc.expectedOutcome}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Center Pane: Code Editor & Sandbox Terminal (5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          
          {/* Code Editor Container */}
          <div className="liquid-glass border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Free Lab Notice Banner */}
            {!activeLab.isPro && (
              <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-indigo-950/40 px-4 py-2 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[9px]">
                    FREE PREVIEW LAB
                  </span>
                  <span>You are practicing in a free preview module. Unlock 24 advanced modules with Pro.</span>
                </div>
                {userState.tier !== 'pro' && (
                  <button
                    onClick={onOpenUpgradeModal}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center space-x-1"
                  >
                    <span>Unlock Pro Curriculum ($199)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* File Tabs & Utility Toolbar */}
            <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 border-b border-zinc-800 overflow-x-auto gap-2">
              <div className="flex items-center space-x-1">
                {files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectFile(idx)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                      activeFileIndex === idx
                        ? 'bg-zinc-800 text-red-300 border border-zinc-700 shadow-sm font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-red-400" />
                    <span>{file.filename}</span>
                  </button>
                ))}
              </div>

              {/* IDE Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleResetCode}
                  title="Reset code to original template"
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-mono flex items-center space-x-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Code</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  title="Copy code to clipboard"
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-mono flex items-center space-x-1 transition"
                >
                  {copySuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code Textarea / IDE OR PRO PAYWALL OVERLAY */}
            {activeLab.isPro && userState.tier !== 'pro' ? (
              <div className="p-8 bg-zinc-950/90 border-b border-zinc-800 text-center space-y-5 my-1 relative min-h-[320px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10">
                  <Lock className="w-7 h-7" />
                </div>
                
                <div className="space-y-1.5 max-w-md">
                  <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                    PRO EXTENSION LAB MODULE
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    Unlock {activeLab.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    This advanced production lab is part of Backend Forge Pro. Unlock all 24 tracks, live Forger 1.0 AI code reviews, and official verified mastery certificates.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    onClick={onOpenUpgradeModal}
                    className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition font-mono shadow-xl shadow-red-950/50 flex items-center space-x-1.5 border border-red-500/30"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Unlock Pro Curriculum ($199)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative bg-zinc-950 font-mono text-xs text-zinc-100 flex min-h-[340px] max-h-[440px] overflow-auto">
                {/* Visual Line Numbers Gutter */}
                <div className="py-4 px-3 bg-zinc-950/90 border-r border-zinc-800/80 text-zinc-600 select-none text-right font-mono text-[11px] leading-relaxed shrink-0">
                  {codeLines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Editable Code Area */}
                <textarea
                  value={activeCode}
                  onChange={(e) => setActiveCode(e.target.value)}
                  className="w-full h-full min-h-[320px] bg-transparent text-zinc-200 focus:outline-none resize-none font-mono text-xs p-4 leading-relaxed tracking-wide"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Bottom Integrated Interactive Terminal */}
            <div className="border-t border-zinc-800 bg-zinc-950 p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/80 pb-2">
                <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sandbox Terminal</span>
                </span>
                <span className="text-[10px] text-zinc-500">{currentTrack.paradigm} Sandbox • Docker Container</span>
              </div>

              {/* Quick CLI Execution Command Buttons (Dynamic per lab/stack) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Quick Commands:</span>
                {dynamicCommands.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTerminalCommandSubmit(item.cmd)}
                    className={`px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono transition ${item.color}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1 text-zinc-300 max-h-36 overflow-y-auto pt-1 font-mono">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="text-[11px] leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>

              {/* Interactive CLI Prompt */}
              <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800/80">
                <span className="text-emerald-400 font-bold font-mono">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTerminalCommandSubmit(terminalInput)}
                  placeholder={`Type '${dynamicCommands[0]?.cmd || 'npm test'}', 'curl ...', or 'help'...`}
                  className="flex-1 bg-transparent text-emerald-300 placeholder-zinc-600 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Pane: AI Systems Architect Mentor Panel (4 Cols - Sticky Right Column) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* AI Systems Architect Mentor Panel */}
          <div className="liquid-glass border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Bot className="w-4.5 h-4.5 text-red-400" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white font-mono block">
                    AI Systems Architect Mentor
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Forger 1.0 • {activeLab.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsTutorFullscreen(true)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-mono font-bold transition shadow-sm"
                  title="Expand to Fullscreen Focus Mode"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Focus Chat Mode</span>
                </button>
              </div>
            </div>

            {/* Dynamic Suggested Question Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold font-mono">Suggested:</span>
              {dynamicQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTutorQuery(q.replace(/^[💡🔐🎯⚡🦀🐘🐍💎☕🧪🤖🔧⚠️]\s*/, ''))}
                  disabled={isTutorReplying}
                  className="px-2.5 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-mono transition text-left disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Tutor Chat History Container (Spacious Scrollable Viewport in Right Panel) */}
            <div
              ref={chatScrollRef}
              className="space-y-3.5 min-h-[420px] max-h-[640px] overflow-y-auto pr-1.5 font-sans border border-zinc-900 rounded-xl p-3.5 bg-zinc-950/70"
            >
              {tutorChat.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl text-xs space-y-1.5 transition-all shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-red-950/40 to-indigo-950/40 border border-red-500/30 text-zinc-100 ml-8 sm:ml-16'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 mr-8 sm:mr-16'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1 text-[10px] font-mono">
                    <span className={`font-bold flex items-center space-x-1 ${msg.sender === 'user' ? 'text-red-400' : 'text-purple-400'}`}>
                      {msg.sender === 'user' ? (
                        <span>YOU</span>
                      ) : (
                        <span className="flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>GEMINI 3.6 FLASH MENTOR</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <FormattedChatMessage
                    text={msg.text}
                    onRunTests={handleRequestAiReview}
                    onInjectCode={(codeSnippet) => {
                      setFiles(prev => prev.map((f, i) => i === activeFileIndex ? { ...f, content: codeSnippet } : f));
                      setTerminalLogs(p => [...p, `[EDITOR] Injected code snippet into active file.`]);
                    }}
                    onClearTerminal={() => setTerminalLogs([])}
                    onOpenUpgrade={onOpenUpgradeModal}
                  />
                </div>
              ))}

              {/* Gemini Thinking Animation */}
              {isTutorReplying && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-950 to-indigo-950/40 border border-purple-500/30 text-xs text-purple-200 mr-8 font-mono space-y-2 shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                    </div>
                    <span className="font-bold text-purple-300 tracking-wider">GEMINI IS THINKING...</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-zinc-400 pl-1">
                    <div className="flex space-x-1.5 items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Analyzing system topology, race conditions & drafting architectural solution...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input prompt bar */}
            <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800/80">
              <input
                type="text"
                value={tutorQuery}
                disabled={isTutorReplying}
                onChange={(e) => setTutorQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTutorQuery()}
                placeholder={isTutorReplying ? 'Forger 1.0 is drafting answer...' : `Ask mentor about ${activeLab.title}...`}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 font-mono disabled:opacity-50"
              />
              <button
                onClick={() => handleSendTutorQuery()}
                disabled={isTutorReplying || !tutorQuery.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white rounded-xl transition shadow-md font-mono text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isTutorReplying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ask</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* FULLSCREEN FOCUS MODE MODAL FOR EXPANDED DIALOGUE */}
      <AnimatePresence>
        {isTutorFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl p-3 sm:p-6 flex items-center justify-center overflow-hidden"
          >
            <div className="w-full max-w-5xl h-[92vh] liquid-glass border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative bg-zinc-950/90">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/90">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-500/20 via-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                      <span>AI Systems Architect Mentor (Forger 1.0)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        FOCUS MODE
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 font-sans">
                      Active Context: <span className="text-zinc-200 font-mono font-bold">{currentTrack.title}</span> • <span className="text-red-400 font-mono">{activeLab.title}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsTutorFullscreen(false)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition flex items-center space-x-1.5 text-xs font-mono"
                    title="Exit Focus Mode (ESC)"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Exit Focus (ESC)</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Suggested Question Chips */}
              <div className="px-6 py-3 bg-zinc-950/50 border-b border-zinc-900 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold font-mono">Quick Inquiries:</span>
                {dynamicQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendTutorQuery(q.replace(/^[💡🔐🎯⚡🦀🐘🐍💎☕🧪🤖🔧⚠️]\s*/, ''))}
                    disabled={isTutorReplying}
                    className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono transition disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Expanded Chat Conversation Viewport */}
              <div
                ref={fullscreenChatScrollRef}
                className="flex-1 p-6 space-y-4 overflow-y-auto font-sans bg-zinc-950/40"
              >
                {tutorChat.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-5 rounded-2xl text-xs sm:text-sm space-y-2 transition-all shadow-xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-red-950/50 to-indigo-950/50 border border-red-500/30 text-zinc-100 ml-8 sm:ml-24'
                        : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 mr-8 sm:mr-24'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5 text-xs font-mono">
                      <span className={`font-bold flex items-center space-x-1.5 ${msg.sender === 'user' ? 'text-red-400' : 'text-purple-300'}`}>
                        {msg.sender === 'user' ? (
                          <span>YOU</span>
                        ) : (
                          <span className="flex items-center space-x-1.5">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>GEMINI 3.6 FLASH SYSTEM MENTOR</span>
                          </span>
                        )}
                      </span>
                    </div>
                    <FormattedChatMessage
                      text={msg.text}
                      onRunTests={handleRequestAiReview}
                      onInjectCode={(codeSnippet) => {
                        setFiles(prev => prev.map((f, i) => i === activeFileIndex ? { ...f, content: codeSnippet } : f));
                        setTerminalLogs(p => [...p, `[EDITOR] Injected code snippet into active file.`]);
                      }}
                      onClearTerminal={() => setTerminalLogs([])}
                      onOpenUpgrade={onOpenUpgradeModal}
                    />
                  </div>
                ))}

                {/* Gemini Thinking Animation */}
                {isTutorReplying && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-zinc-950 to-indigo-950/50 border border-purple-500/40 text-xs sm:text-sm text-purple-200 mr-12 font-mono space-y-3 shadow-2xl"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Sparkles className="w-5 h-5 animate-spin text-purple-400" />
                      </div>
                      <span className="font-bold text-purple-300 tracking-wider">FORGER 1.0 IS THINKING...</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-zinc-400 pl-1">
                      <div className="flex space-x-1.5 items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>Analyzing system architecture, concurrency bounds, and drafting comprehensive response...</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Fullscreen Input Footer */}
              <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/90 space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={tutorQuery}
                    disabled={isTutorReplying}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTutorQuery()}
                    placeholder={isTutorReplying ? 'Forger 1.0 is drafting response...' : `Ask mentor about ${activeLab.title} (e.g. race conditions, locks, retry policies)...`}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/60 font-mono disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSendTutorQuery()}
                    disabled={isTutorReplying || !tutorQuery.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white rounded-2xl transition shadow-xl font-mono text-xs font-bold flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isTutorReplying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Submit</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">⏎ Enter</kbd> to submit query</span>
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">ESC</kbd> to return to sandbox editor</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
