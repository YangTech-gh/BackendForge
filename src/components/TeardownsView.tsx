import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  CheckCircle2,
  Code2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  User,
  Clock,
} from 'lucide-react';
import { TeardownArticle } from '../types';
import { SITE_URL } from '../seo-config';

interface TeardownsViewProps {
  teardowns: TeardownArticle[];
  selectedTeardownIdFromQuery?: string;
}

export const TeardownsView: React.FC<TeardownsViewProps> = ({ teardowns, selectedTeardownIdFromQuery }) => {
  const [activeTeardownId, setActiveTeardownId] = useState<string>(
    selectedTeardownIdFromQuery || teardowns[0]?.id || ''
  );
  const [activeTag, setActiveTag] = useState<string>('All');

  const allTags = ['All', ...Array.from(new Set(teardowns.flatMap(t => t.tags)))];

  const filteredTeardowns = activeTag === 'All'
    ? teardowns
    : teardowns.filter(t => t.tags.includes(activeTag));

  const activeTeardown = teardowns.find(t => t.id === activeTeardownId) || teardowns[0];

  if (teardowns.length === 0) {
    return (
      <div className="space-y-8 pb-16" role="main" aria-label="Architecture Teardowns">
        <header className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
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
        </header>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No teardown articles available yet</h3>
          <p className="text-zinc-500 text-sm max-w-md">New architecture teardowns are coming soon.</p>
        </div>
      </div>
    );
  }

  const articleUrl = activeTeardown?.slug
    ? `${SITE_URL}/#/teardowns/${activeTeardown.slug}`
    : `${SITE_URL}/#/teardowns`;

  // FAQ structured data for the active article
  const faqSchema = activeTeardown?.faqPairs?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: activeTeardown.faqPairs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  // Article structured data
  const articleSchema = activeTeardown ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: activeTeardown.title,
    description: activeTeardown.seoDescription || activeTeardown.summary,
    author: {
      "@type": "Organization",
      name: activeTeardown.author || 'Backend Forge Team',
    },
    publisher: {
      "@type": "Organization",
      name: 'Backend Forge',
      url: SITE_URL,
    },
    datePublished: activeTeardown.publishedAt,
    keywords: activeTeardown.keywords?.join(', ') || activeTeardown.tags.join(', '),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  } : null;

  return (
    <div className="space-y-8 pb-16" role="main" aria-label="Architecture Teardowns">
      {activeTeardown && (
        <Helmet>
          <title>{activeTeardown.seoDescription ? `${activeTeardown.title} | Backend Forge` : 'Architecture Teardowns | Backend Forge'}</title>
          <meta name="description" content={activeTeardown.seoDescription || activeTeardown.summary} />
          <meta name="keywords" content={activeTeardown.keywords?.join(', ') || activeTeardown.tags.join(', ')} />
          <link rel="canonical" href={articleUrl} />
          <meta property="og:title" content={activeTeardown.title} />
          <meta property="og:description" content={activeTeardown.seoDescription || activeTeardown.summary} />
          <meta property="og:url" content={articleUrl} />
          <meta property="og:type" content="article" />
          <meta property="article:published_time" content={activeTeardown.publishedAt} />
          <meta property="article:author" content={activeTeardown.author || 'Backend Forge Team'} />
          {activeTeardown.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </Helmet>
      )}

      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
      {articleSchema && (
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      )}

      {/* Hidden SEO content block */}
      <div className="seo-hidden" aria-hidden="true">
        <h2>Backend Architecture Teardowns - Technical Deep Dives</h2>
        <p>
          Explore in-depth architecture teardowns of Stripe, Vercel, Cloudflare, Shopify, and Discord.
          Learn how these companies handle distributed transactions, edge computing, real-time messaging,
          and high-traffic e-commerce at scale. Each teardown includes production code examples,
          architectural analysis, and key engineering lessons for backend architects and senior engineers.
        </p>
      </div>

      {/* Breadcrumb navigation */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <ol className="flex items-center flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a href={`#/dashboard`} itemProp="item">
              <span itemProp="name">Home</span>
            </a>
            <meta itemProp="position" content="1" />
          </li>
          <li className="separator" aria-hidden="true">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a href={`#/teardowns`} itemProp="item">
              <span itemProp="name">Teardowns</span>
            </a>
            <meta itemProp="position" content="2" />
          </li>
          {activeTeardown?.slug && (
            <>
              <li className="separator" aria-hidden="true">/</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" aria-current="page">
                <span itemProp="name">{activeTeardown.company}</span>
                <meta itemProp="position" content="3" />
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Header */}
      <header className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
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
      </header>

      {/* Tag Filter */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter teardown articles by topic tag">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            role="tab"
            aria-selected={activeTag === tag}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition whitespace-nowrap ${
              activeTag === tag
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tag === 'All' ? 'All Topics' : `#${tag}`}
          </button>
        ))}
      </div>

      {/* Mobile Article Tabs */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-none pb-1" role="tablist" aria-label="Select teardown article to read">
        {filteredTeardowns.map((item) => {
          const isSelected = item.id === activeTeardownId;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTeardownId(item.id); }}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`article-${item.id}`}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                isSelected
                  ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {item.company}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Left Article Selector List (4 Cols) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-3" aria-label="Teardown article selector sidebar">
          {filteredTeardowns.map((item) => {
            const isSelected = item.id === activeTeardownId;

            return (
              <div
                key={item.id}
                onClick={() => setActiveTeardownId(item.id)}
                role="article"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTeardownId(item.id)}
                className={`article-card p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-zinc-900 border-red-500/60 ring-1 ring-red-500/30 shadow-xl shadow-red-950/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
                aria-label={`Read teardown article: ${item.title}`}
                aria-current={isSelected ? 'true' : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-red-300 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                    {item.company}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {item.readTime}
                  </span>
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
        </aside>

        {/* Right Article Detail Reader (8 Cols) */}
        {activeTeardown && (
          <article className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl" itemScope itemType="https://schema.org/Article">

            {/* Article Meta Header */}
            <div className="space-y-3 border-b border-zinc-800 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  TEARDOWN: {activeTeardown.company}
                </span>
                <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 font-semibold">
                  Critical Failure & Resolution
                </span>
                {activeTeardown.publishedAt && (
                  <time className="text-xs text-zinc-500 font-mono flex items-center gap-1" dateTime={activeTeardown.publishedAt}>
                    <Calendar className="w-3 h-3" />
                    {new Date(activeTeardown.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                )}
                <span className="text-xs text-zinc-500 font-mono ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeTeardown.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight" itemProp="headline">
                {activeTeardown.title}
              </h2>

              {activeTeardown.author && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <User className="w-3 h-3" />
                  <span>By <span itemProp="author">{activeTeardown.author}</span></span>
                </div>
              )}

              <p className="text-sm text-zinc-300 leading-relaxed font-normal" itemProp="description">
                {activeTeardown.summary}
              </p>

              {/* Direct answer paragraph for Google featured snippets */}
              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed">
                <span className="font-bold text-emerald-400">Quick Answer:</span>{' '}
                {activeTeardown.seoDescription || activeTeardown.summary}
              </div>
            </div>

            {/* Key Insights List */}
            <section className="space-y-3" aria-labelledby="key-insights-heading">
              <h3 id="key-insights-heading" className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Core Architectural Lessons & Resolution Trade-Offs</span>
              </h3>
              <div className="space-y-2">
                {activeTeardown.keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80 text-xs text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Topology Overview */}
            <section className="space-y-2" aria-labelledby="architecture-heading">
              <h3 id="architecture-heading" className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                Distributed System Flow Boundary
              </h3>
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 font-mono text-xs text-indigo-300 leading-relaxed" itemProp="articleBody">
                {activeTeardown.architectureOverview}
              </div>
            </section>

            {/* RFC Code Implementation */}
            <section className="space-y-2" aria-labelledby="code-snippet-heading">
              <h3 id="code-snippet-heading" className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider flex items-center space-x-1">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Production RFC Implementation Snippet</span>
              </h3>
              <pre className="bg-zinc-950 text-zinc-200 p-4 rounded-2xl border border-zinc-800 font-mono text-xs overflow-x-auto leading-relaxed">
                <code>{activeTeardown.rfcCodeSnippet}</code>
              </pre>
            </section>

            {/* FAQ Section for Featured Snippets */}
            {activeTeardown.faqPairs && activeTeardown.faqPairs.length > 0 && (
              <section className="space-y-3 faq-section" aria-labelledby="faq-heading">
                <h3 id="faq-heading" className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
                  Frequently Asked Questions
                </h3>
                {activeTeardown.faqPairs.map((faq, idx) => (
                  <details key={idx}>
                    <summary>{faq.question}</summary>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </section>
            )}

          </article>
        )}

      </div>

    </div>
  );
};
