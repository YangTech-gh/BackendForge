import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Code2, 
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { TeardownArticle } from '../types';

interface TeardownsViewProps {
  teardowns: TeardownArticle[];
  selectedTeardownIdFromQuery?: string;
}

export const TeardownsView: React.FC<TeardownsViewProps> = ({ teardowns, selectedTeardownIdFromQuery }) => {
  const [activeTeardownId, setActiveTeardownId] = useState<string>(
    selectedTeardownIdFromQuery || teardowns[0]?.id || ''
  );
  const [activeTag, setActiveTag] = useState<string>('All');

  const allTags = ['All', ...Array.from(new Set(teardowns.flatMap(t => t.tags)))];

  const filteredTeardowns = activeTag === 'All'
    ? teardowns
    : teardowns.filter(t => t.tags.includes(activeTag));

  const activeTeardown = teardowns.find(t => t.id === activeTeardownId) || teardowns[0];

  if (teardowns.length === 0) {
    return (
      <div className="space-y-8 pb-16" role="main" aria-label="Architecture Teardowns">
        <header className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-widest flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>REAL-WORLD POST-MORTEMS & SYSTEM TEARDOWNS</span>
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              Backend Architecture Teardowns
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Deep-dive technical post-mortems analyzing how enterprise tech companies handle outage spikes, race conditions, distributed locking, and database migrations under load.
            </p>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No teardown articles available yet</h3>
          <p className="text-zinc-500 text-sm max-w-md">New architecture teardowns are coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16" role="main" aria-label="Architecture Teardowns">
      
      {/* Header */}
      <header className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-widest flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>REAL-WORLD POST-MORTEMS & SYSTEM TEARDOWNS</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Backend Architecture Teardowns
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Deep-dive technical post-mortems analyzing how enterprise tech companies handle outage spikes, race conditions, distributed locking, and database migrations under load.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Verified High-Signal RFC Case Studies</span>
        </div>
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter by tag">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            role="tab"
            aria-selected={activeTag === tag}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition whitespace-nowrap ${
              activeTag === tag
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tag === 'All' ? 'All Topics' : `#${tag}`}
          </button>
        ))}
      </div>

      {/* Mobile Article Tabs */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-none pb-1" role="tablist" aria-label="Select article">
        {filteredTeardowns.map((item) => {
          const isSelected = item.id === activeTeardownId;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTeardownId(item.id)}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`article-${item.id}`}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                isSelected
                  ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {item.company}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Article Selector List (4 Cols) - Hidden on mobile, shown on desktop */}
        <aside className="hidden lg:block lg:col-span-4 space-y-3" aria-label="Article selector">
          {filteredTeardowns.map((item) => {
            const isSelected = item.id === activeTeardownId;

            return (
              <div
                key={item.id}
                onClick={() => setActiveTeardownId(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-zinc-900 border-red-500/60 ring-1 ring-red-500/30 shadow-xl shadow-red-950/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-red-300 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                    {item.company}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">{item.readTime}</span>
                </div>

                <h3 className="font-bold text-sm text-white leading-snug">{item.title}</h3>

                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="text-[9px] font-mono bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Article Detail Reader (8 Cols) */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          
          <div className="space-y-3 border-b border-zinc-800 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                TEARDOWN: {activeTeardown.company}
              </span>
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 font-semibold">
                Critical Failure & Resolution
              </span>
              <span className="text-xs text-zinc-500 font-mono ml-auto">{activeTeardown.readTime}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {activeTeardown.title}
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed font-normal">
              {activeTeardown.summary}
            </p>
          </div>

          {/* Key Insights List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Core Architectural Lessons & Resolution Trade-Offs</span>
            </h3>
            <div className="space-y-2">
              {activeTeardown.keyInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80 text-xs text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topology Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
              Distributed System Flow Boundary
            </h3>
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 font-mono text-xs text-indigo-300 leading-relaxed">
              {activeTeardown.architectureOverview}
            </div>
          </div>

          {/* RFC Code Implementation */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider flex items-center space-x-1">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Production RFC Implementation Snippet</span>
            </h3>
            <pre className="bg-zinc-950 text-zinc-200 p-4 rounded-2xl border border-zinc-800 font-mono text-xs overflow-x-auto leading-relaxed">
              {activeTeardown.rfcCodeSnippet}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
