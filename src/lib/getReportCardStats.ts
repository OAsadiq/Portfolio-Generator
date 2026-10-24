import { supabase } from './supabase';
import { reportCardStats, previousMonth } from '../../api/_lib/reportCard.js';

/**
 * Everything the Execution Report Card renders, for one trader and one month.
 *
 * The rules live in api/_lib/reportCard.js and are NOT reimplemented here. This fetches
 * and delegates — so the card, the PNG, the share text and the finishers' wall all read
 * one object. A score in a tweet that disagrees with the card it came from would be
 * noticed, and would cost more trust than the feature earns.
 */

export interface ReportCard {
  yearMonth: string;
  label: string;

  journaled: number;
  closed: number;
  tagged: number;
  clean: number;
  untagged: number;

  eligible: boolean;
  minTrades: number;
  showScore: boolean;
  taggedRatio: number;

  score: number | null;
  scorePct: number | null;
  biggestLeak: string | null;
  negatives: Record<string, number>;

  /** Each calendar day as 'win' | 'loss' | 'flat', or null when nothing closed. */
  days: Array<'win' | 'loss' | 'flat' | null>;

  netResultPct: number | null;
  winRatePct: number | null;

  showMoney: boolean;
  /** Present ONLY when the trader turned the money toggle on. Absent otherwise. */
  netResultValue?: number;
}

export interface Options {
  /** The trader's explicit opt-in to show a money figure. Off unless asked for. */
  showMoney?: boolean;
}

export async function getReportCardStats(
  userId: string,
  yearMonth: string,
  options: Options = {},
): Promise<ReportCard> {
  // Only what the rules touch. Notes and screenshots are private and irrelevant to a
  // score — and this path produces something shareable, so private text should never
  // enter it in the first place.
  const { data: trades, error } = await supabase
    .from('trades')
    .select('tags, opened_at, closed_at, pnl, fees')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  // Net result % is measured against the starting balance, same as the live track record.
  // A trader with several pages gets the journal one — that's where the trades live.
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('starting_balance')
    .eq('user_id', userId)
    .eq('template_id', 'trader-template')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return reportCardStats(
    trades || [],
    yearMonth,
    portfolio?.starting_balance ?? null,
    { showMoney: !!options.showMoney },
  ) as ReportCard;
}

/** The month the monthly prompt asks about: the one that just ended. */
export function lastCompletedMonth(now: Date = new Date()): string {
  return previousMonth(now);
}

export default getReportCardStats;
