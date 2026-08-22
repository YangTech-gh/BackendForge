import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Download, Cpu, ArrowRight } from 'lucide-react';
import { CourseTrack, TeardownArticle, StarterKitOption } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSelectAction: (tab: string, extraId?: string) => void;
  courses: CourseTrack[];
  teardowns: TeardownArticle[];
  starterKits: StarterKitOption[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpen,
  onSelectAction,
  courses,
  teardowns,
  starterKits,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredTracks = courses.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.paradigm.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTeardowns = teardowns.filter(a =>
    a.company.toLowerCase().includes(query.toLowerCase()) ||
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredKits = starterKits.filter(k =>
    k.name.toLowerCase().includes(query.toLowerCase()) ||
    k.paradigm.toLowerCase().includes(query.toLowerCase())
  );

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen) return;
    const el = document.querySelector(`[data-result-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (isOpen && e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filteredTracks.length + filteredTeardowns.length + filteredKits.length - 1));
      }
      if (isOpen && e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (isOpen && e.key === 'Enter') {
        e.preventDefault();
        const allResults = [
          ...filteredTracks.map(t => ({ tab: 'tracks', id: t.id })),
          ...filteredTeardowns.map(t => ({ tab: 'teardowns', id: t.id })),
          ...filteredKits.map(k => ({ tab: 'starter-kits', id: k.id })),
        ];
        if (allResults[activeIndex]) {
          onSelectAction(allResults[activeIndex].tab, allResults[activeIndex].id);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpen, filteredTracks, filteredTeardowns, filteredKits, activeIndex, onSelectAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/50">
          <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, idempotency labs, Rust/Go, Stripe teardowns, starter kits..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none font-mono"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 font-sans text-xs">
          
          {/* Quick Shortcuts */}
          {!query && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 mb-1.5">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onSelectAction('system-designer'); onClose(); }}
                  className="flex items-center space-x-2 p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-left border border-zinc-800 transition"
                >
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-white">System Design Sandbox</div>
                    <div className="text-[10px] text-zinc-400">Simulate 75k RPS architecture</div>
                  </div>
                </button>
                <button
                  onClick={() => { onSelectAction('starter-kits'); onClose(); }}
                  className="flex items-center space-x-2 p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-left border border-zinc-800 transition"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">Starter Kit Generator</div>
                    <div className="text-[10px] text-zinc-400">Export production boilerplate</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Course Tracks */}
          {filteredTracks.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 mb-1.5 flex items-center justify-between">
                <span>Curriculum Tracks</span>
                <span className="text-zinc-600">{filteredTracks.length} tracks</span>
              </div>
              <div className="space-y-1">
                {filteredTracks.map((track, idx) => (
                  <button
                    key={track.id}
                    data-result-index={idx}
                    onClick={() => { onSelectAction('tracks', track.id); onClose(); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition group ${
                      activeIndex === idx ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold">
                        T{track.trackNumber}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-indigo-400 transition">{track.title}</div>
                        <div className="text-[11px] text-zinc-400">{track.tagline}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teardowns */}
          {filteredTeardowns.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 mb-1.5">Architecture Teardowns</div>
              <div className="space-y-1">
                {filteredTeardowns.map((t, idx) => {
                  const globalIdx = filteredTracks.length + idx;
                  return (
                    <button
                      key={t.id}
                      data-result-index={globalIdx}
                      onClick={() => { onSelectAction('teardowns', t.id); onClose(); }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition group ${
                        activeIndex === globalIdx ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-white group-hover:text-purple-300 transition">{t.company}: {t.title}</div>
                          <div className="text-[10px] text-zinc-400">{t.readTime} • {t.tags.join(', ')}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Starter Kits */}
          {filteredKits.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 mb-1.5">Open-Source Boilerplates</div>
              <div className="space-y-1">
                {filteredKits.map((k, idx) => {
                  const globalIdx = filteredTracks.length + filteredTeardowns.length + idx;
                  return (
                    <button
                      key={k.id}
                      data-result-index={globalIdx}
                      onClick={() => { onSelectAction('starter-kits', k.id); onClose(); }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition group ${
                        activeIndex === globalIdx ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-white group-hover:text-emerald-300 transition">{k.name}</div>
                          <div className="text-[10px] text-zinc-400">{k.paradigm} • {k.db}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/70 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
          <span>Navigate with 🧮 Arrow keys</span>
          <span>Press ESC to exit</span>
        </div>

      </div>
    </div>
  );
};
