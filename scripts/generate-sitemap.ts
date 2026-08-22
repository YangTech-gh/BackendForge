/**
 * Dynamic Sitemap Generator for Backend Forge
 * Generates sitemap.xml with all app routes including teardown articles.
 *
 * Run: npx tsx scripts/generate-sitemap.ts
 * Output: dist/sitemap.xml (after vite build) or public/sitemap.xml
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://backendforge.dev';
const TODAY = new Date().toISOString().split('T')[0];

// Teardown article slugs and their SEO metadata
const TEARDOWN_ARTICLES = [
  {
    slug: 'stripe-payment-infrastructure',
    title: "Stripe's Payment Infrastructure: A Masterclass in Distributed Transactions",
    description: 'How Stripe processes billions in payments with zero data loss using a custom distributed transaction engine.',
    publishedAt: '2026-03-15',
    priority: '0.8',
  },
  {
    slug: 'vercel-edge-network',
    title: "Vercel's Edge Network: How Serverless Functions Scale to Billions of Requests",
    description: "Inside Vercel's edge runtime, cold start optimization, and how they achieve sub-50ms function startup globally.",
    publishedAt: '2026-04-01',
    priority: '0.8',
  },
  {
    slug: 'cloudflare-workers-runtime',
    title: 'Cloudflare Workers: The Runtime That Runs at the Edge of Every Network',
    description: 'How Cloudflare built a serverless platform on V8 isolates that deploys to 300+ cities with zero cold starts.',
    publishedAt: '2026-04-15',
    priority: '0.8',
  },
  {
    slug: 'shopify-checkout-scalability',
    title: "Shopify's Checkout: How They Process $1B in Black Friday Traffic",
    description: "The architecture behind Shopify's checkout flow handling 80,000 requests per second during peak traffic.",
    publishedAt: '2026-05-01',
    priority: '0.8',
  },
  {
    slug: 'discord-real-time-infrastructure',
    title: "Discord's Real-Time Infrastructure: Scaling WebSocket Connections to 500M Users",
    description: 'How Discord built a real-time messaging platform that handles 500 million messages per day.',
    publishedAt: '2026-05-15',
    priority: '0.8',
  },
];

// Static routes
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/#/dashboard', priority: '0.7', changefreq: 'weekly' },
  { path: '/#/tracks', priority: '0.9', changefreq: 'weekly' },
  { path: '/#/teardowns', priority: '0.9', changefreq: 'weekly' },
  { path: '/#/workshops', priority: '0.6', changefreq: 'monthly' },
  { path: '/#/starter-kits', priority: '0.7', changefreq: 'monthly' },
  { path: '/#/system-designer', priority: '0.6', changefreq: 'monthly' },
];

function generateSitemap(): string {
  const urls = [...STATIC_ROUTES];

  // Add teardown article URLs
  for (const article of TEARDOWN_ARTICLES) {
    urls.push({
      path: `/#/teardowns/${article.slug}`,
      priority: article.priority,
      changefreq: 'monthly',
    });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  for (const url of urls) {
    xml += `  <url>
    <loc>${SITE_URL}${url.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
`;
  }

  xml += '</urlset>\n';
  return xml;
}

function main() {
  const sitemap = generateSitemap();

  // Output to dist/ if it exists (after vite build), otherwise public/
  const distDir = join(process.cwd(), 'dist');
  const publicDir = join(process.cwd(), 'public');
  const outputDir = existsSync(distDir) ? distDir : publicDir;

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, 'sitemap.xml');
  writeFileSync(outputPath, sitemap, 'utf-8');
  console.log(`✅ Sitemap generated: ${outputPath}`);
  console.log(`   Total URLs: ${STATIC_ROUTES.length + TEARDOWN_ARTICLES.length}`);
}

main();
