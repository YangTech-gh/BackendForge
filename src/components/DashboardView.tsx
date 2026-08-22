import React from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  Play, 
  Layers, 
  TrendingUp,
  Award,
  ShieldAlert,
  BookOpen,
  Cpu,
  Trophy,
  Flame,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { PRICING } from '../constants/pricing';
import { CourseTrack, TeardownArticle, UserState } from '../types';

interface DashboardViewProps {
  userState: UserState;
  courses: CourseTrack[];
  teardowns: TeardownArticle[];
  onNavigateTab: (tab: string, extraId?: string) => void;
  onOpenUpgradeModal: () => void;
  onOpenCertificateModal: (trackId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userState,
  courses,
  teardowns,
  onNavigateTab,
  onOpenUpgradeModal,
  onOpenCertificateModal,
}) => {
  const totalLabs = courses.reduce((acc, track) => acc + (track.labs?.length || 0), 0);
  const totalTips = courses.reduce((sum, track) => sum + track.labs.reduce((s, lab) => s + (lab.tips?.length || 0), 0), 0);
  const totalLessons = courses.reduce((sum, track) => sum + track.labs.reduce((s, lab) => s + (lab.lessons?.length || 0), 0), 0);
  const totalExercises = courses.reduce((sum, track) => sum + track.labs.reduce((s, lab) => s + (lab.exercises?.length || 0), 0), 0);

  // XP Milestones
  const XP_MILESTONES = [
    { xp: 100, label: 'First Steps', icon: Target, color: 'text-zinc-400' },
    { xp: 500, label: 'Code Warrior', icon: Flame, color: 'text-amber-400' },
    { xp: 1000, label: 'System Builder', icon: Award, color: 'text-emerald-400' },
    { xp: 2500, label: 'Architecture Ace', icon: Trophy, color: 'text-purple-400' },
    { xp: 5000, label: 'Backend Legend', icon: Sparkles, color: 'text-red-400' },
  ];

  const currentMilestone = XP_MILESTONES.filter(m => userState.xpPoints >= m.xp).pop();
  const nextMilestone = XP_MILESTONES.find(m => userState.xpPoints < m.xp);
  const xpProgress = nextMilestone
    ? ((userState.xpPoints - (currentMilestone?.xp || 0)) / (nextMilestone.xp - (currentMilestone?.xp || 0))) * 100
    : 100;
  return (
    <div className="space-y-8 pb-16" role="main" aria-label="Dashboard">
      {/* Hidden SEO content block */}
      <div className="seo-hidden" aria-hidden="true">
        <h2>Backend Forge Dashboard - Your Learning Hub</h2>
        <p>
          Track your progress across enterprise backend engineering tracks. Access interactive labs,
          AI code reviews, verified certificates, and system architecture sandbox tools.
          Backend Forge covers TypeScript, Go, Rust, PostgreSQL, distributed systems, and
          AI-native backend development for engineers building high-concurrency production systems.
        </p>
      </div>
      
      {/* Top Main Bento Grid Row */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        
        {/* Main Hero Bento Card (Col 8) - Modernized with Liquid Metal Synth Style */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="col-span-12 lg:col-span-8 liquid-metal-card rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl group h-full min-h-[440px]"
          aria-label="Welcome to Backend Forge"
        >
          {/* Glowing Red & Indigo Ambient Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-red-600/25 transition duration-700" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Decorative Grid SVG & Vintage Noise Texture */}
          <div className="absolute inset-0 synth-grid-overlay opacity-25 pointer-events-none" />

          <div className="space-y-6 relative z-10 max-w-2xl">
            
            {/* Live Accent Badges */}
            <div className="flex flex-wrap items-center gap-2" role="status" aria-label="Platform features">
              <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>INTERACTIVE PRODUCTION LABS</span>
              </span>

              <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-indigo-400" aria-hidden="true" />
                <span>AI-Native Systems & Verified Diploma</span>
              </span>
            </div>

            {/* Hero Main Headline with Red/Rose Accent */}
            <h1 className="text-3xl sm:text-5xl font-black leading-[1.1] tracking-tight text-white">
              From API Builder to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 via-purple-300 to-indigo-300">
                Systems Architect
              </span>
            </h1>
            <p className="sr-only">Transform your backend engineering career with interactive labs and AI mentorship</p>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-sans">
              Master high-concurrency systems, race condition locks, PostgreSQL transaction isolation, and distributed fault tolerance — the core engineering AI cannot automate.
            </p>

            {/* Core Action CTAs with Motion Physics */}
            <div className="flex flex-wrap items-center gap-3 pt-2" role="group" aria-label="Main actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateTab('tracks')}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-6 py-3.5 rounded-2xl transition text-sm shadow-xl shadow-red-950/40 border border-red-500/30 font-sans"
                aria-label="Explore all enterprise tracks"
              >
                <span>Explore All Tracks</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateTab('lab')}
                className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold px-5 py-3.5 rounded-2xl transition text-sm font-mono shadow-md"
                aria-label="Open interactive lab"
              >
                <Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Open Lab</span>
              </motion.button>
            </div>
          </div>

          {/* Hero Footer Stats with Red SLA Accent */}
          <div className="pt-8 mt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-mono text-zinc-400 relative z-10">
            <div className="space-y-0.5">
              <div className="text-base font-bold text-white font-sans">{courses.length} Full Tracks</div>
              <div className="text-zinc-500 text-[11px]">{courses.slice(0, 4).map(t => t.paradigm?.split(' ')[0]).join(', ')}{courses.length > 4 ? ' & more' : ''}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base font-bold text-white font-sans">{totalLabs} Total Labs</div>
              <div className="text-zinc-500 text-[11px]">Interactive Exercises</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base font-bold text-amber-400 font-sans">{totalTips + totalLessons + totalExercises}</div>
              <div className="text-zinc-500 text-[11px]">Learning Items</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base font-bold text-red-400 font-sans flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sub-5ms Latency</span>
              </div>
              <div className="text-zinc-500 text-[11px]">Production Chaos Hardened</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base font-bold text-white font-sans">{PRICING.PRO_LIFETIME_PRICE_DISPLAY} Lifetime</div>
              <div className="text-zinc-500 text-[11px]">No Monthly Subscriptions</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base font-bold text-emerald-400 font-sans flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Verified Diploma</span>
              </div>
              <div className="text-zinc-500 text-[11px]">Shareable Credential ID</div>
            </div>
          </div>
        </motion.section>

        {/* Pricing Bento Card (Col 4) - Modernized with Liquid Metal Synth Style & Animated Circular Waves */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="col-span-12 lg:col-span-4 liquid-metal-card rounded-3xl p-8 flex flex-col justify-between shadow-2xl text-white h-full min-h-[440px] relative overflow-hidden group"
          aria-label="Pro lifetime access pricing"
        >
          {/* Subtle Red/Indigo Liquid Metal Sheen & Vintage Grid */}
          <div className="absolute inset-0 synth-grid-overlay opacity-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/25 via-purple-500/15 to-transparent pointer-events-none" />

          {/* Hover Animated Effect of Circular Waves (Digital Synth) - Modern Noise Vintage */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute w-48 h-48 rounded-full border border-purple-500/40 animate-synth-wave-1" />
            <div className="absolute w-64 h-64 rounded-full border border-rose-500/35 animate-synth-wave-2" />
            <div className="absolute w-80 h-80 rounded-full border border-indigo-400/30 animate-synth-wave-3" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/20 via-transparent to-purple-950/20 mix-blend-screen" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-400/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Zap className="w-3 h-3 fill-red-300 text-red-300" />
              <span>RECOMMENDED LIFETIME PASS</span>
            </div>

            <h2 className="text-2xl font-black mb-1.5 tracking-tight">Lifetime Pro Access</h2>
            <p className="text-zinc-300 text-xs mb-6 font-mono leading-relaxed">
              One-time payment. Unlock all tracks & official verified certificate.
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-xs text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlock all Enterprise Curriculum Tracks</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited Forger 1.0 AI Code Reviews</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official Verified Certificate of Mastery</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1-on-1 Architecture Review Call</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white font-mono tracking-tight">{PRICING.PRO_LIFETIME_PRICE_DISPLAY}</span>
              <span className="text-zinc-400 line-through text-sm font-mono">{PRICING.PRO_ORIGINAL_PRICE_DISPLAY}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/30 text-red-200 font-bold border border-red-400/40 ml-auto">
                SAVE 66%
              </span>
            </div>
            
            {userState.tier === 'pro' ? (
              <div className="w-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 py-3 rounded-2xl font-bold text-xs text-center font-mono">
                ✓ PRO MEMBER ACTIVE
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenUpgradeModal}
                className="w-full bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-extrabold text-sm transition shadow-xl font-mono border border-red-400/40"
              >
                Join the Forge ({PRICING.PRO_LIFETIME_PRICE_DISPLAY})
              </motion.button>
            )}

            <p className="text-center text-[10px] text-zinc-400 mt-3 uppercase tracking-widest font-mono">
              One-time payment • Lifetime access
            </p>
          </div>
        </motion.section>

      </div>

      {/* Middle Bento Grid Row: Progress & Sandbox */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Active Student Progress Bento Box (6 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="md:col-span-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg"
          role="region"
          aria-label="Learning progress"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                <Award className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono block">
                  ACTIVE PROGRESS
                </span>
                <h3 className="text-base font-bold text-white">{userState.inProgressCourseId ? courses.find(t => t.id === userState.inProgressCourseId)?.title || courses[0]?.title : courses[0]?.title}</h3>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
              {userState.completedLabs.length} / {totalLabs} LABS
            </span>
          </div>

          <div className="my-4 space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Current Progress:</span>
              <span className="text-indigo-400 font-bold">{totalLabs > 0 ? Math.round((userState.completedLabs.length / totalLabs) * 100) : 0}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(totalLabs > 0 && userState.completedLabs.length > 0 ? 10 : 0, totalLabs > 0 ? Math.round((userState.completedLabs.length / totalLabs) * 100) : 0)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <button
              onClick={() => onOpenCertificateModal(userState.inProgressCourseId || courses[0]?.id)}
              className="flex items-center space-x-1 text-xs text-emerald-400 font-mono hover:underline"
            >
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Claim Track Certificate</span>
            </button>
            <button
              onClick={() => onNavigateTab('lab')}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-full text-xs transition font-mono"
            >
              <Play className="w-3.5 h-3.5 fill-white" aria-hidden="true" />
              <span>Resume Lab</span>
            </button>
          </div>
        </motion.div>

        {/* System Designer Teaser Bento Box (6 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="md:col-span-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold">
                <Cpu className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono block">
                  INTERACTIVE TOPOLOGY
                </span>
                <h3 className="text-base font-bold text-white">System Architecture Sandbox</h3>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>CHAOS TESTER</span>
            </span>
          </div>

          <p className="text-xs text-zinc-400 my-3 leading-relaxed">
            Simulate 75,000 RPS traffic spikes, detect connection pool exhaustion, analyze single points of failure (SPOFs), and generate formal technical RFCs.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-500 font-mono">Simulate SPOFs & Traffic Spikes</span>
            <button
              onClick={() => onNavigateTab('system-designer')}
              className="flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-red-300 font-bold px-4 py-2 rounded-full text-xs transition font-mono border border-red-500/30"
            >
              <span>Launch Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        {/* XP Milestones & Badge Progression */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-lg"
          role="region"
          aria-label="XP milestones and badges"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono block">
                  XP MILESTONES
                </span>
                <h3 className="text-base font-bold text-white">{userState.xpPoints.toLocaleString()} XP Earned</h3>
              </div>
            </div>
            {currentMilestone && (
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 ${currentMilestone.color} border border-zinc-700 font-bold flex items-center space-x-1`}>
                <currentMilestone.icon className="w-3 h-3" aria-hidden="true" />
                <span>{currentMilestone.label}</span>
              </span>
            )}
          </div>

          {/* XP Progress to Next Milestone */}
          {nextMilestone && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>Next: {nextMilestone.label}</span>
                <span className="text-amber-400 font-bold">{userState.xpPoints} / {nextMilestone.xp} XP</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, xpProgress))}%` }}
                />
              </div>
            </div>
          )}

          {/* Badge Timeline */}
          <div className="flex items-center justify-between pt-2">
            {XP_MILESTONES.map((milestone, idx) => {
              const isEarned = userState.xpPoints >= milestone.xp;
              const Icon = milestone.icon;
              return (
                <div key={idx} className="flex flex-col items-center space-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    isEarned
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-600'
                  }`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className={`text-[9px] font-mono ${isEarned ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {milestone.xp >= 1000 ? `${milestone.xp / 1000}k` : milestone.xp}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* Philosophy Pillars (3 Bento Cards) */}
      <section className="space-y-4" aria-labelledby="philosophy-heading">
        <div className="flex items-center justify-between">
          <h2 id="philosophy-heading" className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">
            ARCHITECTURAL PHILOSOPHY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3">
            <div className="p-2.5 bg-zinc-800 rounded-2xl text-indigo-400 w-fit" aria-hidden="true">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Paradigm Mastery</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Rails to validate rapidly, Node/TS for ubiquitous API ecosystems, Go for microservices, and Rust for critical latency bottlenecks.
            </p>
          </article>

          <article className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3">
            <div className="p-2.5 bg-zinc-800 rounded-2xl text-purple-400 w-fit" aria-hidden="true">
              <Bot className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-white">AI Systems Integration</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Build RAG pipelines with pgvector, integrate LLM function calling safely, write output guardrails, and harness agentic workflows.
            </p>
          </article>

          <article className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3">
            <div className="p-2.5 bg-zinc-800 rounded-2xl text-emerald-400 w-fit" aria-hidden="true">
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-white">Outcome & RFC Leadership</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Write formal RFCs, communicate technical trade-offs to executives, set observability metrics, and align technical debt with growth.
            </p>
          </article>
        </div>
      </section>

      {/* Curriculum Tracks Bento Grid */}
      <section className="space-y-4" aria-labelledby="tracks-heading">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="tracks-heading" className="text-2xl font-bold text-white">The {courses.length} Enterprise Curriculum Tracks</h2>
            <p className="text-xs text-zinc-400">Modular, project-based learning paths designed for Mid-Level to Senior & Staff Engineers.</p>
          </div>
          <button
            onClick={() => onNavigateTab('tracks')}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-mono font-semibold flex items-center space-x-1"
            aria-label="View all tracks"
          >
            <span>View All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
          {courses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No courses available yet</h3>
              <p className="text-zinc-500 text-sm max-w-md">Check back soon for new enterprise curriculum tracks.</p>
            </div>
          )}
          {courses.map((track) => (
            <article
              key={track.id}
              role="listitem"
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition group space-y-4 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${track.badgeColor}`}>
                    TRACK {track.trackNumber}: {track.paradigm}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">{track.labs?.length || 0} Labs</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                  {track.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {track.description}
                </p>

                {/* Project Deliverable */}
                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs space-y-1">
                  <div className="text-[10px] font-mono uppercase text-indigo-400 font-semibold">Shippable Deliverable:</div>
                  <div className="font-bold text-zinc-200">{track.deliverableProject?.title || 'Project'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(track.deliverableProject?.techStack || []).slice(0, 3).map((tech: string, i: number) => (
                    <span key={i} className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onNavigateTab('tracks', track.id)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Architecture Teardowns Teaser Bento Card */}
      <section className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6" aria-labelledby="teardowns-heading">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-1">DEEP-DIVE CASE STUDIES</div>
            <h2 id="teardowns-heading" className="text-2xl font-bold text-white">Architecture Teardowns</h2>
            <p className="text-xs text-zinc-400">Deep-dive technical post-mortems analyzing how companies like Stripe, Discord, and Shopify scale.</p>
          </div>
          <button
            onClick={() => onNavigateTab('teardowns')}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-mono font-semibold flex items-center space-x-1"
            aria-label="Read all teardowns"
          >
            <span>Read All Teardowns</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
          {teardowns.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No teardown articles available yet</h3>
              <p className="text-zinc-500 text-sm max-w-md">New architecture teardowns are coming soon.</p>
            </div>
          )}
          {teardowns.map((item) => (
            <article
              key={item.id}
              role="listitem"
              onClick={() => onNavigateTab('teardowns', item.id)}
              className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 space-y-3 cursor-pointer transition group"
              aria-label={`Read teardown: ${item.title}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  {item.company}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{item.readTime}</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
};
