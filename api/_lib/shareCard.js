// Porfilr — the text a trader posts with their execution report card.
//
// Written from the SAME stats object the card renders, never retyped. A tweet whose
// numbers disagree with the image attached to it would be noticed immediately, and it is
// the one mistake this feature cannot afford: the whole point is that a trader's card is
// trustworthy enough to put their name on.
//
// Porfilr never posts. This builds text; the trader opens X, edits it, and posts it
// themselves.

import { cardFooter } from './reportCard.js';

/** Mandatory on the link. Without it we can't tell whether shared cards bring anyone in. */
export const SHARE_REF = 'reportcard';
export const SHARE_URL = `https://porfilr.com/trading-journal?ref=${SHARE_REF}`;

/**
 * Should a Share button exist at all?
 *
 * No score, no sharing. A card with a blank score is a screenshot with no substance —
 * exactly the thing Porfilr exists to replace — and posting one would argue against us
 * in public. The panel shows the "tag your trades to unlock" state instead.
 */
export function canShare(stats) {
  return !!(stats && stats.eligible && stats.showScore && stats.scorePct !== null);
}

/**
 * The prefilled post.
 *
 * Deliberately ends on a question. A card that only announces a number invites nothing;
 * "What's yours?" is what makes another trader reply, and replies are the only reason
 * this reaches anyone who doesn't already follow us.
 */
export function buildShareText(stats) {
  if (!canShare(stats)) return '';

  const leak = stats.biggestLeak
    ? `Biggest leak: ${stats.biggestLeak}.`
    : 'No leaks detected — clean month.';

  return [
    `My ${stats.label} execution report — ${stats.journaled} trades journaled, `
      + `execution score ${stats.scorePct}%.`,
    leak,
    `What's yours?`,
    SHARE_URL,
  ].join(' ');
}

/** The X Web Intent URL. Opens a composer the trader can edit before posting. */
export function shareIntentUrl(stats) {
  const text = buildShareText(stats);
  if (!text) return '';
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

/**
 * What the UI must tell the trader.
 *
 * X's Web Intent CANNOT attach an image — there is no parameter for it, and pretending
 * otherwise would produce a post with a link and no card. So the flow is: download the
 * PNG, open the composer, attach the file. Saying that plainly costs one line of copy and
 * avoids a broken promise.
 */
export const ATTACH_HINT = 'Your card downloads first — attach it in the post.';

/** Reused by the card footer so share copy and image stay consistent. */
export { cardFooter };
