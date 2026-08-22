import React from 'react';
import { 
  Server, 
  Terminal, 
  Cpu, 
  Search, 
  Sparkles, 
  Layers, 
  Download, 
  BookOpen, 
  Users, 
  ShieldAlert, 
  ChevronRight,
  Zap,
  Anvil
} from 'lucide-react';
import { UserState } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userState: UserState;
  onOpenCommandPalette: () => void;
  onOpenUpgradeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userState,
  onOpenCommandPalette,
  onOpenUpgradeModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'tracks', label: 'Curriculum Tracks', icon: Server },
    { id: 'lab', label: 'Interactive Lab', icon: Terminal },
    { id: 'system-designer', label: 'System Designer', icon: Cpu },
    { id: 'starter-kits', label: 'Starter Kits', icon: Download },
    { id: 'teardowns', label: 'Teardowns', icon: BookOpen },
    { id: 'workshops', label: 'Live Workshops', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      {/* Top Banner for Urgency */}
      {userState.tier === 'free' && (
        <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-red-950 border-b border-red-500/30 text-white px-4 py-1 text-xs font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2 mx-auto sm:mx-0">
            <Zap className="w-3.5 h-3.5 animate-pulse text-red-400" />
            <span>
              <strong className="text-red-300">Backend Forge Pro:</strong> Claim Lifetime Access for <strong className="text-emerald-400">$199</strong> (One-time, no subscription).
            </span>
          </div>
          <button
            onClick={onOpenUpgradeModal}
            className="hidden sm:inline-flex items-center space-x-1 bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-0.5 rounded-full font-bold transition shadow-sm"
          >
            <span>Claim Pro Lifetime</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0 group" onClick={() => setActiveTab('dashboard')}>
            <div className="flex items-center justify-center text-red-500 group-hover:text-red-400 transition-colors">
              <Anvil className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                  Backend<span className="text-red-500">Forge</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono hidden xl:block">From API Builders to AI-Native Systems Architects</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white font-semibold shadow-md shadow-red-600/25 border border-red-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls & User Tier */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* ⌘K Command Palette Button */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3 py-1.5 rounded-full text-xs transition font-mono"
              title="Search courses, teardowns, system nodes..."
            >
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span className="opacity-50 tracking-tighter hidden sm:inline">⌘K</span>
              <span className="hidden sm:inline">Search...</span>
            </button>

            {/* User Tier Status Badge */}
            {userState.tier === 'pro' ? (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>PRO LIFETIME</span>
              </div>
            ) : (
              <button
                onClick={onOpenUpgradeModal}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-full text-xs transition shadow-lg shadow-red-600/25 border border-red-500/30"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Go Pro</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Navigation bar */}
        <div className="lg:hidden flex items-center space-x-2 overflow-x-auto py-2 border-t border-zinc-800/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
