-- Porfilr — the 15-Trade Challenge finishers' wall.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- A finisher is someone who journaled 15+ trades in a calendar month, tagged enough of
-- them to earn an execution score, and CHOSE to appear. Nothing lands here without that
-- choice.
--
-- WHAT IS DELIBERATELY ABSENT
--   • Tags. "Revenge trade" is private reflection; it never becomes public.
--   • Money. No P&L, no returns, in any column — the wall ranks consistency, not results.
--     Leaving the columns out entirely means no future query can accidentally expose them,
--     and keeps this clear of anything that reads as investment promotion.
--
-- The score and trade count are the same figures the trader already published on their
-- card, so nothing here is newly disclosed.

create table if not exists public.card_finishers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  year_month   text not null,                    -- 'YYYY-MM'
  display_name text not null,
  handle       text,                             -- their X handle, optional
  score_pct    integer not null check (score_pct between 0 and 100),
  trades       integer not null check (trades >= 15),
  created_at   timestamptz not null default now(),

  -- One entry per trader per month. Re-opting in updates rather than duplicating.
  unique (user_id, year_month)
);

create index if not exists card_finishers_month_idx on public.card_finishers (year_month, created_at desc);

comment on table public.card_finishers is
  'Opt-in finishers of the 15-Trade Challenge. Score and counts only — never tags, never money. See api/_lib/reportCard.js for how score_pct is earned.';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.card_finishers enable row level security;

-- Anyone may read the wall: that is the point of it.
drop policy if exists "finishers are public" on public.card_finishers;
create policy "finishers are public"
  on public.card_finishers for select
  to anon, authenticated
  using (true);

-- A trader may only add themselves, and only with a figure that clears the bar. The
-- check constraints above are the real guard; this stops one user writing another's row.
drop policy if exists "add yourself" on public.card_finishers;
create policy "add yourself"
  on public.card_finishers for insert
  to authenticated
  with check (auth.uid() = user_id and length(display_name) between 1 and 60);

drop policy if exists "update your own" on public.card_finishers;
create policy "update your own"
  on public.card_finishers for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Opting in must be reversible. Someone who changes their mind should not have to ask.
drop policy if exists "remove yourself" on public.card_finishers;
create policy "remove yourself"
  on public.card_finishers for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- The wall, newest first:
--   select year_month, display_name, handle, score_pct, trades
--   from public.card_finishers order by year_month desc, created_at desc;
--
-- The gate before this goes public — needs 2-3 real traders, none of them the team's:
--   select count(distinct user_id) from public.card_finishers;
