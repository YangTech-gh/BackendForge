import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Tag, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { ARCHITECTURE_TEARDOWNS } from '../data/teardownsData';
import { TeardownArticle } from '../types';

interface TeardownsViewProps {
  selectedTeardownIdFromQuery?: string;
}

export const TeardownsView: React.FC<TeardownsViewProps> = ({ selectedTeardownIdFromQuery }) => {
  const [activeTeardownId, setActiveTeardownId] = useState<string>(
    selectedTeardownIdFromQuery || ARCHITECTURE_TEARDOWNS[0].id
  );

  const activeTeardown = ARCHITECTURE_TEARDOWNS.find(t => t.id === activeTeardownId) || ARCHITECTURE_TEARDOWNS[0];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Article Selector List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          {ARCHITECTURE_TEARDOWNS.map((item) => {
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
