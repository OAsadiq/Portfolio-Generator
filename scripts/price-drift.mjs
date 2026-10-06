// Porfilr — has our local pricing drifted away from what we meant to charge?
//
//   node scripts/price-drift.mjs                  fetch a rate and report
//   node scripts/price-drift.mjs --rate=1750      use YOUR rate instead of an API's
//   node scripts/price-drift.mjs --threshold=10   warn past 10% (default 15)
//
// Exits 1 if anything is past the threshold, so it can be run on a schedule.
//
// WHY THIS AND NOT AUTOMATIC PRICING
// We deliberately do NOT convert prices live. Three reasons:
//
//   1. There is no single USD->NGN rate. The official and parallel rates diverge, often a
//      lot, and an API quotes one of them. Which one is a judgement call, not a lookup —
//      hence --rate, so you can use the number you actually believe.
//   2. A price that moves daily reads as untrustworthy, and invalidates every graphic,
//      ad and video the moment it moves.
//   3. Pricing locally is the POINT: $35 is a different amount of money in Lagos than in
//      Ohio. Converting at spot just gives the American price in naira, which is the trap
//      we were trying to escape.
//
// So: you set a round number by hand, and this tells you when it has quietly stopped
// meaning what you intended. The judgement stays with you; only the arithmetic is here.

import { readFileSync } from 'fs';

const ROOT = new URL('..', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// --- .env ---
let env = {};
try {
  env = Object.fromEntries(
    read('.env').split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
  );
} catch {
  console.error('No .env found — run this from the repo root.');
  process.exit(1);
}

// --- args ---
const args = process.argv.slice(2);
const flag = (n) => { const h = args.find((a) => a.startsWith(`--${n}=`)); return h ? h.slice(n.length + 3) : null; };
const manualRate = flag('rate') ? Number(flag('rate')) : null;
const threshold = Number(flag('threshold') || 15);

if (manualRate !== null && (!Number.isFinite(manualRate) || manualRate <= 0)) {
  console.error(`--rate must be a positive number (got "${flag('rate')}")`);
  process.exit(1);
}

// --- target USD prices, read from the app so they can't drift apart ---
// src/lib/plan.ts is the single source of truth for what we SAY things cost.
function targetsFromPlan() {
  const src = read('src/lib/plan.ts');
  const grab = (name) => {
    const m = new RegExp(`export const ${name}\\s*=\\s*(\\d+(?:\\.\\d+)?)`).exec(src);
    return m ? Number(m[1]) : null;
  };
  return { kit: grab('KIT_PRICE_USD'), pro: grab('PRO_PRICE_USD') };
}

const t = targetsFromPlan();
if (t.kit == null || t.pro == null) {
  console.error('Could not read KIT_PRICE_USD / PRO_PRICE_USD from src/lib/plan.ts.');
  process.exit(1);
}

// product id -> intended USD price. Kits all sit at the kit price today; add entries here
// when a kit prices differently.
const TARGET_USD = { pro: t.pro, 'trader-template': t.kit };

// A local price is usually NOT the dollar price converted. Pricing for Nigeria means
// charging what a Nigerian trader will actually pay, which is deliberately below the US
// figure — so measuring drift against the US price would flash "REVIEW" forever at a
// number we chose on purpose, and we'd learn to ignore the warning.
//
// PRICE_TARGET_USD says what each local price is MEANT to be worth in dollars. Drift is
// then measured against our own intent: it fires when the exchange rate moves enough to
// change what we're really charging, not because we chose to charge less here.
//
//   PRICE_TARGET_USD={"trader-template":15,"pro":9}
let INTENT_USD = {};
try {
  if (env.PRICE_TARGET_USD) {
    const parsed = JSON.parse(env.PRICE_TARGET_USD);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed)) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) INTENT_USD[k] = n;
      }
    }
  }
} catch (e) {
  console.error(`PRICE_TARGET_USD is not valid JSON — falling back to the US prices. (${e.message})`);
  INTENT_USD = {};
}

const targetFor = (product) => INTENT_USD[product] ?? TARGET_USD[product] ?? t.kit;
const targetIsLocal = (product) => INTENT_USD[product] != null;

function parseMap(key) {
  const raw = env[key];
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('not an object');
    return o;
  } catch (e) {
    console.error(`${key} is not valid JSON — that payment method is disabled in the app too. (${e.message})`);
    return null;
  }
}

async function usdToNgn() {
  if (manualRate !== null) return { rate: manualRate, source: 'your --rate' };
  // No key required, and it publishes NGN. It quotes an OFFICIAL-style rate, which may sit
  // well away from what people actually transact at — that's exactly why --rate exists.
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) throw new Error(`rate lookup failed: HTTP ${res.status}`);
  const data = await res.json();
  const rate = data?.rates?.NGN;
  if (!rate) throw new Error('response carried no NGN rate');
  return { rate, source: `open.er-api.com (${data.time_last_update_utc?.slice(0, 16) || 'today'})` };
}

const pct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
const money = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

let breached = 0;

console.log('\nPRICE DRIFT\n');

// ── Naira ────────────────────────────────────────────────────────────────────
const ngn = parseMap('VITE_NGN_PRICES');
if (!ngn || !Object.keys(ngn).length) {
  console.log('  NGN   VITE_NGN_PRICES not set — bank transfer is off in the app.\n');
} else {
  let rate, source;
  try { ({ rate, source } = await usdToNgn()); }
  catch (e) {
    console.error(`  NGN   could not get a rate: ${e.message}`);
    console.error('        pass one you trust: --rate=1750\n');
    process.exit(1);
  }
  console.log(`  rate  1 USD = ₦${money(rate)}   [${source}]\n`);

  for (const [product, priceRaw] of Object.entries(ngn)) {
    const price = Number(String(priceRaw).replace(/[^\d.]/g, ''));
    const target = targetFor(product);
    if (!Number.isFinite(price) || price <= 0) { console.log(`  ${product.padEnd(18)} invalid price "${priceRaw}"`); continue; }

    const impliedUsd = price / rate;
    const drift = ((impliedUsd - target) / target) * 100;
    const over = Math.abs(drift) > threshold;
    if (over) breached++;

    const tag = targetIsLocal(product) ? 'local' : 'US   ';
    console.log(`  ${product.padEnd(18)} ₦${money(price).padEnd(12)} ≈ $${impliedUsd.toFixed(2).padEnd(8)} ${tag} target $${String(target).padEnd(5)} ${pct(drift).padStart(8)}  ${over ? '  <-- REVIEW' : ''}`);
  }
  console.log('');
}

// ── USDT ─────────────────────────────────────────────────────────────────────
// USDT tracks the dollar, so this is a straight comparison — no rate involved. It still
// drifts, because the USD price can change and this map is edited separately.
const usdt = parseMap('VITE_USDT_PRICES');
if (!usdt || !Object.keys(usdt).length) {
  console.log('  USDT  VITE_USDT_PRICES not set — crypto is off in the app.\n');
} else {
  for (const [product, priceRaw] of Object.entries(usdt)) {
    const price = Number(String(priceRaw).replace(/[^\d.]/g, ''));
    const target = targetFor(product);
    if (!Number.isFinite(price) || price <= 0) { console.log(`  ${product.padEnd(18)} invalid price "${priceRaw}"`); continue; }
    const drift = ((price - target) / target) * 100;
    const over = Math.abs(drift) > threshold;
    if (over) breached++;
    console.log(`  ${product.padEnd(18)} ${price} USDT`.padEnd(42) + `target $${String(target).padEnd(5)} ${pct(drift).padStart(8)}  ${over ? '  <-- REVIEW' : ''}`);
  }
  console.log('');
}

// ── Products that can't be bought locally at all ─────────────────────────────
// A product missing from a map has that tab hidden in the app. Usually deliberate; easy to
// forget after launching a kit, which would silently leave it card-only.
const known = Object.keys(TARGET_USD);
const missing = known.filter((p) => !(ngn && ngn[p]) && !(usdt && usdt[p]));
if (missing.length) {
  console.log(`  not purchasable locally (card only): ${missing.join(', ')}\n`);
}

if (breached) {
  console.log(`${breached} price past ${threshold}% — worth a deliberate look. Nothing has changed automatically.\n`);
  process.exit(1);
}
console.log(`All within ${threshold}%.\n`);
