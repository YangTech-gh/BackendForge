import React, { useRef, useCallback } from 'react';
import {
  FileCode, RotateCcw, Copy, Check, Terminal, Lock, Sparkles, Zap,
} from 'lucide-react';
import { CourseLab, UserState } from '../../types';
import { CommandItem } from './types';
import { PRICING } from '../../constants/pricing';

interface CodeEditorPaneProps {
  activeLab: CourseLab;
  activeFileIndex: number;
  activeCode: string;
  files: { filename: string; language: string; code: string }[];
  terminalLogs: string[];
  terminalInput: string;
  dynamicCommands: CommandItem[];
  userState: UserState;
  isRunningTests: boolean;
  copySuccess: boolean;
  onSetActiveCode: (code: string) => void;
  onSelectFile: (index: number) => void;
  onResetCode: () => void;
  onCopyCode: () => void;
  onTerminalInput: (input: string) => void;
  onTerminalSubmit: (cmd: string) => void;
  onRunTests: () => void;
  onOpenUpgradeModal: () => void;
}

export const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  activeLab, activeFileIndex, activeCode, files, terminalLogs, terminalInput,
  dynamicCommands, userState, isRunningTests, copySuccess,
  onSetActiveCode, onSelectFile, onResetCode, onCopyCode,
  onTerminalInput, onTerminalSubmit, onRunTests, onOpenUpgradeModal,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeLines = activeCode.split('\n');

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = activeCode.substring(0, start) + '  ' + activeCode.substring(end);
      onSetActiveCode(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [activeCode, onSetActiveCode]);

  return (
    <div className="space-y-4">
      <div className="card-elevated overflow-hidden">
        {/* Free Lab Banner */}
        {!activeLab.isPro && (
          <div className="bg-emerald-950/20 px-4 py-2 border-b border-zinc-800/60 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
            <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">FREE PREVIEW</span>
            {userState.tier !== 'pro' && (
              <button onClick={onOpenUpgradeModal} className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                <span>Unlock Pro ({PRICING.PRO_LIFETIME_PRICE_DISPLAY})</span>
              </button>
            )}
          </div>
        )}

        {/* File Tabs & Toolbar */}
        <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 border-b border-zinc-800/60 overflow-x-auto gap-2">
          <div className="flex items-center gap-1">
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => onSelectFile(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                  activeFileIndex === idx
                    ? 'bg-zinc-800 text-red-300 border border-zinc-700 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-red-400" />
                <span>{file.filename}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onResetCode} className="btn-ghost text-[11px] px-2 py-1 flex items-center gap-1" title="Reset to template">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button onClick={onCopyCode} className="btn-ghost text-[11px] px-2 py-1 flex items-center gap-1" title="Copy code">
              {copySuccess ? <><Check className="w-3 h-3 text-emerald-400" /> <span className="text-emerald-400">Copied</span></> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
        </div>

        {/* Pro Paywall OR Code Editor */}
        {activeLab.isPro && userState.tier !== 'pro' ? (
          <div className="p-8 bg-zinc-950/60 border-b border-zinc-800 text-center space-y-5 min-h-[320px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">PRO LAB</span>
              <h3 className="text-lg font-extrabold text-white">Unlock {activeLab.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">This advanced lab is part of Backend Forge Pro.</p>
            </div>
            <button onClick={onOpenUpgradeModal} className="btn-primary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Unlock Pro ({PRICING.PRO_LIFETIME_PRICE_DISPLAY})
            </button>
          </div>
        ) : (
          <div className="relative bg-zinc-950 flex min-h-[340px] max-h-[440px]">
            {/* Line Numbers */}
            <div className="py-4 px-2 bg-zinc-950 border-r border-zinc-800/60 text-zinc-600 select-none text-right font-mono text-[11px] leading-[1.65] shrink-0 w-10">
              {codeLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Textarea with Tab Support */}
            <textarea
              ref={textareaRef}
              value={activeCode}
              onChange={(e) => onSetActiveCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="code-editor flex-1 min-h-[320px]"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              data-gramm="false"
            />
          </div>
        )}

        {/* Terminal */}
        <div className="border-t border-zinc-800/60 bg-zinc-950 p-4 font-mono text-xs space-y-3" role="region" aria-label="Sandbox terminal">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/60 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Terminal className="w-3.5 h-3.5" /> Terminal
            </span>
            <span className="text-[10px] text-zinc-500">{activeLab.title}</span>
          </div>

          {/* Quick Commands */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {dynamicCommands.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onTerminalSubmit(item.cmd)}
                className={`px-2.5 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800/60 text-[11px] font-mono transition ${item.color}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Logs */}
          <div className="space-y-1 text-zinc-300 max-h-36 overflow-y-auto pt-1 font-mono">
            {terminalLogs.map((log, i) => (
              <div key={i} className="text-[11px] leading-relaxed">{log}</div>
            ))}
          </div>

          {/* CLI Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
            <span className="text-emerald-400 font-bold">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => onTerminalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onTerminalSubmit(terminalInput)}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-emerald-300 placeholder-zinc-600 focus:outline-none font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
