// Pre-render the niche landing pages to static HTML for search engines.
//
// THE PROBLEM THIS SOLVES
// Porfilr is a client-rendered SPA. A crawler requesting
// /portfolio-website-for-graphic-designers received the generic index.html — title
// "Porfilr — Your work, finally visible", zero niche content. Six pages built to capture
// real search intent were invisible to Google and to every link-preview fetcher.
//
// WHAT THIS DOES
// After `vite build`, it writes dist/<slug>/index.html for each niche: the built app
// shell, but with real <title>/<meta>/canonical/JSON-LD and the page's actual copy
// pre-rendered into <body>. React hydrates over it on load, so users see no difference —
// crawlers now see the content.
//
// Run automatically as part of `npm run build`.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://porfilr.com';

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html not found — run `vite build` first.');
  process.exit(1);
}

// The niche config is TypeScript. Strip the types with esbuild (already a Vite dependency,
// so no new install) and import the real data — far more reliable than regex-stripping.
const esbuild = await import('esbuild');
const configSrc = readFileSync(join(ROOT, 'src/pages/niches/nicheConfig.ts'), 'utf8');
const { code } = await esbuild.transform(configSrc, { loader: 'ts', format: 'esm' });
const { NICHES } = await import(`data:text/javascript,${encodeURIComponent(code)}`);

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const shell = readFileSync(join(DIST, 'index.html'), 'utf8');

/** The visible copy a crawler should read. React replaces this on hydration. */
function bodyHtml(n) {
  return `<main>
  <h1>${esc(n.h1)}</h1>
  <p>${esc(n.subhead)}</p>
  <h2>Why ${esc(n.niche.toLowerCase())} use Porfilr</h2>
  ${n.benefits.map((b) => `<section><h3>${esc(b.title)}</h3><p>${esc(b.body)}</p></section>`).join('\n  ')}
  <h2>What a strong ${esc(n.niche.toLowerCase().replace(/s$/, ''))} portfolio needs</h2>
  ${n.essentials.map((e) => `<section><h3>${esc(e.title)}</h3><p>${esc(e.body)}</p></section>`).join('\n  ')}
  <h2>Frequently asked questions</h2>
  ${n.faq.map((f) => `<section><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></section>`).join('\n  ')}
  <p><a href="/templates">Build your ${esc(n.niche.toLowerCase().replace(/s$/, ''))} portfolio free</a></p>
</main>`;
}

function headHtml(n, canonical) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: n.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return `<title>${esc(n.seoTitle)}</title>
    <meta name="description" content="${esc(n.seoDescription)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${esc(n.seoTitle)}" />
    <meta property="og:description" content="${esc(n.seoDescription)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(n.seoTitle)}" />
    <meta name="twitter:description" content="${esc(n.seoDescription)}" />
    <script type="application/ld+json">${JSON.stringify(faqLd)}</script>`;
}

let written = 0;
for (const n of NICHES) {
  const canonical = `${ORIGIN}/${n.slug}`;

  // Order matters: strip the shell's generic description FIRST, then inject the niche
  // head. Doing it the other way round deletes the description we just added.
  let html = shell
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, headHtml(n, canonical));

  // Seed #root so the crawler reads real copy. React overwrites this on hydration.
  html = html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${bodyHtml(n)}</div>`
  );

  const outDir = join(DIST, n.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
  console.log(`  ${n.slug}/index.html`);
  written++;
}

console.log(`\nPre-rendered ${written} niche page(s).`);
