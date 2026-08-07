-- Porfilr — opt-in: show the trading calendar on the published page.
--
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- The calendar is strong proof of consistency for investors, but it also exposes a
-- trader's day-by-day pattern publicly. That's a personal call, so it is OFF by default
-- and the trader turns it on themselves in the Journal.

alter table public.portfolios
  add column if not exists calendar_public boolean not null default false;

comment on column public.portfolios.calendar_public is
  'Trader opted to show their daily P&L calendar on the published page. Off by default — it reveals day-by-day trading patterns.';

-- The client writes this from the Journal, so it needs to be in the column grant added in
-- 003 (RLS gates rows; the grant gates columns).
grant update (calendar_public) on public.portfolios to authenticated;
