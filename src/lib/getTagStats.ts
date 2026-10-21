import { supabase } from './supabase';
import { tagStats, inMonth } from '../../api/_lib/tags.js';

/**
 * Execution stats for one user, one month.
 *
 * This is the only thing the Execution Report Card needs from the data layer — it fetches,
 * slices by month, and hands off to the shared rules in api/_lib/tags.js. The rules are
 * NOT reimplemented here: if "clean trade" meant one thing in the journal and another on
 * the card, the score would be indefensible the first time a trader checked it by hand.
 *
 * Returns raw numbers only. Presentation decisions — including whether to show the score
 * at all when under half the month is tagged — belong to the card.
 *
 * @param userId
 * @param yearMonth 'YYYY-MM'. Trades are bucketed by close date, falling back to open.
 */
export interface TagStats {
  total: number;
  tagged: number;
  clean: number;
  /** clean / tagged, or null when nothing in the month is tagged. Never NaN. */
  score: number | null;
  /** tagged / total, or null when the month has no trades. The card's cutoff reads this. */
  taggedRatio: number | null;
  negatives: Record<string, number>;
  biggestLeak: string | null;
}

export async function getTagStats(userId: string, yearMonth: string): Promise<TagStats> {
  // Only the columns the rules touch. Notes and screenshots are private and irrelevant
  // here — not fetching them keeps this cheap and keeps private text out of a code path
  // whose whole job is producing something shareable.
  const { data, error } = await supabase
    .from('trades')
    .select('tags, opened_at, closed_at')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  return tagStats(inMonth(data || [], yearMonth)) as TagStats;
}

export default getTagStats;
