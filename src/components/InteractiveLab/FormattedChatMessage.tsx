import React, { useState } from 'react';
import {
  Terminal, Play, Layers, Zap, Award, Lightbulb, AlertTriangle,
  Sparkles, Code2, Check, Copy,
} from 'lucide-react';
import { FormattedChatMessageProps } from './types';

function parseRichInlineText(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
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
        return <strong key={bIdx} className="font-bold text-white">{bPart.slice(2, -2)}</strong>;
      }
      return bPart;
    });
  });
}

export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({
  text, onRunTests, onInjectCode, onClearTerminal, onOpenUpgrade, labTitle, labConcept,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-xs sm:text-sm">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const rawLines = part.slice(3, -3).trim().split('\n');
          const firstLine = rawLines[0] || '';
          const hasLang = !firstLine.includes(' ') && firstLine.length < 15;
          const lang = hasLang ? firstLine : '';
          const codeContent = hasLang ? rawLines.slice(1).join('\n') : rawLines.join('\n');

          return (
            <div key={idx} className="code-block my-3 font-mono text-[11px]">
              <div className="code-block-header">
                <span className="text-purple-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  <span>{lang || 'SNIPPET'}</span>
                </span>
                <div className="flex items-center gap-2">
                  {onInjectCode && (
                    <button
                      onClick={() => onInjectCode(codeContent)}
                      className="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/30 flex items-center gap-1 transition text-[10px]"
                      title="Inject code into editor"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Inject</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(codeContent, idx)}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 transition text-[10px]"
                  >
                    {copiedIndex === idx ? (
                      <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                    ) : (
                      <><Copy className="w-3 h-3" /><span>Copy</span></>
                    )}
                  </button>
                </div>
              </div>
              <pre className="p-3.5 text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">{codeContent}</pre>
            </div>
          );
        }

        const lines = part.split('\n');
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              if (trimmed.includes('[ACTION:RUN_TESTS]')) {
                return (
                  <div key={lIdx} className="my-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                        <Play className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-200 font-mono block">System Integration Test</span>
                        <span className="text-[10px] text-zinc-400">Execute sandbox unit tests</span>
                      </div>
                    </div>
                    {onRunTests && (
                      <button onClick={onRunTests} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition">
                        Run Tests
                      </button>
                    )}
                  </div>
                );
              }

              if (trimmed.includes('[ACTION:SHOW_ARCHITECTURE]') || trimmed.includes('[ACTION:EXPLAIN_DIAGRAM]')) {
                return (
                  <div key={lIdx} className="my-3 p-3.5 rounded-xl bg-zinc-950 border border-purple-500/20 space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-purple-300 font-bold">
                      <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /><span>SYSTEM ARCHITECTURE</span></span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">LIVE</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-900/80 text-[10px] space-y-1 overflow-x-auto">
                      <div className="flex items-center justify-between text-zinc-400 min-w-[300px]">
                        <span>[ Client ]</span><span className="text-purple-400">--&gt;</span>
                        <span>[ {labTitle || 'Gateway'} ]</span><span className="text-purple-400">--&gt;</span>
                        <span>[ {labConcept ? labConcept.split(' ').slice(0, 3).join(' ') : 'Cache'} ]</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-300 font-bold min-w-[300px]">
                        <span>[ Audit Log ]</span><span className="text-emerald-400">&lt;--</span>
                        <span>[ PostgreSQL ]</span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (trimmed.includes('[ACTION:CLEAR_TERMINAL]')) {
                return (
                  <div key={lIdx} className="my-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /><span>Clear Terminal</span></span>
                    {onClearTerminal && (
                      <button onClick={onClearTerminal} className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] transition">Clear</button>
                    )}
                  </div>
                );
              }

              if (trimmed.includes('[ACTION:PRO_UPGRADE]')) {
                return (
                  <div key={lIdx} className="my-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-200 font-mono">Unlock Pro Suite</span>
                    </div>
                    {onOpenUpgrade && (
                      <button onClick={onOpenUpgrade} className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-mono font-bold transition">Upgrade</button>
                    )}
                  </div>
                );
              }

              if (trimmed.startsWith('>')) {
                const quoteContent = trimmed.replace(/^>\s*/, '');
                let calloutType: 'tip' | 'warning' | 'info' = 'info';
                let cleanQuote = quoteContent;
                if (quoteContent.startsWith('[!TIP]')) { calloutType = 'tip'; cleanQuote = quoteContent.replace('[!TIP]', '').trim(); }
                else if (quoteContent.startsWith('[!WARNING]')) { calloutType = 'warning'; cleanQuote = quoteContent.replace('[!WARNING]', '').trim(); }
                else if (quoteContent.startsWith('[!NOTE]')) { calloutType = 'info'; cleanQuote = quoteContent.replace('[!NOTE]', '').trim(); }

                return (
                  <div key={lIdx} className={`p-3 rounded-xl border text-xs leading-relaxed my-1.5 flex items-start gap-2.5 ${
                    calloutType === 'tip' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200' :
                    calloutType === 'warning' ? 'bg-amber-950/20 border-amber-500/20 text-amber-200' :
                    'bg-purple-950/20 border-purple-500/20 text-purple-200'
                  }`}>
                    {calloutType === 'tip' && <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {calloutType === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    {calloutType === 'info' && <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />}
                    <div className="flex-1 font-sans">{parseRichInlineText(cleanQuote)}</div>
                  </div>
                );
              }

              if (trimmed.startsWith('### ')) return <h3 key={lIdx} className="text-xs sm:text-sm font-bold text-purple-300 font-mono border-l-2 border-purple-500 pl-2 mt-3 mb-1">{parseRichInlineText(trimmed.replace('### ', ''))}</h3>;
              if (trimmed.startsWith('## ')) return <h2 key={lIdx} className="text-sm sm:text-base font-extrabold text-white font-mono mt-3 mb-1 pb-1 border-b border-zinc-800">{parseRichInlineText(trimmed.replace('## ', ''))}</h2>;
              if (trimmed.startsWith('# ')) return <h1 key={lIdx} className="text-base sm:text-lg font-black text-purple-300 font-mono mt-3 mb-1">{parseRichInlineText(trimmed.replace('# ', ''))}</h1>;
              if (trimmed === '---' || trimmed === '***') return <hr key={lIdx} className="border-zinc-800 my-2.5" />;

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5 my-0.5 text-zinc-300">
                    <span className="text-purple-400 font-bold shrink-0 mt-0.5">&bull;</span>
                    <div className="flex-1 leading-relaxed">{parseRichInlineText(trimmed.slice(2))}</div>
                  </div>
                );
              }

              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+)\.\s(.*)/);
                if (match) return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5 my-0.5 text-zinc-300">
                    <span className="text-purple-400 font-mono font-bold shrink-0 text-xs mt-0.5">{match[1]}.</span>
                    <div className="flex-1 leading-relaxed">{parseRichInlineText(match[2])}</div>
                  </div>
                );
              }

              if (!trimmed) return <div key={lIdx} className="h-1" />;
              return <div key={lIdx} className="leading-relaxed text-zinc-300">{parseRichInlineText(line)}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
};
