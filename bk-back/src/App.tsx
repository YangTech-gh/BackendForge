import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TracksCatalogView } from './components/TracksCatalogView';
import { InteractiveLabView } from './components/InteractiveLabView';
import { SystemDesignerSandbox } from './components/SystemDesignerSandbox';
import { StarterKitBuilder } from './components/StarterKitBuilder';
import { TeardownsView } from './components/TeardownsView';
import { WorkshopsCommunityView } from './components/WorkshopsCommunityView';
import { CommandPalette } from './components/CommandPalette';
import { PricingUpgradeModal } from './components/PricingUpgradeModal';
import { CertificateModal } from './components/CertificateModal';
import { COURSE_TRACKS } from './data/coursesData';
import { UserState } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [certificateTrackId, setCertificateTrackId] = useState<string>('track-1-node-ts');

  // Selected query params when navigating
  const [selectedTrackId, setSelectedTrackId] = useState<string>('track-1-node-ts');
  const [selectedLabId, setSelectedLabId] = useState<string>('lab-idempotency-engine');
  const [selectedTeardownId, setSelectedTeardownId] = useState<string>('teardown-stripe-idempotency');

  // User persistent state
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('backend_forge_user_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean up legacy default seed where lab-idempotency-engine was pre-completed
        if (parsed.completedLabs && parsed.completedLabs.length === 1 && parsed.completedLabs[0] === 'lab-idempotency-engine' && parsed.xpPoints === 150) {
          return {
            ...parsed,
            completedLabs: [],
            xpPoints: 0
          };
        }
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return {
      tier: 'free',
      completedLabs: [],
      inProgressCourseId: 'track-1-node-ts',
      activeLabId: 'lab-idempotency-engine',
      xpPoints: 0,
      unlockedCertificates: [],
      coachingCallsRemaining: 1,
      savedStarterKits: []
    };
  });

  useEffect(() => {
    localStorage.setItem('backend_forge_user_state', JSON.stringify(userState));
  }, [userState]);

  // Tab switcher with optional payload
  const handleNavigateTab = (tab: string, extraId?: string) => {
    setActiveTab(tab);
    if (extraId) {
      if (tab === 'tracks') setSelectedTrackId(extraId);
      if (tab === 'teardowns') setSelectedTeardownId(extraId);
    }
  };

  const handleLaunchLab = (trackId: string, labId: string) => {
    setSelectedTrackId(trackId);
    setSelectedLabId(labId);
    setActiveTab('lab');
  };

  const handleCompleteLab = (labId: string) => {
    if (!userState.completedLabs.includes(labId)) {
      setUserState(prev => ({
        ...prev,
        completedLabs: [...prev.completedLabs, labId],
        xpPoints: prev.xpPoints + 150
      }));
    }
  };

  const handleUpgradeProSuccess = () => {
    setUserState(prev => ({
      ...prev,
      tier: 'pro',
      coachingCallsRemaining: 2
    }));
  };

  const handleOpenCertificateModal = (trackId?: string) => {
    if (trackId) setCertificateTrackId(trackId);
    setIsCertificateModalOpen(true);
  };

  const activeCertificateTrack = COURSE_TRACKS.find(t => t.id === certificateTrackId) || COURSE_TRACKS[0];

  return (
    <div className="min-h-screen bg-zinc-950 bg-noise-vintage text-zinc-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-red-200 relative overflow-x-hidden">
      {/* High-performance synth vintage background accent grid */}
      <div className="fixed inset-0 synth-grid-overlay opacity-30 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Top Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userState={userState}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            userState={userState}
            onNavigateTab={handleNavigateTab}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onOpenCertificateModal={handleOpenCertificateModal}
          />
        )}

        {activeTab === 'tracks' && (
          <TracksCatalogView
            userState={userState}
            onLaunchLab={handleLaunchLab}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onOpenCertificateModal={handleOpenCertificateModal}
            selectedTrackIdFromQuery={selectedTrackId}
          />
        )}

        {activeTab === 'lab' && (
          <InteractiveLabView
            userState={userState}
            onCompleteLab={handleCompleteLab}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onOpenCertificateModal={handleOpenCertificateModal}
            selectedTrackId={selectedTrackId}
            selectedLabId={selectedLabId}
            onSelectTrackAndLab={handleLaunchLab}
          />
        )}

        {activeTab === 'system-designer' && (
          <SystemDesignerSandbox />
        )}

        {activeTab === 'starter-kits' && (
          <StarterKitBuilder />
        )}

        {activeTab === 'teardowns' && (
          <TeardownsView selectedTeardownIdFromQuery={selectedTeardownId} />
        )}

        {activeTab === 'workshops' && (
          <WorkshopsCommunityView
            userState={userState}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            <strong>Backend Forge</strong> © 2026 • From API Builders to AI-Native Systems Architects
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('tracks')} className="hover:text-zinc-300">Tracks</button>
            <button onClick={() => setActiveTab('starter-kits')} className="hover:text-zinc-300">Boilerplates</button>
            <button onClick={() => setActiveTab('teardowns')} className="hover:text-zinc-300">Teardowns</button>
            <button onClick={() => setIsUpgradeModalOpen(true)} className="text-indigo-400 hover:text-indigo-300 font-bold">Pro $199</button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={handleNavigateTab}
      />

      <PricingUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgradeSuccess={handleUpgradeProSuccess}
      />

      {isCertificateModalOpen && (
        <CertificateModal
          isOpen={isCertificateModalOpen}
          userState={userState}
          onClose={() => setIsCertificateModalOpen(false)}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
          completedTrackId={certificateTrackId}
          studentName="Alex Vance, Senior Engineer"
          trackTitle={activeCertificateTrack.title}
          completionDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        />
      )}

      </div>
    </div>
  );
}
