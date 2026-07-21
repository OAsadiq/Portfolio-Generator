/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { track } from '../lib/track';
// Same maths the server runs for the published page (api/_lib/metrics.js, covered by
// `npm test`). Shared deliberately: the preview a trader sees here must never disagree
// with the numbers that end up in front of an investor.
import { computeMetrics } from '../../api/_lib/metrics.js';
// Shared, unit-tested CSV import (api/_lib/tradeCsv.js). A trader with real history won't
// hand-log hundreds of trades, so this is what makes the journal usable for them.
import { parseTradeCsv } from '../../api/_lib/tradeCsv.js';
import TutorialTour, { TourStep } from '../components/tutorial/TutorialTour';

const JOURNAL_TOUR: TourStep[] = [
  { title: "This is your trade journal", body: "Log your trades here and Porfilr turns them into the live track record on your page — return, win rate, drawdown, and your equity curve. Here's the 20-second version.", placement: "center" },
  { selector: '[data-tour="journal-setup"]', title: "1. Set your starting balance", body: "Your return % is measured against this. It's the one thing you must set before anything shows.", placement: "bottom" },
  { selector: '[data-tour="journal-log"]', title: "2. Log a trade", body: "Add each trade — symbol, direction, and the P&L your broker shows you. Closed trades count toward your numbers; open ones don't until you close them.", placement: "top" },
  { selector: '[data-tour="journal-import"]', title: "Got history? Import it", body: "Already have months of trades? Export a CSV from your broker and drop it here instead of logging by hand.", placement: "bottom" },
  { selector: '[data-tour="journal-toggle"]', title: "3. Go live", body: "Turn this on to show your track record on your published page. It updates automatically every time you log a trade.", placement: "left" },
];

type Trade = {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  opened_at: string;
  closed_at: string | null;
  entry_price: number | null;
  exit_price: number | null;
  size: number | null;
  pnl: number | null;
  fees: number | null;
  notes: string | null;
};

const EMPTY_FORM = {
  symbol: '',
  direction: 'long' as 'long' | 'short',
  opened_at: '',
  closed_at: '',
  entry_price: '',
  exit_price: '',
  size: '',
  pnl: '',
  fees: '',
  notes: '',
};

/** <input type="datetime-local"> wants 'YYYY-MM-DDTHH:mm' in LOCAL time. */
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const toIso = (local: string) => (local ? new Date(local).toISOString() : null);

/** ISO from the database back into what <input type="datetime-local"> expects (local time). */
const isoToLocal = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const numToStr = (n: number | null) => (n === null || n === undefined ? '' : String(n));

const fmtMoney = (n: number | null) =>
  n === null || n === undefined ? '—' : (n > 0 ? '+' : '') + n.toLocaleString(undefined, { maximumFractionDigits: 2 });

const fmtMetric = (n: number | null, suffix = '') =>
  n === null || n === undefined ? '—' : `${n}${suffix}`;

const TradeJournal = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM, opened_at: nowLocal() });
  // When set, the form is editing that trade rather than logging a new one.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [balanceInput, setBalanceInput] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);
  const [togglingJournal, setTogglingJournal] = useState(false);

  // CSV import: null until a file is parsed, then a preview the user confirms.
  type ImportPreview = { valid: any[]; errors: { line: number; message: string }[]; totalRows: number; fileName: string };
  const [csvPreview, setCsvPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (user) load();
  }, [slug, user]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: p, error: pErr } = await supabase
        .from('portfolios')
        // form_data/sections are needed to republish the page when the journal is
        // toggled — the live-metrics script is baked in at publish time.
        .select('id, slug, user_id, template_id, starting_balance, journal_enabled, form_data, sections')
        .eq('slug', slug)
        .maybeSingle();

      if (pErr) throw pErr;
      if (!p) throw new Error('Portfolio not found.');
      // RLS already prevents reading someone else's, but fail loudly rather than
      // rendering an empty journal that looks like data loss.
      if (p.user_id !== user?.id) throw new Error('You do not have access to this portfolio.');

      setPortfolio(p);
      setBalanceInput(p.starting_balance ? String(p.starting_balance) : '');

      const { data: t, error: tErr } = await supabase
        .from('trades')
        .select('*')
        .eq('portfolio_id', p.id)
        .order('opened_at', { ascending: false });

      if (tErr) throw tErr;
      setTrades((t as Trade[]) || []);
    } catch (e: any) {
      setError(e.message || 'Could not load your journal.');
    } finally {
      setLoading(false);
    }
  };

  // Recomputed locally on every change — no round-trip, and identical to the server.
  const metrics = useMemo(
    () => computeMetrics(trades, portfolio?.starting_balance),
    [trades, portfolio?.starting_balance]
  );

  const closedCount = metrics.totalTrades;
  const openCount = trades.length - closedCount;
  const hasBalanceNow = portfolio?.starting_balance > 0;
  // All three conditions the published page needs before it can show live numbers.
  const liveReady = hasBalanceNow && closedCount > 0 && !!portfolio?.journal_enabled;

  const saveBalance = async () => {
    const n = Number(balanceInput);
    // Return % divides by this, and the DB rejects <= 0. Catch it here with a sentence
    // a human understands rather than surfacing a constraint violation.
    if (!Number.isFinite(n) || n <= 0) {
      showToast('Starting balance must be a number greater than 0.');
      return;
    }
    setSavingBalance(true);
    try {
      // .select() matters: without it Supabase reports success even when the write
      // touched zero rows (filtered by RLS or a bad id), and the UI cheerfully says
      // "saved" while the database is unchanged. Confirm a row actually came back.
      const { data, error: e } = await supabase
        .from('portfolios')
        .update({ starting_balance: n })
        .eq('id', portfolio.id)
        .select('id, starting_balance');
      if (e) throw e;
      if (!data || data.length === 0) {
        throw new Error("That didn't save — the database rejected the write. Try signing out and back in.");
      }
      setPortfolio({ ...portfolio, starting_balance: data[0].starting_balance });
      showToast('Starting balance saved.');
    } catch (e: any) {
      showToast(e.message || 'Could not save.');
    } finally {
      setSavingBalance(false);
    }
  };

  /**
   * Republish the static page. The live-metrics script and the fallback numbers are
   * baked in at publish time, so flipping journal_enabled in the database does nothing
   * to the page until it's regenerated. Without this the toggle would silently lie.
   */
  const republish = async (p: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Session expired — sign in again.');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/update-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        slug: p.slug,
        templateId: p.template_id,
        formData: p.form_data || {},
        sections: p.sections || [],
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Could not update your published page.');
    }
  };

  const toggleJournal = async () => {
    const next = !portfolio.journal_enabled;
    if (next && !(portfolio.starting_balance > 0)) {
      showToast('Set your starting balance first.');
      return;
    }
    setTogglingJournal(true);
    try {
      // Order matters: the column must be committed before republishing, because the
      // publish route reads journal_enabled to decide whether to bake in the script.
      // .select() confirms the write landed — a zero-row update reports no error.
      const { data, error: e } = await supabase
        .from('portfolios')
        .update({ journal_enabled: next })
        .eq('id', portfolio.id)
        .select('id, journal_enabled');
      if (e) throw e;
      if (!data || data.length === 0) {
        throw new Error("That didn't save — the database rejected the write. Try signing out and back in.");
      }

      const updated = { ...portfolio, journal_enabled: next };
      setPortfolio(updated);
      await republish(updated);

      track('journal_toggled', { enabled: next, slug });
      showToast(next ? 'Live track record is live on your page.' : 'Live track record removed from your page.');
    } catch (e: any) {
      // The column may have flipped while the republish failed — say so plainly rather
      // than let them believe their page changed when it didn't.
      showToast(e.message || 'Could not update your page. Try again.');
    } finally {
      setTogglingJournal(false);
    }
  };

  const validate = () => {
    if (!form.symbol.trim()) return 'Add the symbol you traded.';
    if (!form.opened_at) return 'Add when you opened the trade.';
    if (form.closed_at && new Date(form.closed_at) < new Date(form.opened_at)) {
      return 'A trade cannot close before it opens.';
    }
    // Mirrors the DB constraint: a closed trade must carry a P&L, or every metric
    // computed from it would be silently wrong.
    if (form.closed_at && form.pnl.trim() === '') {
      return 'Add the P&L for a closed trade — the metrics are built from it.';
    }
    if (form.pnl.trim() !== '' && !Number.isFinite(Number(form.pnl))) return 'P&L must be a number.';
    if (form.size.trim() !== '' && !(Number(form.size) > 0)) return 'Size must be greater than 0.';
    if (form.fees.trim() !== '' && Number(form.fees) < 0) return 'Fees cannot be negative.';
    for (const [k, label] of [['entry_price', 'Entry price'], ['exit_price', 'Exit price']] as const) {
      const v = (form as any)[k];
      if (v.trim() !== '' && !(Number(v) > 0)) return `${label} must be greater than 0.`;
    }
    return null;
  };

  const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v));

  const formFromTrade = (t: Trade) => ({
    symbol: t.symbol || '',
    direction: t.direction,
    opened_at: isoToLocal(t.opened_at),
    closed_at: isoToLocal(t.closed_at),
    entry_price: numToStr(t.entry_price),
    exit_price: numToStr(t.exit_price),
    size: numToStr(t.size),
    pnl: numToStr(t.pnl),
    fees: numToStr(t.fees),
    notes: t.notes || '',
  });

  const focusForm = () => {
    setFormError(null);
    document.getElementById('trade-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const startEdit = (t: Trade) => {
    setEditingId(t.id);
    setForm(formFromTrade(t));
    focusForm();
  };

  /** Closing an open trade is the common case, so prefill the close time and let them
   *  just type the P&L their broker shows. */
  const startClose = (t: Trade) => {
    setEditingId(t.id);
    setForm({ ...formFromTrade(t), closed_at: t.closed_at ? isoToLocal(t.closed_at) : nowLocal() });
    focusForm();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, opened_at: nowLocal() });
    setFormError(null);
  };

  const submitTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setFormError(v);
    if (v) return;

    setSaving(true);
    try {
      const row = {
        symbol: form.symbol.trim().toUpperCase(),
        direction: form.direction,
        opened_at: toIso(form.opened_at),
        closed_at: toIso(form.closed_at),
        entry_price: numOrNull(form.entry_price),
        exit_price: numOrNull(form.exit_price),
        size: numOrNull(form.size),
        pnl: numOrNull(form.pnl),
        fees: numOrNull(form.fees) ?? 0,
        notes: form.notes.trim() || null,
      };

      if (editingId) {
        // user_id/portfolio_id are deliberately not in `row` — an update must never be
        // able to move a trade to another user or portfolio. RLS would reject it, but
        // the safest write is the one that can't express it.
        const { data, error: e2 } = await supabase
          .from('trades').update(row).eq('id', editingId).select().single();
        if (e2) throw e2;
        setTrades(trades.map(t => (t.id === editingId ? (data as Trade) : t)));
        track('trade_edited', { slug, closed: !!row.closed_at });
        showToast(row.closed_at ? 'Trade updated and closed.' : 'Trade updated.');
        cancelEdit();
      } else {
        const { data, error: e2 } = await supabase
          // template_id ties the trade to the KIT, not just this page — that's what lets
          // a rebuilt page re-adopt its history after a delete. portfolio_id is the
          // current (soft) association.
          .from('trades').insert({ ...row, user_id: user!.id, portfolio_id: portfolio.id, template_id: portfolio.template_id })
          .select().single();
        if (e2) throw e2;
        setTrades([data as Trade, ...trades]);
        // Keep the open date — traders log several trades from the same session.
        setForm({ ...EMPTY_FORM, opened_at: form.opened_at, direction: form.direction });
        track('trade_logged', { slug, closed: !!row.closed_at });
        showToast('Trade logged.');
      }
    } catch (e: any) {
      setFormError(e.message || 'Could not save that trade.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTrade = async (id: string) => {
    if (!window.confirm('Delete this trade? This cannot be undone.')) return;
    // Don't leave the form editing a row that no longer exists — saving it would fail.
    if (editingId === id) cancelEdit();
    const prev = trades;
    setTrades(trades.filter((t) => t.id !== id)); // optimistic
    const { error: e } = await supabase.from('trades').delete().eq('id', id);
    if (e) {
      setTrades(prev); // roll back rather than lie about what's stored
      showToast(e.message || 'Could not delete.');
    } else {
      showToast('Trade deleted.');
    }
  };

  const onCsvFile = async (file: File | null) => {
    if (!file) return;
    setShowErrors(false);
    try {
      const text = await file.text();
      const { valid, errors, totalRows } = parseTradeCsv(text);
      setCsvPreview({ valid, errors, totalRows, fileName: file.name });
      if (valid.length === 0 && errors.length === 0) {
        showToast("That file has no rows we could read.");
      }
    } catch {
      showToast("Could not read that file.");
    }
  };

  const confirmImport = async () => {
    if (!csvPreview || csvPreview.valid.length === 0) return;
    setImporting(true);
    try {
      // Stamp each row with owner/page/kit, same as a manual insert. Chunked so a large
      // history doesn't hit request limits.
      const rows = csvPreview.valid.map((t) => ({
        ...t, user_id: user!.id, portfolio_id: portfolio.id, template_id: portfolio.template_id,
      }));
      const CHUNK = 200;
      const inserted: Trade[] = [];
      for (let i = 0; i < rows.length; i += CHUNK) {
        const { data, error: e } = await supabase.from('trades').insert(rows.slice(i, i + CHUNK)).select();
        if (e) throw e;
        if (data) inserted.push(...(data as Trade[]));
      }
      // Merge and re-sort by opened_at desc to match the list's ordering.
      setTrades([...inserted, ...trades].sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime()));
      track('trades_imported', { slug, count: inserted.length });
      showToast(`Imported ${inserted.length} ${inserted.length === 1 ? 'trade' : 'trades'}.`);
      setCsvPreview(null);
    } catch (e: any) {
      showToast(e.message || 'Import failed. Nothing was changed.');
    } finally {
      setImporting(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading your journal…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-stone-900 font-semibold mb-2">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="text-orange-600 text-sm font-medium hover:text-orange-500">
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isTrader = portfolio.template_id === 'trader-template';
  const hasBalance = portfolio.starting_balance > 0;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Auto-runs once per user, then replayable from the ? button. */}
      <TutorialTour steps={JOURNAL_TOUR} storageKey={`porfilr_tour_journal_v1_${user.id}`} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-stone-400 hover:text-stone-600 text-sm mb-3 inline-block transition">
            ← Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Trade journal.
          </h1>
          <p className="text-stone-500 text-sm">
            Log your trades — Porfilr works out your track record and keeps your page current.
          </p>
        </div>

        {!isTrader && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <p className="text-amber-900 text-sm font-medium mb-1">This isn't a trader portfolio.</p>
            <p className="text-amber-700 text-sm">
              The journal publishes to the Trader template. You can still log trades here, but they won't appear on this page.
            </p>
          </div>
        )}

        {/* Setup — the live track record has three preconditions and every one of them
            used to fail silently. Say out loud what's missing. */}
        <div data-tour="journal-setup" className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-stone-900 text-sm">Setup</h2>
            {!liveReady && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                Not live yet
              </span>
            )}
          </div>

          {!liveReady && (
            <ol className="mb-5 space-y-2">
              {[
                [hasBalance, 'Set your starting balance', 'Your return % is measured against it.'],
                [closedCount > 0, 'Log at least one closed trade', openCount > 0
                  ? `You have ${openCount} open ${openCount === 1 ? 'trade' : 'trades'} — add a close date and P&L to ${openCount === 1 ? 'it' : 'them'}.`
                  : 'Only closed trades count towards your numbers.'],
                [portfolio.journal_enabled, 'Turn on the live track record', 'Publishes your computed metrics to your page.'],
              ].map(([done, title, why], i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`flex-none w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    done ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${done ? 'text-stone-400 line-through' : 'text-stone-900'}`}>{title as string}</p>
                    {!done && <p className="text-xs text-stone-500 mt-0.5">{why as string}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                Starting balance <span className="text-orange-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                // Typing a number and walking away used to save nothing — the separate
                // Save button was easy to miss, and every downstream step silently
                // stayed blocked. Commit on blur and on Enter too.
                onBlur={() => { if (balanceInput.trim() !== '' && Number(balanceInput) !== portfolio.starting_balance) saveBalance(); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                placeholder="e.g. 10000"
                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
              />
              <p className="text-stone-400 text-xs mt-1.5">
                What your account started at. Your return % is measured against this.
              </p>
            </div>
            <button
              onClick={saveBalance}
              disabled={savingBalance}
              className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-3 rounded-xl transition"
            >
              {savingBalance ? 'Saving…' : 'Save'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 pt-5 border-t border-stone-100">
            <div>
              <p className="text-sm font-semibold text-stone-900">Show live track record on my page</p>
              <p className="text-stone-500 text-xs mt-0.5">
                {togglingJournal
                  ? 'Updating your published page…'
                  : !hasBalance
                    ? 'Add a starting balance above to enable this.'
                    : portfolio.journal_enabled && closedCount === 0
                      ? 'On — but your page still shows your typed figures until you log a closed trade.'
                      : 'Your metrics update on your published page as you log trades, and it shows when you last traded.'}
              </p>
            </div>
            <button
              data-tour="journal-toggle"
              onClick={toggleJournal}
              disabled={!hasBalance || togglingJournal}
              className={`relative w-12 h-7 rounded-full transition flex-none disabled:opacity-40 ${
                portfolio.journal_enabled ? 'bg-emerald-500' : 'bg-stone-300'
              }`}
              aria-pressed={portfolio.journal_enabled}
              aria-label="Show live track record on my page"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  portfolio.journal_enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live metrics preview */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-stone-900 text-sm">Your track record</h2>
            <span className="text-stone-400 text-xs">
              {closedCount} closed{openCount > 0 ? ` · ${openCount} open` : ''}
            </span>
          </div>

          {!hasBalance ? (
            <p className="text-stone-400 text-sm">Add a starting balance to see your numbers.</p>
          ) : closedCount === 0 ? (
            <p className="text-stone-400 text-sm">Log a closed trade to see your numbers.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  ['Total return', fmtMetric(metrics.totalReturnPct, '%'), metrics.totalReturnPct !== null && metrics.totalReturnPct >= 0 ? 'text-emerald-600' : 'text-red-500'],
                  ['Win rate', fmtMetric(metrics.winRate, '%'), 'text-stone-900'],
                  ['Profit factor', fmtMetric(metrics.profitFactor), 'text-stone-900'],
                  ['Max drawdown', fmtMetric(metrics.maxDrawdownPct, '%'), 'text-red-500'],
                  ['Trades', String(metrics.totalTrades), 'text-stone-900'],
                ].map(([label, val, cls]) => (
                  <div key={label as string} className="bg-stone-50 border border-stone-100 rounded-xl p-4">
                    <div className={`text-xl font-bold tabular-nums ${cls}`}>{val}</div>
                    <div className="text-stone-400 text-[10px] uppercase tracking-wide font-semibold mt-1">{label}</div>
                  </div>
                ))}
              </div>

              {/* Sample size honesty: percentages over a handful of trades are noise, and
                  an investor reading them deserves to know that. */}
              {closedCount < 20 && (
                <p className="text-stone-400 text-xs mt-4">
                  Only {closedCount} closed {closedCount === 1 ? 'trade' : 'trades'} so far — your win rate and profit
                  factor will swing a lot until you have more history.
                </p>
              )}
              {metrics.profitFactor === null && closedCount > 0 && (
                <p className="text-stone-400 text-xs mt-2">
                  Profit factor needs at least one losing trade to mean anything, so it's hidden for now.
                </p>
              )}
            </>
          )}
        </div>

        {/* Import from CSV — the adoption unlock for traders with existing history */}
        <div data-tour="journal-import" className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">Import from CSV</h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Export your history from MT4/MT5, cTrader, or your broker and drop it here. We'll map the columns automatically.
              </p>
            </div>
            <label className="cursor-pointer bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition whitespace-nowrap">
              Choose CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => { onCsvFile(e.target.files?.[0] || null); e.currentTarget.value = ''; }}
              />
            </label>
          </div>

          {csvPreview && (
            <div className="mt-5 border-t border-stone-100 pt-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-sm text-stone-700 font-medium truncate">{csvPreview.fileName}</p>
                <button onClick={() => setCsvPreview(null)} className="text-stone-400 hover:text-stone-700 text-xs font-semibold flex-none">Clear</button>
              </div>

              <div className="flex gap-3 flex-wrap mb-4">
                <span className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1.5 font-semibold">
                  {csvPreview.valid.length} ready to import
                </span>
                {csvPreview.errors.length > 0 && (
                  <button
                    onClick={() => setShowErrors((v) => !v)}
                    className="text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-1.5 font-semibold"
                  >
                    {csvPreview.errors.length} couldn't be read {showErrors ? '▲' : '▼'}
                  </button>
                )}
              </div>

              {showErrors && csvPreview.errors.length > 0 && (
                <div className="mb-4 max-h-48 overflow-y-auto bg-stone-50 border border-stone-200 rounded-xl divide-y divide-stone-100">
                  {csvPreview.errors.map((er, i) => (
                    <div key={i} className="px-3 py-2 text-xs flex gap-3">
                      <span className="text-stone-400 font-mono flex-none">line {er.line}</span>
                      <span className="text-stone-600">{er.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {csvPreview.valid.length > 0 ? (
                <>
                  {/* Preview the first few so they can eyeball the mapping before committing. */}
                  <div className="overflow-x-auto -mx-6 px-6 mb-4">
                    <table className="w-full text-xs min-w-[560px]">
                      <thead>
                        <tr className="text-stone-400 uppercase tracking-wide">
                          <th className="text-left font-semibold pb-2">Symbol</th>
                          <th className="text-left font-semibold pb-2">Side</th>
                          <th className="text-left font-semibold pb-2">Opened</th>
                          <th className="text-left font-semibold pb-2">Closed</th>
                          <th className="text-right font-semibold pb-2">P&amp;L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.valid.slice(0, 5).map((t, i) => (
                          <tr key={i} className="border-t border-stone-100">
                            <td className="py-1.5 font-semibold text-stone-900">{t.symbol}</td>
                            <td className={`py-1.5 capitalize font-semibold ${t.direction === 'long' ? 'text-emerald-600' : 'text-red-500'}`}>{t.direction}</td>
                            <td className="py-1.5 text-stone-500">{new Date(t.opened_at).toLocaleDateString()}</td>
                            <td className="py-1.5 text-stone-500">{t.closed_at ? new Date(t.closed_at).toLocaleDateString() : '—'}</td>
                            <td className={`py-1.5 text-right tabular-nums ${t.pnl == null ? 'text-stone-300' : t.pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {t.pnl == null ? '—' : (t.pnl > 0 ? '+' : '') + t.pnl}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvPreview.valid.length > 5 && (
                      <p className="text-stone-400 text-xs mt-2">…and {csvPreview.valid.length - 5} more.</p>
                    )}
                  </div>
                  <button
                    onClick={confirmImport}
                    disabled={importing}
                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
                  >
                    {importing ? 'Importing…' : `Import ${csvPreview.valid.length} ${csvPreview.valid.length === 1 ? 'trade' : 'trades'}`}
                  </button>
                </>
              ) : (
                <p className="text-stone-500 text-sm">
                  No rows could be read from this file. Check the errors above, or make sure it has a header row with column names.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Log / edit a trade — one form, two modes. */}
        <div id="trade-form" data-tour="journal-log" className={`bg-white border rounded-2xl p-6 mb-6 transition ${
          editingId ? 'border-orange-300 ring-2 ring-orange-100' : 'border-stone-200'
        }`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-stone-900 text-sm">
              {editingId ? 'Edit trade' : 'Log a trade'}
            </h2>
            {editingId && (
              <button onClick={cancelEdit} className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition">
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={submitTrade} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  Symbol <span className="text-orange-500">*</span>
                </label>
                <input
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  placeholder="EURUSD"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['long', 'short'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, direction: d })}
                      className={`py-3 rounded-xl text-sm font-semibold capitalize transition border ${
                        form.direction === d
                          ? d === 'long'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-red-50 border-red-300 text-red-600'
                          : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  Size
                </label>
                <input
                  type="number" step="any" min="0"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  placeholder="1.0"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  Opened <span className="text-orange-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.opened_at}
                  onChange={(e) => setForm({ ...form, opened_at: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  Closed <span className="text-stone-400 font-normal normal-case">(leave blank if still open)</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.closed_at}
                  onChange={(e) => setForm({ ...form, closed_at: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Entry</label>
                <input
                  type="number" step="any" min="0"
                  value={form.entry_price}
                  onChange={(e) => setForm({ ...form, entry_price: e.target.value })}
                  placeholder="1.0850"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Exit</label>
                <input
                  type="number" step="any" min="0"
                  value={form.exit_price}
                  onChange={(e) => setForm({ ...form, exit_price: e.target.value })}
                  placeholder="1.0920"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  P&amp;L {form.closed_at && <span className="text-orange-500">*</span>}
                </label>
                <input
                  type="number" step="any"
                  value={form.pnl}
                  onChange={(e) => setForm({ ...form, pnl: e.target.value })}
                  placeholder="120.50"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Fees</label>
                <input
                  type="number" step="any" min="0"
                  value={form.fees}
                  onChange={(e) => setForm({ ...form, fees: e.target.value })}
                  placeholder="0"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
                />
              </div>
            </div>

            <p className="text-stone-400 text-xs -mt-1">
              Enter the P&amp;L your broker shows you — Porfilr doesn't guess it from your entry and exit.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                Notes <span className="text-stone-400 font-normal normal-case">(private — never shown on your page)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="What was the setup? What did you learn?"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition resize-none"
              />
            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
              >
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Log trade'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold px-5 py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trades */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="font-bold text-stone-900 text-sm mb-5">Your trades</h2>

          {trades.length === 0 ? (
            <p className="text-stone-400 text-sm">No trades logged yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-stone-400 text-[10px] uppercase tracking-wide">
                    <th className="text-left font-semibold pb-3">Symbol</th>
                    <th className="text-left font-semibold pb-3">Side</th>
                    <th className="text-left font-semibold pb-3">Opened</th>
                    <th className="text-left font-semibold pb-3">Closed</th>
                    <th className="text-right font-semibold pb-3">P&amp;L</th>
                    <th className="text-right font-semibold pb-3">Fees</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-t border-stone-100">
                      <td className="py-3 font-semibold text-stone-900">{t.symbol}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold capitalize ${t.direction === 'long' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3 text-stone-500 text-xs">{new Date(t.opened_at).toLocaleDateString()}</td>
                      <td className="py-3 text-xs">
                        {t.closed_at ? (
                          <span className="text-stone-500">{new Date(t.closed_at).toLocaleDateString()}</span>
                        ) : (
                          // The whole point of an open trade is that it gets closed later.
                          <button
                            onClick={() => startClose(t)}
                            className="text-amber-700 bg-amber-50 border border-amber-200 hover:border-amber-400 font-semibold px-2 py-1 rounded-md transition"
                          >
                            Open · close it
                          </button>
                        )}
                      </td>
                      <td className={`py-3 text-right font-semibold tabular-nums ${
                        t.pnl === null ? 'text-stone-300' : t.pnl > 0 ? 'text-emerald-600' : t.pnl < 0 ? 'text-red-500' : 'text-stone-500'
                      }`}>
                        {fmtMoney(t.pnl)}
                      </td>
                      <td className="py-3 text-right text-stone-400 tabular-nums text-xs">{t.fees ? t.fees : '—'}</td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => startEdit(t)}
                          className={`transition text-xs font-semibold mr-3 ${
                            editingId === t.id ? 'text-orange-600' : 'text-stone-400 hover:text-stone-900'
                          }`}
                          aria-label={`Edit ${t.symbol} trade`}
                        >
                          {editingId === t.id ? 'Editing' : 'Edit'}
                        </button>
                        <button
                          onClick={() => deleteTrade(t.id)}
                          className="text-stone-300 hover:text-red-500 transition text-xs font-medium"
                          aria-label={`Delete ${t.symbol} trade`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {openCount > 0 && (
            <p className="text-stone-400 text-xs mt-4">
              Open trades aren't counted — your metrics only use trades you've actually closed.
            </p>
          )}
        </div>

        <p className="text-stone-400 text-xs mt-6 leading-relaxed">
          Your trades are private. Only the totals above are published, and only when you turn on the live track record.
          Porfilr computes these numbers from what you log — it doesn't verify them, and your page says so.
        </p>
      </div>
    </div>
  );
};

export default TradeJournal;
