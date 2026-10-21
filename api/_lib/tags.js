// Porfilr — execution tags: the definitions, in one place.
//
// The journal UI and the Execution Report Card both consume this. Keeping the rules here
// is the whole point: if "clean trade" meant one thing on the trade list and another on
// the card, the score would be indefensible — and a score a trader can't trust is worse
// than no score, because they'll find the discrepancy and stop believing the rest.
//
// Pure functions only. No network, no Supabase, so every rule below is testable.

/** The only positive tag. Order matters — this is the order chips render in. */
export const POSITIVE_TAG = 'On plan';

/** Negative presets, in display order. */
export const NEGATIVE_TAGS = [
  'FOMO entry',
  'Revenge trade',
  'Moved stop',
  'Exited early',
  'Oversized',
  'Chased price',
];

/** Every preset, positive first. Presets are constants in code, never database rows. */
export const PRESET_TAGS = [POSITIVE_TAG, ...NEGATIVE_TAGS];

const NEGATIVE_SET = new Set(NEGATIVE_TAGS);
const PRESET_SET = new Set(PRESET_TAGS);

export const MAX_CUSTOM_TAG_LENGTH = 24;

export function isPreset(tag) {
  return PRESET_SET.has(String(tag || ''));
}

export function isNegative(tag) {
  return NEGATIVE_SET.has(String(tag || ''));
}

/**
 * Clean up a custom tag as typed.
 *
 * Returns null for anything unusable, so callers can drop it without branching. A typed
 * tag that only differs from a preset by case IS that preset — otherwise someone types
 * "fomo entry", it's stored as a custom (and therefore neutral), and their score silently
 * ignores a real leak.
 */
export function normalizeTag(raw) {
  const trimmed = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;

  const preset = PRESET_TAGS.find((p) => p.toLowerCase() === trimmed.toLowerCase());
  if (preset) return preset;

  return trimmed.slice(0, MAX_CUSTOM_TAG_LENGTH);
}

/**
 * Normalise a whole tag list: clean each, drop blanks, dedupe case-insensitively, and
 * keep first-seen order. Presets are not forced to the front — the form controls order.
 */
export function normalizeTags(tags) {
  const out = [];
  const seen = new Set();
  for (const raw of Array.isArray(tags) ? tags : []) {
    const t = normalizeTag(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

const tagsOf = (trade) => (Array.isArray(trade?.tags) ? trade.tags : []);

/** Tagged = carries at least one PRESET tag. Custom-only trades don't count. */
export function isTagged(trade) {
  return tagsOf(trade).some(isPreset);
}

/**
 * Clean = tagged `On plan` AND carrying no negative preset.
 *
 * The negative always wins: "On plan" plus "Moved stop" is not a clean trade, it's a trade
 * where the plan was abandoned. Scoring it as clean would let the score flatter exactly the
 * behaviour it exists to surface.
 */
export function isClean(trade) {
  const tags = tagsOf(trade);
  if (!tags.includes(POSITIVE_TAG)) return false;
  return !tags.some(isNegative);
}

/**
 * Aggregate a set of trades.
 *
 * Returns the numbers the Report Card renders, and nothing presentational — no percentage
 * strings, no hiding rules. Whether to SHOW a score (the <50% tagged rule) belongs to the
 * card, not here; this layer reports what is true.
 *
 *   {
 *     total, tagged, clean,
 *     score,        // clean / tagged, or null when nothing is tagged
 *     taggedRatio,  // tagged / total, or null when there are no trades
 *     negatives,    // { 'FOMO entry': 3, ... } — only non-zero counts
 *     biggestLeak,  // most frequent negative, or null
 *   }
 */
export function tagStats(trades) {
  const list = Array.isArray(trades) ? trades : [];

  let tagged = 0;
  let clean = 0;
  const negatives = {};
  // For the tie-break: the most recent occurrence of each negative tag.
  const lastSeen = {};

  for (const t of list) {
    if (isTagged(t)) tagged++;
    if (isClean(t)) clean++;

    // A trade's own time, not the order it arrived in. Closed time is when the behaviour
    // actually resolved; fall back to opened for a trade still running.
    const when = t?.closed_at || t?.opened_at || '';
    for (const tag of tagsOf(t)) {
      if (!isNegative(tag)) continue;
      negatives[tag] = (negatives[tag] || 0) + 1;
      if (!lastSeen[tag] || String(when) > String(lastSeen[tag])) lastSeen[tag] = String(when);
    }
  }

  return {
    total: list.length,
    tagged,
    clean,
    score: tagged > 0 ? clean / tagged : null,
    taggedRatio: list.length > 0 ? tagged / list.length : null,
    negatives,
    biggestLeak: biggestLeak(negatives, lastSeen),
  };
}

/**
 * Most frequent negative tag. Ties break on whose most recent occurrence is latest —
 * between two equally common leaks, the one still happening is the useful one to name.
 */
export function biggestLeak(negatives, lastSeen = {}) {
  const entries = Object.entries(negatives || {}).filter(([, n]) => n > 0);
  if (!entries.length) return null;

  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const la = String(lastSeen[a[0]] || '');
    const lb = String(lastSeen[b[0]] || '');
    if (la !== lb) return lb > la ? 1 : -1;
    // Fully tied: fall back to preset order so the answer is at least deterministic.
    return NEGATIVE_TAGS.indexOf(a[0]) - NEGATIVE_TAGS.indexOf(b[0]);
  });

  return entries[0][0];
}

/** Trades whose closed (else opened) time falls in 'YYYY-MM'. */
export function inMonth(trades, yearMonth) {
  const ym = String(yearMonth || '');
  return (Array.isArray(trades) ? trades : []).filter((t) => {
    const when = t?.closed_at || t?.opened_at || '';
    return String(when).slice(0, 7) === ym;
  });
}

/** Every distinct custom (non-preset) tag in a trade set, for the filter's tag list. */
export function customTagsIn(trades) {
  const seen = new Map();
  for (const t of Array.isArray(trades) ? trades : []) {
    for (const tag of tagsOf(t)) {
      if (isPreset(tag)) continue;
      const key = tag.toLowerCase();
      if (!seen.has(key)) seen.set(key, tag);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export default tagStats;
