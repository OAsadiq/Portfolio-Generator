// Porfilr — equity curve renderer.
//
// Draws the curve computed from a trader's logged trades as inline SVG. No chart
// library and no external requests: published pages must stay self-contained, and a
// chart that fails to load on an investor's screen is worse than no chart.
//
// Pure geometry, so it's unit-testable. The published page also redraws this curve
// client-side when live metrics arrive — see CLIENT_REDRAW in this file, which mirrors
// the maths below and must be kept in step with it.

const DEFAULTS = { w: 900, h: 280, padT: 22, padB: 30, padX: 10 };

/**
 * Strict numeric coercion. Number(null) is 0 — not NaN — and 0 is finite, so a naive
 * Number.isFinite(Number(v)) check silently accepts null/'' and plots them at zero,
 * drawing the curve off a cliff. On this page that reads as "lost everything".
 * Returns null for anything that isn't genuinely a number.
 */
function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Even-sample a long curve. A trader with 2000 trades doesn't need 2000 SVG points —
 *  the path would be enormous and visually identical. The last point is always kept:
 *  it's where the curve ends, which is the number people actually read. */
export function downsample(points, max = 240) {
  if (!Array.isArray(points) || points.length <= max) return points || [];
  const step = (points.length - 1) / (max - 1);
  const out = [];
  for (let i = 0; i < max - 1; i++) out.push(points[Math.round(i * step)]);
  out.push(points[points.length - 1]);
  return out;
}

/**
 * Map curve points to SVG coordinates.
 * Returns { pts, areaPath, linePath, min, max, first, last, up, baseline } or null when
 * there's nothing meaningful to draw (fewer than 2 points).
 */
export function curveGeometry(curve, opts = {}) {
  const { w, h, padT, padB, padX } = { ...DEFAULTS, ...opts };
  const raw = (Array.isArray(curve) ? curve : []).filter((p) => p && num(p.equity) !== null);
  // One point is a dot, not a curve. Say nothing rather than draw a meaningless line.
  if (raw.length < 2) return null;

  const pts = downsample(raw);
  const vals = pts.map((p) => num(p.equity));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const innerW = w - padX * 2;
  const innerH = h - padT - padB;
  const baseline = h - padB;

  // A perfectly flat curve (every trade netted zero) has no range — dividing by it
  // would give NaN and silently blank the chart. Draw it down the middle instead.
  const range = max - min;
  const y = (v) => (range === 0 ? padT + innerH / 2 : padT + (1 - (v - min) / range) * innerH);
  const x = (i) => padX + (pts.length === 1 ? innerW / 2 : (i / (pts.length - 1)) * innerW);

  const coords = vals.map((v, i) => [round(x(i)), round(y(v))]);
  const linePath = coords.map(([cx, cy], i) => `${i === 0 ? 'M' : 'L'}${cx},${cy}`).join(' ');
  const areaPath =
    `M${coords[0][0]},${baseline} ` +
    coords.map(([cx, cy]) => `L${cx},${cy}`).join(' ') +
    ` L${coords[coords.length - 1][0]},${baseline} Z`;

  return {
    pts: coords,
    linePath,
    areaPath,
    min,
    max,
    first: vals[0],
    last: vals[vals.length - 1],
    up: vals[vals.length - 1] >= vals[0],
    baseline,
    w, h,
  };
}

function round(n) {
  return Math.round(n * 10) / 10;
}

/** Compact money label: 20000 -> "20,000", 1234567 -> "1.23M". */
export function fmtMoney(n) {
  const v = num(n);
  if (v === null) return '';
  const abs = Math.abs(v);
  if (abs >= 1e6) return (v / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
  if (abs >= 1e4) return Math.round(v).toLocaleString('en-US');
  return (Math.round(v * 100) / 100).toLocaleString('en-US');
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * The full inline SVG. Green when the curve ends above where it started, red when
 * below — the colour states the outcome before anyone reads a number.
 * Returns '' when there's nothing to draw, so callers can fall back.
 */
export function equityCurveSvg(curve, opts = {}) {
  const g = curveGeometry(curve, opts);
  if (!g) return '';

  const stroke = g.up ? '#22c55e' : '#f87171';
  const id = 'eqg';
  const firstDate = fmtDate(curve[0]?.t);
  const lastDate = fmtDate(curve[curve.length - 1]?.t);

  // Aspect ratio is preserved deliberately: preserveAspectRatio="none" would stretch the
  // <text> labels along with the path and render them squashed at narrow widths.
  return `<svg class="eq-svg" viewBox="0 0 ${g.w} ${g.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Equity curve from ${fmtMoney(g.first)} to ${fmtMoney(g.last)}">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${stroke}" stop-opacity=".28"/>
      <stop offset="100%" stop-color="${stroke}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <line x1="0" y1="${g.baseline}" x2="${g.w}" y2="${g.baseline}" stroke="#26262e" stroke-width="1"/>
  <path id="eqArea" d="${g.areaPath}" fill="url(#${id})"/>
  <path id="eqLine" d="${g.linePath}" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
  <circle id="eqDot" cx="${g.pts[g.pts.length - 1][0]}" cy="${g.pts[g.pts.length - 1][1]}" r="4" fill="${stroke}"/>
  <text id="eqLo" x="${g.w - 10}" y="${g.baseline + 20}" fill="#63636e" font-family="Inter,sans-serif" font-size="11" text-anchor="end">${esc(lastDate)}</text>
  <text x="10" y="${g.baseline + 20}" fill="#63636e" font-family="Inter,sans-serif" font-size="11">${esc(firstDate)}</text>
  <text id="eqHi" x="10" y="14" fill="#93939f" font-family="Inter,sans-serif" font-size="11">${esc(fmtMoney(g.max))}</text>
</svg>`;
}

/**
 * Client-side redraw, injected into the published page. Mirrors curveGeometry above —
 * if you change the maths there, change it here. It exists because the metrics update
 * live at view time, and a curve showing 2 trades beside a metric reading "143 trades"
 * would be an obvious lie.
 */
export const CLIENT_REDRAW = `
function redrawCurve(curve){
  var svg = document.querySelector('.eq-svg'); if (!svg || !curve || curve.length < 2) return;
  var W=${DEFAULTS.w}, H=${DEFAULTS.h}, PT=${DEFAULTS.padT}, PB=${DEFAULTS.padB}, PX=${DEFAULTS.padX};
  var max_pts=240, pts=curve;
  if (curve.length > max_pts) {
    pts=[]; var step=(curve.length-1)/(max_pts-1);
    for (var i=0;i<max_pts-1;i++) pts.push(curve[Math.round(i*step)]);
    pts.push(curve[curve.length-1]);
  }
  var vals=pts.map(function(p){return Number(p.equity);}).filter(isFinite);
  if (vals.length < 2) return;
  var min=Math.min.apply(null,vals), max=Math.max.apply(null,vals), range=max-min;
  var innerW=W-PX*2, innerH=H-PT-PB, base=H-PB;
  var r=function(n){return Math.round(n*10)/10;};
  var coords=vals.map(function(v,i){
    var x=PX+(i/(vals.length-1))*innerW;
    var y=range===0?PT+innerH/2:PT+(1-(v-min)/range)*innerH;
    return [r(x),r(y)];
  });
  var up=vals[vals.length-1]>=vals[0], stroke=up?'#22c55e':'#f87171';
  var line=coords.map(function(c,i){return (i?'L':'M')+c[0]+','+c[1];}).join(' ');
  var area='M'+coords[0][0]+','+base+' '+coords.map(function(c){return 'L'+c[0]+','+c[1];}).join(' ')+' L'+coords[coords.length-1][0]+','+base+' Z';
  var eLine=svg.querySelector('#eqLine'), eArea=svg.querySelector('#eqArea'), eDot=svg.querySelector('#eqDot'), eHi=svg.querySelector('#eqHi');
  if (eLine){ eLine.setAttribute('d', line); eLine.setAttribute('stroke', stroke); }
  if (eArea){ eArea.setAttribute('d', area); }
  if (eDot){ eDot.setAttribute('cx', coords[coords.length-1][0]); eDot.setAttribute('cy', coords[coords.length-1][1]); eDot.setAttribute('fill', stroke); }
  var stops=svg.querySelectorAll('linearGradient stop');
  if (stops.length===2){ stops[0].setAttribute('stop-color',stroke); stops[1].setAttribute('stop-color',stroke); }
  if (eHi){ eHi.textContent = (Math.abs(max)>=1e6? (max/1e6).toFixed(2)+'M' : Math.round(max).toLocaleString('en-US')); }
}`;

export default equityCurveSvg;
