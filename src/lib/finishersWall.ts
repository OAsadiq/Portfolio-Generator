import { supabase } from './supabase';
import { canShare } from '../../api/_lib/shareCard.js';
import type { ReportCard } from './getReportCardStats';

/**
 * The 15-Trade Challenge finishers' wall.
 *
 * FLAGGED OFF BY DEFAULT. An empty wall is a credibility liability — the same class of
 * problem as a sample page with a fake-looking equity curve. It goes public only once
 * real traders have real cards on it, and the team's own accounts don't count toward that.
 *
 * Turn on with VITE_FINISHERS_WALL=true once seeded.
 */
export function wallEnabled(): boolean {
  const v = (import.meta.env as Record<string, string | undefined>).VITE_FINISHERS_WALL;
  return String(v || '').toLowerCase() === 'true';
}

export interface Finisher {
  year_month: string;
  display_name: string;
  handle: string | null;
  score_pct: number;
  trades: number;
  created_at: string;
}

/**
 * Ordered by month, then by trades journaled.
 *
 * NEVER by score, and never by returns. Ranking by score would reward whoever tagged most
 * selectively, and ranking by money would make this a performance leaderboard — which is
 * both a different product and a regulatory problem we have no reason to invite.
 */
export async function listFinishers(limit = 100): Promise<Finisher[]> {
  const { data, error } = await supabase
    .from('card_finishers')
    .select('year_month, display_name, handle, score_pct, trades, created_at')
    .order('year_month', { ascending: false })
    .order('trades', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []) as Finisher[];
}

/** Is this trader already on the wall for that month? */
export async function isOnWall(userId: string, yearMonth: string): Promise<boolean> {
  const { data } = await supabase
    .from('card_finishers')
    .select('id')
    .eq('user_id', userId)
    .eq('year_month', yearMonth)
    .maybeSingle();
  return !!data;
}

/**
 * Opt in. Requires a card that could actually be shared — same bar, so nobody appears on
 * the wall with a figure they couldn't stand behind publicly.
 */
export async function joinWall(
  userId: string,
  stats: ReportCard,
  displayName: string,
  handle?: string | null,
): Promise<void> {
  if (!canShare(stats)) throw new Error('You need a complete card for that month first.');
  const name = (displayName || '').trim();
  if (!name) throw new Error('Add a display name first.');

  const { error } = await supabase.from('card_finishers').upsert({
    user_id: userId,
    year_month: stats.yearMonth,
    display_name: name.slice(0, 60),
    // Stored without the @ so the wall can render it consistently.
    handle: (handle || '').trim().replace(/^@/, '').slice(0, 30) || null,
    score_pct: stats.scorePct,
    trades: stats.journaled,
  }, { onConflict: 'user_id,year_month' });

  if (error) throw new Error(error.message);
}

/** Change of mind. Opting in must be reversible without asking anyone. */
export async function leaveWall(userId: string, yearMonth: string): Promise<void> {
  const { error } = await supabase
    .from('card_finishers')
    .delete()
    .eq('user_id', userId)
    .eq('year_month', yearMonth);
  if (error) throw new Error(error.message);
}
