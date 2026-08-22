import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { invokeEdgeFunction, invalidateCache } from './lib/api';
import { PRICING } from './constants/pricing';
import { CourseTrack, TeardownArticle, StarterKitOption, WorkshopEvent, UserState } from './types';

const Navbar = lazy(() => import('./components/Navbar').then(m => ({ default: m.Navbar })));
const DashboardView = lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })));
const TracksCatalogView = lazy(() => import('./components/TracksCatalogView').then(m => ({ default: m.TracksCatalogView })));
const InteractiveLabView = lazy(() => import('./components/InteractiveLab').then(m => ({ default: m.InteractiveLabView })));
const SystemDesignerSandbox = lazy(() => import('./components/SystemDesignerSandbox').then(m => ({ default: m.SystemDesignerSandbox })));
const StarterKitBuilder = lazy(() => import('./components/StarterKitBuilder').then(m => ({ default: m.StarterKitBuilder })));
const TeardownsView = lazy(() => import('./components/TeardownsView').then(m => ({ default: m.TeardownsView })));
const WorkshopsCommunityView = lazy(() => import('./components/WorkshopsCommunityView').then(m => ({ default: m.WorkshopsCommunityView })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const PricingUpgradeModal = lazy(() => import('./components/PricingUpgradeModal').then(m => ({ default: m.PricingUpgradeModal })));
const CertificateModal = lazy(() => import('./components/CertificateModal').then(m => ({ default: m.CertificateModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));

function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-500">Loading...</span>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
        <p className="text-zinc-500 font-mono text-xs tracking-wide">Loading Backend Forge...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [certificateTrackId, setCertificateTrackId] = useState('track-1-node-ts');
  const [selectedTrackId, setSelectedTrackId] = useState('track-1-node-ts');
  const [selectedLabId, setSelectedLabId] = useState('lab-idempotency-engine');
  const [selectedTeardownId, setSelectedTeardownId] = useState('teardown-stripe-idempotency');

  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [courses, setCourses] = useState<CourseTrack[]>([]);
  const [teardowns, setTeardowns] = useState<TeardownArticle[]>([]);
  const [starterKits, setStarterKits] = useState<StarterKitOption[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopEvent[]>([]);

  const [userState, setUserState] = useState<UserState>({
    tier: 'free',
    completedLabs: [],
    inProgressCourseId: 'track-1-node-ts',
    activeLabId: 'lab-idempotency-engine',
    xpPoints: 0,
    unlockedCertificates: [],
    coachingCallsRemaining: 0,
    savedStarterKits: [],
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setDataLoading(false);
      return;
    }

    async function loadAllData() {
      setDataLoading(true);
      setDataError(false);
      try {
        const [coursesRes, progressRes, teardownsRes, kitsRes, workshopsRes] = await Promise.allSettled([
          invokeEdgeFunction<{ courses: CourseTrack[]; userTier: string; xpPoints: number }>('get-courses'),
          invokeEdgeFunction<{ userState: Partial<UserState>; labProgress: { labId: string; completed: boolean; score: number; xpEarned: number }[] }>('get-user-progress'),
          invokeEdgeFunction<{ teardowns: TeardownArticle[] }>('get-teardowns'),
          invokeEdgeFunction<{ kits: StarterKitOption[] }>('get-starter-kits'),
          invokeEdgeFunction<{ workshops: WorkshopEvent[] }>('get-workshops'),
        ]);

        if (coursesRes.status === 'fulfilled') {
          const c = coursesRes.value;
          setCourses(c.courses);
          setUserState(prev => ({ ...prev, tier: (c.userTier as UserState['tier']) || 'free', xpPoints: c.xpPoints || 0 }));
        }

        if (progressRes.status === 'fulfilled') {
          const p = progressRes.value;
          const completedLabs = p.labProgress.filter(l => l.completed).map(l => l.labId);
          setUserState(prev => ({
            ...prev,
            ...p.userState,
            completedLabs,
            xpPoints: p.userState?.xpPoints ?? prev.xpPoints,
          }));
        }

        if (teardownsRes.status === 'fulfilled') setTeardowns(teardownsRes.value.teardowns);
        if (kitsRes.status === 'fulfilled') setStarterKits(kitsRes.value.kits);
        if (workshopsRes.status === 'fulfilled') setWorkshops(workshopsRes.value.workshops);

        if (coursesRes.status === 'rejected') {
          setDataError(true);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setDataError(true);
      } finally {
        setDataLoading(false);
      }
    }

    loadAllData();
  }, [user, authLoading, dataRefreshKey]);

  const handleNavigateTab = (tab: string, extraId?: string) => {
    setActiveTab(tab);
    if (extraId) {
      if (tab === 'tracks') setSelectedTrackId(extraId);
      if (tab === 'teardowns') setSelectedTeardownId(extraId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchLab = (trackId: string, labId: string) => {
    setSelectedTrackId(trackId);
    setSelectedLabId(labId);
    setActiveTab('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteLab = async (labId: string, score: number, code: string) => {
    if (!user || userState.completedLabs.includes(labId)) return;
    try {
      const result = await invokeEdgeFunction<{ passed: boolean; xpAwarded: number; totalXp: number; certificateIssued: any }>(
        'submit-lab-completion',
        { method: 'POST', body: { labId, score, code } }
      );
      if (result.passed) {
        setUserState(prev => ({
          ...prev,
          completedLabs: [...prev.completedLabs, labId],
          xpPoints: result.totalXp,
        }));
      }
    } catch (err) {
      console.error('Failed to submit lab:', err);
    }
  };

  const handleUpgradeProSuccess = () => {
    setUserState(prev => ({ ...prev, tier: 'pro', coachingCallsRemaining: 2 }));
    invalidateCache();
  };

  const handleOpenCertificateModal = (trackId?: string) => {
    if (trackId) setCertificateTrackId(trackId);
    setIsCertificateModalOpen(true);
  };

  const activeCertificateTrack = courses.find(t => t.id === certificateTrackId) || courses[0];

  if (authLoading || dataLoading) {
    return <SkeletonLoader />;
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-hidden">
          <div className="fixed inset-0 synth-grid-overlay opacity-20 pointer-events-none z-0" />
          <Suspense fallback={<ViewLoader />}><LandingPage onStart={() => setIsAuthModalOpen(true)} /></Suspense>
        </div>
        <Suspense fallback={null}>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </Suspense>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <OfflineBanner />
      <div className="fixed inset-0 synth-grid-overlay opacity-20 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <Navbar activeTab={activeTab} setActiveTab={handleNavigateTab} userState={userState} courses={courses} onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} />
        </Suspense>

        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-8" tabIndex={-1}>
          <Suspense fallback={<ViewLoader />}>
            {activeTab === 'dashboard' && (
              <ErrorBoundary fallbackTitle="Dashboard Error">
                <DashboardView userState={userState} courses={courses} teardowns={teardowns} onNavigateTab={handleNavigateTab} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} onOpenCertificateModal={handleOpenCertificateModal} />
              </ErrorBoundary>
            )}
            {activeTab === 'tracks' && (
              <ErrorBoundary fallbackTitle="Tracks Error">
                <TracksCatalogView userState={userState} courses={courses} onLaunchLab={handleLaunchLab} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} onOpenCertificateModal={handleOpenCertificateModal} selectedTrackIdFromQuery={selectedTrackId} />
              </ErrorBoundary>
            )}
            {activeTab === 'lab' && (
              <ErrorBoundary fallbackTitle="Lab Error">
                <InteractiveLabView userState={userState} courses={courses} onCompleteLab={handleCompleteLab} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} onOpenCertificateModal={handleOpenCertificateModal} selectedTrackId={selectedTrackId} selectedLabId={selectedLabId} onSelectTrackAndLab={handleLaunchLab} />
              </ErrorBoundary>
            )}
            {activeTab === 'system-designer' && (
              <ErrorBoundary fallbackTitle="System Designer Error">
                <SystemDesignerSandbox />
              </ErrorBoundary>
            )}
            {activeTab === 'starter-kits' && (
              <ErrorBoundary fallbackTitle="Starter Kit Error">
                <StarterKitBuilder kits={starterKits} />
              </ErrorBoundary>
            )}
            {activeTab === 'teardowns' && (
              <ErrorBoundary fallbackTitle="Teardowns Error">
                <TeardownsView teardowns={teardowns} selectedTeardownIdFromQuery={selectedTeardownId} />
              </ErrorBoundary>
            )}
            {activeTab === 'workshops' && (
              <ErrorBoundary fallbackTitle="Workshops Error">
                <WorkshopsCommunityView userState={userState} workshops={workshops} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} />
              </ErrorBoundary>
            )}
          </Suspense>
        </main>

        <footer className="border-t border-zinc-800/60 bg-zinc-950 py-6 mt-auto pb-24 lg:pb-6 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
            <div>&copy; 2026 Backend Forge. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <button onClick={() => handleNavigateTab('tracks')} className="btn-ghost px-2 py-1 text-[11px]">Tracks</button>
              <button onClick={() => handleNavigateTab('starter-kits')} className="btn-ghost px-2 py-1 text-[11px]">Boilerplates</button>
              <button onClick={() => handleNavigateTab('teardowns')} className="btn-ghost px-2 py-1 text-[11px]">Teardowns</button>
              <button onClick={() => setIsUpgradeModalOpen(true)} className="text-red-400 hover:text-red-300 font-bold text-[11px]">Pro {PRICING.PRO_LIFETIME_PRICE_DISPLAY}</button>
            </div>
          </div>
        </footer>

        <Suspense fallback={null}>
          <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onOpen={() => setIsCommandPaletteOpen(true)} onSelectAction={handleNavigateTab} courses={courses} teardowns={teardowns} starterKits={starterKits} />
          <PricingUpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} onUpgradeSuccess={handleUpgradeProSuccess} />
          {isCertificateModalOpen && (
            <CertificateModal isOpen={isCertificateModalOpen} userState={userState} onClose={() => setIsCertificateModalOpen(false)} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} completedTrackId={certificateTrackId} studentName={user?.user_metadata?.full_name || user?.email || 'Backend Engineer'} trackTitle={activeCertificateTrack?.title || ''} completionDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} courses={courses} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
