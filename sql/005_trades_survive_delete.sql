-- Porfilr — decouple trades from the portfolio so deleting a kit page and rebuilding
-- restores the trader's history instead of wiping it.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- BEFORE: trades.portfolio_id was NOT NULL with ON DELETE CASCADE, so deleting a kit
-- page destroyed every logged trade with it. A trader who deleted their page to "start
-- fresh" lost months of history.
--
-- AFTER: a trade belongs to (user_id, template_id) — the trader and their kit. The
-- portfolio is a soft link: deleting the page sets portfolio_id to null (trades kept),
-- and creating a new page of the same kit re-adopts those orphaned trades
-- (see the adoption block in api/templates/create-portfolio.js).

-- ---------------------------------------------------------------------------
-- 1. Which kit does each trade belong to?
-- ---------------------------------------------------------------------------
alter table public.trades add column if not exists template_id text;

-- Backfill from the owning portfolio for existing trades.
update public.trades t
set template_id = p.template_id
from public.portfolios p
where t.portfolio_id = p.id and t.template_id is null;

-- ---------------------------------------------------------------------------
-- 2. The portfolio link is now soft: deleting a page must NOT delete its trades
-- ---------------------------------------------------------------------------
alter table public.trades alter column portfolio_id drop not null;

-- Swap CASCADE for SET NULL. The inline FK from 001 is named trades_portfolio_id_fkey.
alter table public.trades drop constraint if exists trades_portfolio_id_fkey;
alter table public.trades
  add constraint trades_portfolio_id_fkey
  foreign key (portfolio_id) references public.portfolios(id) on delete set null;

-- ---------------------------------------------------------------------------
-- 3. Indexes for the (user, kit) query + fast adoption of orphans
-- ---------------------------------------------------------------------------
create index if not exists trades_user_template_idx
  on public.trades (user_id, template_id);
-- Orphans are what a rebuild adopts; a partial index keeps that lookup cheap.
create index if not exists trades_orphan_idx
  on public.trades (user_id, template_id) where portfolio_id is null;

-- ---------------------------------------------------------------------------
-- 4. RLS: tolerate a null portfolio_id
-- ---------------------------------------------------------------------------
-- The insert/update policies from 001 required the row's portfolio to be owned by the
-- caller. A trade can now legitimately have portfolio_id = null (orphaned between delete
-- and rebuild), so allow that case. Adoption itself runs server-side with the service
-- key and bypasses RLS; this only keeps client writes valid.
drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own"
  on public.trades for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      portfolio_id is null
      or exists (
        select 1 from public.portfolios p
        where p.id = trades.portfolio_id and p.user_id = auth.uid()
      )
    )
  );

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own"
  on public.trades for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      portfolio_id is null
      or exists (
        select 1 from public.portfolios p
        where p.id = trades.portfolio_id and p.user_id = auth.uid()
      )
    )
  );

-- select/delete policies from 001 are keyed on user_id only and need no change.
