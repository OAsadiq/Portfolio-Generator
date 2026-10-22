import { useEffect, useRef, useState } from 'react';
import { getReportCardStats, lastCompletedMonth, type ReportCard } from '../lib/getReportCardStats';
import { drawReportCard, reportCardBlob } from '../lib/renderReportCard';
import { track } from '../lib/track';

/**
 * Execution Report Card — Phase 1.
 *
 * One month, one card, generated on demand. The month is the last COMPLETE one: a card for
 * a month still running would change every time you looked at it, which makes it useless
 * as something to share or compare.
 *
 * Nothing here decides anything. Eligibility, the 50% tagging rule and the score all come
 * from api/_lib/reportCard.js, so this panel and the PNG can't disagree about what a
 * trader's month was.
 */

interface Props {
  userId: string;
  displayName?: string | null;
  /** Lets the blocked state send someone to their untagged trades. */
  onTagTrades?: () => void;
}

export default function ReportCardPanel({ userId, displayName, onTagTrades }: Props) {
  const [stats, setStats] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMoney, setShowMoney] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const month = lastCompletedMonth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getReportCardStats(userId, month, { showMoney });
        if (!cancelled) { setStats(s); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setError(e instanceof Error ? e.message : 'Could not load your month.'); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [userId, month, showMoney]);

  // Redraw whenever the numbers change, so toggling money updates the preview in place
  // rather than silently leaving a stale image to be downloaded.
  useEffect(() => {
    if (generated && stats && canvasRef.current) drawReportCard(canvasRef.current, stats, displayName);
  }, [generated, stats, displayName]);

  const generate = () => {
    if (!stats) return;
    setGenerated(true);
    track('report_card_generated', { month, showScore: stats.showScore, journaled: stats.journaled });
  };

  const download = async () => {
    if (!stats) return;
    setBusy(true);
    try {
      const blob = await reportCardBlob(stats, displayName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `porfilr-${stats.yearMonth}-execution-report.png`;
      a.click();
      // Revoke on the next tick — revoking immediately can cancel the download in Safari.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      track('report_card_downloaded', { month });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the image.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="h-4 w-40 bg-stone-100 rounded animate-pulse" />
      </div>
    );
  }
  if (error || !stats) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-stone-900 text-sm mb-1">Execution report</h2>
        <p className="text-stone-500 text-sm">{error || 'No data for last month.'}</p>
      </div>
    );
  }

  const needed = stats.minTrades - stats.journaled;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
        <h2 className="font-bold text-stone-900 text-sm">
          Execution report <span className="text-stone-400 font-normal">· {stats.label}</span>
        </h2>
        {stats.eligible && stats.showScore && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            {stats.scorePct}% on plan
          </span>
        )}
      </div>

      {/* ── Not enough trades ────────────────────────────────────────────── */}
      {!stats.eligible && (
        <>
          <p className="text-stone-500 text-sm mt-2 leading-relaxed">
            You journaled <strong className="text-stone-700">{stats.journaled}</strong>{' '}
            {stats.journaled === 1 ? 'trade' : 'trades'} in {stats.label}. A report card needs{' '}
            {stats.minTrades} — {needed} more and you'll have one.
          </p>
          <div className="mt-3 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-900 rounded-full transition-all"
              style={{ width: `${Math.min(100, (stats.journaled / stats.minTrades) * 100)}%` }}
            />
          </div>
        </>
      )}

      {/* ── Enough trades, not enough tagged ─────────────────────────────── */}
      {stats.eligible && !stats.showScore && (
        <>
          <p className="text-stone-500 text-sm mt-2 leading-relaxed">
            You journaled <strong className="text-stone-700">{stats.journaled}</strong> trades in{' '}
            {stats.label}, but only <strong className="text-stone-700">{stats.tagged}</strong> are
            tagged. Tag at least half and your execution score unlocks.
          </p>
          {onTagTrades && (
            <button
              type="button"
              onClick={onTagTrades}
              className="mt-3 bg-stone-900 hover:bg-stone-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              Tag {stats.untagged} {stats.untagged === 1 ? 'trade' : 'trades'}
            </button>
          )}
        </>
      )}

      {/* ── Ready ────────────────────────────────────────────────────────── */}
      {stats.eligible && stats.showScore && (
        <>
          <p className="text-stone-500 text-sm mt-2 leading-relaxed">
            {stats.clean} of your {stats.tagged} tagged trades went to plan
            {stats.biggestLeak ? <> · biggest leak was <strong className="text-stone-700">{stats.biggestLeak}</strong></> : ' · no leaks'}.
          </p>

          <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showMoney}
              onChange={(e) => setShowMoney(e.target.checked)}
              className="w-4 h-4 accent-stone-900"
            />
            <span className="text-sm text-stone-700">
              Show my net result in money
              <span className="text-stone-400"> — off by default; the card shows a percentage</span>
            </span>
          </label>

          <div className="flex gap-2 mt-4 flex-wrap">
            {!generated ? (
              <button
                type="button"
                onClick={generate}
                className="bg-stone-900 hover:bg-stone-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Generate my card
              </button>
            ) : (
              <button
                type="button"
                onClick={download}
                disabled={busy}
                className="bg-stone-900 hover:bg-stone-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                {busy ? 'Creating…' : 'Download PNG'}
              </button>
            )}
          </div>

          {generated && (
            <div className="mt-4">
              {/* Full size is 1080×1080; it's displayed scaled so the preview is exactly
                  what downloads — no second rendering path to drift. */}
              <canvas
                ref={canvasRef}
                className="w-full max-w-[420px] rounded-xl border border-stone-200"
                style={{ aspectRatio: '1 / 1' }}
              />
              <p className="text-stone-400 text-xs mt-2">1080×1080 — sized for a post.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
