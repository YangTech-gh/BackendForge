import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Loader2, 
  MessageSquare,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { FormattedChatMessage } from './InteractiveLab/FormattedChatMessage';
import { invokeEdgeFunction } from '../lib/api';
import { UserState, CourseTrack } from '../types';

interface AIChatViewProps {
  userState: UserState;
  courses: CourseTrack[];
  onOpenUpgradeModal: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const GENERIC_QUESTIONS = [
  'Explain the CAP theorem in simple terms',
  'What are the differences between SQL and NoSQL databases?',
  'How does a load balancer work?',
  'What is event-driven architecture?',
  'Explain microservices vs monolith',
  'How does Redis caching improve performance?',
];

export const AIChatView: React.FC<AIChatViewProps> = ({
  userState,
  courses,
  onOpenUpgradeModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isReplying]);

  const handleSendQuery = async (text?: string) => {
    const queryText = text || query.trim();
    if (!queryText || isReplying) return;

    const userMessage: ChatMessage = {
      sender: 'user',
      text: queryText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsReplying(true);

    try {
      const result = await invokeEdgeFunction<{ response: string }>(
        'ai-ask-tutor',
        {
          method: 'POST',
          body: {
            question: queryText,
            labId: 'general-chat',
            labTitle: 'General Backend Architecture',
            labConcept: 'Backend systems design and architecture patterns',
          },
        }
      );

      const aiMessage: ChatMessage = {
        sender: 'ai',
        text: result.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsReplying(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-6 pb-16" role="main" aria-label="AI Chat">
      
      {/* Header */}
      <header className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            <span>AI MENTOR</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Backend Architecture Chat
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Ask questions about system design, distributed systems, databases, and backend architecture.
          </p>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center space-x-2 text-xs text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 px-3 py-2 rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </header>

      {/* Pro Upgrade Banner */}
      {userState.tier === 'free' && (
        <div className="liquid-glass-red rounded-2xl p-4 flex items-center justify-between border border-red-500/20">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-xs font-bold text-white">Free Tier: Limited AI Questions</p>
              <p className="text-[10px] text-zinc-400">Upgrade to Pro for unlimited AI mentor access</p>
            </div>
          </div>
          <button
            onClick={onOpenUpgradeModal}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            Go Pro
          </button>
        </div>
      )}

      {/* Suggested Questions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-zinc-500 uppercase font-bold font-mono">Try asking:</span>
        {GENERIC_QUESTIONS.slice(0, 4).map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(q)}
            disabled={isReplying}
            className="px-3 py-1.5 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/60 text-[11px] font-mono transition text-left disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="liquid-glass border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div ref={chatRef} className="space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto pr-1 border border-zinc-800/60 rounded-xl p-4 bg-zinc-950/50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">Start a conversation</h3>
              <p className="text-zinc-500 text-sm max-w-md">Ask anything about backend architecture, distributed systems, or system design.</p>
            </div>
          )}

          {messages.map((msg, i) => (
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
                <span className="text-zinc-600">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <FormattedChatMessage
                text={msg.text}
                onRunTests={() => {}}
                onInjectCode={() => {}}
                onClearTerminal={() => {}}
                onOpenUpgrade={onOpenUpgradeModal}
                labTitle="General Chat"
                labConcept="Backend systems design"
              />
            </div>
          ))}

          {isReplying && (
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
            value={query}
            disabled={isReplying}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder={isReplying ? 'Thinking...' : 'Ask about backend architecture...'}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/40 font-mono disabled:opacity-50"
          />
          <button
            onClick={() => handleSendQuery()}
            disabled={isReplying || !query.trim()}
            className="btn-primary !py-2.5 flex items-center gap-1.5"
          >
            {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><span>Ask</span><Send className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};
