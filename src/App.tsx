import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { invokeEdgeFunction, invalidateCache } from './lib/api';
import { CourseTrack, TeardownArticle, StarterKitOption, WorkshopEvent, UserState } from './types';
import { SITE_URL, TAB_TITLES, TAB_DESCRIPTIONS, TEARDOWN_META, parseHashRoute } from './seo-config';

const Navbar = lazy(() => import('./components/Navbar').then(m => ({ default: m.Navbar })));
const DashboardView = lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })));
const TracksCatalogView = lazy(() => import('./components/TracksCatalogView').then(m => ({ default: m.TracksCatalogView })));
const InteractiveLabView = lazy(() => import('./components/InteractiveLab').then(m => ({ default: m.InteractiveLabView })));
const SystemDesignerSandbox = lazy(() => import('./components/SystemDesignerSandbox').then(m => ({ default: m.SystemDesignerSandbox })));
const StarterKitBuilder = lazy(() => import('./components/StarterKitBuilder').then(m => ({ default: m.StarterKitBuilder })));
const TeardownsView = lazy(() => import('./components/TeardownsView').then(m => ({ default: m.TeardownsView })));
const WorkshopsCommunityView = lazy(() => import('./components/WorkshopsCommunityView').then(m => ({ default: m.WorkshopsCommunityView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const AIChatView = lazy(() => import('./components/AIChatView').then(m => ({ default: m.AIChatView })));
const PricingView = lazy(() => import('./components/PricingView').then(m => ({ default: m.PricingView })));
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
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTeardownSlug, setSelectedTeardownSlug] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [certificateTrackId, setCertificateTrackId] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [selectedLabId, setSelectedLabId] = useState('');
  const [selectedTeardownId, setSelectedTeardownId] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [courses, setCourses] = useState<CourseTrack[]>([]);
  const [teardowns, setTeardowns] = useState<TeardownArticle[]>([]);
  const [starterKits, setStarterKits] = useState<StarterKitOption[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopEvent[]>([]);
  const [userState, setUserState] = useState<UserState>({
    tier: 'free', completedLabs: [], inProgressCourseId: '',
    activeLabId: '', xpPoints: 0, unlockedCertificates: [],
    coachingCallsRemaining: 0, savedStarterKits: [],
  });

  const GlobalBackground = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-noise-vintage" />
      <div className="absolute inset-0 synth-grid-overlay opacity-40" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl geo-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl geo-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-0 w-64 h-64 border border-red-500/10 rounded-full geo-float-1" />
      <div className="absolute bottom-1/4 left-0 w-48 h-48 border border-indigo-500/10 rounded-full geo-float-2" />
      <div className="absolute top-2/3 left-1/3 w-32 h-32 border border-purple-500/10 rotate-45 geo-float-3" />
      <div className="absolute top-20 right-1/3 w-2 h-2 bg-red-500/30 rounded-full geo-float-1" />
      <div className="absolute bottom-32 left-1/2 w-1.5 h-1.5 bg-indigo-500/30 rounded-full geo-float-2" />
      <div className="absolute top-1/2 left-20 w-1 h-1 bg-purple-400/30 rounded-full geo-float-3" />
    </div>
  );

  useEffect(() => {
    const { tab, id } = parseHashRoute();
    setActiveTab(tab);
    if (tab === 'teardowns' && id) { setSelectedTeardownSlug(id); setSelectedTeardownId(id); }
    if (tab === 'tracks' && id) { setSelectedTrackId(id); }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const { tab, id } = parseHashRoute();
      setActiveTab(tab);
      if (tab === 'teardowns' && id) { setSelectedTeardownSlug(id); setSelectedTeardownId(id); }
      else if (tab === 'teardowns') { setSelectedTeardownSlug(''); setSelectedTeardownId(''); }
      if (tab === 'tracks' && id) { setSelectedTrackId(id); }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setDataLoading(false); return; }
    async function loadAllData() {
      setDataLoading(true); setDataError(false);
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
          setUserState(prev => ({ ...prev, ...p.userState, completedLabs, xpPoints: p.userState?.xpPoints ?? prev.xpPoints }));
        }
        if (teardownsRes.status === 'fulfilled') setTeardowns(teardownsRes.value.teardowns);
        if (kitsRes.status === 'fulfilled') setStarterKits(kitsRes.value.kits);
        if (workshopsRes.status === 'fulfilled') setWorkshops(workshopsRes.value.workshops);
        if (coursesRes.status === 'rejected') setDataError(true);
      } catch (err) {
        console.error('Failed to load data:', err);
        setDataError(true);
      } finally { setDataLoading(false); }
    }
    loadAllData();
  }, [user, authLoading, dataRefreshKey]);

  const handleNavigateTab = useCallback((tab: string, extraId?: string) => {
    setActiveTab(tab);
    let hash = `#/${tab}`;
    if (extraId) {
      hash += `/${extraId}`;
      if (tab === 'teardowns') { setSelectedTeardownSlug(extraId); setSelectedTeardownId(extraId); }
      if (tab === 'tracks') setSelectedTrackId(extraId);
    } else {
      if (tab === 'teardowns') { setSelectedTeardownSlug(''); setSelectedTeardownId(''); }
    }
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLaunchLab = (trackId: string, labId: string) => {
    setSelectedTrackId(trackId); setSelectedLabId(labId);
    setActiveTab('lab'); window.location.hash = '#/lab';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteLab = async (labId: string, score: number, code: string) => {
    if (!user || userState.completedLabs.includes(labId)) return;
    try {
      const result = await invokeEdgeFunction<{ passed: boolean; xpAwarded: number; totalXp: number; certificateIssued: any }>(
        'submit-lab-completion', { method: 'POST', body: { labId, score, code } }
      );
      if (result.passed) {
        setUserState(prev => ({ ...prev, completedLabs: [...prev.completedLabs, labId], xpPoints: result.totalXp }));
      }
    } catch (err) { console.error('Failed to submit lab:', err); }
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

  if (authLoading || dataLoading) return <SkeletonLoader />;

  const isTeardown = activeTab === 'teardowns' && selectedTeardownSlug;
  const teardownMeta = isTeardown ? TEARDOWN_META[selectedTeardownSlug] : null;
  const currentTitle = teardownMeta?.title || TAB_TITLES[activeTab] || 'Backend Forge';
  const currentDescription = teardownMeta?.description || TAB_DESCRIPTIONS[activeTab] || '';
  const currentKeywords = teardownMeta?.keywords || 'backend engineering, systems architecture, interactive labs';
  const currentUrl = `${SITE_URL}/#/${activeTab}${selectedTeardownSlug ? '/' + selectedTeardownSlug : ''}`;

  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' '), url: `${SITE_URL}/#/${activeTab}` },
  ];
  if (teardownMeta) {
    breadcrumbItems.push({ name: teardownMeta.slug.split('-').slice(0, 2).join(' '), url: currentUrl });
  }

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Backend Forge - Build Judgment Behind Reliable Systems</title>
          <meta name="description" content="Backend Forge turns real production work into guided, verifiable labs with AI mentorship." />
          <meta name="keywords" content="backend engineering, systems architecture, interactive labs, PostgreSQL, distributed systems" />
          <link rel="canonical" href={SITE_URL} />
          <meta property="og:title" content="Backend Forge - Build Judgment Behind Reliable Systems" />
          <meta property="og:description" content="Interactive backend engineering platform with production-grade labs, AI mentorship, and verified certificates." />
          <meta property="og:url" content={SITE_URL} />
          <meta property="og:type" content="website" />
        </Helmet>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-hidden">
          <GlobalBackground />
          <Suspense fallback={<ViewLoader />}>
            <LandingPage onStart={() => setIsAuthModalOpen(true)} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </Suspense>
        <Suspense fallback={null}>
          <PricingUpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} onUpgradeSuccess={handleUpgradeProSuccess} />
        </Suspense>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
      <Helmet>
        <title>{currentTitle}</title>
        <meta name="description" content={currentDescription} />
        <meta name="keywords" content={currentKeywords} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={currentTitle} />
        <meta property="og:description" content={currentDescription} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
      </Helmet>

      <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      })}
      </script>

      <a href="#main-content" className="skip-link">Skip to main content</a>
      <OfflineBanner />
      <GlobalBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <Navbar activeTab={activeTab} setActiveTab={handleNavigateTab} userState={userState} courses={courses} onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} onOpenAuthModal={() => setIsAuthModalOpen(true)} />
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
            {activeTab === 'settings' && (
              <ErrorBoundary fallbackTitle="Settings Error">
                <SettingsView userState={userState} />
              </ErrorBoundary>
            )}
            {activeTab === 'ai-chat' && (
              <ErrorBoundary fallbackTitle="AI Chat Error">
                <AIChatView userState={userState} courses={courses} onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} />
              </ErrorBoundary>
            )}
            {activeTab === 'pricing' && (
              <ErrorBoundary fallbackTitle="Pricing Error">
                <PricingView onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} />
              </ErrorBoundary>
            )}
          </Suspense>
        </main>

        <footer className="border-t border-zinc-800/60 bg-zinc-950 py-6 mt-auto pb-24 lg:pb-6 no-print" role="contentinfo" aria-label="Site footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
            <div>&copy; 2026 Backend Forge. All rights reserved.</div>
            <nav aria-label="Footer navigation" className="flex items-center gap-4">
              <button onClick={() => handleNavigateTab('tracks')} className="btn-ghost px-2 py-1 text-[11px]">Tracks</button>
              <button onClick={() => handleNavigateTab('starter-kits')} className="btn-ghost px-2 py-1 text-[11px]">Boilerplates</button>
              <button onClick={() => handleNavigateTab('teardowns')} className="btn-ghost px-2 py-1 text-[11px]">Teardowns</button>
              <button onClick={() => setIsUpgradeModalOpen(true)} className="text-red-400 hover:text-red-300 font-bold text-[11px]">Pro $199</button>
            </nav>
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
