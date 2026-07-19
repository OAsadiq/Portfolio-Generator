// Porfilr — trade CSV import tests.  Run: npm test
//
// Import is where broker-data bugs hide: quoted fields, odd date formats, accounting
// negatives, mislabelled columns. Each test targets a way a row could be silently
// misparsed into a wrong track record.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCsv, autoDetectMapping, parseNumber, parseDirection, parseDate,
  rowToTrade, parseTradeCsv,
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
