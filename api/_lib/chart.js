// Porfilr — equity curve renderer.
//
// Draws the curve computed from a trader's logged trades as inline SVG. No chart
// library and no external requests: published pages must stay self-contained, and a
// chart that fails to load on an investor's screen is worse than no chart.
//
// Pure geometry, so it's unit-testable. The published page also redraws this curve
// client-side when live metrics arrive — see CLIENT_REDRAW, which mirrors the maths.
//
// Visual language (borrowed from a premium reference, kept honest): gridlines with
// $-value ticks, a dashed starting-equity baseline, an area fill, and a glowing
// endpoint dot. The line is GREEN when it ends up, RED when down — the colour states
// the outcome. Gold is the page accent, not the data colour.

export const DEFAULTS = { w: 900, h: 300, padT: 16, padB: 28, padL: 12, padR: 58 };

/** Strict numeric coercion. Number(null) is 0 (finite!), so guard explicitly. */
function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Even-sample a long curve; always keep the final point (the number people read). */
export function downsample(points, max = 240) {
  if (!Array.isArray(points) || points.length <= max) return points || [];
  const step = (points.length - 1) / (max - 1);
  const out = [];
  for (let i = 0; i < max - 1; i++) out.push(points[Math.round(i * step)]);
  out.push(points[points.length - 1]);
  return out;
}

function round(n) { return Math.round(n * 10) / 10; }

/**
 * Map curve points to SVG coordinates + everything the renderer needs.
 * Returns null when there's nothing meaningful to draw (fewer than 2 points).
 */
export function curveGeometry(curve, opts = {}) {
  const { w, h, padT, padB, padL, padR } = { ...DEFAULTS, ...opts };
  const raw = (Array.isArray(curve) ? curve : []).filter((p) => p && num(p.equity) !== null);
  if (raw.length < 2) return null;

  const pts = downsample(raw);
  const vals = pts.map((p) => num(p.equity));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const baseline = h - padB;

  // A perfectly flat curve has no range — draw it down the middle rather than /0.
  const range = max - min;
  const y = (v) => (range === 0 ? padT + innerH / 2 : padT + (1 - (v - min) / range) * innerH);
  const x = (i) => padL + (pts.length === 1 ? innerW / 2 : (i / (pts.length - 1)) * innerW);

  const coords = vals.map((v, i) => [round(x(i)), round(y(v))]);
  const linePath = coords.map(([cx, cy], i) => `${i === 0 ? 'M' : 'L'}${cx},${cy}`).join(' ');
  const areaPath =
    `M${coords[0][0]},${baseline} ` +
    coords.map(([cx, cy]) => `L${cx},${cy}`).join(' ') +
    ` L${coords[coords.length - 1][0]},${baseline} Z`;

  return {
    pts, coords, linePath, areaPath,
    min, max, range, first: vals[0], last: vals[vals.length - 1],
    up: vals[vals.length - 1] >= vals[0],
    baseline, startY: round(y(vals[0])),
    w, h, padT, padB, padL, padR, innerH,
    yOf: (v) => round(y(v)),
  };
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

/** Axis tick label: $60k, $8.5k, $940. Keeps the right gutter readable. */
export function tickLabel(v) {
  const n = num(v);
  if (n === null) return '';
  const abs = Math.abs(n);
  if (abs >= 1e6) return '$' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1e4) return '$' + Math.round(n / 1000) + 'k';
  if (abs >= 1000) return '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return '$' + Math.round(n);
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const GRID_LINES = 4; // → 5 ticks (0..4)

/**
 * The full inline SVG. Returns '' when there's nothing to draw, so callers can fall back.
 */
export function equityCurveSvg(curve, opts = {}) {
  const g = curveGeometry(curve, opts);
  if (!g) return '';

  const stroke = g.up ? '#22c55e' : '#f87171';
  const id = 'eqg';
  const gridColor = '#20242e';
  const tickColor = '#63636e';
  const firstDate = fmtDate(curve[0]?.t);
  const lastDate = fmtDate(curve[curve.length - 1]?.t);

  // Horizontal gridlines + right-gutter $-value ticks.
  let grid = '';
  for (let i = 0; i <= GRID_LINES; i++) {
    const val = g.range === 0 ? g.min : g.min + (g.range * i) / GRID_LINES;
    const gy = g.yOf(val);
    grid +=
      `<line x1="${g.padL}" y1="${gy}" x2="${g.w - g.padR}" y2="${gy}" stroke="${gridColor}" stroke-width="1"/>` +
      `<text class="eq-tick" x="${g.w - g.padR + 8}" y="${gy + 3.5}" fill="${tickColor}" font-family="ui-monospace,Menlo,monospace" font-size="10.5">${esc(tickLabel(val))}</text>`;
  }

  const lastX = g.coords[g.coords.length - 1][0];
  const lastY = g.coords[g.coords.length - 1][1];

  return `<svg class="eq-svg" viewBox="0 0 ${g.w} ${g.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Equity curve from ${fmtMoney(g.first)} to ${fmtMoney(g.last)}">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${stroke}" stop-opacity=".26"/>
      <stop offset="100%" stop-color="${stroke}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g id="eqGrid">${grid}</g>
  <path id="eqArea" d="${g.areaPath}" fill="url(#${id})"/>
  <line id="eqBase" x1="${g.padL}" y1="${g.startY}" x2="${g.w - g.padR}" y2="${g.startY}" stroke="#3a3f4c" stroke-width="1" stroke-dasharray="3 4"/>
  <path id="eqLine" d="${g.linePath}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
  <circle id="eqHalo" cx="${lastX}" cy="${lastY}" r="9" fill="${stroke}" opacity="0.18"/>
  <circle id="eqDot" cx="${lastX}" cy="${lastY}" r="4" fill="${stroke}"/>
  <text id="eqFirst" class="eq-xlabel" x="${g.padL}" y="${g.h - 8}" fill="${tickColor}" font-family="Inter,sans-serif" font-size="10.5">${esc(firstDate)}</text>
  <text id="eqLast" class="eq-xlabel" x="${g.w - g.padR}" y="${g.h - 8}" fill="${tickColor}" font-family="Inter,sans-serif" font-size="10.5" text-anchor="end">${esc(lastDate)}</text>
</svg>`;
}

/**
 * Client-side redraw, injected into the published page. Mirrors curveGeometry — if the
 * maths there changes, change it here too. Runs when live metrics arrive so the curve
 * can't disagree with the numbers beside it.
 */
export const CLIENT_REDRAW = `
function redrawCurve(curve){
  var svg = document.querySelector('.eq-svg'); if (!svg || !curve || curve.length < 2) return;
  var W=${DEFAULTS.w}, H=${DEFAULTS.h}, PT=${DEFAULTS.padT}, PB=${DEFAULTS.padB}, PL=${DEFAULTS.padL}, PR=${DEFAULTS.padR}, GRID=${GRID_LINES};
  var max_pts=240, pts=curve;
  if (curve.length > max_pts) {
    pts=[]; var step=(curve.length-1)/(max_pts-1);
    for (var i=0;i<max_pts-1;i++) pts.push(curve[Math.round(i*step)]);
    pts.push(curve[curve.length-1]);
  }
  var vals=pts.map(function(p){return Number(p.equity);}).filter(isFinite);
  if (vals.length < 2) return;
  var min=Math.min.apply(null,vals), max=Math.max.apply(null,vals), range=max-min;
  var innerW=W-PL-PR, innerH=H-PT-PB, base=H-PB;
  var r=function(n){return Math.round(n*10)/10;};
  var yOf=function(v){return r(range===0?PT+innerH/2:PT+(1-(v-min)/range)*innerH);};
  var coords=vals.map(function(v,i){ return [r(PL+(i/(vals.length-1))*innerW), yOf(v)]; });
  var up=vals[vals.length-1]>=vals[0], stroke=up?'#22c55e':'#f87171';
  var line=coords.map(function(c,i){return (i?'L':'M')+c[0]+','+c[1];}).join(' ');
  var last=coords[coords.length-1];
  var area='M'+coords[0][0]+','+base+' '+coords.map(function(c){return 'L'+c[0]+','+c[1];}).join(' ')+' L'+last[0]+','+base+' Z';
  var q=function(s){return svg.querySelector(s);};
  var eLine=q('#eqLine'), eArea=q('#eqArea'), eDot=q('#eqDot'), eHalo=q('#eqHalo'), eBase=q('#eqBase');
  if (eLine){ eLine.setAttribute('d', line); eLine.setAttribute('stroke', stroke); }
  if (eArea){ eArea.setAttribute('d', area); }
  if (eDot){ eDot.setAttribute('cx', last[0]); eDot.setAttribute('cy', last[1]); eDot.setAttribute('fill', stroke); }
  if (eHalo){ eHalo.setAttribute('cx', last[0]); eHalo.setAttribute('cy', last[1]); eHalo.setAttribute('fill', stroke); }
  if (eBase){ var by=yOf(vals[0]); eBase.setAttribute('y1', by); eBase.setAttribute('y2', by); }
  var stops=svg.querySelectorAll('linearGradient stop');
  if (stops.length===2){ stops[0].setAttribute('stop-color',stroke); stops[1].setAttribute('stop-color',stroke); }
  // Refresh gridline positions + $ ticks to the new range.
  var tick=function(v){var a=Math.abs(v); if(a>=1e6)return '$'+(v/1e6).toFixed(1).replace(/\\.0$/,'')+'M'; if(a>=1e4)return '$'+Math.round(v/1000)+'k'; if(a>=1000)return '$'+(v/1000).toFixed(1).replace(/\\.0$/,'')+'k'; return '$'+Math.round(v);};
  var grid=q('#eqGrid');
  if (grid){
    var gh='';
    for (var k=0;k<=GRID;k++){ var val=range===0?min:min+range*k/GRID; var gy=yOf(val);
      gh+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#20242e" stroke-width="1"/>'+
          '<text x="'+(W-PR+8)+'" y="'+(gy+3.5)+'" fill="#63636e" font-family="ui-monospace,Menlo,monospace" font-size="10.5">'+tick(val)+'</text>';
    }
    grid.innerHTML=gh;
  }
}`;

export default equityCurveSvg;
