import { ArrowRight, CheckCircle2, Code2, LockKeyhole, Network, Terminal, Zap, ShieldCheck, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { PRICING } from '../constants/pricing';
import { SITE_URL } from '../seo-config';

interface LandingPageProps {
  onStart: () => void;
}

const outcomes = [
  'Ship a production-grade backend project in every track',
  'Learn through incident-style labs, not passive videos',
  'Build judgment for the systems AI cannot own for you',
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Senior Backend Engineer', quote: 'The incident-style labs are exactly how real debugging works. I shipped a production fix the same week I completed the concurrency track.' },
  { name: 'Marcus Rivera', role: 'Staff Engineer', quote: 'Finally, a platform that teaches systems thinking instead of just syntax. The data integrity labs saved me from a race condition in our payment pipeline.' },
  { name: 'Priya Patel', role: 'Platform Engineer', quote: 'I went from copy-pasting configs to actually understanding why our distributed systems fail. The verification approach is a game-changer.' },
];

export function LandingPage({ onStart }: LandingPageProps) {
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

      {/* Hidden SEO content block - crawlable by search engines */}
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

      {/* FAQ structured data for Google featured snippets */}
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
      <header className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5 font-mono text-lg font-extrabold tracking-tight text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400"><Network className="h-4 w-4" aria-hidden="true" /></span>
          Backend<span className="text-red-400">Forge</span>
        </div>
        <button onClick={onStart} className="btn-secondary px-4 py-2">Sign in</button>
      </header>

      <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
        <div className="max-w-2xl animate-fade-in-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> Practice-first backend engineering
          </p>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
            Build the judgment behind <span className="text-gradient">reliable systems.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            Backend Forge turns the difficult parts of real production work—concurrency, failure modes, data integrity, and architecture—into guided, verifiable labs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={onStart} className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm">Start learning free <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            <a href="#how-it-works" className="btn-secondary px-6 py-3.5 text-sm">See how it works</a>
          </div>
          <ul className="mt-8 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
            {outcomes.map((outcome) => <li key={outcome} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />{outcome}</li>)}
          </ul>
        </div>

        <div className="card-elevated relative overflow-hidden p-5 sm:p-7" aria-label="Example interactive lab">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(239,68,68,.16),transparent_42%)]" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 font-mono text-xs"><span className="text-zinc-400">LAB 02 / DATA INTEGRITY</span><span className="rounded-full bg-amber-400/10 px-2 py-1 text-amber-300">25 min</span></div>
            <h2 className="mt-6 text-2xl font-bold text-white">Stop duplicate checkout events</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Design an idempotent API path that remains correct under retries and concurrent requests.</p>
            <div className="code-block mt-6"><div className="code-block-header text-zinc-500"><span>checkout.ts</span><span className="text-emerald-400">● tests ready</span></div><pre><code><span className="text-purple-300">await</span> db.transaction(<span className="text-sky-300">async</span> (tx) =&gt; {'{'}{`\n`}  <span className="text-zinc-500">// reserve exactly one payment intent</span>{`\n`}  <span className="text-purple-300">return</span> tx.payment.upsert(...) {`\n`}{'}'});</code></pre></div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg bg-zinc-800/70 p-2 text-zinc-400">Brief</div><div className="rounded-lg border border-red-400/25 bg-red-400/10 p-2 font-semibold text-red-200">Build</div><div className="rounded-lg bg-zinc-800/70 p-2 text-zinc-400">Verify</div></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="grid gap-4 border-t border-zinc-800/70 py-10 sm:grid-cols-3">
        {[{ icon: Terminal, title: 'Understand the incident', text: 'Start with a concrete production failure and the constraints that make it hard.' }, { icon: Code2, title: 'Build the solution', text: 'Write or refine working code with focused feedback and useful scaffolding.' }, { icon: LockKeyhole, title: 'Verify the behavior', text: 'Prove the system holds up with tests and architecture-level checks.' }].map(({ icon: Icon, title, text }) => <article key={title} className="card-surface p-5"><Icon className="h-5 w-5 text-red-400" aria-hidden="true" /><h2 className="mt-4 font-bold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p></article>)}
      </section>

      <section id="social-proof" className="border-t border-zinc-800/70 py-14">
        <div className="text-center">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500">Social Proof</p>
          <h2 className="text-3xl font-bold text-white">Trusted by backend engineers</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">Hear from engineers who sharpened their craft on Backend Forge.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {testimonials.map(({ name, role, quote }) => (
            <article key={name} className="card-surface flex flex-col p-6">
              <p className="flex-1 text-sm leading-6 text-zinc-300">"{quote}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-zinc-800/70 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 font-mono text-sm font-bold text-red-400" aria-hidden="true">{name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-zinc-500">{role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing-cta" className="border-t border-zinc-800/70 py-14">
        <div className="card-glow relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-zinc-800/70 p-8 text-center sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,.12),transparent_60%)]" />
          <div className="relative">
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500">Start building today</p>
            <h2 className="text-3xl font-bold text-white">Get Backend Forge for <span className="text-red-400">{PRICING.PRO_LIFETIME_PRICE_DISPLAY}</span></h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">One-time payment. Lifetime access to all current and future labs.</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-red-400">{PRICING.PRO_LIFETIME_PRICE_DISPLAY}</span>
              <span className="text-lg text-zinc-500 line-through">{PRICING.PRO_ORIGINAL_PRICE_DISPLAY}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{PRICING.ENROLLMENT_COUNT} engineers enrolled</p>
            <button onClick={onStart} className="btn-primary mx-auto mt-6 flex items-center gap-2 px-8 py-3.5 text-sm">Get Started Free <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" /> 30-day money-back guarantee</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" aria-hidden="true" /> Instant access</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
