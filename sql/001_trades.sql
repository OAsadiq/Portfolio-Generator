-- Porfilr — Trade Journal: trades table + RLS + portfolio columns
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query → Run).
-- Safe to re-run: every statement is idempotent.
--
-- Context: the frontend talks to Supabase directly with the ANON key, so RLS is the
-- real security boundary — not the API layer. Trades hold a trader's private P&L and
-- notes, so the rule is: a user can only ever see/write their OWN trades, and only
-- against a portfolio they own. The public page never reads this table; it reads the
-- computed aggregate in portfolios.metrics_cache (populated server-side).

-- ---------------------------------------------------------------------------
-- 1. portfolios: journal columns
-- ---------------------------------------------------------------------------
alter table public.portfolios
  add column if not exists starting_balance   numeric,
  add column if not exists journal_enabled    boolean not null default false,
  add column if not exists metrics_cache      jsonb,
  add column if not exists metrics_updated_at timestamptz;

-- Return % divides by starting_balance — a zero or negative balance would break the
-- math (or produce nonsense). Allow NULL (journal off / not set yet) but never <= 0.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'portfolios_starting_balance_positive'
  ) then
    alter table public.portfolios
      add constraint portfolios_starting_balance_positive
      check (starting_balance is null or starting_balance > 0);
  end if;
end $$;

comment on column public.portfolios.starting_balance is
  'Account balance the equity curve starts from. Required before metrics can be computed.';
comment on column public.portfolios.metrics_cache is
  'Server-computed aggregate (return, win rate, profit factor, drawdown, curve). The ONLY journal data that becomes public.';

-- ---------------------------------------------------------------------------
-- 2. trades
-- ---------------------------------------------------------------------------
create table if not exists public.trades (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  portfolio_id  uuid not null references public.portfolios(id) on delete cascade,

  symbol        text not null,
  direction     text not null,
  opened_at     timestamptz not null,
  closed_at     timestamptz,

  entry_price   numeric,
  exit_price    numeric,
  size          numeric,

  -- P&L is ENTERED, not derived. Deriving it from entry/exit needs pip value,
  -- contract size, and quote currency per instrument — a per-broker rabbit hole that
  -- would silently produce wrong numbers on an investor-facing page. The trader enters
  -- what their broker shows them.
  pnl           numeric,
  fees          numeric not null default 0,

  notes         text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint trades_direction_valid check (direction in ('long', 'short')),
  constraint trades_symbol_not_blank check (length(btrim(symbol)) > 0),
  constraint trades_size_positive     check (size is null or size > 0),
  constraint trades_prices_positive   check (
    (entry_price is null or entry_price > 0) and (exit_price is null or exit_price > 0)
  ),
  constraint trades_fees_not_negative check (fees >= 0),
  -- A trade cannot close before it opens.
  constraint trades_closed_after_open check (closed_at is null or closed_at >= opened_at),
  -- Metrics are computed from CLOSED trades only. A closed trade without a P&L would
  -- silently corrupt every metric (a NULL pnl would drop out of sums but still count
  -- in the trade total), so require it at the DB level rather than trusting the UI.
  constraint trades_closed_requires_pnl check (closed_at is null or pnl is not null)
);

comment on table public.trades is
  'A trader''s logged trades. PRIVATE — self-reported, never verified by Porfilr. Only the computed aggregate is ever published.';
comment on column public.trades.pnl is
  'Realised P&L in account currency, entered by the trader (not derived). Required once closed_at is set.';
comment on column public.trades.notes is
  'Private to the trader. MUST never be rendered on a published page.';

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------
-- Metric computation walks one portfolio's closed trades in chronological order
-- (the equity curve and max-drawdown both depend on that ordering).
create index if not exists trades_portfolio_closed_at_idx
  on public.trades (portfolio_id, closed_at);
create index if not exists trades_user_id_idx
  on public.trades (user_id);

-- ---------------------------------------------------------------------------
-- 4. updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trades_set_updated_at on public.trades;
create trigger trades_set_updated_at
  before update on public.trades
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. RLS — the actual security boundary
-- ---------------------------------------------------------------------------
alter table public.trades enable row level security;
-- Belt and braces: applies the policies to the table owner too.
alter table public.trades force row level security;

drop policy if exists "trades_select_own" on public.trades;
drop policy if exists "trades_insert_own" on public.trades;
drop policy if exists "trades_update_own" on public.trades;
drop policy if exists "trades_delete_own" on public.trades;

-- Read: only your own trades. There is deliberately NO public read policy — the
-- published page must never touch this table.
create policy "trades_select_own"
  on public.trades for select
  to authenticated
  using (auth.uid() = user_id);

-- Insert: you must be the owner AND own the portfolio you're attaching to. Without
-- the portfolio check, a user could write trades onto someone else's page.
create policy "trades_insert_own"
  on public.trades for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.portfolios p
      where p.id = trades.portfolio_id and p.user_id = auth.uid()
    )
  );

-- Update: USING guards the row you may touch, WITH CHECK guards what it may become —
-- both are needed, or a user could reassign a trade to another user/portfolio.
create policy "trades_update_own"
  on public.trades for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.portfolios p
      where p.id = trades.portfolio_id and p.user_id = auth.uid()
    )
  );

create policy "trades_delete_own"
  on public.trades for delete
  to authenticated
  using (auth.uid() = user_id);
