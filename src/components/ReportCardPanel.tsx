import { useEffect, useMemo, useRef, useState } from 'react';
import { lastCompletedMonth, type ReportCard } from '../lib/getReportCardStats';
import { reportCardStats } from '../../api/_lib/reportCard.js';
import { drawReportCard, reportCardBlob } from '../lib/renderReportCard';
import { track } from '../lib/track';
import {
  canShare, shareIntentUrl,
  buildShareText, cardFileName, canAttachFiles, shareDoneHint, shareLabels,
} from '../../api/_lib/shareCard.js';
import { wallEnabled, joinWall, leaveWall, isOnWall } from '../lib/finishersWall';

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
  /** Every trade the journal already loaded. Stats are computed from these, not refetched:
      the page has them in memory, and a second query could disagree with what's on screen. */
  trades: any[];
  startingBalance: number | null;
  displayName?: string | null;
  /** Lets the blocked state send someone to their untagged trades. */
  onTagTrades?: () => void;
  /** The journal's declared currency, or null. Shown on the card beside a money figure. */
  currency?: string | null;
  /** Needed only for the finishers' wall opt-in. */
  userId?: string | null;
  /** The trader's X handle, if their page has one. */
  handle?: string | null;
}

export default function ReportCardPanel({
  trades, startingBalance, displayName, onTagTrades, currency, userId, handle,
}: Props) {
  const [error, setError] = useState('');
  const [showMoney, setShowMoney] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [busy, setBusy] = useState(false);
  // null until a share happens, then which path it took — the two end somewhere
  // different, so they can't report the same thing.
  const [shared, setShared] = useState<'native' | 'fallback' | null>(null);
  const [onWall, setOnWall] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const month = lastCompletedMonth();

  // Pure, from trades already in memory. Toggling money recomputes instantly instead of
  // round-tripping, and the panel can never show numbers the rest of the page doesn't.
  const stats = useMemo(
    () => reportCardStats(trades, month, startingBalance, { showMoney }) as ReportCard,
    [trades, month, startingBalance, showMoney],
  );

  // Do they already appear on the wall for this month?
  useEffect(() => {
    if (!wallEnabled() || !userId || !stats.yearMonth) return;
    let cancelled = false;
    isOnWall(userId, stats.yearMonth).then((v) => { if (!cancelled) setOnWall(v); }).catch(() => {});
    return () => { cancelled = true; };
  }, [userId, stats.yearMonth]);

  // Redraw whenever the numbers change, so toggling money updates the preview in place
  // rather than silently leaving a stale image to be downloaded.
  useEffect(() => {
    if (generated && stats && canvasRef.current) drawReportCard(canvasRef.current, stats, displayName, currency);
  }, [generated, stats, displayName, currency]);

  // Fixed for the session — a browser does not gain file sharing mid-visit. Drives the
  // button label and hint so the UI promises whichever path share() will take.
  const labels = useMemo(() => shareLabels(canAttachFiles()), []);

  const generate = () => {
    if (!stats) return;
    setGenerated(true);
    track('report_card_generated', { month, showScore: stats.showScore, journaled: stats.journaled });
  };

  /**
   * Share the card.
   *
   * Two paths, because the platforms differ in what they can actually do:
   *
   * MOBILE — navigator.share() with a `files` array opens the OS share sheet with the PNG
   * already attached. The trader picks X (or anything else) and the image is there. This
   * is the only path that solves the attach problem rather than explaining it.
   *
   * DESKTOP — no file sharing, so the card downloads and X's Web Intent opens a composer
   * to attach it to. The Intent has no image parameter; this is as good as it gets.
   *
   * The popup bug this replaces: window.open() ran AFTER `await reportCardBlob()`. That
   * await ends the user-gesture window, so the call was a popup rather than a navigation,
   * and mobile browsers block popups outright — the card downloaded and X never opened.
   * The fix is to commit to a path and reserve the tab BEFORE any await, while the click
   * is still live.
   *
   * Porfilr never posts. Both paths hand the trader an editable composer; they send it.
   */
  const share = async () => {
    if (!stats || !canShare(stats)) return;

    // Decided synchronously, inside the gesture. Probing after the render would be too
    // late to open a tab, which is the whole bug.
    const native = canAttachFiles();
    // Reserved now for the same reason. Not `noopener` — that makes window.open return
    // null and we need the handle to point it at X once the render finishes. The opener
    // is severed below instead.
    const tab = native ? null : window.open('', '_blank');
    if (tab) { try { tab.opener = null; } catch { /* some browsers forbid the write */ } }

    setBusy(true);
    setError('');
    try {
      const blob = await reportCardBlob(stats, displayName, currency);
      const name = cardFileName(stats);

      if (native) {
        const file = new File([blob], name, { type: 'image/png' });
        // Re-checked with the real file: the synchronous probe used a 1-byte stand-in,
        // and a browser may still refuse the actual payload.
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: buildShareText(stats) });
          track('report_card_shared', { month, scorePct: stats.scorePct, leak: stats.biggestLeak, via: 'native' });
          setShared('native');
          return;
        }
      }

      // Fallback: save the file, then send the reserved tab to the composer.
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      track('report_card_shared', { month, scorePct: stats.scorePct, leak: stats.biggestLeak, via: 'intent' });

      const intent = shareIntentUrl(stats);
      if (tab) tab.location.href = intent;
      // No tab to use — either it was blocked or we expected a native share that the
      // real file was refused for. Navigate directly; losing the journal tab beats
      // downloading a card with nowhere to post it.
      else window.location.href = intent;
      setShared('fallback');
    } catch (e) {
      // Dismissing the share sheet is a choice, not a failure. Reporting it as an error
      // would tell the trader something broke when they simply changed their mind.
      const aborted = e instanceof DOMException && e.name === 'AbortError';
      if (!aborted) setError(e instanceof Error ? e.message : 'Could not prepare the share.');
      if (tab) tab.close();
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!stats) return;
    setBusy(true);
    try {
      const blob = await reportCardBlob(stats, displayName, currency);
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

          {/* Nudge, never a block. A card with a bare number is honest; a card with an
              assumed "$" is not. So we ask once, at the moment it starts to matter —
              when the trader has chosen to put a money figure in front of strangers. */}
          {showMoney && !currency && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
              Your currency isn't set, so the card will show a plain number. Add it in
              Journal setup above so readers aren't guessing what you trade in.
            </p>
          )}

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
              <>
                <button
                  type="button"
                  onClick={download}
                  disabled={busy}
                  className="border border-stone-200 hover:bg-stone-50 disabled:opacity-60 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  {busy ? 'Creating…' : 'Download PNG'}
                </button>
                {/* Only when there's a real score behind it — see canShare. */}
                {canShare(stats) && (
                  <button
                    type="button"
                    onClick={share}
                    disabled={busy}
                    className="bg-stone-900 hover:bg-stone-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                  >
                    {labels.button}
                  </button>
                )}
              </>
            )}
          </div>

          {generated && canShare(stats) && (
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              {shared
                ? shareDoneHint(shared)
                : labels.hint}
            </p>
          )}

          {/* Finishers' wall opt-in. Hidden entirely until the wall is seeded and the flag
              is on — offering to add someone to a page that doesn't exist yet would be a
              promise we can't keep. Nothing appears on the wall without this click. */}
          {generated && canShare(stats) && wallEnabled() && userId && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              {onWall ? (
                <p className="text-sm text-stone-600">
                  You're on the{' '}
                  <a href="/finishers" className="underline hover:text-stone-900">finishers' wall</a>{' '}
                  for {stats.label}.{' '}
                  <button
                    type="button"
                    onClick={async () => {
                      try { await leaveWall(userId, stats.yearMonth); setOnWall(false); }
                      catch (e) { setError(e instanceof Error ? e.message : 'Could not remove you.'); }
                    }}
                    className="text-stone-400 hover:text-stone-700 underline"
                  >
                    Remove me
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await joinWall(userId, stats, displayName || 'Anonymous trader', handle);
                      setOnWall(true);
                      track('finishers_wall_joined', { month, scorePct: stats.scorePct });
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Could not add you.');
                    } finally { setBusy(false); }
                  }}
                  className="text-sm font-semibold text-stone-700 hover:text-stone-900 underline"
                >
                  Add me to the finishers' wall
                </button>
              )}
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                Shows your name, score and trade count. Never your tags, notes or P&amp;L.
              </p>
            </div>
          )}

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
