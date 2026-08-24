-- Porfilr — screenshots on journal trades.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- WHY: traders asked to attach the chart to the log. A note saying "entered off the 4h
-- level" is far more useful six weeks later with the picture next to it — reviewing your
-- own setups is the point of a journal.
--
-- Stores a URL only. The file goes to the existing `images` bucket under the user's own
-- folder, same as profile photos, so no new storage policy is needed.

alter table public.trades
  add column if not exists screenshot_url text;

comment on column public.trades.screenshot_url is
  'Public URL of a chart screenshot attached to this trade. Null when none.';

-- The client writes this straight from the journal, so it must be in the column grant.
-- RLS gates rows; the grant gates columns — see 003_portfolios_update_policy.sql for the
-- same pattern and why a missing column here fails the whole update silently.
grant update (screenshot_url) on public.trades to authenticated;

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Should list screenshot_url:
--   select column_name from information_schema.columns
--   where table_name = 'trades' and column_name = 'screenshot_url';
--
-- Should include screenshot_url:
--   select column_name from information_schema.column_privileges
--   where table_name = 'trades' and grantee = 'authenticated' and privilege_type = 'UPDATE';
