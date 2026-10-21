-- Porfilr — execution tags on trades.
--
-- Run this in the Supabase SQL editor BEFORE deploying the matching client change.
-- Safe to re-run.
--
-- WHY A COLUMN AND NOT A JOIN TABLE
-- The spec allows either. An array column wins here because every read we care about
-- already fetches the whole trade row: the journal lists trades, the filter runs in the
-- browser over trades already in memory, and the aggregation groups a single user's month.
-- A join table would add a second query to every one of those for no benefit at this size.
--
-- WHY text[] AND NOT jsonb
-- Postgres can index text[] with GIN and answer `tags && array['FOMO entry']` directly, so
-- filtering stays a database operation if we ever need it to be. jsonb would make that
-- clumsier and buys nothing — a tag is a string, not a document.
--
-- RLS: trades already has row policies keyed on user_id; a new column inherits them, so
-- nobody gains access to anyone else's tags by this change.

alter table public.trades
  add column if not exists tags text[] not null default '{}';

comment on column public.trades.tags is
  'Execution tags. Preset tags (see api/_lib/tags.js) feed the Execution Score; custom tags are neutral. Empty array = untagged, which is valid everywhere — an untagged trade is simply invisible to the score.';

-- Filtering by tag, and the per-month aggregation, both benefit. GIN is the right index
-- for array containment/overlap.
create index if not exists trades_tags_idx on public.trades using gin (tags);

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Every existing trade should now be untagged, not null:
--   select count(*) filter (where tags = '{}') as untagged, count(*) from public.trades;
--
-- Tag distribution once people start using it:
--   select unnest(tags) as tag, count(*)
--   from public.trades group by 1 order by 2 desc;
--
-- A trade that is tagged but NOT clean (On plan plus a negative) — the case the scoring
-- rules hinge on:
--   select id, tags from public.trades
--   where tags @> array['On plan'] and tags && array['FOMO entry','Revenge trade','Moved stop','Exited early','Oversized','Chased price'];
