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
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [balanceInput, setBalanceInput] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);

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
        .select('id, slug, user_id, template_id, starting_balance, journal_enabled')
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
      const { error: e } = await supabase
        .from('portfolios')
        .update({ starting_balance: n })
        .eq('id', portfolio.id);
      if (e) throw e;
      setPortfolio({ ...portfolio, starting_balance: n });
      showToast('Starting balance saved.');
    } catch (e: any) {
      showToast(e.message || 'Could not save.');
    } finally {
      setSavingBalance(false);
    }
  };

  const toggleJournal = async () => {
    const next = !portfolio.journal_enabled;
    if (next && !(portfolio.starting_balance > 0)) {
      showToast('Set your starting balance first.');
      return;
    }
    try {
      const { error: e } = await supabase
        .from('portfolios')
        .update({ journal_enabled: next })
        .eq('id', portfolio.id);
      if (e) throw e;
      setPortfolio({ ...portfolio, journal_enabled: next });
      track('journal_toggled', { enabled: next, slug });
      showToast(next ? 'Live track record is now on your page.' : 'Live track record hidden.');
    } catch (e: any) {
      showToast(e.message || 'Could not update.');
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

  const addTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setFormError(v);
    if (v) return;

    setSaving(true);
    try {
      const row = {
        user_id: user!.id,
        portfolio_id: portfolio.id,
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
      const { data, error: e2 } = await supabase.from('trades').insert(row).select().single();
      if (e2) throw e2;

      setTrades([data as Trade, ...trades]);
      // Keep the open date — traders log several trades from the same session.
      setForm({ ...EMPTY_FORM, opened_at: form.opened_at, direction: form.direction });
      track('trade_logged', { slug, closed: !!row.closed_at });
      showToast('Trade logged.');
    } catch (e: any) {
      setFormError(e.message || 'Could not save that trade.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTrade = async (id: string) => {
    if (!window.confirm('Delete this trade? This cannot be undone.')) return;
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

        {/* Setup */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-stone-900 text-sm mb-5">Setup</h2>

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
                {hasBalance
                  ? 'Your metrics update on your published page as you log trades.'
                  : 'Set a starting balance first.'}
              </p>
            </div>
            <button
              onClick={toggleJournal}
              disabled={!hasBalance}
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

        {/* Log a trade */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-stone-900 text-sm mb-5">Log a trade</h2>

          <form onSubmit={addTrade} className="space-y-4">
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

            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
            >
              {saving ? 'Saving…' : 'Log trade'}
            </button>
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
                          <span className="text-amber-600 font-semibold">Open</span>
                        )}
                      </td>
                      <td className={`py-3 text-right font-semibold tabular-nums ${
                        t.pnl === null ? 'text-stone-300' : t.pnl > 0 ? 'text-emerald-600' : t.pnl < 0 ? 'text-red-500' : 'text-stone-500'
                      }`}>
                        {fmtMoney(t.pnl)}
                      </td>
                      <td className="py-3 text-right text-stone-400 tabular-nums text-xs">{t.fees ? t.fees : '—'}</td>
                      <td className="py-3 text-right">
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
