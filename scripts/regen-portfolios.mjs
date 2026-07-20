// Regenerates the stored HTML for ALL published portfolios from the CURRENT templates
// + each portfolio's saved form_data. Run this after a template change so existing
// portfolios pick up the update (they're static files, frozen at publish time).
//
// Requires env: SUPABASE_URL, SUPABASE_SERVICE_KEY
// Run (PowerShell):
//   $env:SUPABASE_URL="https://xxxx.supabase.co"; $env:SUPABASE_SERVICE_KEY="service_role_key"; node scripts/regen-portfolios.mjs
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

const DRY = process.argv.includes('--dry');
const slugArg = (process.argv.find((a) => a.startsWith('--slug=')) || '').split('=')[1] || null;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars.');
  process.exit(1);
}
const supabase = createClient(url, key);

let q = supabase
  .from('portfolios')
  .select('id, slug, template_id, form_data, sections, file_path, user_id, journal_enabled, starting_balance, metrics_cache');
if (slugArg) q = q.eq('slug', slugArg);
const { data: portfolios, error } = await q;

if (error) { console.error('Fetch error:', error.message); process.exit(1); }
console.log(`Found ${portfolios.length} portfolio(s).${DRY ? ' (dry run)' : ''}${slugArg ? ` [slug=${slugArg}]` : ''}\n`);

// Same entitlement rule as the publish route: paid users (Pro or any kit) drop branding.
async function computeRemoveBranding(userId) {
  const { data: subs } = await supabase
    .from('subscriptions').select('status, plan').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(1);
  const isPro = subs && subs[0] && subs[0].status === 'active' && subs[0].plan === 'pro';
  const { count: kitCount } = await supabase
    .from('template_purchases').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  return !!isPro || (kitCount || 0) > 0;
}

// Same journal metrics the live publish computes, from the portfolio's own closed trades.
async function computeMetricsCache(p) {
  if (!(p.journal_enabled && p.starting_balance > 0)) return p.metrics_cache || null;
  const { data: trades } = await supabase
    .from('trades').select('opened_at, closed_at, pnl, fees')
    .eq('portfolio_id', p.id).not('closed_at', 'is', null).limit(5000);
  return computeMetrics(trades || [], p.starting_balance);
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
    const removeBranding = await computeRemoveBranding(p.user_id);
    const metricsCache = await computeMetricsCache(p);
    const meta = { slug: p.slug, journalEnabled: !!p.journal_enabled, metricsCache, removeBranding };

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
