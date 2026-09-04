/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, Fragment } from 'react';
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
import { extractLinks } from '../../api/_lib/noteLinks.js';
import Modal from '../components/Modal';
import { startKitCheckout } from '../lib/kitCheckout';
// Trading performance calendar — same closed-only, net-of-fees maths as the metrics, so
// the calendar can never disagree with the headline numbers.
import { monthGrid, activeMonths } from '../../api/_lib/calendar.js';
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
  screenshot_url?: string | null;
};

/**
 * Mirrors public.free_trade_cap() in the database — used for copy only.
 *
 * The DATABASE is the source of truth: the trigger in sql/011_trade_cap.sql reads that
 * function, so enforcement never depends on this constant. It exists so the dialog can
 * name the number without a round trip. If you change the cap, change it in SQL first
 * (see sql/014_trade_cap_15.sql) and update this line to match.
 */
const FREE_TRADE_CAP = 15;

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
  screenshot_url: '',
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

/** Compact money for calendar cells: 3220 -> $3.22K, -2090 -> -$2.09K. Sign included, so
 *  callers must NOT add their own — a missing minus on a losing day would be misleading. */
const fmtCompact = (n: number | null) => {
  if (n === null || n === undefined) return '';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2).replace(/\.?0+$/, '')}K`;
  return `${sign}$${Math.round(abs)}`;
};

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
  const [togglingCalendar, setTogglingCalendar] = useState(false);

  // CSV import: null until a file is parsed, then a preview the user confirms.
  type ImportPreview = {
    valid: any[];
    errors: { line: number; message: string }[];
    totalRows: number;
    fileName: string;
    /** Set when the whole file is the wrong export (e.g. a list of individual fills). */
    fileError?: string;
    /** The export had no open-time column, so the close time was used for both. */
    assumedOpenTime?: boolean;
  };
  // Calendar: which month is on screen. null = default to the most recent month with trades.
  const [calMonth, setCalMonth] = useState<{ year: number; month: number } | null>(null);
  const [csvPreview, setCsvPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [shotUploading, setShotUploading] = useState(false);
  // Set when the free trade cap stops something. `found`/`imported` describe the import
  // that triggered it; a manual add sets found = 0.
  const [capPrompt, setCapPrompt] = useState<{ found: number; imported: number } | null>(null);
  // The trade awaiting delete confirmation. Holds the whole row so the dialog can name it.
  const [deleteTarget, setDeleteTarget] = useState<Trade | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  type Mover = { symbol: string; price: number; changePct: number; major: boolean };
  const [movers, setMovers] = useState<Mover[]>([]);
  const [moversStale, setMoversStale] = useState(false);
  const [changeLabel, setChangeLabel] = useState('24h');
  // Once the panel has shown anything, keep it (and its toggle) on screen even if the
  // other market's feed fails — otherwise switching to a dead feed makes the whole panel
  // vanish and there's no way back without a reload.
  const [panelSeen, setPanelSeen] = useState(false);
  const [asOf, setAsOf] = useState<string | null>(null);
  // Remembered per browser: a forex trader shouldn't have to re-pick their market every
  // time they open the journal.
  const [market, setMarket] = useState<'crypto' | 'forex'>(
    () => (localStorage.getItem('porfilr_market') === 'forex' ? 'forex' : 'crypto')
  );

  /**
   * Did this failure come from the free trade cap?
   *
   * The database trigger raises the literal string TRADE_CAP_REACHED (see
   * sql/011_trade_cap.sql). Supabase surfaces it inside `message`, and without this the
   * user would see a raw Postgres error where an upgrade prompt belongs.
   */
  const isCapError = (e: any) =>
    typeof e?.message === 'string' && e.message.includes('TRADE_CAP_REACHED');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Keyed on the user's ID, not the user object — belt and braces with the identity fix
  // in AuthContext. Reloading here unmounts the page and loses the scroll position.
  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user?.id]);

  // Market panel. Failure is silent on purpose — it's decoration on a page that matters,
  // so a dead feed leaves no trace rather than an error box next to someone's P&L.
  useEffect(() => {
    let cancelled = false;
    localStorage.setItem('porfilr_market', market);
    fetch(`${import.meta.env.VITE_API_URL}/api/trending?market=${market}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        // Empty means the feed failed — clear rather than leaving the other market's
        // rows on screen under the new heading.
        setMovers(d?.items || []);
        if (d?.items?.length) setPanelSeen(true);
        setMoversStale(!!d?.stale);
        setChangeLabel(d?.changeLabel || '24h');
        setAsOf(d?.asOf || null);
      })
      .catch(() => { if (!cancelled) setMovers([]); });
    return () => { cancelled = true; };
  }, [market]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: p, error: pErr } = await supabase
        .from('portfolios')
        // form_data/sections are needed to republish the page when the journal is
        // toggled — the live-metrics script is baked in at publish time.
        .select('id, slug, user_id, template_id, starting_balance, journal_enabled, calendar_public, form_data, sections')
        .eq('slug', slug)
        .maybeSingle();

      if (pErr) throw pErr;
      if (!p) throw new Error('Portfolio not found.');
      // RLS already prevents reading someone else's, but fail loudly rather than
      // rendering an empty journal that looks like data loss.
      if (p.user_id !== user?.id) throw new Error('You do not have access to this portfolio.');

      setPortfolio(p);
      setBalanceInput(p.starting_balance ? String(p.starting_balance) : '');

      // Re-attach any trades left behind by a page they deleted. Runs on every open, and
      // is a no-op once there's nothing orphaned.
      //
      // It must happen BEFORE the trades are fetched, or the adopted ones wouldn't appear
      // until the next visit. Orphans stay counted against the free cap the whole time
      // they're detached, so a trader could be told they'd used 25 trades while looking at
      // 4 — which is what happened before this existed.
      try {
        const { data: adopted } = await supabase.rpc('adopt_orphan_trades', { target_portfolio: p.id });
        if (typeof adopted === 'number' && adopted > 0) {
          track('orphan_trades_adopted', { slug, count: adopted });
        }
      } catch {
        // The RPC may not be deployed yet — never block the journal over a repair step.
      }

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

  // ── Trading performance calendar ──
  const months = useMemo(() => activeMonths(trades), [trades]);
  // Show the selected month, else the most recent month that has trades, else today.
  const shownMonth = useMemo(() => {
    if (calMonth) return calMonth;
    if (months.length) return { year: months[0].year, month: months[0].month };
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  }, [calMonth, months]);
  const grid = useMemo(
    () => monthGrid(trades, shownMonth.year, shownMonth.month),
    [trades, shownMonth]
  );
  // Scale day colours against the biggest absolute day in view, so a big win reads
  // differently from a scrape.
  const maxAbsDay = useMemo(() => {
    const vals = grid.weeks.flat().filter((c: any) => c && c.pnl !== null).map((c: any) => Math.abs(c.pnl));
    return vals.length ? Math.max(...vals) : 0;
  }, [grid]);
  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(shownMonth.year, shownMonth.month - 1 + delta, 1));
    setCalMonth({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  };
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

  /** Opt-in: show the trading calendar on the published page. Off by default — it reveals
   *  day-by-day trading patterns, so it's the trader's call. Republishes so the page
   *  reflects the change immediately. */
  const toggleCalendar = async () => {
    const next = !portfolio.calendar_public;
    setTogglingCalendar(true);
    try {
      const { data, error: e } = await supabase
        .from('portfolios')
        .update({ calendar_public: next })
        .eq('id', portfolio.id)
        .select('id, calendar_public');
      if (e) throw e;
      if (!data || data.length === 0) {
        throw new Error("That didn't save — the database rejected the write. Try signing out and back in.");
      }
      const updated = { ...portfolio, calendar_public: next };
      setPortfolio(updated);
      await republish(updated);
      track('calendar_public_toggled', { enabled: next, slug });
      showToast(next ? 'Calendar added to your page.' : 'Calendar removed from your page.');
    } catch (e: any) {
      showToast(e.message || 'Could not update your page. Try again.');
    } finally {
      setTogglingCalendar(false);
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
    // Without this, editing a trade and saving would blank an existing screenshot.
    screenshot_url: t.screenshot_url || '',
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

  /**
   * Attach a chart screenshot to the trade being logged.
   *
   * Goes to the same `images` bucket as profile photos, under the user's own folder, so
   * no new storage policy is needed. The size cap is here rather than server-side because
   * a phone camera photo is routinely 5-10MB and the useful thing is to say so before a
   * slow upload, not after.
   */
  const uploadScreenshot = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setFormError('That file isn\'t an image.'); return; }
    if (file.size > 5 * 1024 * 1024) {
      setFormError(`That image is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is 5MB.`);
      return;
    }
    setShotUploading(true);
    setFormError(null);
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `trade-screenshots/${user!.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('images').getPublicUrl(path);
      setForm((f) => ({ ...f, screenshot_url: data.publicUrl }));
    } catch (err: any) {
      setFormError(err?.message || 'Could not upload that image.');
    } finally {
      setShotUploading(false);
    }
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
        screenshot_url: form.screenshot_url || null,
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
      // A capped user gets the upgrade prompt, not a Postgres error string.
      if (isCapError(e)) {
        setCapPrompt({ found: 0, imported: 0 });
        setFormError(null);
      } else {
        setFormError(e.message || 'Could not save that trade.');
      }
    } finally {
      setSaving(false);
    }
  };

  /** Buy from inside the dialog. Sends them to Stripe without leaving the journal first. */
  const unlockKit = async () => {
    if (!user) return;
    setUnlocking(true);
    setUnlockError(null);
    track('cap_prompt_upgrade_clicked', { slug, found: capPrompt?.found ?? 0 });
    try {
      const r = await startKitCheckout(portfolio.template_id, user);
      if (r.kind === 'checkout') {
        window.location.href = r.url;
        return;                       // navigating away; leave the spinner up
      }
      // Granted by a referral credit, or already owned — no payment needed. Reload so the
      // cap lifts and the journal reflects it.
      setCapPrompt(null);
      showToast(r.kind === 'granted' ? 'Unlocked with your referral credit.' : 'Already unlocked.');
      load();
    } catch (err: any) {
      setUnlockError(err?.message || 'Could not open checkout. Please try again.');
    } finally {
      setUnlocking(false);
    }
  };

  const confirmDelete = async () => {
    const t = deleteTarget;
    if (!t) return;
    setDeleteTarget(null);
    // Don't leave the form editing a row that no longer exists — saving it would fail.
    if (editingId === t.id) cancelEdit();
    const prev = trades;
    setTrades(trades.filter((x) => x.id !== t.id)); // optimistic
    const { error: e } = await supabase.from('trades').delete().eq('id', t.id);
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
      const { valid, errors, totalRows, fileError, assumedOpenTime } = parseTradeCsv(text);
      setCsvPreview({ valid, errors, totalRows, fileName: file.name, fileError, assumedOpenTime });
      if (fileError) return;  // the panel explains which export to download instead
      if (valid.length === 0 && errors.length === 0) {
        showToast("That file has no rows we could read.");
      }
    } catch {
      showToast("Could not read that file.");
    }
  };

  /**
   * How many more trades this account may store. null = unlimited (owns the kit).
   *
   * Degrades to unlimited if the RPC isn't there — the cap migration may not have been run
   * yet, and a missing function must never stop someone logging a trade.
   */
  const fetchRemaining = async (): Promise<number | null> => {
    try {
      const { data, error } = await supabase.rpc('trades_remaining');
      if (error) return null;
      return typeof data === 'number' ? data : null;
    } catch {
      return null;
    }
  };

  const confirmImport = async () => {
    if (!csvPreview || csvPreview.valid.length === 0) return;
    setImporting(true);
    try {
      // Free accounts store a limited number of trades. Truncate HERE rather than letting
      // the database trigger reject the insert: a 200-row insert failing partway would
      // leave a half-imported history and no clear way back.
      //
      // Keep the MOST RECENT ones — someone's last few weeks are what they came to look
      // at, not trades from three years ago.
      const remaining = await fetchRemaining();
      const all = [...csvPreview.valid].sort(
        (a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime()
      );
      const toImport = remaining === null ? all : all.slice(0, Math.max(remaining, 0));
      const heldBack = all.length - toImport.length;

      if (toImport.length === 0) {
        setCapPrompt({ found: all.length, imported: 0 });
        setImporting(false);
        return;
      }

      // Stamp each row with owner/page/kit, same as a manual insert. Chunked so a large
      // history doesn't hit request limits.
      const rows = toImport.map((t) => ({
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
      track('trades_imported', { slug, count: inserted.length, heldBack });
      setCsvPreview(null);

      if (heldBack > 0) {
        // The paywall moment, and the only one that matters. It appears AFTER their own
        // calendar and curve have been built from the imported trades — they're looking at
        // a partial picture of their own trading and can see what's missing.
        setCapPrompt({ found: all.length, imported: inserted.length });
      } else {
        showToast(`Imported ${inserted.length} ${inserted.length === 1 ? 'trade' : 'trades'}.`);
      }
    } catch (e: any) {
      showToast(isCapError(e) ? 'That would go over your free trade limit.' : (e.message || 'Import failed. Nothing was changed.'));
      if (isCapError(e)) setCapPrompt({ found: csvPreview.valid.length, imported: 0 });
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
  // A journal with no published page behind it. Created by /journal so someone can start
  // logging immediately; never publicly reachable until they publish.
  const isDraft = portfolio.status === 'draft';
  const hasBalance = portfolio.starting_balance > 0;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Auto-runs once per user, then replayable from the ? button. */}
      <TutorialTour steps={JOURNAL_TOUR} storageKey={`porfilr_tour_journal_v1_${user.id}`} />

      {/* The free-limit prompt. A modal, not an inline panel: it used to render partway
          down the page, so you could hit a limit and never see why. It still only appears
          AFTER the import has run and the calendar has been built from their own trades —
          the argument is the partial picture behind it, not the interruption. */}
      <Modal
        open={!!capPrompt}
        onClose={() => { track('cap_prompt_dismissed', { slug }); setCapPrompt(null); }}
        title={capPrompt && capPrompt.found > 0
          ? `We found ${capPrompt.found} trades in your file`
          : "You've hit the free limit"}
        footer={capPrompt ? (
          <>
            <button
              type="button"
              onClick={() => { track('cap_prompt_dismissed', { slug }); setCapPrompt(null); }}
              className="border border-stone-200 hover:bg-stone-50 text-stone-600 px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              {capPrompt.imported > 0 ? `Keep the free ${capPrompt.imported}` : 'Not now'}
            </button>
            {/* Straight to Stripe from here — no detour through the page builder. The
                decision was made in this dialog; making them navigate somewhere else to
                act on it is where intent leaks away. */}
            <button
              type="button"
              disabled={unlocking}
              onClick={unlockKit}
              className="bg-stone-900 hover:bg-stone-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition text-center"
            >
              {unlocking ? 'Opening checkout…' : 'Unlock everything — $35 once'}
            </button>
          </>
        ) : null}
      >
        {capPrompt && capPrompt.found > 0 && capPrompt.imported > 0 ? (
          <p>
            We've imported your most recent <strong>{capPrompt.imported}</strong> and built your
            calendar and equity curve from them. Unlock the rest to see your full history —
            all {capPrompt.found} trades, your real win rate, and the whole curve.
          </p>
        ) : (
          <p>
            Free accounts keep their most recent {FREE_TRADE_CAP} trades. Unlock unlimited
            logging and imports, and remove the Porfilr badge from your page.
          </p>
        )}
        {unlockError && <p className="text-red-500 text-sm mt-3">{unlockError}</p>}
        <p className="text-stone-400 text-xs mt-3">
          One payment, no subscription. What you've already logged stays yours either way.
        </p>
      </Modal>

      {/* Deleting a trade used window.confirm — browser chrome that looks nothing like the
          product and can't show WHICH trade is about to go. */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this trade?"
        tone="danger"
        closeOnBackdrop={false}
        footer={(
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="border border-stone-200 hover:bg-stone-50 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Delete trade
            </button>
          </>
        )}
      >
        {deleteTarget && (
          <>
            <p>
              <strong className="text-stone-800">{deleteTarget.symbol}</strong>
              {' · '}{deleteTarget.direction}
              {deleteTarget.pnl !== null && (
                <>
                  {' · '}
                  <span className={deleteTarget.pnl >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                    {deleteTarget.pnl > 0 ? '+' : ''}{deleteTarget.pnl}
                  </span>
                </>
              )}
            </p>
            <p className="mt-2">
              This can't be undone, and your calendar and stats will change to match.
            </p>
          </>
        )}
      </Modal>

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
            {isDraft
              ? 'Log your trades and Porfilr works out your numbers. Publish a page whenever you want one.'
              : 'Log your trades — Porfilr works out your track record and keeps your page current.'}
          </p>
        </div>

        {/* A draft journal has no public page yet, and that's fine — the journal is the
            product. Offer the page once there's something worth putting on it, rather
            than demanding it up front the way we used to. */}
        {isDraft && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-stone-900 text-sm mb-0.5">
                {closedCount >= 5 ? 'Ready for a page?' : 'No public page yet'}
              </p>
              <p className="text-stone-500 text-sm">
                {closedCount >= 5
                  ? `You've logged ${closedCount} closed trades — enough to make a page worth looking at.`
                  : 'Your journal is private. When you want a page that shows this, you can publish one.'}
              </p>
            </div>
            <Link
              to={`/create/${portfolio.template_id}`}
              className={`flex-none text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                closedCount >= 5
                  ? 'bg-stone-900 hover:bg-stone-700 text-white'
                  : 'border border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              {closedCount >= 5 ? 'Build my page' : 'Set one up'}
            </Link>
          </div>
        )}

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

          {/* Opt-in calendar — only offered once the live track record is on, since it's
              part of the same public proof. Off by default: it shows daily patterns. */}
          {portfolio.journal_enabled && (
            <div className="flex items-center justify-between gap-4 pt-5 border-t border-stone-100">
              <div>
                <p className="text-sm font-semibold text-stone-900">Show my trading calendar on my page</p>
                <p className="text-stone-500 text-xs mt-0.5">
                  {togglingCalendar
                    ? 'Updating your published page…'
                    : closedCount === 0
                      ? 'Log a closed trade first.'
                      : 'Adds a month view of your green and red days — strong proof of consistency. Colours only, never your daily amounts.'}
                </p>
              </div>
              <button
                onClick={toggleCalendar}
                disabled={togglingCalendar || closedCount === 0}
                className={`relative w-12 h-7 rounded-full transition flex-none disabled:opacity-40 ${
                  portfolio.calendar_public ? 'bg-emerald-500' : 'bg-stone-300'
                }`}
                aria-pressed={!!portfolio.calendar_public}
                aria-label="Show my trading calendar on my page"
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    portfolio.calendar_public ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          )}
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

        {/* Trading performance calendar — shows consistency at a glance, which is what an
            investor actually reads: steady green, or one big day carrying a wall of red? */}
        {closedCount > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-bold text-stone-900 text-sm">Trading calendar</h2>
                {/* Month stats as pills — the headline read before you scan the grid. */}
                <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-full ${
                  grid.summary.pnl > 0 ? 'bg-emerald-50 text-emerald-700'
                    : grid.summary.pnl < 0 ? 'bg-red-50 text-red-600'
                    : 'bg-stone-100 text-stone-500'
                }`}>
                  {fmtCompact(grid.summary.pnl)}
                </span>
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                  {grid.summary.tradingDays} {grid.summary.tradingDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => shiftMonth(-1)}
                  className="w-8 h-8 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-900 transition"
                  aria-label="Previous month"
                >‹</button>
                <span className="text-sm font-semibold text-stone-900 min-w-[130px] text-center tabular-nums">{grid.label}</span>
                <button
                  onClick={() => shiftMonth(1)}
                  className="w-8 h-8 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-900 transition"
                  aria-label="Next month"
                >›</button>
              </div>
            </div>

            {/* Grid + weekly column. Traders read consistency week by week, so the weekly
                totals sit alongside the days rather than being buried in a footer. */}
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <div key={d} className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide text-center">
                      {d.slice(0, 1)}<span className="hidden sm:inline">{d.slice(1)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {grid.weeks.map((week: any[], wi: number) => (
                    <div key={wi} className="grid grid-cols-7 gap-1.5">
                      {week.map((cell: any, i: number) => {
                        if (!cell) return <div key={`b${wi}-${i}`} className="aspect-[4/3]" />;
                        const traded = cell.pnl !== null;
                        const up = traded && cell.pnl > 0;
                        const down = traded && cell.pnl < 0;
                        // Opacity scales with the day's size relative to the biggest in view.
                        const strength = traded && maxAbsDay ? 0.25 + 0.75 * (Math.abs(cell.pnl) / maxAbsDay) : 0;
                        return (
                          <div
                            key={cell.date}
                            title={traded
                              ? `${cell.date}: ${cell.pnl > 0 ? '+' : ''}${cell.pnl} · ${cell.trades} ${cell.trades === 1 ? 'trade' : 'trades'} · ${cell.wins}W ${cell.losses}L`
                              : cell.date}
                            className={`aspect-[4/3] rounded-lg border p-1.5 flex flex-col justify-between relative ${
                              traded ? (up ? 'border-emerald-200' : down ? 'border-red-200' : 'border-stone-200') : 'border-stone-100'
                            }`}
                            style={traded ? {
                              backgroundColor: up
                                ? `rgba(16,185,129,${0.10 + 0.24 * strength})`
                                : down ? `rgba(239,68,68,${0.10 + 0.24 * strength})` : undefined,
                            } : undefined}
                          >
                            <span className={`text-[10px] font-semibold leading-none ${traded ? 'text-stone-600' : 'text-stone-300'}`}>{cell.day}</span>
                            {traded && (
                              <>
                                <span className={`text-[11px] sm:text-xs font-bold tabular-nums leading-none ${up ? 'text-emerald-700' : down ? 'text-red-600' : 'text-stone-500'}`}>
                                  {fmtCompact(cell.pnl)}
                                </span>
                                {/* Trade count and the win/loss split. The dot alone made you
                                    hover to learn anything; a day that was +$300 across one
                                    trade and one that was +$300 across six losses and a
                                    winner are different days, and you should see which
                                    without touching the cell.
                                    Below sm the cells are too small for text, so the dot
                                    stays there and this takes over from sm up. */}
                                <span className="hidden sm:flex items-center gap-1 text-[9px] leading-none tabular-nums text-stone-500">
                                  <span>{cell.trades}{cell.trades === 1 ? ' trade' : ' trades'}</span>
                                  {(cell.wins > 0 || cell.losses > 0) && (
                                    <span className="text-stone-300">·</span>
                                  )}
                                  {cell.wins > 0 && <span className="text-emerald-600 font-semibold">{cell.wins}W</span>}
                                  {cell.losses > 0 && <span className="text-red-500 font-semibold">{cell.losses}L</span>}
                                </span>
                                <span
                                  className={`sm:hidden absolute bottom-1 right-1 rounded-full ${up ? 'bg-emerald-500' : down ? 'bg-red-400' : 'bg-stone-300'}`}
                                  style={{ width: 4 + Math.min(cell.trades - 1, 3), height: 4 + Math.min(cell.trades - 1, 3) }}
                                  title={`${cell.trades} ${cell.trades === 1 ? 'trade' : 'trades'}`}
                                />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly totals */}
              <div className="hidden sm:block w-28 flex-none space-y-1.5">
                <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide text-center mb-1.5">Week</div>
                {grid.weekSummaries.map((w: any) => (
                  <div
                    key={w.week}
                    className={`aspect-[4/3] rounded-lg border p-2 flex flex-col justify-center ${
                      w.tradingDays === 0 ? 'border-stone-100 bg-stone-50' : 'border-stone-200 bg-white'
                    }`}
                  >
                    <p className="text-[10px] text-stone-400 font-semibold leading-none mb-1">Week {w.week}</p>
                    <p className={`text-sm font-bold tabular-nums leading-none ${
                      w.pnl > 0 ? 'text-emerald-600' : w.pnl < 0 ? 'text-red-500' : 'text-stone-400'
                    }`}>
                      {fmtCompact(w.pnl)}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1 leading-none">
                      {w.tradingDays} {w.tradingDays === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Green / red split */}
            <div className="flex gap-4 mt-4 text-xs">
              <span className="text-emerald-600 font-semibold">{grid.summary.greenDays} green</span>
              <span className="text-red-500 font-semibold">{grid.summary.redDays} red</span>
              <span className="text-stone-400">{grid.summary.trades} {grid.summary.trades === 1 ? 'trade' : 'trades'}</span>
            </div>
            <p className="text-stone-400 text-xs">Days with no closed trades are left blank.</p>
          </div>
        )}

        {/* Market movers — ambient context, deliberately inert.
            No links, no "trade this", no affiliate: this page exists to help someone see
            their own trading clearly, and a journal that nudges you to trade more works
            against both that and the user. Hides itself entirely if the feed is down. */}
        {(movers.length > 0 || panelSeen) && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h2 className="font-bold text-stone-900 text-sm">Market</h2>

              <div className="flex items-center gap-3">
                <span className="text-stone-400 text-xs">
                  {moversStale
                    ? 'Delayed'
                    : market === 'forex'
                      ? (asOf ? `ECB rates, ${asOf}` : 'Daily ECB rates')
                      : 'Updated every 5 min'}
                </span>
                {/* Crypto and forex traders want different tables, and this product now
                    serves both. Remembered per browser so it's a one-time choice. */}
                <div className="inline-flex bg-stone-100 rounded-lg p-0.5">
                  {(['crypto', 'forex'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMarket(m)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition ${
                        market === m ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {movers.length === 0 ? (
              <p className="text-stone-400 text-sm py-3">
                Couldn't load {market} prices right now.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-stone-400 text-xs border-b border-stone-100">
                      <th className="text-left font-medium pb-2">Pair</th>
                      <th className="text-right font-medium pb-2">Price</th>
                      <th className="text-right font-medium pb-2">{changeLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movers.map((m) => (
                      <tr key={m.symbol} className="border-b border-stone-50 last:border-0">
                        <td className="py-2 font-semibold text-stone-800">
                          {m.symbol}
                          {market === 'crypto' && <span className="text-stone-300 font-normal">/USDT</span>}
                        </td>
                        <td className="py-2 text-right text-stone-600 tabular-nums">
                          {market === 'forex'
                            // FX is quoted to 4-5 places (JPY pairs to 2-3). Rounding
                            // EURUSD to 1.16 erases the range traders actually work in.
                            ? m.price.toFixed(m.price > 50 ? 2 : 5)
                            // Sub-dollar coins need the extra places or they all read $0.00.
                            // minimumFractionDigits too, or a price of 1.0004 renders as
                            // "$1" and reads like a placeholder rather than a rate.
                            : `$${m.price < 1
                                ? m.price.toPrecision(3)
                                : m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </td>
                        <td className={`py-2 text-right font-semibold tabular-nums ${
                          m.changePct > 0 ? 'text-emerald-600' : m.changePct < 0 ? 'text-red-500' : 'text-stone-400'
                        }`}>
                          {m.changePct > 0 ? '+' : ''}{m.changePct.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Said plainly, because a table inside a trading tool invites the assumption
                that it's a suggestion. It isn't, and we're not licensed to make one. */}
            <p className="text-stone-400 text-xs mt-3">
              Reference only — not a recommendation. Your own numbers above are what matter.
              {market === 'forex' && ' ECB publishes once per working day, so weekends show Friday\'s close.'}
            </p>
          </div>
        )}

        {/* Import from CSV — the adoption unlock for traders with existing history */}
        <div data-tour="journal-import" className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">Import from CSV</h2>
              {/* Naming the exchanges matters as much as supporting them: a crypto trader
                  reading "MT4/MT5" assumes this isn't built for them and never tries. */}
              <p className="text-stone-500 text-xs mt-0.5">
                Drop in a CSV from MT4/MT5, cTrader, Bybit, MEXC or Binance — we'll map the columns
                automatically. On an exchange, export your <strong>closed positions</strong> (Bybit
                calls it "Closed P&amp;L"), not the list of individual fills.
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

              {/* Wrong export entirely — tell them which one to download rather than
                  importing a pile of half-trades they'd have to delete one by one. */}
              {csvPreview.fileError && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-stone-800 text-sm mb-1">This is the wrong export</p>
                  <p className="text-stone-600 text-sm leading-relaxed">{csvPreview.fileError}</p>
                </div>
              )}

              {/* Say what we inferred. A closed-P&L export doesn't record the open time,
                  and quietly inventing one would be a lie in a track record. */}
              {!csvPreview.fileError && csvPreview.assumedOpenTime && csvPreview.valid.length > 0 && (
                <div className="mb-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <p className="text-stone-600 text-sm leading-relaxed">
                    This export only records when each position <strong>closed</strong>, so we've used
                    that as the open time too. Your P&amp;L, win rate and calendar are unaffected — they
                    all work off the close.
                  </p>
                </div>
              )}

              <div className={`flex gap-3 flex-wrap mb-4 ${csvPreview.fileError ? 'hidden' : ''}`}>
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
                placeholder="What was the setup? What did you learn? Paste a chart link — it'll become a button."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition resize-none"
              />
            </div>

            {/* Chart screenshot. Same privacy line as notes: this is for the trader's own
                review, not the published page. */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                Chart screenshot <span className="text-stone-400 font-normal normal-case">(optional, private)</span>
              </label>

              {form.screenshot_url ? (
                <div className="flex items-start gap-3">
                  <img src={form.screenshot_url} alt="Trade screenshot" className="h-20 rounded-lg border border-stone-200" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, screenshot_url: '' }))}
                    className="text-xs font-semibold text-stone-500 hover:text-red-500 transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className={`flex items-center justify-center gap-2 border border-dashed border-stone-300 rounded-xl px-4 py-4 text-sm transition ${shotUploading ? 'opacity-60' : 'cursor-pointer hover:border-stone-400 hover:bg-stone-50'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={shotUploading}
                    onChange={(e) => { uploadScreenshot(e.target.files?.[0] || null); e.target.value = ''; }}
                  />
                  {shotUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                      <span className="text-stone-500">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16l5-5 4 4 3-3 6 6M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
                      </svg>
                      <span className="text-stone-500">Add a screenshot of the chart</span>
                    </>
                  )}
                </label>
              )}
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
                    <Fragment key={t.id}>
                    <tr className="border-t border-stone-100">
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
                          onClick={() => setDeleteTarget(t)}
                          className="text-stone-300 hover:text-red-500 transition text-xs font-medium"
                          aria-label={`Delete ${t.symbol} trade`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {/* The note, shown under its trade. Reviewing your own notes is the
                        point of a journal — a note you can't see afterwards is worthless. */}
                    {(t.notes || t.screenshot_url) && (() => {
                      // Links are lifted out of the prose and listed underneath. Inline
                      // linkifying breaks the sentence and a 120-character chart URL wraps
                      // badly in a table cell; as its own row it's a thing you click.
                      const { text: noteText, links } = extractLinks(t.notes || '');
                      return (
                        <tr>
                          <td colSpan={7} className="pb-3 pt-0">
                            <div className="bg-stone-50 border-l-2 border-stone-200 pl-3 py-2 rounded-r space-y-2">
                              {noteText && (
                                <p className="text-stone-500 text-xs leading-relaxed whitespace-pre-wrap">{noteText}</p>
                              )}
                              {links.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {links.map((l) => (
                                    <a
                                      key={l.href}
                                      href={l.href}
                                      target="_blank"
                                      // noreferrer as well as noopener: these are links a
                                      // trader pasted, not ones we vouch for.
                                      rel="noopener noreferrer nofollow"
                                      className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-500 bg-white border border-stone-200 rounded-lg px-2.5 py-1 transition max-w-full"
                                    >
                                      <svg className="w-3 h-3 flex-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
                                      </svg>
                                      <span className="truncate">{l.label}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              {t.screenshot_url && (
                                <a href={t.screenshot_url} target="_blank" rel="noopener noreferrer" className="block w-fit">
                                  <img
                                    src={t.screenshot_url}
                                    alt="Trade screenshot"
                                    loading="lazy"
                                    className="max-h-40 rounded-lg border border-stone-200 hover:border-stone-300 transition"
                                  />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })()}
                    </Fragment>
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
