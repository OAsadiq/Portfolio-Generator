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
 */

const SIZE = 1080;

const C = {
  bg: '#0b0e14',
  panel: '#12161f',
  line: 'rgba(255,255,255,.08)',
  gold: '#e0b252',
  text: '#f3f3f5',
  dim: '#8a909c',
  green: '#22c55e',
  red: '#f87171',
};

const font = (size: number, weight = 700) =>
  `${weight} ${size}px Poppins, Inter, system-ui, -apple-system, "Segoe UI", sans-serif`;

/** Wrap text to a width, returning the lines. Canvas has no wrapping of its own. */
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

const pct = (n: number | null) => (n === null ? '—' : `${n > 0 ? '+' : ''}${n}%`);

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

  const PAD = 84;

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // A soft gold wash behind the score, so the card has a focal point rather than reading
  // as a table of numbers.
  const glow = ctx.createRadialGradient(SIZE / 2, 430, 40, SIZE / 2, 430, 460);
  glow.addColorStop(0, 'rgba(224,178,82,.13)');
  glow.addColorStop(1, 'rgba(224,178,82,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── Header ───────────────────────────────────────────────────────────────
  ctx.textAlign = 'left';
  ctx.fillStyle = C.gold;
  ctx.font = font(22, 800);
  ctx.letterSpacing = '4px';
  ctx.fillText('EXECUTION REPORT', PAD, PAD + 22);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = C.text;
  ctx.font = font(52, 800);
  ctx.fillText(stats.label, PAD, PAD + 92);

  if (name) {
    ctx.fillStyle = C.dim;
    ctx.font = font(26, 600);
    ctx.fillText(name, PAD, PAD + 136);
  }

  // ── Score ────────────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  const scoreY = 450;

  if (stats.showScore && stats.scorePct !== null) {
    ctx.fillStyle = C.text;
    ctx.font = font(190, 800);
    ctx.fillText(`${stats.scorePct}%`, SIZE / 2, scoreY);

    ctx.fillStyle = C.gold;
    ctx.font = font(24, 800);
    ctx.letterSpacing = '5px';
    ctx.fillText('EXECUTION SCORE', SIZE / 2, scoreY + 56);
    ctx.letterSpacing = '0px';

    ctx.fillStyle = C.dim;
    ctx.font = font(23, 500);
    ctx.fillText(`${stats.clean} of ${stats.tagged} tagged trades went to plan`, SIZE / 2, scoreY + 104);
  } else {
    // Blocked. Never draw a number here — see reportCard.js for why a score from a
    // handful of tagged trades is worse than no score.
    ctx.fillStyle = C.dim;
    ctx.font = font(92, 800);
    ctx.fillText('—', SIZE / 2, scoreY - 20);
    ctx.fillStyle = C.text;
    ctx.font = font(30, 700);
    ctx.fillText('Tag your trades to unlock', SIZE / 2, scoreY + 44);
    ctx.fillStyle = C.dim;
    ctx.font = font(23, 500);
    ctx.fillText(`${stats.tagged} of ${stats.journaled} trades tagged`, SIZE / 2, scoreY + 88);
  }

  // ── Stat row ─────────────────────────────────────────────────────────────
  const boxY = 600;
  const boxH = 168;
  const gap = 24;
  const cols = 3;
  const boxW = (SIZE - PAD * 2 - gap * (cols - 1)) / cols;

  const net = stats.netResultPct;

  // The money figure lives INSIDE the net-result tile, as a second line under the
  // percentage. It used to sit on its own below the leak, where its only label was the
  // word "net" — so it read as the leak's cost. The first person to QA a card misread it
  // exactly that way, which is all the evidence needed.
  //
  // Here the layout states the rule rather than relying on it being known: the percentage
  // is the number, money is an addition beneath it, under one label.
  const netMoney = stats.showMoney && typeof stats.netResultValue === 'number'
    ? formatMoney(stats.netResultValue, currency, { signed: true })
    : null;

  // [value, label, colour, secondLine?]
  const tiles: Array<[string, string, string, string?]> = [
    [String(stats.journaled), 'TRADES JOURNALED', C.text],
    [pct(net), 'NET RESULT', net === null ? C.dim : net >= 0 ? C.green : C.red, netMoney ?? undefined],
    [stats.winRatePct === null ? '—' : `${stats.winRatePct}%`, 'WIN RATE', C.text],
  ];

  tiles.forEach(([value, label, colour, sub], i) => {
    const x = PAD + i * (boxW + gap);
    ctx.fillStyle = C.panel;
    roundRect(ctx, x, boxY, boxW, boxH, 18);
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = colour;
    // A tile carrying a second line lifts its value to make room; the others keep their
    // original position so the row still reads as one set.
    ctx.font = font(sub ? 50 : 56, 800);
    ctx.fillText(value, x + boxW / 2, boxY + (sub ? 72 : 86));

    if (sub) {
      ctx.fillStyle = colour;
      ctx.font = font(25, 700);
      ctx.fillText(sub, x + boxW / 2, boxY + 106);
    }

    ctx.fillStyle = C.dim;
    ctx.font = font(17, 800);
    ctx.letterSpacing = '2.5px';
    ctx.fillText(label, x + boxW / 2, boxY + (sub ? 140 : 126));
    ctx.letterSpacing = '0px';
  });

  // ── Biggest leak, or the money line when the trader opted in ─────────────
  let y = boxY + boxH + 62;
  ctx.textAlign = 'center';

  if (stats.showScore && stats.biggestLeak) {
    ctx.fillStyle = C.dim;
    ctx.font = font(22, 700);
    ctx.letterSpacing = '2px';
    ctx.fillText('MOST COMMON SLIP', SIZE / 2, y);
    ctx.letterSpacing = '0px';
    ctx.fillStyle = C.red;
    ctx.font = font(40, 800);
    ctx.fillText(stats.biggestLeak, SIZE / 2, y + 48);
    y += 48;
  } else if (stats.showScore) {
    ctx.fillStyle = C.green;
    ctx.font = font(34, 800);
    ctx.fillText('No leaks detected — clean month.', SIZE / 2, y + 18);
    y += 18;
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  ctx.fillStyle = C.dim;
  ctx.font = font(19, 500);
  const lines = wrap(ctx, cardFooter(stats), SIZE - PAD * 2);
  lines.forEach((l, i) => ctx.fillText(l, SIZE / 2, SIZE - 118 + i * 26));

  ctx.fillStyle = C.gold;
  ctx.font = font(22, 800);
  ctx.fillText('porfilr.com/trading-journal', SIZE / 2, SIZE - 48);

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
