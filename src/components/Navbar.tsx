import React, { useState } from 'react';
import {
  Layers,
  Server,
  Terminal,
  Cpu,
  Download,
  BookOpen,
  Users,
  Search,
  Sparkles,
  Zap,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRICING } from '../constants/pricing';
import { UserState, CourseTrack } from '../types';
import { UserProfileModal } from './UserProfileModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string, extraId?: string) => void;
  userState: UserState;
  courses: CourseTrack[];
  onOpenCommandPalette: () => void;
  onOpenUpgradeModal: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Layers },
  { id: 'tracks', label: 'Tracks', icon: Server },
  { id: 'lab', label: 'Labs', icon: Terminal },
  { id: 'system-designer', label: 'Design', icon: Cpu },
  { id: 'starter-kits', label: 'Kits', icon: Download },
  { id: 'teardowns', label: 'Reads', icon: BookOpen },
  { id: 'workshops', label: 'Events', icon: Users },
];

const mobileNavItems = [
  { id: 'dashboard', label: 'Home', icon: Layers },
  { id: 'tracks', label: 'Tracks', icon: Server },
  { id: 'lab', label: 'Labs', icon: Terminal },
  { id: 'teardowns', label: 'Reads', icon: BookOpen },
  { id: 'more', label: 'More', icon: Menu },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userState,
  courses,
  onOpenCommandPalette,
  onOpenUpgradeModal,
}) => {
  const { user, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleMobileNav = (id: string) => {
    if (id === 'more') {
      setShowMobileMenu(prev => !prev);
    } else {
      setShowMobileMenu(false);
      setActiveTab(id);
    }
  };

  const isMoreOpen = !mobileNavItems.some(i => i.id === activeTab) && activeTab !== 'more';

  return (
    <>
      <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} userState={userState} courses={courses} />

      {/* Pro Upgrade Banner (Desktop) */}
      {userState.tier === 'free' && (
        <div className="hidden lg:block bg-gradient-to-r from-red-950/80 via-zinc-900 to-red-950/80 border-b border-red-500/20 text-white px-4 py-1.5 text-xs font-semibold no-print" role="banner" aria-label="Pro upgrade banner">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span>
                <strong className="text-red-300">Backend Forge Pro:</strong> Claim Lifetime Access for <strong className="text-emerald-400 font-mono">{PRICING.PRO_LIFETIME_PRICE_DISPLAY}</strong> (One-time, no subscription).
              </span>
            </div>
            <button
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold transition"
            >
              <span>Claim Pro</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-40 border-b border-zinc-800/60 glass no-print" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Brand */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="Go to dashboard"
            >
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div className="hidden xl:block">
                <span className="text-base font-extrabold tracking-tight text-white font-mono">
                  Backend<span className="text-red-500">Forge</span>
                </span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-0.5 overflow-x-auto py-1 scrollbar-none" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-red-500/15 text-red-300 font-semibold border border-red-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenCommandPalette}
                className="flex items-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 px-3 py-1.5 rounded-lg text-xs transition font-mono"
                title="Search (Ctrl+K)"
                aria-label="Open search"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-zinc-500">Ctrl+K</span>
              </button>

              {user && (
                <>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 transition"
                    aria-label="Open profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-zinc-300 hidden sm:inline max-w-[100px] truncate">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</span>
                  </button>
                </>
              )}

              {userState.tier === 'pro' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>PRO</span>
                </div>
              ) : (
                <button
                  onClick={onOpenUpgradeModal}
                  className="btn-primary text-[11px] py-1.5 px-3"
                >
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Go Pro
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 glass no-print" role="banner">
        {userState.tier === 'free' && (
          <button
            onClick={onOpenUpgradeModal}
            className="w-full bg-gradient-to-r from-red-950/80 via-zinc-900 to-red-950/80 border-b border-red-500/20 text-white px-3 py-1.5 text-[10px] font-semibold flex items-center justify-center gap-1"
          >
            <Zap className="w-3 h-3 text-red-400" />
            <span>Lifetime Pro <strong className="text-emerald-400 font-mono">{PRICING.PRO_LIFETIME_PRICE_DISPLAY}</strong></span>
          </button>
        )}
        <div className="flex items-center justify-between h-12 px-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2"
            aria-label="Go to dashboard"
          >
            <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-white font-mono">
              Backend<span className="text-red-500">Forge</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCommandPalette}
              className="w-9 h-9 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/50 flex items-center justify-center transition"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>

            {user && (
              <button
                onClick={() => setShowProfile(true)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white"
                aria-label="Open profile"
              >
                {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (5 items max) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-zinc-800/60 pb-safe no-print" aria-label="Main navigation">
        <div className="flex items-center justify-around px-1 py-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'more' && isMoreOpen);
            return (
              <button
                key={item.id}
                onClick={() => handleMobileNav(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center px-2 py-1.5 rounded-xl transition min-w-[56px] ${
                  isActive ? 'text-red-400' : 'text-zinc-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-[9px] mt-0.5 font-medium ${isActive ? 'text-red-400 font-bold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Expanded More Menu */}
        {showMobileMenu && (
          <div className="absolute bottom-full left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-4 py-3 animate-slide-down">
            <div className="grid grid-cols-3 gap-2">
              {navItems.filter(i => !mobileNavItems.some(m => m.id === i.id)).map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setShowMobileMenu(false); setActiveTab(item.id); }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${
                      activeTab === item.id ? 'bg-red-500/15 text-red-300 border border-red-500/20' : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
