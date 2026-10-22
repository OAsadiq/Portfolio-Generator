// Porfilr — regenerate the trader sample page's calendar.
//
//   node scripts/gen-sample-calendar.mjs           print the HTML
//   node scripts/gen-sample-calendar.mjs --write   splice it into the sample page
//
// WHY THIS EXISTS
// public/templates/trader-template/preview.html is what people see when they preview the
// kit. It used to be hand-written, which is how "Verified Track Record" — a claim every
// brief forbids — survived in it for months while the product said "self-reported".
//
// This generates the calendar with calendarHtml(), the SAME function the live template
// calls. The sample therefore cannot show a calendar the real page wouldn't. When the
// calendar changes, re-run this instead of editing HTML by hand.
//
// The month is built to agree with the stats already on that page (58.4% win rate, 2.31
// profit factor, ~59 trades/month). A calendar implying a different trader than the
// numbers beside it is worse than no calendar.

import { readFileSync, writeFileSync } from 'fs';
import { calendarHtml, monthGrid } from '../api/_lib/calendar.js';

const SAMPLE = new URL('../public/templates/trader-template/preview.html', import.meta.url);
const WRITE = process.argv.includes('--write');

const YEAR = 2026, MONTH = 9;   // September 2026 — a complete month in the past

// Deterministic PRNG: re-running must produce byte-identical output, or every regeneration
// would show a diff and nobody could tell a real change from noise.
let seed = 20260920;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

const trades = [];
const daysInMonth = new Date(Date.UTC(YEAR, MONTH, 0)).getUTCDate();

for (let d = 1; d <= daysInMonth; d++) {
  const dow = new Date(Date.UTC(YEAR, MONTH - 1, d)).getUTCDay();
  if (dow === 0 || dow === 6) continue;          // weekdays only
  if (rnd() < 0.12) continue;                    // the odd day off — nobody trades every day

  const count = 2 + Math.floor(rnd() * 4);       // 2-5 trades/day -> ~60 for the month
  for (let i = 0; i < count; i++) {
    // ~58% winners. Losers run larger than winners, which is what a 2.31 profit factor at
    // that win rate actually looks like.
    const win = rnd() < 0.584;
    const pnl = win
      ? Math.round((60 + rnd() * 420) * 100) / 100
      : -Math.round((50 + rnd() * 260) * 100) / 100;
    trades.push({
      pnl,
      fees: 0,
      opened_at: new Date(Date.UTC(YEAR, MONTH - 1, d, 8 + i, 5)).toISOString(),
      closed_at: new Date(Date.UTC(YEAR, MONTH - 1, d, 10 + i, 40)).toISOString(),
    });
  }
}

const g = monthGrid(trades, YEAR, MONTH);
const wins = trades.filter((t) => t.pnl > 0).length;
const gross = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
const loss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));

const report = [
  `month        : ${g.label}`,
  `trades       : ${trades.length}            (page claims ~59/month)`,
  `win rate     : ${(wins / trades.length * 100).toFixed(1)}%          (page claims 58.4%)`,
  `profit factor: ${(gross / loss).toFixed(2)}           (page claims 2.31)`,
  `days         : ${g.summary.tradingDays} traded, ${g.summary.greenDays} green, ${g.summary.redDays} red`,
].join('\n');

const html = calendarHtml(trades, { year: YEAR, month: MONTH });

if (!WRITE) {
  console.error(report + '\n');
  process.stdout.write(html);
  process.exit(0);
}

// ── Splice into the sample ──────────────────────────────────────────────────
// Bounded by markers so re-running replaces the block instead of appending another.
const START = '<!-- CALENDAR:START -->';
const END = '<!-- CALENDAR:END -->';
const block = `${START}\n${html}\n      ${END}`;

let page = readFileSync(SAMPLE, 'utf8');

if (page.includes(START) && page.includes(END)) {
  page = page.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block);
} else {
  // First run: insert above the proof note, where the equity chart ends.
  const anchor = '      <p class="proof-note">';
  if (!page.includes(anchor)) {
    console.error('Could not find the insertion anchor in the sample page. Insert the markers by hand once, then re-run.');
    process.exit(1);
  }
  page = page.replace(anchor, `      ${block}\n\n${anchor}`);
}

writeFileSync(SAMPLE, page);
console.error(report);
console.error(`\nWrote the calendar into ${SAMPLE.pathname.split('/').pop()}.`);
