-- Porfilr — lower the free trade cap from 25 to 15.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- WHY: the free tier now includes everything the journal does — the calendar, the equity
-- curve, the live track record on the page. The only paid levers left are the trade cap
-- and removing the Porfilr badge. With less held back elsewhere, the cap has to do more
-- of the work, and 25 was set when it was one limit among several.
--
-- 15 is still roughly a month of trading for most people, so it lands after someone has a
-- real calendar to look at rather than before.
--
-- Nothing is deleted. The trigger only fires on INSERT, so anyone already above 15 keeps
-- every trade they have — they simply can't add more without unlocking. See
-- sql/011_trade_cap.sql for the trigger itself, which reads this function.

create or replace function public.free_trade_cap()
returns integer
language sql
immutable
as $$ select 15 $$;

comment on function public.free_trade_cap is
  'Trades a user may store without owning the Trader Kit. Change here, not in the client.';

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Should return 15:
--   select public.free_trade_cap();
--
-- Who is now above the cap and will be blocked from adding (they keep what they have):
--   select t.user_id, count(*) as trades
--   from public.trades t
--   where not exists (
--     select 1 from public.template_purchases p
--     where p.user_id = t.user_id and p.template_id = 'trader-template'
--   )
--   group by t.user_id
--   having count(*) >= 15;
