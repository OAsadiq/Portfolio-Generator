-- Porfilr — record roughly where an event came from.
--
-- Run this in the Supabase SQL editor BEFORE deploying the matching client change.
-- Safe to re-run.
--
-- WHY
-- The product is priced for the US ($35) but almost all of its distribution runs through
-- Nigerian creators and a mostly Nigerian engagement graph. Nobody could say which
-- audience actually arrives, because we captured utm_content and nothing geographic. That
-- made a significant strategic question — US-first or Nigeria-first — an argument instead
-- of a measurement.
--
-- WHAT IS STORED
-- `timezone` is the browser's IANA zone ("Africa/Lagos"), and `country` is derived from it
-- client-side (see src/lib/region.ts). No IP address, no city, nothing that identifies a
-- person. Timezone is kept raw so a better derivation can be applied later without having
-- thrown the signal away.
--
-- ACCURACY
-- Wrong for any individual behind a VPN or travelling. Right in aggregate, which is the
-- only way it should ever be read.

alter table public.events add column if not exists country  text;
alter table public.events add column if not exists timezone text;

comment on column public.events.country is
  'Best-effort ISO country code derived from the browser timezone. Aggregate use only — unreliable per person (VPNs, travel).';
comment on column public.events.timezone is
  'Raw IANA timezone from the browser, e.g. "Africa/Lagos". Source of truth for country.';

-- Grouping by country is the whole point, and events grows fast.
create index if not exists events_country_created_idx
  on public.events (country, created_at desc);

-- ---------------------------------------------------------------------------
-- Reading it
-- ---------------------------------------------------------------------------
-- The split, last 30 days:
--
--   select coalesce(country, 'unknown') as country,
--          count(*)                      as events,
--          count(distinct session_id)    as visitors,
--          count(distinct user_id)       as signed_in
--   from public.events
--   where created_at > now() - interval '30 days'
--   group by 1
--   order by visitors desc;
--
-- Which countries actually DO something, rather than just land:
--
--   select coalesce(country,'unknown') as country,
--          count(*) filter (where name = 'trade_logged')     as trades,
--          count(*) filter (where name = 'portfolio_published') as published
--   from public.events
--   where created_at > now() - interval '30 days'
--   group by 1
--   order by trades desc;
--
-- Rows written before this migration have country null and read as 'unknown'. Give it two
-- weeks before drawing any conclusion.
