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

/** Filename for the rendered card. Shared by the download, the share sheet and tests. */
export function cardFileName(stats) {
  return `porfilr-${stats?.yearMonth || 'card'}-execution-report.png`;
}

/**
 * Can this browser share the PNG itself?
 *
 * Mobile Safari and Android Chrome can: navigator.share() with a `files` array opens the
 * OS share sheet with the image attached, which is the one path that actually solves the
 * problem the Web Intent can't — see ATTACH_HINT. Desktop browsers almost universally
 * cannot, and must fall back to download-then-compose.
 *
 * Probed with a real File because canShare() rejects on type, not just on shape, and a
 * plain object passes feature detection on browsers that would then throw. The probe is
 * synchronous on purpose: the caller has to decide BEFORE awaiting the render, while it
 * still holds the user gesture.
 */
export function canAttachFiles(nav = typeof navigator === 'undefined' ? null : navigator) {
  if (!nav || typeof nav.share !== 'function' || typeof nav.canShare !== 'function') return false;
  try {
    const probe = new File([new Uint8Array(1)], 'probe.png', { type: 'image/png' });
    return nav.canShare({ files: [probe] });
  } catch {
    // No File constructor, or canShare threw. Either way, fall back.
    return false;
  }
}

/**
 * What to tell the trader once the share has happened.
 *
 * The two paths end somewhere genuinely different — one has already attached the image,
 * the other needs them to do it — so they cannot share one message. Telling a mobile
 * user to "attach the image" after the sheet already attached it reads as a failure.
 */
export function shareDoneHint(mode) {
  return mode === 'native'
    ? 'Shared with your card attached.'
    : 'Card downloaded and X opened — attach the image before you post.';
}

/**
 * Button label and pre-share hint for the path this browser will actually take.
 *
 * On a phone the sheet attaches the card and offers every app, so promising "Share to X"
 * and warning about a download would both be wrong. ATTACH_HINT stays the desktop copy.
 */
export function shareLabels(native) {
  return native
    ? { button: 'Share card', hint: 'Opens your share sheet with the card attached.' }
    : { button: 'Share to X', hint: ATTACH_HINT };
}
