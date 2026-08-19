// Porfilr — trade CSV import tests.  Run: npm test
//
// Import is where broker-data bugs hide: quoted fields, odd date formats, accounting
// negatives, mislabelled columns. Each test targets a way a row could be silently
// misparsed into a wrong track record.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCsv, autoDetectMapping, parseNumber, parseDirection, parseDate,
  rowToTrade, parseTradeCsv, looksLikeFillExport,
} from './tradeCsv.js';

test('parseCsv handles quoted fields with commas and newlines', () => {
  const csv = 'a,b,c\r\n"x,1","line\nbreak",3\n';
  const rows = parseCsv(csv);
  assert.deepEqual(rows[0], ['a', 'b', 'c']);
  assert.deepEqual(rows[1], ['x,1', 'line\nbreak', '3']);
});

test('parseCsv handles escaped quotes and a BOM', () => {
  const rows = parseCsv('﻿name\n"she said ""hi"""');
  assert.equal(rows[0][0], 'name');
  assert.equal(rows[1][0], 'she said "hi"');
});

test('parseCsv skips blank lines', () => {
  const rows = parseCsv('a\n\n\nb\n');
  assert.deepEqual(rows, [['a'], ['b']]);
});

test('parseNumber strips currency and thousands separators', () => {
  assert.equal(parseNumber('$1,234.50'), 1234.5);
  assert.equal(parseNumber('  -42 '), -42);
  assert.equal(parseNumber('2,000'), 2000);
});

test('parseNumber reads accounting and trailing-minus negatives', () => {
  assert.equal(parseNumber('(123.45)'), -123.45);
  assert.equal(parseNumber('123.45-'), -123.45);
});

test('parseNumber returns null for blanks and junk, not 0', () => {
  // The trap: Number('') === 0 would plot a phantom zero-P&L trade.
  for (const v of ['', '  ', '-', 'N/A', 'n/a', 'abc', null, undefined]) {
    assert.equal(parseNumber(v), null, `expected null for ${JSON.stringify(v)}`);
  }
  assert.equal(parseNumber('0'), 0); // a real zero still parses
});

test('parseDirection maps broker variants and refuses the ambiguous', () => {
  for (const v of ['buy', 'Buy', 'B', 'long', 'LONG', '0']) assert.equal(parseDirection(v), 'long', v);
  for (const v of ['sell', 'Sell', 'S', 'short', '1']) assert.equal(parseDirection(v), 'short', v);
  assert.equal(parseDirection('hold'), null);
  assert.equal(parseDirection(''), null);
});

test('parseDate handles ISO, US, and MT4 dotted formats', () => {
  assert.equal(parseDate('2024-03-15T14:30:00Z'), '2024-03-15T14:30:00.000Z');
  assert.ok(parseDate('2024.03.15 14:30:00')); // MT4/MT5 dotted
  assert.equal(parseDate('garbage'), null);
  assert.equal(parseDate(''), null);
});

test('autoDetectMapping matches common broker headers', () => {
  const m = autoDetectMapping(['Symbol', 'Side', 'Open Time', 'Close Time', 'Entry Price', 'Exit Price', 'Lots', 'Profit', 'Commission']);
  assert.equal(m.symbol, 0);
  assert.equal(m.direction, 1);
  assert.equal(m.opened_at, 2);
  assert.equal(m.closed_at, 3);
  assert.equal(m.entry_price, 4);
  assert.equal(m.exit_price, 5);
  assert.equal(m.size, 6);
  assert.equal(m.pnl, 7);
  assert.equal(m.fees, 8);
});

test('autoDetectMapping prefers exact match over contains', () => {
  // "Open Time" (opentime) should win symbol/close ambiguity cleanly.
  const m = autoDetectMapping(['Instrument', 'Open Time', 'Close Time']);
  assert.equal(m.symbol, 0);
  assert.equal(m.opened_at, 1);
  assert.equal(m.closed_at, 2);
});

const MAP = { symbol: 0, direction: 1, opened_at: 2, closed_at: 3, entry_price: 4, exit_price: 5, size: 6, pnl: 7, fees: 8, notes: null };

test('rowToTrade builds a valid closed trade', () => {
  const { trade, error } = rowToTrade(
    ['eurusd', 'buy', '2024-01-01', '2024-01-02', '1.10', '1.12', '1', '200', '5'], MAP);
  assert.equal(error, undefined);
  assert.equal(trade.symbol, 'EURUSD');       // uppercased
  assert.equal(trade.direction, 'long');
  assert.equal(trade.pnl, 200);
  assert.equal(trade.fees, 5);
  assert.equal(trade.closed_at.slice(0, 10), '2024-01-02');
});

test('rowToTrade rejects a closed trade with no P&L (DB constraint)', () => {
  const { error } = rowToTrade(['EURUSD', 'buy', '2024-01-01', '2024-01-02', '', '', '1', '', ''], MAP);
  assert.match(error, /no P&L/i);
});

test('rowToTrade allows an open trade with no P&L', () => {
  const { trade, error } = rowToTrade(['EURUSD', 'buy', '2024-01-01', '', '', '', '', '', ''], MAP);
  assert.equal(error, undefined);
  assert.equal(trade.closed_at, null);
  assert.equal(trade.pnl, null);
});

test('rowToTrade rejects missing symbol and unreadable dates', () => {
  assert.match(rowToTrade(['', 'buy', '2024-01-01', '', '', '', '', '', ''], MAP).error, /symbol/i);
  assert.match(rowToTrade(['EURUSD', 'buy', 'notadate', '', '', '', '', '', ''], MAP).error, /open date/i);
});

test('rowToTrade rejects an unrecognised direction rather than guessing', () => {
  const { error } = rowToTrade(['EURUSD', 'hold', '2024-01-01', '2024-01-02', '', '', '', '10', ''], MAP);
  assert.match(error, /direction/i);
});

test('rowToTrade rejects close-before-open', () => {
  const { error } = rowToTrade(['EURUSD', 'buy', '2024-01-05', '2024-01-01', '', '', '', '10', ''], MAP);
  assert.match(error, /before the open/i);
});

test('rowToTrade defaults direction to long only when the column is absent', () => {
  const noDir = { ...MAP, direction: null };
  const { trade } = rowToTrade(['EURUSD', '', '2024-01-01', '2024-01-02', '', '', '', '10', ''], noDir);
  assert.equal(trade.direction, 'long');
});

test('parseTradeCsv end-to-end: valid + errors with line numbers', () => {
  const csv = [
    'Symbol,Side,Open Time,Close Time,Entry,Exit,Lots,Profit,Commission',
    'EURUSD,Buy,2024.01.01 09:00,2024.01.01 15:00,1.10,1.12,1.0,"$200.00",2',
    'GBPUSD,Sell,2024.01.02 10:00,2024.01.02 12:00,1.27,1.26,0.5,"(50.00)",1',
    ',Buy,2024.01.03,2024.01.03,1,1,1,10,0',            // missing symbol -> error on line 4
    'XAUUSD,Buy,notadate,2024.01.04,1900,1910,1,100,0', // bad date -> error on line 5
  ].join('\n');

  const { valid, errors, totalRows } = parseTradeCsv(csv);
  assert.equal(totalRows, 4);
  assert.equal(valid.length, 2);
  assert.equal(valid[0].symbol, 'EURUSD');
  assert.equal(valid[0].pnl, 200);
  assert.equal(valid[1].pnl, -50);   // accounting negative parsed
  assert.equal(errors.length, 2);
  assert.equal(errors[0].line, 4);
  assert.equal(errors[1].line, 5);
});

test('parseTradeCsv on an empty file returns empty, not a crash', () => {
  const r = parseTradeCsv('');
  assert.deepEqual(r.valid, []);
  assert.equal(r.totalRows, 0);
});

// ── Crypto exchange exports ────────────────────────────────────────────────
// "I'm not typing in my trades" is a reason not to try the kit at all, and the audience
// is now crypto as well as forex. These pin the exchange shapes.
//
// NOTE: the header spellings below follow the documented/observed exports at the time of
// writing. Exchanges rename columns without warning — when a real export fails, the fix
// is an alias plus a test here, not a change to the parsing.

test('Bybit closed-P&L export maps onto a trade', () => {
  // Bybit names the instrument "Contracts" and profit "Closed P&L", and gives one
  // timestamp (the close). All three used to break the import.
  const csv = [
    'Contracts,Closing Direction,Qty,Entry Price,Exit Price,Closed P&L,Trade Time(UTC)',
    'BTCUSDT,Sell,0.5,64000,63200,-400.25,2026-03-10 14:05:00',
  ].join('\n');
  const r = parseTradeCsv(csv);
  assert.equal(r.errors.length, 0, JSON.stringify(r.errors));
  assert.equal(r.valid.length, 1);
  const t = r.valid[0];
  assert.equal(t.symbol, 'BTCUSDT');
  assert.equal(t.direction, 'short', '"Closing Direction: Sell" is a short position');
  assert.equal(t.pnl, -400.25);
  assert.equal(t.entry_price, 64000);
  assert.equal(t.exit_price, 63200);
  assert.equal(t.size, 0.5);
});

test('"Contracts" is read as the symbol, not the size', () => {
  // The collision that makes or breaks the Bybit import: "Contracts" is the instrument,
  // "Qty" is the quantity. Getting it backwards yields "Missing symbol" on every row.
  const m = autoDetectMapping(['Contracts', 'Qty', 'Closed P&L', 'Trade Time']);
  assert.equal(m.symbol, 0);
  assert.equal(m.size, 1);
  assert.equal(m.pnl, 2);
});

test('a close-only export reuses the close time and says so', () => {
  // A closed-P&L row genuinely does not record when the position was opened. Rejecting
  // the file would refuse every Bybit/MEXC export; inferring it silently would be a lie.
  const csv = 'Contracts,Qty,Closed P&L,Trade Time(UTC)\nETHUSDT,2,150,2026-03-11 09:00:00';
  const r = parseTradeCsv(csv);
  assert.equal(r.assumedOpenTime, true);
  assert.equal(r.valid.length, 1);
  assert.equal(r.valid[0].opened_at, r.valid[0].closed_at);
});

test('an export with a real open time does not flag an assumption', () => {
  const csv = 'Symbol,Open Time,Close Time,Profit\nEURUSD,2026-03-01,2026-03-02,50';
  assert.equal(parseTradeCsv(csv).assumedOpenTime, false);
});

test('MEXC-style realised P&L headers are recognised', () => {
  const csv = [
    'Futures,Side,Filled Qty,Avg Entry Price,Avg Exit Price,Realized PNL,Trading Fee,Close Time',
    'SOLUSDT,Long,10,180.5,192.0,115,0.62,2026-03-12 18:30:00',
  ].join('\n');
  const r = parseTradeCsv(csv);
  assert.equal(r.errors.length, 0, JSON.stringify(r.errors));
  assert.equal(r.valid[0].symbol, 'SOLUSDT');
  assert.equal(r.valid[0].direction, 'long');
  assert.equal(r.valid[0].pnl, 115);
  assert.equal(r.valid[0].fees, 0.62);
});

test('Binance "Realized Profit" maps to P&L', () => {
  const csv = [
    'Date(UTC),Symbol,Side,Price,Quantity,Realized Profit,Fee',
    '2026-03-13 11:00:00,BNBUSDT,SELL,610.4,3,88.10,0.45',
  ].join('\n');
  const r = parseTradeCsv(csv);
  assert.equal(r.errors.length, 0, JSON.stringify(r.errors));
  assert.equal(r.valid[0].pnl, 88.1);
  assert.equal(r.valid[0].fees, 0.45);
  assert.equal(r.valid[0].direction, 'short');
});

test('a "Fee Coin" column never becomes the fee amount', () => {
  // Binance writes the currency next to the number. Matching "Fee Coin" would put "USDT"
  // where a fee belongs — it parses to null and every fee in the import silently becomes 0.
  const m = autoDetectMapping(['Symbol', 'Fee Coin', 'Fee', 'Closed P&L', 'Trade Time']);
  assert.equal(m.fees, 2, 'the numeric Fee column, not Fee Coin');
});

test('a fill-level export is refused with instructions, not imported', () => {
  // Binance spot trade history: buys and sells as separate rows, no profit column.
  // Importing it would create a pile of phantom open positions.
  const csv = [
    'Date(UTC),Pair,Side,Price,Executed,Amount,Fee',
    '2026-03-01 10:00:00,BTCUSDT,BUY,64000,0.1,6400,0.006',
    '2026-03-02 12:00:00,BTCUSDT,SELL,65000,0.1,6500,0.006',
  ].join('\n');
  const r = parseTradeCsv(csv);
  assert.ok(r.fileError, 'the file is rejected as a whole');
  assert.equal(r.valid.length, 0, 'nothing is imported');
  assert.match(r.fileError, /Closed P&L/, 'names the export to download instead');
});

test('looksLikeFillExport does not fire on a round-trip export', () => {
  assert.equal(looksLikeFillExport(autoDetectMapping(
    ['Contracts', 'Qty', 'Closed P&L', 'Trade Time'])), false);
  assert.equal(looksLikeFillExport(autoDetectMapping(
    ['Symbol', 'Open Time', 'Close Time', 'Profit', 'Lots'])), false);
});

test('forex exports still work exactly as before', () => {
  // The regression that matters: crypto support must not cost the existing audience.
  const csv = [
    'Symbol,Side,Open Time,Close Time,Entry Price,Exit Price,Lots,Profit,Commission',
    'GBPNZD,sell,2026.08.12 20:16,2026.08.13 11:17,2.30084,2.30876,0.05,-23.13,0.20',
  ].join('\n');
  const r = parseTradeCsv(csv);
  assert.equal(r.errors.length, 0, JSON.stringify(r.errors));
  assert.equal(r.assumedOpenTime, false);
  const t = r.valid[0];
  assert.equal(t.symbol, 'GBPNZD');
  assert.equal(t.direction, 'short');
  assert.equal(t.pnl, -23.13);
  assert.equal(t.fees, 0.2);
});
