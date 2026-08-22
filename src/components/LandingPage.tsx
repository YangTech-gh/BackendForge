import { ArrowRight, CheckCircle2, Cpu, Terminal, Zap, ShieldCheck, ShieldAlert, Sparkles, Layers, Bot, TrendingUp, Award, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { PRICING } from '../constants/pricing';
import { SITE_URL } from '../seo-config';
import { COURSE_TRACKS } from '../data/coursesData';
import { ARCHITECTURE_TEARDOWNS } from '../data/teardownsData';

interface LandingPageProps {
  onStart: () => void;
  onOpenUpgradeModal: () => void;
}

const PHILOSOPHY_PILLARS = [
  {
    icon: Layers,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    title: 'Multi-Paradigm Mastery',
    text: 'Rails to validate rapidly, Node/TS for ubiquitous API ecosystems, Go for microservices, and Rust for critical latency bottlenecks.',
  },
  {
    icon: Bot,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'AI Systems Integration',
    text: 'Build RAG pipelines with pgvector, integrate LLM function calling safely, write output guardrails, and harness agentic workflows.',
  },
  {
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Outcome & RFC Leadership',
    text: 'Write formal RFCs, communicate technical trade-offs to executives, set observability metrics, and align technical debt with growth.',
  },
];

function CornerOrnaments() {
  return (
    <>
      <div className="corner-ornament corner-tl" />
      <div className="corner-ornament corner-tr" />
      <div className="corner-ornament corner-bl" />
      <div className="corner-ornament corner-br" />
    </>
  );
}

function AnimatedSectionDivider() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" style={{ animation: 'shimmer 3s linear infinite', backgroundSize: '200% auto' }} />
    </div>
  );
}

function CircuitDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400" preserveAspectRatio="none">
        <path d="M0 100 L80 100 L100 80 L200 80" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="0.5" className="animate-dash-move" strokeDasharray="10 5" />
        <path d="M400 300 L320 300 L300 320 L200 320" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" className="animate-dash-move" strokeDasharray="10 5" style={{ animationDelay: '5s' }} />
        <circle cx="80" cy="100" r="2" fill="rgba(239,68,68,0.6)" className="circuit-dot" />
        <circle cx="200" cy="80" r="2" fill="rgba(239,68,68,0.6)" className="circuit-dot" style={{ animationDelay: '1s' }} />
        <circle cx="320" cy="300" r="2" fill="rgba(99,102,241,0.6)" className="circuit-dot" style={{ animationDelay: '2s' }} />
        <circle cx="200" cy="320" r="2" fill="rgba(99,102,241,0.6)" className="circuit-dot" style={{ animationDelay: '3s' }} />
      </svg>
    </div>
  );
}

function FloatingParticles() {
  const particles = [
    { size: 2, x: '10%', y: '20%', color: 'bg-red-500/40', delay: '0s', duration: '4s' },
    { size: 1.5, x: '85%', y: '15%', color: 'bg-indigo-500/40', delay: '1s', duration: '5s' },
    { size: 2.5, x: '75%', y: '70%', color: 'bg-purple-500/30', delay: '2s', duration: '6s' },
    { size: 1, x: '15%', y: '80%', color: 'bg-red-400/30', delay: '0.5s', duration: '4.5s' },
    { size: 2, x: '50%', y: '10%', color: 'bg-indigo-400/30', delay: '1.5s', duration: '5.5s' },
    { size: 1.5, x: '90%', y: '50%', color: 'bg-emerald-500/20', delay: '3s', duration: '7s' },
    { size: 1, x: '5%', y: '50%', color: 'bg-amber-500/20', delay: '2.5s', duration: '6.5s' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${p.color} ${i % 2 === 0 ? 'geo-float-y' : 'geo-float-y-reverse'}`}
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

function RotatingRings() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-1/4 right-0 w-48 h-48 border border-red-500/10 rounded-full geo-rotate-slow opacity-40" />
      <div className="absolute bottom-1/4 left-0 w-32 h-32 border border-indigo-500/10 rounded-full geo-rotate-reverse opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-purple-500/5 rounded-full geo-rotate-slow opacity-30" style={{ animationDuration: '35s' }} />
    </div>
  );
}

export function LandingPage({ onStart, onOpenUpgradeModal }: LandingPageProps) {
  return (
    <main id="main-content" className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
      <Helmet>
        <title>Backend Forge - Build Judgment Behind Reliable Systems</title>
        <meta name="description" content="Backend Forge turns real production work - concurrency, failure modes, data integrity, and architecture - into guided, verifiable labs with AI mentorship." />
        <meta name="keywords" content="backend engineering, systems architecture, interactive labs, PostgreSQL, distributed systems, AI mentorship, TypeScript, Go, Rust" />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="Backend Forge - Build Judgment Behind Reliable Systems" />
        <meta property="og:description" content="Interactive backend engineering platform with production-grade labs, AI mentorship, and verified certificates." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hidden SEO content block */}
      <div className="seo-hidden" aria-hidden="true">
        <h2>Backend Forge: Interactive Backend Engineering Platform</h2>
        <p>
          Backend Forge is a hands-on learning platform for backend engineers who want to master
          high-concurrency systems, distributed fault tolerance, PostgreSQL transaction isolation,
          race condition debugging, and AI-native system design. Unlike video courses, every lesson
          on Backend Forge is an interactive coding lab with real test verification, AI mentorship,
          and production-grade code scaffolding.
        </p>
        <p>
          Our curriculum covers TypeScript, Node.js, Go, Rust, Ruby on Rails, PostgreSQL, Redis,
          event sourcing, saga patterns, idempotent API design, distributed locking, and LLM
          function calling integration. Graduate with verified certificates and the judgment to
          build systems that AI cannot own for you.
        </p>
      </div>

      {/* FAQ structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is Backend Forge?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Backend Forge is an interactive backend engineering platform that turns real production work - concurrency, failure modes, data integrity, and architecture - into guided, verifiable labs with AI mentorship and verified certificates."
              }
            },
            {
              "@type": "Question",
              name: "How much does Backend Forge cost?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Backend Forge offers a one-time lifetime Pro pass for $199 (originally $599). This includes all current and future tracks, AI code reviews, verified certificates, and 1-on-1 architecture coaching calls. No monthly subscriptions."
              }
            },
            {
              "@type": "Question",
              name: "What backend technologies does Backend Forge teach?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Backend Forge covers TypeScript, Node.js, Go, Rust, Ruby on Rails, PostgreSQL, Redis, distributed systems, event sourcing, saga patterns, and AI-native backend integration with pgvector and LLM function calling."
              }
            },
            {
              "@type": "Question",
              name: "Are the labs really interactive?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Every lab is a hands-on coding environment with a real code editor, terminal, test verification suite, and AI mentor. You write production-grade code, not watch videos. Labs include incident-style scenarios, race condition debugging, and distributed system failures."
              }
            }
          ]
        })}
      </script>

      {/* ── HERO BENTO GRID ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-6 stagger-in">

        {/* Main Hero Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="lg:col-span-8 liquid-metal-card rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl group border border-zinc-800 hover:border-red-500/40 min-h-[440px] scanline-overlay"
        >
          <CornerOrnaments />
          <CircuitDecorations />
          <FloatingParticles />
          <RotatingRings />
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-red-600/25 transition duration-700" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
          <div className="absolute inset-0 synth-grid-overlay opacity-25 pointer-events-none" />

          {/* Data stream lines */}
          <div className="absolute left-8 top-20 w-px h-20 data-stream-line opacity-30" style={{ animationDelay: '0s' }} />
          <div className="absolute left-12 top-28 w-px h-12 data-stream-line opacity-20" style={{ animationDelay: '1s' }} />
          <div className="absolute right-16 bottom-24 w-px h-16 data-stream-line opacity-20" style={{ animationDelay: '2s' }} />

          <div className="space-y-6 relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                SYSTEM INCIDENT FORGE
              </span>
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-indigo-400" aria-hidden="true" />
                AI-Native Systems & Verified Diploma
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-[1.1] tracking-tight text-white">
              From API Builder to <br />
              <span className="shimmer-text">
                Systems Architect
              </span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Master high-concurrency systems, race condition locks, PostgreSQL transaction isolation, and distributed fault tolerance — the core engineering AI cannot automate.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStart()}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-6 py-3.5 rounded-2xl transition text-sm shadow-xl shadow-red-950/40 border border-red-500/30 btn-shimmer"
                style={{ backgroundSize: '200% auto' }}
              >
                <span>Start Learning Free</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStart()}
                className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold px-5 py-3.5 rounded-2xl transition text-sm font-mono shadow-md"
              >
                <Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Interactive Lab</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStart()}
                className="flex items-center space-x-2 bg-zinc-950 hover:bg-zinc-900 text-red-300 border border-red-500/30 font-semibold px-5 py-3.5 rounded-2xl transition text-sm font-mono shadow-md"
              >
                <Cpu className="w-4 h-4 text-red-400" aria-hidden="true" />
                <span>System Designer</span>
              </motion.button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="pt-8 mt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400 relative z-10">
            {[
              { value: `${COURSE_TRACKS.length}`, label: 'Full Tracks', sub: 'Node, Rails, Go, Rust, AI', accent: false },
              { value: 'Sub-5ms', label: 'Latency', sub: 'Production Chaos Hardened', accent: true, icon: ShieldAlert },
              { value: PRICING.PRO_LIFETIME_PRICE_DISPLAY, label: 'Lifetime', sub: 'No Monthly Subscriptions', accent: false },
              { value: 'Verified', label: 'Diploma', sub: 'Shareable Credential ID', accent: true, icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className="space-y-0.5 group/stat">
                <div className={`text-base font-bold font-sans flex items-center space-x-1 ${stat.accent ? 'text-red-400' : 'text-white'}`}>
                  {stat.icon && <stat.icon className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{stat.value}</span>
                </div>
                <div className="text-zinc-500 text-[11px] group-hover/stat:text-zinc-400 transition-colors">{stat.sub}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Pricing Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-4 liquid-metal-card rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-indigo-500/40 text-white min-h-[440px] relative overflow-hidden group"
        >
          <CornerOrnaments />
          <CircuitDecorations />
          <FloatingParticles />
          <RotatingRings />
          <div className="absolute inset-0 synth-grid-overlay opacity-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/25 via-purple-500/15 to-transparent pointer-events-none" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute w-48 h-48 rounded-full border border-purple-500/40 animate-synth-wave-1" />
            <div className="absolute w-64 h-64 rounded-full border border-rose-500/35 animate-synth-wave-2" />
            <div className="absolute w-80 h-80 rounded-full border border-indigo-400/30 animate-synth-wave-3" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/20 via-transparent to-purple-950/20 mix-blend-screen" />
          </div>

          {/* Animated ring ornament */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-red-500/10 rounded-full animate-spin" style={{ animationDuration: '30s' }} />

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
              {[
                'Unlock all Enterprise Curriculum Tracks',
                'Unlimited Forger 1.0 AI Code Reviews',
                'Official Verified Certificate of Mastery',
                '1-on-1 Architecture Review Call',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-white font-medium">
                  <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" style={{ animationDuration: '2s', animationDelay: `${i * 0.3}s` }} />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenUpgradeModal}
              className="w-full bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-extrabold text-sm transition shadow-xl font-mono border border-red-400/40 relative overflow-hidden"
            >
              <span className="relative z-10">Join the Forge ({PRICING.PRO_LIFETIME_PRICE_DISPLAY})</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
            </motion.button>

            <p className="text-center text-[10px] text-zinc-400 mt-3 uppercase tracking-widest font-mono">
              One-time payment &bull; Lifetime access
            </p>
          </div>
        </motion.section>
      </div>

      {/* ── SYSTEM DESIGNER TEASER ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden mt-4 scanline-overlay group hover:border-red-500/30 transition-all duration-500"
      >
        <CornerOrnaments />
        <CircuitDecorations />
        <FloatingParticles />
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-red-600/15 transition duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />
        <div className="absolute inset-0 synth-grid-overlay opacity-20 pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Cpu className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono block">
                INTERACTIVE TOPOLOGY
              </span>
              <h3 className="text-base font-bold text-white">System Architecture Sandbox</h3>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center space-x-1">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            <span>CHAOS TESTER</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 my-4 relative z-10">
          {[
            { label: '75K RPS', sub: 'Traffic Spikes' },
            { label: 'SPOFs', sub: 'Single Points of Failure' },
            { label: 'RFCs', sub: 'Technical Documents' },
          ].map((item, i) => (
            <div key={i} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-center space-y-1 hover:border-zinc-700 transition">
              <div className="text-sm font-bold text-white font-mono">{item.label}</div>
              <div className="text-[10px] text-zinc-500 font-mono">{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 relative z-10">
          <span className="text-xs text-zinc-500 font-mono">Simulate SPOFs &amp; Traffic Spikes</span>
          <button onClick={onStart} className="flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-red-300 font-bold px-4 py-2 rounded-full text-xs transition font-mono border border-red-500/30 hover:border-red-500/50">
            <span>Launch Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </motion.div>

      {/* ── PHILOSOPHY PILLARS ─────────────────────────────────────────── */}
      <section className="mt-8 space-y-4 stagger-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">
            ARCHITECTURAL PHILOSOPHY
          </h2>
          <div className="h-px flex-1 ml-4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" style={{ animation: 'shimmer 3s linear infinite', backgroundSize: '200% auto' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PHILOSOPHY_PILLARS.map(({ icon: Icon, color, bg, title, text }) => (
            <motion.div
              key={title}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3 hover:border-zinc-700 transition-all duration-300 cursor-default ${bg} relative overflow-hidden group`}
            >
              <div className={`p-2.5 bg-zinc-800 rounded-2xl ${color} w-fit`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{text}</p>

              {/* Animated corner accent */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CURRICULUM TRACKS PREVIEW ──────────────────────────────────── */}
      <section className="mt-8 space-y-4 stagger-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Enterprise Curriculum Tracks</h2>
            <p className="text-xs text-zinc-400 mt-1">Modular, project-based learning paths for backend engineers.</p>
          </div>
          <button onClick={onStart} className="text-indigo-400 hover:text-indigo-300 text-xs font-mono font-semibold flex items-center space-x-1 group/btn">
            <span>View All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSE_TRACKS.slice(0, 6).map((track, idx) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              onClick={() => onStart()}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition group space-y-4 shadow-lg cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-3 right-3 w-1 h-1 bg-red-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${track.badgeColor}`}>
                    TRACK {track.trackNumber}: {track.paradigm}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">{track.labs.length} Labs</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                  {track.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {track.description}
                </p>

                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs space-y-1">
                  <div className="text-[10px] font-mono uppercase text-indigo-400 font-semibold">Shippable Deliverable:</div>
                  <div className="font-bold text-zinc-200">{track.deliverableProject.title}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between relative z-10">
                <div className="flex flex-wrap gap-1">
                  {track.deliverableProject.techStack.slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-indigo-400 flex items-center space-x-1">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ARCHITECTURE TEARDOWNS PREVIEW ─────────────────────────────── */}
      <section className="mt-8 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden stagger-in">
        <div className="absolute inset-0 synth-grid-overlay opacity-10 pointer-events-none" />
        <CircuitDecorations />
        <FloatingParticles />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-1">HIGH-SIGNAL CONTENT MARKETING</div>
            <h2 className="text-2xl font-bold text-white">Architecture Teardowns</h2>
            <p className="text-xs text-zinc-400 mt-1">Deep-dive technical post-mortems analyzing how companies scale.</p>
          </div>
          <button onClick={onStart} className="text-indigo-400 hover:text-indigo-300 text-xs font-mono font-semibold flex items-center space-x-1 group/btn">
            <span>Read All Teardowns</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {ARCHITECTURE_TEARDOWNS.slice(0, 3).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.08, duration: 0.4 }}
              onClick={() => onStart()}
              className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 space-y-3 cursor-pointer transition group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-bold font-mono text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  {item.company}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{item.readTime}</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition line-clamp-2 relative z-10">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed relative z-10">
                {item.summary}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
