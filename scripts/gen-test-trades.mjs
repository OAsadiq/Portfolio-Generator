// Generate an importable CSV of trades for testing the Execution Report Card.
//
// MT5 round-trip shape: both open AND close times, so the import preview shows real
// Opened/Closed columns rather than the assumed-open-time notice a Bybit-style export
// triggers. Commission is negative, as MT5 actually writes it — which also exercises the
// fee-sign fix in tradeCsv.js.
//
// The month is complete by definition, so trades run to its real last day.

// The month is NOT hardcoded. The report card always covers the last COMPLETE calendar
// month (see lastCompletedMonth / previousMonth), so test data for "this month" is
// useless — the card never looks at a month still running. Deriving it from the same
// function the card uses means this can't drift out of step again.
//
//   node scripts/gen-test-trades.mjs              last complete month
//   node scripts/gen-test-trades.mjs --month=2026-08
import { previousMonth } from '../api/_lib/reportCard.js';

const arg = (process.argv.find((a) => a.startsWith('--month=')) || '').split('=')[1];
const ym = arg || previousMonth();
const m = /^(\d{4})-(\d{2})$/.exec(ym);
if (!m) { console.error(`--month must look like 2026-09 (got "${arg}")`); process.exit(1); }

const YEAR = Number(m[1]);
const MONTH = Number(m[2]);
// A complete month, so the last day is the real last day — not today's date.
const LAST_DAY = new Date(Date.UTC(YEAR, MONTH, 0)).getUTCDate();

let seed = Number(`${YEAR}${m[2]}22`);
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

const SYMBOLS = [
  ['EURUSD', 1.08, 0.0009], ['GBPUSD', 1.27, 0.0011], ['USDJPY', 147.2, 0.14],
  ['XAUUSD', 2420, 2.4], ['GBPJPY', 188.1, 0.22], ['USDCAD', 1.365, 0.0008],
];

const rows = [];
let ticket = 50301000;

for (let d = 1; d <= LAST_DAY; d++) {
  const dow = new Date(Date.UTC(YEAR, MONTH - 1, d)).getUTCDay();
  if (dow === 0 || dow === 6) continue;     // weekdays only
  if (rnd() < 0.2) continue;                // some days off

  // 1-3 a day. Enough headroom above the 15-trade card minimum that tagging half of them
  // is a real test rather than tagging almost all of them.
  const count = 1 + Math.floor(rnd() * 3);
  for (let i = 0; i < count; i++) {
    const [sym, base, step] = SYMBOLS[Math.floor(rnd() * SYMBOLS.length)];
    const long = rnd() < 0.55;
    // ~60% winners; losers run a bit larger than winners so the profit factor stays
    // believable rather than heroic.
    const win = rnd() < 0.6;
    const moveSteps = 1 + rnd() * 3;
    const move = step * moveSteps * (win === long ? 1 : -1);
    const open = Number((base + (rnd() - 0.5) * step * 6).toFixed(sym === 'USDJPY' || sym === 'GBPJPY' ? 3 : sym === 'XAUUSD' ? 2 : 5));
    const close = Number((open + move).toFixed(sym === 'USDJPY' || sym === 'GBPJPY' ? 3 : sym === 'XAUUSD' ? 2 : 5));
    const volume = Number((0.2 + rnd() * 1.3).toFixed(2));
    const profit = Number(((win ? 1 : -1) * (35 + rnd() * 240)).toFixed(2));

    const oh = 7 + i * 3 + Math.floor(rnd() * 2);
    const ch = oh + 2 + Math.floor(rnd() * 3);
    const pad = (n) => String(n).padStart(2, '0');
    const dt = (h, m) => `${YEAR}.${pad(MONTH)}.${pad(d)} ${pad(h)}:${pad(m)}:00`;

    rows.push([
      ticket++, sym, long ? 'Buy' : 'Sell', volume.toFixed(2),
      dt(oh, 5 + Math.floor(rnd() * 50)), open,
      dt(Math.min(ch, 22), 10 + Math.floor(rnd() * 45)), close,
      (-(2 + rnd() * 6)).toFixed(2),            // commission: negative, like MT5
      (-(rnd() * 2)).toFixed(2),                // swap
      profit.toFixed(2),
    ]);
  }
}

const header = 'Ticket,Symbol,Type,Volume,Open Time,Open Price,Close Time,Close Price,Commission,Swap,Profit';
const csv = [header, ...rows.map((r) => r.join(','))].join('\n') + '\n';

const wins = rows.filter((r) => Number(r[10]) > 0).length;
const net = rows.reduce((s, r) => s + Number(r[10]), 0);
console.error(`rows        : ${rows.length}`);
console.error(`win rate    : ${(wins / rows.length * 100).toFixed(1)}%`);
console.error(`net profit  : ${net.toFixed(2)}`);
console.error(`date range  : ${YEAR}-${MONTH}-01 .. ${YEAR}-${MONTH}-${LAST_DAY}`);

process.stdout.write(csv);
