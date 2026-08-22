import React, { useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, Loader2, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { FormattedChatMessage } from './FormattedChatMessage';
import { CourseLab, CourseTrack } from '../../types';
import { LabAIState } from './types';

interface AIMentorPaneProps {
  activeLab: CourseLab;
  currentTrack: CourseTrack;
  aiState: LabAIState;
  dynamicQuestions: string[];
  onSendQuery: (text?: string) => void;
  onSetQuery: (q: string) => void;
  onToggleFullscreen: () => void;
  onRequestAiReview: () => void;
  onInjectCode: (code: string) => void;
  onClearTerminal: () => void;
  onOpenUpgrade: () => void;
}

export const AIMentorPane: React.FC<AIMentorPaneProps> = ({
  activeLab, currentTrack, aiState, dynamicQuestions,
  onSendQuery, onSetQuery, onToggleFullscreen,
  onRequestAiReview, onInjectCode, onClearTerminal, onOpenUpgrade,
}) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [aiState.chat, aiState.isReplying]);

  return (
    <div className="card-elevated p-5 space-y-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-4 h-4 text-red-400" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-white font-mono block">AI Mentor</span>
            <span className="text-[10px] text-zinc-400 font-mono">Forger 1.0 &bull; {activeLab.title}</span>
          </div>
        </div>
        <button onClick={onToggleFullscreen} className="btn-ghost text-[11px] px-2 py-1 flex items-center gap-1 !text-indigo-300">
          <Maximize2 className="w-3.5 h-3.5" /> Focus
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-zinc-500 uppercase font-bold font-mono">Suggested:</span>
        {dynamicQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSendQuery(q)}
            disabled={aiState.isReplying}
            className="px-2.5 py-1 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/60 text-[11px] font-mono transition text-left disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div ref={chatRef} className="space-y-3 min-h-[420px] max-h-[640px] overflow-y-auto pr-1 border border-zinc-800/60 rounded-xl p-3.5 bg-zinc-950/50">
        {aiState.chat.map((msg, i) => (
          <div key={i} className={`p-4 rounded-2xl text-xs space-y-1.5 ${
            msg.sender === 'user'
              ? 'bg-red-950/20 border border-red-500/15 text-zinc-100 ml-8 sm:ml-16'
              : 'bg-zinc-800/40 border border-zinc-800/60 text-zinc-200 mr-8 sm:mr-16'
          }`}>
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-1 text-[10px] font-mono">
              <span className={`font-bold flex items-center gap-1 ${msg.sender === 'user' ? 'text-red-400' : 'text-purple-400'}`}>
                {msg.sender === 'user' ? 'YOU' : (
                  <><Sparkles className="w-3 h-3" /> FORGER 1.0</>
                )}
              </span>
            </div>
            <FormattedChatMessage
              text={msg.text}
              onRunTests={onRequestAiReview}
              onInjectCode={onInjectCode}
              onClearTerminal={onClearTerminal}
              onOpenUpgrade={onOpenUpgrade}
              labTitle={activeLab.title}
              labConcept={activeLab.conceptSummary}
            />
          </div>
        ))}

        {aiState.isReplying && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 mr-8 font-mono space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
              </div>
              <span className="font-bold text-purple-300 tracking-wider">THINKING...</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 pl-1">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Analyzing architecture...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
        <input
          type="text"
          value={aiState.query}
          disabled={aiState.isReplying}
          onChange={(e) => onSetQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSendQuery()}
          placeholder={aiState.isReplying ? 'Thinking...' : `Ask about ${activeLab.title}...`}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/40 font-mono disabled:opacity-50"
        />
        <button
          onClick={() => onSendQuery()}
          disabled={aiState.isReplying || !aiState.query.trim()}
          className="btn-primary !py-2.5 flex items-center gap-1.5"
        >
          {aiState.isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><span>Ask</span><Send className="w-3.5 h-3.5" /></>}
        </button>
      </div>
    </div>
  );
};
