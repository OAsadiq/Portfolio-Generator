// Porfilr — the monthly "your card is ready" prompt.
//
// Turns a one-off card into a ritual. The ritual is the point: the execution score only
// unlocks when half a month is tagged, and nobody tags retrospectively unless something
// asks them to.
//
// Rules, from the Phase 2 spec:
//   • Only for traders who journaled 15+ trades in the month just gone.
//   • One prompt, one dismissal, nothing more until next month. No nagging.
//   • Enough trades but too few tagged gets a different prompt, not silence — that
//     trader is one action away from a card and doesn't know it.
//
// Pure: takes stats and a dismissal list, returns what to show. No storage, no clock
// beyond what's passed in, so every branch is testable.

import { previousMonth } from './reportCard.js';

export const PROMPT_READY = 'ready';          // card can be generated now
export const PROMPT_TAG = 'tag';              // enough trades, not enough tagged
export const PROMPT_NONE = null;              // say nothing

/**
 * @param stats      reportCardStats for the month in question
 * @param dismissed  array of 'YYYY-MM' the trader has already dismissed
 * @returns { variant, yearMonth, label, untagged } — variant is null when silent
 */
export function promptState(stats, dismissed = []) {
  const none = { variant: PROMPT_NONE, yearMonth: stats?.yearMonth ?? '', label: stats?.label ?? '', untagged: 0 };
  if (!stats || !stats.yearMonth) return none;

  // Dismissal is per month, so next month asks again on its own.
  const seen = Array.isArray(dismissed) ? dismissed : [];
  if (seen.includes(stats.yearMonth)) return none;

  // Under the bar: silence. A prompt telling someone they're short of a threshold they
  // never opted into is nagging, and the panel already shows their progress.
  if (!stats.eligible) return none;

  return {
    variant: stats.showScore ? PROMPT_READY : PROMPT_TAG,
    yearMonth: stats.yearMonth,
    label: stats.label,
    untagged: stats.untagged,
  };
}

/** The month a prompt is about: the one that just ended. */
export function promptMonth(now = new Date()) {
  return previousMonth(now);
}

/**
 * Copy for each variant. Kept beside the rules so the wording can't drift from the
 * condition that produced it.
 */
export function promptCopy(state) {
  if (!state || !state.variant) return null;
  if (state.variant === PROMPT_READY) {
    return {
      title: `Your ${state.label} report card is ready`,
      body: 'See how much of the month went to plan.',
      action: 'Generate it',
    };
  }
  return {
    title: `Your ${state.label} report card is nearly ready`,
    body: `You journaled enough trades, but ${state.untagged} ${state.untagged === 1 ? 'is' : 'are'} untagged. `
      + 'Tag them to unlock your execution score.',
    action: `Tag ${state.untagged} ${state.untagged === 1 ? 'trade' : 'trades'}`,
  };
}

export default promptState;
