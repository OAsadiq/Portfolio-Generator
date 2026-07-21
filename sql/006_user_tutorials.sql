-- Porfilr — remember which tutorials a user has seen, PER USER (not per browser).
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- Tours were marked "seen" only in localStorage, so a user saw them again on a new
-- device, a different browser, or after clearing cache. This table makes "seen" stick
-- to the user everywhere. localStorage stays as a fast local cache; this is the
-- cross-device source of truth.

create table if not exists public.user_tutorials (
  user_id      uuid not null references auth.users(id) on delete cascade,
  tutorial_key text not null,
  seen_at      timestamptz not null default now(),
  primary key (user_id, tutorial_key)
);

-- RLS: a user only ever reads/writes their own tutorial flags.
alter table public.user_tutorials enable row level security;

drop policy if exists "user_tutorials_select_own" on public.user_tutorials;
create policy "user_tutorials_select_own"
  on public.user_tutorials for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_tutorials_insert_own" on public.user_tutorials;
create policy "user_tutorials_insert_own"
  on public.user_tutorials for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- No update/delete needed: a tutorial only ever goes from unseen -> seen, once.
revoke update, delete on public.user_tutorials from authenticated;
