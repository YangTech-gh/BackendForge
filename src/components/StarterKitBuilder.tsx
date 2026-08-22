import React, { useState } from 'react';
import { 
  Download, 
  Terminal, 
  Copy, 
  Check, 
  Github, 
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { StarterKitOption } from '../types';

interface StarterKitBuilderProps {
  kits: StarterKitOption[];
}

export const StarterKitBuilder: React.FC<StarterKitBuilderProps> = ({ kits }) => {
  const [selectedKitId, setSelectedKitId] = useState<string>(kits[0]?.id || 'kit-node-drizzle');
  const [copied, setCopied] = useState<boolean>(false);

  if (kits.length === 0) {
    return (
    <div className="space-y-8 pb-16" role="main" aria-label="Starter Kit Builder">
      {/* Hidden SEO content block */}
      <div className="seo-hidden" aria-hidden="true">
        <h2>Production Backend Starter Kits and Boilerplates</h2>
        <p>
          Download production-ready backend starter kits with PostgreSQL, Redis queues, Docker,
          CI/CD pipelines, and authentication pre-configured. Choose from Node.js and TypeScript,
          Ruby on Rails, Rust and Go, or AI-Native Agentic Backend stacks. Each kit includes
          database schemas, queue workers, environment configuration, and deployment scripts.
        </p>
      </div>
        <header className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>OPEN-SOURCE SHIPPABLE BOILERPLATES</span>
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              Production Starter Kit Generator
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Skip boilerplate fatigue. Export production-ready, highly polished starter templates with PostgreSQL, Redis queues, Docker setup, and CI/CD pipelines pre-configured.
            </p>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No starter kits available yet</h3>
          <p className="text-zinc-500 text-sm max-w-md">New production starter kits are being added soon.</p>
        </div>
      </div>
    );
  }

  const selectedKit = kits.find(k => k.id === selectedKitId) || kits[0];

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(`git clone ${selectedKit.githubRepoUrl}.git backend-forge-app\ncd backend-forge-app\ndocker-compose up -d\nnpm install\nnpm run dev`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    window.open(selectedKit.githubRepoUrl, '_blank', 'noreferrer');
  };

  return (
    <div className="space-y-8 pb-16" role="main" aria-label="Starter Kit Builder">
      
      {/* Header */}
      <header className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>OPEN-SOURCE SHIPPABLE BOILERPLATES</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Production Starter Kit Generator
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Skip boilerplate fatigue. Export production-ready, highly polished starter templates with PostgreSQL, Redis queues, Docker setup, and CI/CD pipelines pre-configured.
          </p>
        </div>
      </header>

      {/* Kit Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="listbox" aria-label="Select a starter kit">
        {kits.map((kit, idx) => {
          const isSelected = kit.id === selectedKitId;

          return (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              onClick={() => setSelectedKitId(kit.id)}
              role="option"
              aria-selected={isSelected}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedKitId(kit.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                isSelected
                  ? 'liquid-glass-red border-red-500/60 ring-1 ring-red-500/30 shadow-xl shadow-red-950/30'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-red-400 font-bold">
                  {kit.paradigm}
                </span>
                <h3 className="font-bold text-sm text-white">{kit.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{kit.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>⭐ {kit.stars.toLocaleString()} stars</span>
                <span>{kit.downloadCount} exports</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Kit Detail & Terminal Setup Preview */}
      <div className="liquid-glass border border-zinc-800/80 rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-2xl relative overflow-hidden">
        
        {/* Glowing Red Corner Ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Config Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="text-xs font-mono text-red-400 uppercase font-bold flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 fill-red-400" />
              <span>ACTIVE BOILERPLATE CONFIG</span>
            </span>
            <h2 className="text-2xl font-bold text-white">{selectedKit.name}</h2>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">{selectedKit.description}</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-zinc-200 uppercase font-mono">Stack Blueprint:</div>
            
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <span className="block text-[10px] text-zinc-500">PARADIGM</span>
                <strong className="text-red-400">{selectedKit.paradigm}</strong>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <span className="block text-[10px] text-zinc-500">DATABASE</span>
                <strong className="text-emerald-400">{selectedKit.db}</strong>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <span className="block text-[10px] text-zinc-500">QUEUE ENGINE</span>
                <strong className="text-cyan-400">{selectedKit.queue}</strong>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <span className="block text-[10px] text-zinc-500">AUTHENTICATION</span>
                <strong className="text-purple-400">{selectedKit.auth}</strong>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownloadZip}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-xs transition shadow-xl shadow-red-950/50 font-mono border border-red-500/30"
            >
              <Download className="w-4 h-4 fill-white" />
              <span>Download Starter Kit (.zip)</span>
            </button>

            <a
              href={selectedKit.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold px-4 py-3 rounded-xl text-xs transition font-mono"
            >
              <Github className="w-4 h-4" />
              <span>View GitHub Repo</span>
            </a>
          </div>
        </div>

        {/* Right Terminal Setup & File Structure (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 font-mono text-xs space-y-4 shadow-inner relative z-10" role="region" aria-label="Setup instructions">
          
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-zinc-200">Terminal Setup Commands</span>
            </div>

            <button
              onClick={handleCopyCommand}
              className="flex items-center space-x-1.5 text-zinc-400 hover:text-red-400 transition text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Commands'}</span>
            </button>
          </div>

          <pre className="bg-zinc-900/90 text-zinc-200 p-4 rounded-xl border border-zinc-800/80 overflow-x-auto leading-relaxed text-[11px]">
{`# 1. Clone repository
git clone ${selectedKit.githubRepoUrl}.git backend-app
cd backend-app

# 2. Start PostgreSQL & Redis in background
docker-compose up -d

# 3. Run database migrations & seed initial tenant data
npm install
npm run db:push

# 4. Boot development engine
npm run dev`}
          </pre>

          <div className="border-t border-zinc-800/80 pt-3 space-y-2">
            <div className="text-[10px] text-zinc-500 uppercase">Included Files & Configuration:</div>
            <div className="space-y-1 text-zinc-300 text-[11px]">
              <div>📁 <strong className="text-red-400">/src/schema/</strong> (Idempotency & Tenant DB Schema)</div>
              <div>📁 <strong className="text-cyan-400">/src/queue/</strong> (BullMQ Worker & Backoff Retries)</div>
              <div>📄 <strong className="text-zinc-200">docker-compose.yml</strong> (Postgres 16 + Redis 7 + PgBouncer)</div>
              <div>📄 <strong className="text-emerald-400">.env.example</strong> (Database URLs & Secret Keys)</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
