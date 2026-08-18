// Porfilr — converts base64 data: URIs stored in portfolio form_data into real uploaded
// files, and rewrites the field to the public URL.
//
// WHY: one portfolio (Jan 2026) has a 683 KB JPEG pasted in as a data URI. The template
// emits the profile image three times — sidebar avatar, header avatar, og:image — so the
// published page is 2.8 MB against ~25 KB for everyone else. Worse, a data: URI in
// og:image is ignored by every social platform, so that user's link previews are blank.
//
// Written generic rather than hardcoded to the one slug: if another ever appears, this
// fixes it, and running it on a clean database is a no-op.
//
// Run from the repo root:
//   node scripts/fix-inline-images.mjs --dry      preview, writes nothing
//   node scripts/fix-inline-images.mjs            apply
//   node scripts/fix-inline-images.mjs --slug=x   limit to one portfolio
//
// Writes a JSON backup of every form_data it touches BEFORE updating, so a bad conversion
// can be reversed. Republish the affected pages afterwards:
//   node scripts/regen-portfolios.mjs --slug=<slug>

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

try {
  process.loadEnvFile('.env');
} catch {
  /* fall back to shell-exported vars */
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.');
  console.error('Expected them in .env at the repo root. Run from the repo root.');
  process.exit(1);
}
const supabase = createClient(url, key);

const DRY = process.argv.includes('--dry');
const slugArg = (process.argv.find((a) => a.startsWith('--slug=')) || '').split('=')[1] || null;

const EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

/** Split a data: URI into its mime type and raw bytes. Returns null if it isn't one. */
function decodeDataUri(value) {
  if (typeof value !== 'string' || !value.startsWith('data:')) return null;
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(value);
  // Only base64 image payloads are handled. A non-base64 (percent-encoded) data URI or a
  // non-image type is left alone rather than guessed at — better a big page than a
  // corrupted one.
  if (!m) return null;
  const mime = m[1].toLowerCase();
  if (!EXT[mime]) return null;
  try {
    return { mime, ext: EXT[mime], buffer: Buffer.from(m[2], 'base64') };
  } catch {
    return null;
  }
}

let q = supabase.from('portfolios').select('id, slug, user_id, form_data');
if (slugArg) q = q.eq('slug', slugArg);
const { data: portfolios, error } = await q;
if (error) {
  console.error('Fetch error:', error.message);
  process.exit(1);
}

console.log(`Scanning ${portfolios.length} portfolio(s).${DRY ? ' (dry run)' : ''}\n`);

// Backup file is opened up front, NOT at the end. Writing it after the updates meant a
// failed write (Controlled Folder Access blocks node under Documents) left the rows
// already mutated with no safety copy on disk — the one moment the backup existed for.
// A backup written after the thing it protects against is not a backup.
const BACKUP_FILE = process.env.PORFILR_BACKUP_DIR
  ? `${process.env.PORFILR_BACKUP_DIR}/backup-form-data-${Date.now()}.json`
  : `backup-form-data-${Date.now()}.json`;

function writeBackup(entries) {
  writeFileSync(BACKUP_FILE, JSON.stringify(entries, null, 2));
}

if (!DRY) {
  // Fail fast if the location isn't writable, before anything is changed.
  try {
    writeBackup([]);
  } catch (err) {
    console.error(`Cannot write backup file ${BACKUP_FILE}: ${err.message}`);
    console.error('Refusing to modify anything without somewhere to put the backup.');
    console.error('Set PORFILR_BACKUP_DIR to a writable folder outside Documents and retry.');
    process.exit(1);
  }
}

const backups = [];
let converted = 0;
let failed = 0;
const touchedSlugs = [];

for (const p of portfolios) {
  const fd = p.form_data || {};
  const hits = Object.entries(fd)
    .map(([field, value]) => [field, decodeDataUri(value)])
    .filter(([, decoded]) => decoded);

  if (!hits.length) continue;

  const original = JSON.parse(JSON.stringify(fd));
  const updated = { ...fd };
  let changedHere = 0;

  // Record and flush the original BEFORE touching this row, so the backup on disk is
  // always at least as current as the database.
  if (!DRY) {
    backups.push({ slug: p.slug, id: p.id, form_data: original });
    writeBackup(backups);
  }

  for (const [field, { ext, mime, buffer }] of hits) {
    const kb = Math.round(buffer.length / 1024);
    const path = `profile-pictures/${p.user_id}/${Date.now()}-${field}.${ext}`;

    if (DRY) {
      console.log(`DRY   ${p.slug} · ${field} · ${kb} KB ${mime} -> ${path}`);
      changedHere++;
      continue;
    }

    const { error: upErr } = await supabase.storage
      .from('images')
      .upload(path, buffer, { contentType: mime, upsert: true });
    if (upErr) {
      console.error(`FAIL  ${p.slug} · ${field} · upload: ${upErr.message}`);
      failed++;
      continue;
    }

    const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
    if (!pub?.publicUrl) {
      console.error(`FAIL  ${p.slug} · ${field} · could not resolve public URL`);
      failed++;
      continue;
    }

    updated[field] = pub.publicUrl;
    console.log(`OK    ${p.slug} · ${field} · ${kb} KB -> ${pub.publicUrl}`);
    changedHere++;
  }

  if (!changedHere) continue;
  converted += changedHere;

  if (DRY) continue;

  const { error: updErr } = await supabase
    .from('portfolios')
    .update({ form_data: updated })
    .eq('id', p.id);
  if (updErr) {
    console.error(`FAIL  ${p.slug} · form_data update: ${updErr.message}`);
    failed++;
    continue;
  }
  touchedSlugs.push(p.slug);
}

if (backups.length && !DRY) {
  console.log(`\nBackup of original form_data: ${BACKUP_FILE}`);
  console.log('(contains the base64 payloads — keep it local, do not commit)');
}

console.log(`\nDone. ${converted} field(s) ${DRY ? 'would be' : ''} converted, ${failed} failed.`);
if (touchedSlugs.length) {
  console.log('\nNow republish the affected pages so the live HTML picks up the URL:');
  for (const s of touchedSlugs) console.log(`  node scripts/regen-portfolios.mjs --slug=${s}`);
}
