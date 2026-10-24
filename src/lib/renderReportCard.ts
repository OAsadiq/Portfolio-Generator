import type { ReportCard } from './getReportCardStats';
import { cardFooter } from '../../api/_lib/reportCard.js';
import { formatMoney } from '../../api/_lib/money.js';

/**
 * Draw an Execution Report Card at 1080×1080.
 *
 * Canvas rather than html2canvas: no new dependency, exact pixel control, and identical
 * output across browsers. A shared card is the most public artefact Porfilr produces —
 * it should not render differently depending on who generated it.
 *
 * Everything drawn comes from the ReportCard object. Nothing is recomputed here, so the
 * image can never disagree with the page that produced it.
 *
 * ── On the design ────────────────────────────────────────────────────────────────────
 * Light, not dark. A white card floating on warm grey, one tinted accent, and a lot of
 * space doing the work that borders and glows used to. Two earlier versions were a dark
 * panel of bordered tiles and letterspaced capitals — a look that reads as generic
 * because every element is a default: centred, boxed, glowing, four accent colours.
 *
 * The rules this follows:
 *   · one accent per card, chosen by the month's direction, never more
 *   · tint and a soft gradient wash instead of outlines — nothing is boxed
 *   · near-black figures at a large size, everything else quiet grey
 *   · the month's own day strip, so the card can only be THIS month
 *
 * The strip is the point. Four summary numbers could belong to any trader; where the red
 * clusters across thirty days could not.
 */

const SIZE = 1080;
/** The white card floats inside the square, so the PNG carries its own framing. */
const INSET = 28;
const RADIUS = 44;
const PAD = 86;                 // from the image edge to content
const RIGHT = SIZE - PAD;
const COL = SIZE - PAD * 2;

const C = {
  page: '#f4f4f5',
  card: '#ffffff',
  ink: '#18181b',
  mid: '#52525b',
  grey: '#a1a1aa',
  hair: '#ececee',
  green: '#16a34a',
  greenFill: '#22c55e',
  greenTint: 'rgba(34,197,94,',
  red: '#dc2626',
  redFill: '#ef4444',
  redTint: 'rgba(239,68,68,',
  flat: '#c7c7cc',
  // An untraded day. Present enough to keep the month's rhythm legible, quiet enough
  // that the traded days are what you actually see.
  empty: '#f1f1f3',
  // Used when there is no net result to colour the card by.
  neutralTint: 'rgba(113,113,122,',
};

const font = (size: number, weight = 500) =>
  `${weight} ${size}px Poppins, Inter, system-ui, -apple-system, "Segoe UI", sans-serif`;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hairline(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = C.hair;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // The half-pixel keeps a 1px line crisp instead of smeared across two rows.
  ctx.moveTo(PAD, y + 0.5);
  ctx.lineTo(RIGHT, y + 0.5);
  ctx.stroke();
}

const pct = (n: number | null) => (n === null ? '—' : `${n > 0 ? '+' : ''}${n}%`);

/**
 * The soft wash that gives the card its colour, bleeding in from the lower right.
 *
 * Carries the month's direction, so the accent is information rather than decoration:
 * green when the month made money, red when it didn't, nothing at all when there's no
 * starting balance to measure against. A card that tints itself green regardless would
 * be flattering a trader who had a bad month, on something they're about to post.
 */
function wash(ctx: CanvasRenderingContext2D, tint: string | null) {
  if (!tint) return;
  const g = ctx.createRadialGradient(SIZE * 0.92, SIZE * 0.80, 60, SIZE * 0.92, SIZE * 0.80, SIZE * 0.78);
  g.addColorStop(0, `${tint}.30)`);
  g.addColorStop(0.45, `${tint}.11)`);
  g.addColorStop(1, `${tint}0)`);
  ctx.fillStyle = g;
  ctx.fillRect(INSET, INSET, SIZE - INSET * 2, SIZE - INSET * 2);
}

/**
 * A halftone of tiny dots in the lower-right, densest in the corner.
 *
 * Texture is what keeps a flat tint from looking like an empty fill. It's clipped to the
 * card and fades out well before the text, so it never competes with a number.
 */
function halftone(ctx: CanvasRenderingContext2D, tint: string | null) {
  if (!tint) return;
  const step = 15;
  const x0 = SIZE * 0.52;
  const y0 = SIZE * 0.52;
  for (let x = x0; x < SIZE - INSET - 18; x += step) {
    for (let y = y0; y < SIZE - INSET - 18; y += step) {
      // Distance from the corner drives opacity, so the grid dissolves as it travels in.
      const dx = (x - (SIZE - INSET)) / (SIZE * 0.5);
      const dy = (y - (SIZE - INSET)) / (SIZE * 0.5);
      const a = Math.max(0, 0.5 - Math.sqrt(dx * dx + dy * dy) * 0.52);
      if (a <= 0.01) continue;
      ctx.fillStyle = `${tint}${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** The small tinted pill: an arrow and a figure, as compact as the reference. */
function badge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, up: boolean, positive: boolean) {
  const colour = positive ? C.green : C.red;
  const tint = positive ? C.greenTint : C.redTint;

  ctx.font = font(28, 600);
  const tw = ctx.measureText(text).width;
  const h = 46;
  const sq = 40;
  const w = sq + 10 + tw + 18;

  ctx.fillStyle = `${tint}.13)`;
  roundRect(ctx, x, y - h / 2, sq, h, 13);
  ctx.fill();

  // The arrow, drawn rather than typed: an arrow glyph's weight and baseline vary by
  // font, and this one has to sit dead centre in a 40px square.
  const cx = x + sq / 2;
  const cy = y;
  const dir = up ? -1 : 1;  // canvas y grows downward
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // `dir` is the direction the head points: up means the head sits at the TOP, so the
  // shaft runs from the bottom up. Getting this backwards drew a down arrow next to the
  // words "up this month", which is the one thing a direction badge must never do.
  const tip = cy + 10 * dir;
  const tail = cy - 10 * dir;
  ctx.beginPath();
  ctx.moveTo(cx, tail);
  ctx.lineTo(cx, tip);
  ctx.moveTo(cx - 7, tip - 7 * dir);
  ctx.lineTo(cx, tip);
  ctx.lineTo(cx + 7, tip - 7 * dir);
  ctx.stroke();

  ctx.fillStyle = colour;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + sq + 10, y + 1);
  ctx.textBaseline = 'alphabetic';

  return w;
}

/**
 * The month as a row of days, coloured by outcome.
 *
 * Sized from the day count so February and a 31-day month both fill the column exactly —
 * a fixed cell width would leave a ragged gap that reads as a bug.
 */
function dayStrip(ctx: CanvasRenderingContext2D, days: Array<string | null>, y: number) {
  const n = days.length;
  const gap = n > 30 ? 6 : 7;
  const w = (COL - gap * (n - 1)) / n;
  const h = 56;

  days.forEach((d, i) => {
    ctx.fillStyle = d === 'win' ? C.greenFill : d === 'loss' ? C.redFill : d === 'flat' ? C.flat : C.empty;
    roundRect(ctx, PAD + i * (w + gap), y, w, h, 5);
    ctx.fill();
  });

  return y + h;
}

/**
 * The month's running consistency, as a smooth line in the hero's right half.
 *
 * Each green day steps the line up, each red day steps it down, quiet days hold it level.
 * It is the same month as the strip below, read a different way: the strip shows texture
 * — where the red sat — and this shows where it ended up. One answers "what kind of month
 * was it", the other "was I getting better or worse".
 *
 * Deliberately without a y-axis, because the unit is DAYS and not money. A curve on a
 * trading card invites the assumption that it is equity, so there are no gridlines and no
 * values to encourage that reading, and the figure it ends on is spelled out in words.
 */
function consistencyCurve(
  ctx: CanvasRenderingContext2D,
  days: Array<string | null>,
  tint: string,
  stroke: string,
  box: { x: number; y: number; w: number; h: number },
): number {
  let run = 0;
  const series = days.map((d) => (run += d === 'win' ? 1 : d === 'loss' ? -1 : 0));
  if (series.length < 2) return run;

  const lo = Math.min(0, ...series);
  const hi = Math.max(0, ...series);
  // A flat month would divide by zero; a nominal range keeps the line level through the
  // middle instead of collapsing it onto an edge.
  const span = hi - lo || 1;

  const pts = series.map((v, i) => ({
    x: box.x + (i / (series.length - 1)) * box.w,
    y: box.y + box.h - ((v - lo) / span) * box.h,
  }));

  // Midpoint curves: each segment bends through the midpoint of its neighbours, which
  // smooths the line without letting it overshoot a value the trader never had.
  const path = new Path2D();
  path.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    path.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
  }
  const end = pts[pts.length - 1];
  path.lineTo(end.x, end.y);

  const fill = new Path2D(path);
  fill.lineTo(box.x + box.w, box.y + box.h);
  fill.lineTo(box.x, box.y + box.h);
  fill.closePath();
  const g = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
  g.addColorStop(0, `${tint}.26)`);
  g.addColorStop(1, `${tint}0)`);
  ctx.fillStyle = g;
  ctx.fill(fill);

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke(path);

  // The end point, ringed in white so it reads as a marker rather than a kink.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(end.x, end.y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = stroke;
  ctx.beginPath();
  ctx.arc(end.x, end.y, 5.5, 0, Math.PI * 2);
  ctx.fill();

  return series[series.length - 1];
}

/** A figure with its label beneath, and optionally a second line between them. */
function stat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: string,
  label: string,
  colour: string,
  sub?: string | null,
) {
  ctx.textAlign = 'left';
  ctx.fillStyle = colour;
  ctx.font = font(48, 600);
  ctx.fillText(value, x, y);

  if (sub) {
    // The money figure sits directly under the percentage, inside the same column and
    // under one label. It used to sit on its own further down, where its only nearby
    // label was the word "leak" — and the first person to QA a card read it as the cost
    // of the leak. Here the layout states the rule: the percentage is the number, money
    // is an addition to it.
    ctx.fillStyle = colour;
    ctx.font = font(25, 600);
    ctx.fillText(sub, x, y + 34);
  }

  ctx.fillStyle = C.grey;
  ctx.font = font(22, 500);
  ctx.fillText(label, x, y + (sub ? 72 : 38));
}

/**
 * @param canvas a 1080×1080 canvas (sized here if it isn't)
 * @param stats  what to draw
 * @param name   the trader's display name, optional
 */
export function drawReportCard(
  canvas: HTMLCanvasElement,
  stats: ReportCard,
  name?: string | null,
  currency?: string | null,
) {
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable in this browser.');

  const net = stats.netResultPct;
  // One accent for the whole card, and only when there's a real direction to report.
  const tint = net === null ? null : net >= 0 ? C.greenTint : C.redTint;
  const accent = net === null ? C.mid : net >= 0 ? C.green : C.red;

  // ── The card itself ──────────────────────────────────────────────────────
  ctx.fillStyle = C.page;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.save();
  ctx.shadowColor = 'rgba(24,24,27,.08)';
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = C.card;
  roundRect(ctx, INSET, INSET, SIZE - INSET * 2, SIZE - INSET * 2, RADIUS);
  ctx.fill();
  ctx.restore();

  // Everything decorative stays inside the card's rounded edge.
  ctx.save();
  roundRect(ctx, INSET, INSET, SIZE - INSET * 2, SIZE - INSET * 2, RADIUS);
  ctx.clip();
  wash(ctx, tint);
  halftone(ctx, tint);
  ctx.restore();

  ctx.textAlign = 'left';
  const days = Array.isArray(stats.days) ? stats.days : [];

  // ── Header ───────────────────────────────────────────────────────────────
  ctx.fillStyle = C.ink;
  ctx.font = font(32, 600);
  ctx.fillText('Execution score', PAD, 126);

  ctx.textAlign = 'right';
  ctx.fillStyle = C.grey;
  ctx.font = font(29, 500);
  ctx.fillText(stats.label, RIGHT, 126);
  ctx.textAlign = 'left';

  // ── Hero ─────────────────────────────────────────────────────────────────
  const heroBase = 398;

  if (stats.showScore && stats.scorePct !== null) {
    ctx.fillStyle = C.ink;
    ctx.font = font(196, 500);
    const numText = String(stats.scorePct);
    ctx.fillText(numText, PAD, heroBase);
    const numW = ctx.measureText(numText).width;

    ctx.fillStyle = C.grey;
    ctx.font = font(76, 400);
    ctx.fillText('%', PAD + numW + 10, heroBase);

    ctx.fillStyle = C.mid;
    ctx.font = font(27, 500);
    ctx.fillText(`${stats.clean} of ${stats.tagged} tagged trades went to plan`, PAD, heroBase + 58);

    // The badge carries the month's direction — the one number the wash is tinted for.
    if (net !== null) {
      badge(ctx, PAD, 214, `${Math.abs(net)}%`, net >= 0, net >= 0);
      ctx.fillStyle = C.grey;
      ctx.font = font(27, 500);
      ctx.fillText(net >= 0 ? 'up this month' : 'down this month', PAD + 164, 223);
    }
  } else {
    // Blocked. Never draw a number here — see reportCard.js for why a score from a
    // handful of tagged trades is worse than no score.
    ctx.fillStyle = C.ink;
    ctx.font = font(86, 500);
    ctx.fillText('Not scored', PAD, heroBase - 36);

    ctx.fillStyle = C.mid;
    ctx.font = font(27, 500);
    ctx.fillText(`${stats.tagged} of ${stats.journaled} trades tagged`, PAD, heroBase + 24);
  }

  // The hero's right half, which was otherwise empty — the thing that made the card
  // feel unfinished. Drawn for a blocked card too: whether trades are TAGGED decides
  // whether there's a score, but it has no bearing on whether the days happened.
  // Not gated on the tint: the curve is built from DAYS, not from money, so a trader
  // with no starting balance set still has a month worth drawing. It just draws grey.
  if (days.length > 1) {
    const run = consistencyCurve(ctx, days, tint ?? C.neutralTint, accent, { x: 592, y: 192, w: 400, h: 196 });
    ctx.textAlign = 'right';
    ctx.fillStyle = C.grey;
    ctx.font = font(22, 500);
    ctx.fillText(`${run > 0 ? '+' : ''}${run} green days over the month`, RIGHT, 176);
    ctx.textAlign = 'left';
  }

  // ── The month, day by day ────────────────────────────────────────────────
  if (days.length) {
    ctx.fillStyle = C.grey;
    ctx.font = font(22, 500);
    ctx.fillText('Day by day', PAD, 518);

    // A tally rather than a key. "red = losing day" explains the picture to someone who
    // already understands it; the counts say the same thing about the colours while
    // adding a number.
    const green = days.filter((d) => d === 'win').length;
    const red = days.filter((d) => d === 'loss').length;
    ctx.textAlign = 'right';
    const redText = `${red} red`;
    ctx.fillStyle = C.red;
    ctx.fillText(redText, RIGHT, 518);
    const redW = ctx.measureText(redText).width;
    ctx.fillStyle = C.grey;
    ctx.fillText('·', RIGHT - redW - 11, 518);
    const dotW = ctx.measureText('·').width;
    ctx.fillStyle = C.green;
    ctx.fillText(`${green} green`, RIGHT - redW - dotW - 22, 518);
    ctx.textAlign = 'left';

    dayStrip(ctx, days, 540);
  }

  // ── Figures ──────────────────────────────────────────────────────────────
  hairline(ctx, 644);

  const netMoney = stats.showMoney && typeof stats.netResultValue === 'number'
    ? formatMoney(stats.netResultValue, currency, { signed: true })
    : null;

  const colX = [PAD, PAD + Math.round(COL / 3), PAD + Math.round((COL / 3) * 2)];
  const figY = 706;
  stat(ctx, colX[0], figY, String(stats.journaled), 'Trades journaled', C.ink);
  stat(ctx, colX[1], figY, pct(net), 'Net result', accent, netMoney);
  stat(ctx, colX[2], figY, stats.winRatePct === null ? '—' : `${stats.winRatePct}%`, 'Win rate', C.ink);

  // ── Closing row ──────────────────────────────────────────────────────────
  // Pinned, not flowed. Whether the money line is showing and whether there's a score
  // both change the height above this point; letting it flow left the blocked card with
  // a band of dead space above the footer, which read as a rendering fault.
  hairline(ctx, 824);
  const closeY = 876;

  ctx.fillStyle = C.grey;
  ctx.font = font(23, 500);

  if (stats.showScore) {
    ctx.fillText(stats.biggestLeak ? 'Most common slip' : 'Slips', PAD, closeY);
    ctx.textAlign = 'right';
    if (stats.biggestLeak) {
      ctx.fillStyle = C.red;
      ctx.font = font(34, 600);
      ctx.fillText(stats.biggestLeak, RIGHT, closeY + 2);
    } else {
      ctx.fillStyle = C.green;
      ctx.font = font(30, 600);
      ctx.fillText('None — a clean month', RIGHT, closeY + 2);
    }
  } else {
    // No score to report, so the slot carries the one thing that would produce one.
    ctx.fillText('Next step', PAD, closeY);
    ctx.textAlign = 'right';
    ctx.fillStyle = C.ink;
    ctx.font = font(30, 600);
    const n = stats.untagged;
    ctx.fillText(`Tag ${n} trade${n === 1 ? '' : 's'}`, RIGHT, closeY + 2);
  }
  ctx.textAlign = 'left';

  // ── Footer ───────────────────────────────────────────────────────────────
  ctx.fillStyle = C.ink;
  ctx.font = font(24, 600);
  ctx.fillText('porfilr.com/trading-journal', PAD, 940);

  if (name) {
    ctx.textAlign = 'right';
    ctx.fillStyle = C.grey;
    ctx.font = font(24, 500);
    ctx.fillText(name, RIGHT, 940);
    ctx.textAlign = 'left';
  }

  // The honesty line. It states that Porfilr computes but does not verify these numbers,
  // which is the claim the whole card rests on — it stays on every version of this
  // design, however minimal.
  ctx.fillStyle = C.grey;
  ctx.font = font(17, 400);
  wrap(ctx, cardFooter(stats), COL).forEach((l, i) => ctx.fillText(l, PAD, 980 + i * 22));

  return canvas;
}

/** Render and hand back a PNG blob, ready to download or attach. */
export async function reportCardBlob(
  stats: ReportCard,
  name?: string | null,
  currency?: string | null,
): Promise<Blob> {
  // Wait for webfonts, or the first render falls back to a system face and the card looks
  // different from every later one.
  try { await (document as any).fonts?.ready; } catch { /* older browser — draw anyway */ }

  const canvas = document.createElement('canvas');
  drawReportCard(canvas, stats, name, currency);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render the card.'))), 'image/png');
  });
}

export const CARD_SIZE = SIZE;
