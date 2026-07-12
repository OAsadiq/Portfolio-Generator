// Regenerates the stored HTML for ALL published portfolios from the CURRENT templates
// + each portfolio's saved form_data. Run this after a template change so existing
// portfolios pick up the update (they're static files, frozen at publish time).
//
// Requires env: SUPABASE_URL, SUPABASE_SERVICE_KEY
// Run (PowerShell):
//   $env:SUPABASE_URL="https://xxxx.supabase.co"; $env:SUPABASE_SERVICE_KEY="service_role_key"; node scripts/regen-portfolios.mjs
//
// Add --dry to preview without uploading:
//   ... node scripts/regen-portfolios.mjs --dry

import { createClient } from '@supabase/supabase-js';
import { templates } from '../api/templates/_templateConfig.js';

const DRY = process.argv.includes('--dry');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars.');
  process.exit(1);
}
const supabase = createClient(url, key);

const { data: portfolios, error } = await supabase
  .from('portfolios')
  .select('id, slug, template_id, form_data, sections, file_path');

if (error) { console.error('Fetch error:', error.message); process.exit(1); }
console.log(`Found ${portfolios.length} portfolios.${DRY ? ' (dry run)' : ''}\n`);

let ok = 0, skipped = 0, failed = 0;

for (const p of portfolios) {
  const tpl = templates[p.template_id];
  if (!tpl || typeof tpl.generateHTML !== 'function') {
    console.log(`SKIP  ${p.slug} — unknown template "${p.template_id}"`);
    skipped++;
    continue;
  }
  try {
    const html = tpl.generateHTML(p.form_data || {}, p.sections || []);
    const filePath = p.file_path || `portfolios/${p.slug}.html`;

    if (DRY) {
      console.log(`DRY   ${p.slug} — ${html.length} chars → ${filePath}`);
      ok++;
      continue;
    }

    const { error: upErr } = await supabase.storage
      .from('portfolios')
      .upload(filePath, html, { contentType: 'text/html', cacheControl: '3600', upsert: true });

    if (upErr) { console.log(`FAIL  ${p.slug} — ${upErr.message}`); failed++; }
    else { console.log(`OK    ${p.slug}`); ok++; }
  } catch (e) {
    console.log(`FAIL  ${p.slug} — ${e.message}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} regenerated, ${skipped} skipped, ${failed} failed.`);
process.exit(failed ? 1 : 0);
