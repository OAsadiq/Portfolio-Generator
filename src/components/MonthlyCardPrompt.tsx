import { useState } from 'react';
import { promptState, promptCopy, PROMPT_READY } from '../../api/_lib/monthlyPrompt.js';
import type { ReportCard } from '../lib/getReportCardStats';
import { track } from '../lib/track';

/**
 * "Your [Month] report card is ready."
 *
 * Shown once a month, dismissible, never repeated for that month. The rules live in
 * api/_lib/monthlyPrompt.js; this is presentation and the dismissal record.
 *
 * DISMISSALS ARE PER BROWSER (localStorage), not per account. A trader on two devices
 * could see it twice. That is the honest trade for v1: storing it server-side means a
 * column, a migration, a grant and a write path for something whose only job is to stop
 * one banner reappearing. If the duplicate ever actually annoys someone, move it then.
 */

const KEY = 'porfilr_card_prompt_dismissed';

function readDismissed(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];   // private mode, cleared storage — showing the prompt again is harmless
  }
}

interface Props {
  stats: ReportCard;
  /** Scroll to the report card panel. */
  onGenerate: () => void;
  /** Deep-link to that month's untagged trades. */
  onTag: () => void;
}

export default function MonthlyCardPrompt({ stats, onGenerate, onTag }: Props) {
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);

  const state = promptState(stats, dismissed);
  const copy = promptCopy(state);
  if (!copy) return null;

  const isReady = state.variant === PROMPT_READY;

  const dismiss = () => {
    const next = [...dismissed, state.yearMonth];
    setDismissed(next);
    try { localStorage.setItem(KEY, JSON.stringify(next.slice(-12))); } catch { /* ignore */ }
    track('card_prompt_dismissed', { month: state.yearMonth, variant: state.variant });
  };

  const act = () => {
    track('card_prompt_clicked', { month: state.yearMonth, variant: state.variant });
    if (isReady) onGenerate(); else onTag();
  };

  return (
    <div className={`rounded-2xl p-5 mb-6 border ${
      isReady ? 'bg-stone-900 border-stone-900' : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className={`font-bold text-sm ${isReady ? 'text-white' : 'text-stone-900'}`}>
            {copy.title}
          </p>
          <p className={`text-sm mt-1 leading-relaxed ${isReady ? 'text-stone-300' : 'text-stone-600'}`}>
            {copy.body}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={dismiss}
            className={`text-xs font-medium px-3 py-2 rounded-lg transition ${
              isReady ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Not now
          </button>
          <button
            type="button"
            onClick={act}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              isReady
                ? 'bg-white text-stone-900 hover:bg-stone-100'
                : 'bg-stone-900 text-white hover:bg-stone-700'
            }`}
          >
            {copy.action}
          </button>
        </div>
      </div>
    </div>
  );
}
