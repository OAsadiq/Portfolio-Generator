// Porfilr — pulling links out of a trade note.
//
// Traders paste a TradingView or chart link into their note and it rendered as flat text,
// so the one thing they wanted to click wasn't clickable. Rather than linkifying in place
// (which mangles a sentence and makes long URLs wrap badly), the links are extracted and
// listed under the note as their own row.
//
// Pure and tested because URL-in-prose is all edge cases: trailing full stops, wrapping
// brackets, duplicates, and the ever-present risk of turning user text into an attack.

/**
 * Trailing characters that are almost always punctuation rather than part of the URL.
 * "see chart.com/x." and "(chart.com/x)" are both common in a note.
 */
function trimTrailing(url) {
  let u = url;
  // Strip trailing punctuation, but keep a closing paren if the URL opened one — some
  // real URLs (wikis, chart share links) legitimately contain balanced brackets.
  while (u.length > 1) {
    const last = u[u.length - 1];
    if ('.,;:!?"\''.includes(last)) { u = u.slice(0, -1); continue; }
    if (last === ')' && (u.match(/\(/g) || []).length < (u.match(/\)/g) || []).length) {
      u = u.slice(0, -1); continue;
    }
    break;
  }
  return u;
}

/** Only http(s). A javascript: or data: "link" in user text must never become clickable. */
function isSafe(url) {
  try {
    const p = new URL(url);
    return p.protocol === 'http:' || p.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Find the links in a note.
 * Returns { text, links } — `text` is the note with the URLs removed and whitespace
 * tidied, `links` is a de-duplicated list of { href, label }.
 *
 * Bare domains (tradingview.com/x) are accepted and get https:// added, because that's
 * how people actually type them.
 */
export function extractLinks(note) {
  const raw = String(note == null ? '' : note);
  if (!raw.trim()) return { text: '', links: [] };

  const pattern = /\b(?:https?:\/\/|www\.)[^\s<>]+|\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|co|app|dev|me|xyz|tv|fm)\b(?:\/[^\s<>]*)?/gi;

  const links = [];
  const seen = new Set();
  const text = raw.replace(pattern, (match) => {
    const cleaned = trimTrailing(match);
    const href = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
    if (!isSafe(href)) return match;           // leave unrecognised things as plain text
    const key = href.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      links.push({ href, label: displayLabel(href) });
    }
    // Put back any punctuation we trimmed, so the sentence still reads correctly.
    return match.slice(cleaned.length);
  });

  return { text: text.replace(/[ \t]{2,}/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim(), links };
}

/** Short, readable label: host + a truncated path. A raw 120-char URL wrecks the row. */
export function displayLabel(href, max = 42) {
  let label = href.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
  if (label.length > max) label = `${label.slice(0, max - 1)}…`;
  return label;
}

export default extractLinks;
