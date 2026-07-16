# Porfilr — Trade Journal (live track record) spec

**The feature:** traders log their trades in Porfilr. We compute their metrics and draw their
equity curve automatically. Their published page shows a **live track record** that updates as
they trade — instead of numbers they typed once and an equity-curve screenshot they uploaded.

**Why it matters:** the template is copyable in a weekend. The journal isn't. It's the first
thing in the trader kit a competitor can't clone from a screenshot, and it's the reason a trader
comes back weekly instead of publishing once and forgetting us.

**The line we do not cross:** logged trades are still *self-reported*. We compute honestly from
what the trader gives us, but we do not verify it. The page may show "updated 2 days ago" and a
live curve. It may **never** say "Verified by Porfilr." Real verification (broker reconciliation)
is a later phase — the journal is its foundation, not its replacement.

---

## 1. Data model (Supabase)

### `trades`
| column | type | notes |
|---|---|---|
| `id` | uuid, pk | |
| `user_id` | uuid, fk → auth.users | RLS: owner only |
| `portfolio_id` | uuid, fk → portfolios | which page this feeds |
| `symbol` | text | e.g. `EURUSD`, `BTCUSD`, `NAS100` |
| `direction` | text | `long` \| `short` |
| `opened_at` | timestamptz | |
| `closed_at` | timestamptz, nullable | null = still open |
| `entry_price` | numeric | |
| `exit_price` | numeric, nullable | |
| `size` | numeric | lots / units / contracts |
| `pnl` | numeric, nullable | **the money number** — see below |
| `fees` | numeric, default 0 | |
| `notes` | text, nullable | private, never rendered publicly |
| `created_at` / `updated_at` | timestamptz | |

**Key decision — `pnl` is entered directly, not derived.** Computing P&L from entry/exit requires
knowing pip value, contract size, and quote currency per instrument. That's a per-broker rabbit
hole and it will be wrong for someone. The trader enters the P&L their broker shows them. Entry
and exit are for their own record. This keeps us out of the instrument-math business entirely.

**RLS:** every policy keyed on `user_id = auth.uid()`. Trades are private by default — only the
*computed aggregate* becomes public, never the individual trade rows or notes.

### `portfolios` — add:
- `starting_balance` numeric — required to compute return %; asked for once
- `journal_enabled` boolean, default false
- `metrics_cache` jsonb — last computed metrics (see §2)
- `metrics_updated_at` timestamptz — drives the "updated X ago" stamp

---

## 2. Metric computation

Computed from **closed trades only** (open trades are excluded — unrealised P&L is how traders
lie to themselves). All derived from `pnl` and `starting_balance`.

- **Total return %** = `sum(pnl - fees) / starting_balance * 100`
- **Win rate** = `count(pnl > 0) / count(all closed) * 100`
- **Profit factor** = `sum(pnl where pnl > 0) / abs(sum(pnl where pnl < 0))`
  - Edge case: no losing trades → don't render `Infinity`. Show `—` or suppress the metric.
- **Max drawdown %** = walk the equity curve chronologically, track running peak, take the largest
  `(peak - trough) / peak`. Report as a positive number.
- **Track record length** = `now - min(opened_at)`, rendered as "3 years" / "8 months"
- **Total trades** = count of closed trades (new metric — cheap, and it signals sample size,
  which is exactly what a sceptical investor wants)
- **Equity curve** = running cumulative `starting_balance + Σ(pnl - fees)` ordered by `closed_at`

**Small-sample honesty:** below ~20 closed trades, win rate and profit factor are noise. Show the
trade count prominently so the reader can judge for themselves. Don't hide it.

**Where it computes:** server-side, in the API. Never trust numbers posted from the client.

---

## 3. The publish / refresh problem

This is the real architectural work. Today a published portfolio is **static HTML frozen at
publish time** in Supabase storage. A live track record contradicts that by definition.

**Approach: static shell + live metrics fetch.**

Keep publishing static HTML (fast, cached, cheap — don't throw that away). But when
`journal_enabled` is true, the track-record section renders as a **placeholder** that fetches its
numbers at view time:

```
GET /api/track-record?slug=<slug>  →  { metrics, curve, updated_at }
```

- Public, no auth, read-only. Returns **only** the computed aggregate — never trade rows, never notes.
- Cache ~5 min at the CDN. A track record does not need to be real-time.
- **Must degrade gracefully:** if the fetch fails, the section shows the last-known cached values
  baked into the static HTML at publish. The page never shows a broken/empty metrics block —
  that's the single most important part of the page.
- Bake `metrics_cache` into the HTML at publish so there's always a floor to fall back to.

**Why not regenerate the whole page on every trade?** A trader logging 5 trades a day would
trigger 5 full re-publishes. Wasteful, and it makes trade-logging slow for no benefit.

**Equity curve rendering:** draw it as inline SVG from the curve data — no chart library, no
external requests (published pages must stay self-contained). A polyline plus axis labels is
genuinely enough and it'll look sharper than an uploaded screenshot.

---

## 4. API routes — REVISED during build

**Original plan:** `POST/GET/PATCH/DELETE /api/trades` + `GET /api/track-record`.

**What was actually built, and why:** only `GET /api/track-record`.

Trade CRUD needs no routes. The rest of this app writes to Supabase directly with the
anon key under RLS (see `desktop_reminders` in `src/components/builder/index.tsx`), and
the `trades` policies in `sql/001_trades.sql` already enforce owner-only access —
including that you own the portfolio you're attaching to. Adding CRUD routes would
duplicate that security boundary in a second place: two things to keep in sync, one more
place to get it wrong. The builder talks to Supabase directly.

| route | auth | purpose |
|---|---|---|
| `GET /api/track-record?slug=` | **public** | computed metrics + curve for a published slug |

This route is the one thing that genuinely *must* be server-side: it reads private
trades with the service key (bypassing RLS) and returns only the aggregate. Its safety
rests on two rules, both enforced in code:

1. It returns only `computeMetrics()` output — never rows, notes, symbols, or prices.
2. It serves only portfolios with `journal_enabled` **and** a positive `starting_balance`.
   Everything else 404s identically, so absence can't be probed.

**`metrics_cache` is written by this route** (fire-and-forget) rather than by a trigger
or a recompute-on-write hook. The aggregate is cheap, the CDN absorbs the reads, and it
keeps trade-logging fast. Publish-time bakes the cache in as the offline fallback.

Rate-limited with a burst guard (the CDN cache absorbs normal traffic).

---

## 5. Builder UI (desktop — traders trade on laptops)

A **Trades** tab in the builder for trader-template portfolios:

- **Log trade form** — symbol, direction, opened, closed, entry, exit, size, P&L, fees, notes. Fast
  and keyboard-friendly; this gets used repeatedly, so every extra field is friction.
- **Trades table** — sortable, editable inline, delete. Show P&L per row, green/red.
- **Live metrics preview** — the exact numbers their page will show, so there's no surprise.
- **CSV import** — *the adoption unlock.* A trader with 2 years of history will not hand-log 400
  trades. Without import, only brand-new traders can use this. Map columns on upload; MT4/MT5 and
  most brokers export CSV. Ship this close to launch, not "later."
- **Starting balance** prompt on enabling the journal.
- **Manual-vs-journal toggle** — if `journal_enabled` is false, the existing typed-in fields still
  work. Never strand the traders already using the form.

---

## 6. Page changes (trader template)

- Metrics section reads from the journal when enabled, typed fields when not.
- Equity curve = generated SVG when journal enabled; uploaded image otherwise.
- Add **"Track record updated [X] ago"** near the metrics. This is quietly the most valuable
  string on the page — it's the thing a screenshot can never claim, and it's honest.
- Add **total trades** to the metrics grid.
- Keep the outbound proof link ("View my track record" → MyFXBook etc.) exactly as-is. Journal and
  external verification are complementary: we present, they verify.

---

## 7. Build order

1. ~~`trades` table + RLS + portfolio columns~~ — **done** → `sql/001_trades.sql`
   (not yet run against the live DB — paste into the Supabase SQL editor)
2. ~~Metric computation + unit-test the math~~ — **done** → `api/_lib/metrics.js`,
   `api/_lib/metrics.test.js` (25 tests, `npm test`; mutation-tested)
3. ~~CRUD routes~~ — **dropped**, see §4. Builder talks to Supabase directly under RLS.
4. ~~`GET /api/track-record`~~ — **done** → `api/track-record.js`
   (syntax/import verified only; not yet exercised against a live DB or deploy)
5. **NEXT:** Builder Trades tab (log form + table + live metrics preview)
6. Wire the template's live metrics section + baked-in fallback
7. SVG equity curve (replaces the uploaded chart image)
8. CSV import — the adoption unlock, don't under-scope
9. "Updated X ago" + total-trades metric on the page

Ships useful at step 5 (a trader gets a private journal), and becomes the differentiator
at step 6.

---

## 8. Risks

- **Drawdown/profit-factor math bugs** publish wrong numbers to investors. Test the math properly.
- **Abandonment:** logging is a habit. If they stop, the page silently goes stale — and "updated
  8 months ago" is *worse* than no timestamp. Consider hiding the stamp past a staleness threshold.
- **CSV import is the difference between "nice idea" and "traders actually use this."** Don't
  under-scope it.
- **Scope creep** — this is a trading journal, and trading journals can swallow a roadmap
  (tags, screenshots per trade, session analysis, R-multiples, calendars…). Everything that
  doesn't feed the public page is out of scope until traders ask.
