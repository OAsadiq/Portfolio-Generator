-- Porfilr — columns for the calendar announcement + the stale-track-record nudge.
--
-- Run in the Supabase SQL editor. Safe to re-run.

-- One-off "we shipped the calendar" announcement (scripts/announce-calendar.mjs).
-- Re-running the script skips anyone already announced.
alter table public.template_purchases
  add column if not exists calendar_announced_at timestamptz;

comment on column public.template_purchases.calendar_announced_at is
  'When the trading-calendar announcement email was sent. Null = not yet announced.';

-- Cooldown for the "your track record is going quiet" nudge, so it can never become a
-- drip campaign. The cron only emails a trader once per 14 days.
alter table public.portfolios
  add column if not exists stale_nudged_at timestamptz;

comment on column public.portfolios.stale_nudged_at is
  'Last time we nudged this trader that their live track record had gone stale (10+ days without a closed trade). Enforces a 14-day cooldown.';
