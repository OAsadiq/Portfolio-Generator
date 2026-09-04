// Regenerates the stored HTML for ALL published portfolios from the CURRENT templates
// + each portfolio's saved form_data. Run this after a template change so existing
// portfolios pick up the update (they're static files, frozen at publish time).
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_KEY from .env at the repo root.
// Run from the repo root:
//   node scripts/regen-portfolios.mjs
//
// Filter to one page:  node scripts/regen-portfolios.mjs --slug=jordan-rivera-2
// Preview only:        node scripts/regen-portfolios.mjs --dry
//
// IMPORTANT: this MUST pass the same publish-time meta as api/templates/update-portfolio.js
// (removeBranding, journalEnabled, metricsCache, slug). Regenerating without it would turn
// off traders' live track records and re-add "Made with Porfilr" to paid pages.

import { createClient } from '@supabase/supabase-js';
import { templates } from '../api/templates/_templateConfig.js';
import { computeMetrics } from '../api/_lib/metrics.js';
import { removeBrandingFor } from '../api/_lib/branding.js';

const DRY = process.argv.includes('--dry');
const slugArg = (process.argv.find((a) => a.startsWith('--slug=')) || '').split('=')[1] || null;

// Read .env ourselves. Node doesn't load it automatically, and pasting the service key
// into the shell every run is how it ends up in shell history — it must not.
try {
  process.loadEnvFile('.env');
} catch {
  /* No .env (or an older Node): fall back to whatever the shell already exported. */
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.');
  console.error('Expected them in .env at the repo root, or exported in your shell.');
  console.error('Run this from the repo root so .env is found.');
  process.exit(1);
}
const supabase = createClient(url, key);

let q = supabase
  .from('portfolios')
  .select('id, slug, template_id, form_data, sections, file_path, user_id, journal_enabled, starting_balance, metrics_cache, calendar_public, status')
  // Published pages only. A journal-first draft has no file_path and nothing public to
  // serve — regenerating one would invent `portfolios/<slug>.html` for a page the owner
  // has never published, and /p/:slug 404s drafts by design anyway.
  .eq('status', 'active');
if (slugArg) q = q.eq('slug', slugArg);
const { data: portfolios, error } = await q;

if (error) { console.error('Fetch error:', error.message); process.exit(1); }
console.log(`Found ${portfolios.length} portfolio(s).${DRY ? ' (dry run)' : ''}${slugArg ? ` [slug=${slugArg}]` : ''}\n`);

// Same entitlement rule as the publish route, via the shared helper. This MUST stay in
// step: a bulk republish rewrites every live page, so a rule that drifts here silently
// adds or removes the badge on portfolios nobody touched.
async function computeRemoveBranding(userId, tpl) {
  const { data: subs } = await supabase
    .from('subscriptions').select('status, plan').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(1);
  const isPro = subs && subs[0] && subs[0].status === 'active' && subs[0].plan === 'pro';

  // Ownership of THIS template's kit, not any kit — matches update-portfolio.
  let ownsKit = false;
  if (tpl.kit) {
    const { data: owned } = await supabase
      .from('template_purchases').select('id')
      .eq('user_id', userId).eq('template_id', tpl.id).maybeSingle();
    ownsKit = !!owned;
  }

  return removeBrandingFor(tpl, { isPro: !!isPro, ownsKit });
}

// Closed trades for this portfolio — feeds both the metrics and the opt-in calendar.
async function loadClosedTrades(p) {
  if (!(p.journal_enabled && p.starting_balance > 0)) return [];
  const { data: trades } = await supabase
    .from('trades').select('opened_at, closed_at, pnl, fees')
    .eq('portfolio_id', p.id).not('closed_at', 'is', null).limit(5000);
  return trades || [];
}

let ok = 0, skipped = 0, failed = 0;

for (const p of portfolios) {
  const tpl = templates[p.template_id];
  if (!tpl || typeof tpl.generateHTML !== 'function') {
    console.log(`SKIP  ${p.slug} — unknown template "${p.template_id}"`);
    skipped++;
    continue;
  }
  try {
    const removeBranding = await computeRemoveBranding(p.user_id, tpl);
    const closedTrades = await loadClosedTrades(p);
    const metricsCache = closedTrades.length || (p.journal_enabled && p.starting_balance > 0)
      ? computeMetrics(closedTrades, p.starting_balance)
      : (p.metrics_cache || null);
    const meta = {
      slug: p.slug,
      journalEnabled: !!p.journal_enabled,
      metricsCache,
      removeBranding,
      // Preserve the trader's opt-in calendar choice on bulk republish.
      calendarPublic: !!p.calendar_public,
      trades: closedTrades,
    };

    const html = tpl.generateHTML(p.form_data || {}, p.sections || [], meta);
    const filePath = p.file_path || `portfolios/${p.slug}.html`;

    if (DRY) {
      console.log(`DRY   ${p.slug} — ${html.length} chars · branding:${removeBranding ? 'off' : 'on'} · journal:${meta.journalEnabled ? 'on' : 'off'}`);
      ok++;
      continue;
    }

    const { error: upErr } = await supabase.storage
      .from('portfolios')
      .upload(filePath, html, { contentType: 'text/html', cacheControl: '3600', upsert: true });

    if (upErr) { console.log(`FAIL  ${p.slug} — ${upErr.message}`); failed++; }
    else { console.log(`OK    ${p.slug} · branding:${removeBranding ? 'off' : 'on'} · journal:${meta.journalEnabled ? 'on' : 'off'}`); ok++; }
  } catch (e) {
    console.log(`FAIL  ${p.slug} — ${e.message}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} regenerated, ${skipped} skipped, ${failed} failed.`);
process.exit(failed ? 1 : 0);
