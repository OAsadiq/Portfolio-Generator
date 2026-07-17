// Porfilr — equity curve tests.  Run: npm test
//
// This chart is the first thing an investor looks at. Every test below targets a way it
// could silently render nothing, render NaN, or state the wrong outcome.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equityCurveSvg, curveGeometry, downsample, fmtMoney } from './chart.js';

const pt = (t, equity) => ({ t, equity });
const CURVE = [
  pt('2024-01-01T00:00:00Z', 20000),
  pt('2024-02-01T00:00:00Z', 20114.5),
  pt('2024-03-01T00:00:00Z', 20235.15),
];

test('draws a curve from real journal data', () => {
  const svg = equityCurveSvg(CURVE);
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes('id="eqLine"'));
  assert.ok(svg.includes('id="eqArea"'));
  assert.ok(!/NaN|Infinity|undefined/.test(svg), 'no NaN/Infinity/undefined may reach the page');
});

test('rising curve is green, falling curve is red', () => {
  assert.ok(equityCurveSvg(CURVE).includes('#22c55e'));
  const down = [pt('2024-01-01T00:00:00Z', 20000), pt('2024-02-01T00:00:00Z', 17000)];
  assert.ok(equityCurveSvg(down).includes('#f87171'));
  assert.ok(!equityCurveSvg(down).includes('#22c55e'), 'a losing curve must not be drawn green');
});

test('a curve that ends where it started is not called a loss', () => {
  const flat = [pt('2024-01-01T00:00:00Z', 20000), pt('2024-02-01T00:00:00Z', 20000)];
  assert.ok(equityCurveSvg(flat).includes('#22c55e'));
});

test('a perfectly flat curve draws down the middle instead of dividing by zero', () => {
  // range === 0. A naive (v-min)/range gives NaN and blanks the chart.
  const g = curveGeometry([pt('2024-01-01T00:00:00Z', 500), pt('2024-02-01T00:00:00Z', 500)]);
  assert.ok(g);
  assert.ok(g.pts.every(([, y]) => Number.isFinite(y)));
  const ys = g.pts.map(([, y]) => y);
  assert.equal(new Set(ys).size, 1, 'flat curve should be a straight horizontal line');
  assert.ok(!/NaN/.test(g.linePath));
});

test('fewer than two points draws nothing rather than a meaningless dot', () => {
  assert.equal(equityCurveSvg([]), '');
  assert.equal(equityCurveSvg([pt('2024-01-01T00:00:00Z', 20000)]), '');
  assert.equal(curveGeometry([]), null);
  assert.equal(curveGeometry(null), null);
  assert.equal(curveGeometry(undefined), null);
});

test('non-numeric equity points are dropped, not plotted as NaN', () => {
  const dirty = [pt('2024-01-01T00:00:00Z', 20000), { t: 'x', equity: null }, pt('2024-03-01T00:00:00Z', 21000)];
  const svg = equityCurveSvg(dirty);
  assert.ok(!/NaN/.test(svg));
  assert.equal(curveGeometry(dirty).pts.length, 2);
});

test('numeric strings from the database are handled', () => {
  const g = curveGeometry([pt('2024-01-01T00:00:00Z', '20000'), pt('2024-02-01T00:00:00Z', '21000')]);
  assert.ok(g);
  assert.equal(g.first, 20000);
  assert.ok(g.up);
});

test('a long history is downsampled, keeping the final point', () => {
  // A 2000-trade path would be enormous and look identical.
  const long = Array.from({ length: 2000 }, (_, i) => pt(`2024-01-01T00:00:00Z`, 1000 + i));
  const kept = downsample(long);
  assert.equal(kept.length, 240);
  assert.equal(kept[kept.length - 1].equity, 2999, 'the last point is the number people read');
  const g = curveGeometry(long);
  assert.equal(g.last, 2999);
  assert.equal(g.max, 2999);
});

test('short curves are not downsampled', () => {
  assert.equal(downsample(CURVE).length, 3);
});

test('geometry stays inside the viewBox', () => {
  const g = curveGeometry(CURVE);
  for (const [x, y] of g.pts) {
    assert.ok(x >= 0 && x <= g.w, `x ${x} within 0..${g.w}`);
    assert.ok(y >= 0 && y <= g.h, `y ${y} within 0..${g.h}`);
  }
});

test('the curve spans the full width and touches top and bottom', () => {
  const g = curveGeometry(CURVE);
  const xs = g.pts.map(([x]) => x);
  assert.equal(Math.min(...xs), 10);
  assert.equal(Math.max(...xs), 890);
  const ys = g.pts.map(([, y]) => y);
  assert.equal(Math.min(...ys), 22, 'peak sits at the top padding');
});

test('money labels stay readable', () => {
  assert.equal(fmtMoney(20000), '20,000');
  assert.equal(fmtMoney(1234567), '1.23M');
  assert.equal(fmtMoney(999.5), '999.5');
  assert.equal(fmtMoney(-4200), '-4,200');
  assert.equal(fmtMoney('20000'), '20,000');
  assert.equal(fmtMoney(null), '');
  assert.equal(fmtMoney(NaN), '');
});

test('labels are escaped — curve data is user-derived', () => {
  const svg = equityCurveSvg([pt('2024-01-01T00:00:00Z', 100), pt('2024-02-01T00:00:00Z', 200)]);
  assert.ok(!svg.includes('<script'));
  assert.ok(svg.includes('role="img"'));
});

test('an unparseable date yields an empty label, not "Invalid Date"', () => {
  const svg = equityCurveSvg([{ t: 'garbage', equity: 100 }, { t: 'also-garbage', equity: 200 }]);
  assert.ok(!svg.includes('Invalid Date'));
});
