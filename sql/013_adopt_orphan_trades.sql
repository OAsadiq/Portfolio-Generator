-- Porfilr — re-attach trades left behind by a deleted page.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- THE BUG THIS FIXES
-- Deleting a portfolio keeps its trades (sql/005) by setting portfolio_id to null — a
-- trader's history belongs to the trader, not to a page they rebuilt. create-portfolio
-- then re-adopts those orphans on the next build.
--
-- But the journal-first flow never reaches that code: /journal creates the draft straight
-- from the browser, and publishing goes through update-portfolio. So the orphans stayed
-- orphaned — invisible in the journal, while still counted against the free trade cap,
-- which counts by user_id. One live account showed 4 trades and was told it had used all
-- 25. Being charged because of trades you cannot see is the worst version of this.
--
-- Doing it as a SECURITY DEFINER function rather than a client-side update because the
-- client's UPDATE grants on `trades` are column-scoped, and portfolio_id is not among
-- them — a browser update would silently affect zero rows.

create or replace function public.adopt_orphan_trades(target_portfolio uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  tpl text;
  owner uuid;
  adopted integer;
begin
  if uid is null then
    return 0;
  end if;

  -- The caller must own the portfolio they're adopting into. Without this check a
  -- SECURITY DEFINER function would let anyone pull their trades onto someone else's page.
  select user_id, template_id into owner, tpl
  from public.portfolios
  where id = target_portfolio;

  if owner is null or owner <> uid then
    return 0;
  end if;

  -- Only orphans of the SAME template. A trader's forex journal must not be swept into a
  -- different kit's page just because both belong to them.
  update public.trades
     set portfolio_id = target_portfolio
   where user_id = uid
     and portfolio_id is null
     and template_id = tpl;

  get diagnostics adopted = row_count;
  return adopted;
end;
$$;

grant execute on function public.adopt_orphan_trades(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Orphans per user (should trend to zero as people open their journals):
--   select user_id, count(*) from public.trades
--   where portfolio_id is null group by user_id;
--
-- As a signed-in user, returns the number adopted:
--   select public.adopt_orphan_trades('<your-portfolio-id>');
