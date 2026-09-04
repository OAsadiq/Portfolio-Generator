-- Porfilr — free tier trade cap.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- Free users may store up to 25 trades. Owning the Trader Kit removes the cap.
--
-- WHY A TRIGGER AND NOT AN API CHECK
-- Trades are written straight from the browser (supabase.from('trades').insert), not
-- through an /api route. There is no server we control in that path, so a check in
-- JavaScript is advisory only — anyone can bypass it from the devtools console. The
-- database is the only place this can actually be enforced.
--
-- GRANDFATHERING IS AUTOMATIC
-- The exemption is "has a template_purchases row", and all existing kit owners have one.
-- Nobody currently holds more than 21 trades, so this binds on nobody today. It is meant
-- to fire on IMPORTERS — someone dropping in a 200-trade exchange export — after they
-- have already seen their own calendar built from the first 25.

-- ---------------------------------------------------------------------------
-- 1. The cap, in one place
-- ---------------------------------------------------------------------------
create or replace function public.free_trade_cap()
returns integer
language sql
immutable
as $$ select 25 $$;

comment on function public.free_trade_cap is
  'Trades a user may store without owning the Trader Kit. Change here, not in the client.';

-- ---------------------------------------------------------------------------
-- 2. Enforcement
-- ---------------------------------------------------------------------------
create or replace function public.enforce_trade_cap()
returns trigger
language plpgsql
-- SECURITY DEFINER so the count and the ownership lookup are reliable regardless of the
-- caller's RLS view. Without it a user whose policies hide rows could under-count and
-- slip past the cap.
security definer
-- Pinned search_path: a SECURITY DEFINER function without one can be hijacked by a caller
-- who puts a malicious schema earlier in their path.
set search_path = public, pg_temp
as $$
declare
  owns_kit boolean;
  existing integer;
begin
  select exists (
    select 1 from public.template_purchases
    where user_id = new.user_id
      and template_id = 'trader-template'
  ) into owns_kit;

  if owns_kit then
    return new;
  end if;

  select count(*) into existing
  from public.trades
  where user_id = new.user_id;

  if existing >= public.free_trade_cap() then
    -- The client matches on this exact string to show the upgrade prompt instead of a
    -- raw database error. Changing it means changing TradeJournal.tsx too.
    raise exception 'TRADE_CAP_REACHED'
      using hint = 'Free accounts can store ' || public.free_trade_cap() || ' trades. Owning the Trader Kit removes the limit.';
  end if;

  return new;
end;
$$;

drop trigger if exists trades_enforce_cap on public.trades;

create trigger trades_enforce_cap
  before insert on public.trades
  for each row
  execute function public.enforce_trade_cap();

-- Note: INSERT only, deliberately. Updating an existing trade must never be blocked — a
-- user who somehow ends up over the cap (a grant revoked, say) has to stay able to correct
-- and delete what they already have. Deleting back under the cap is allowed and not
-- policed; the alternative feels hostile for a rounding error.

-- ---------------------------------------------------------------------------
-- 3. How many trades may this user still add?
-- ---------------------------------------------------------------------------
-- The client calls this to pre-truncate a CSV import, so a 200-row insert doesn't fail
-- halfway and leave a mess. Returns null for unlimited.
create or replace function public.trades_remaining()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  owns_kit boolean;
  used integer;
begin
  if uid is null then
    return 0;
  end if;

  select exists (
    select 1 from public.template_purchases
    where user_id = uid and template_id = 'trader-template'
  ) into owns_kit;

  if owns_kit then
    return null;              -- unlimited
  end if;

  select count(*) into used from public.trades where user_id = uid;
  return greatest(public.free_trade_cap() - used, 0);
end;
$$;

grant execute on function public.trades_remaining() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Verify
-- ---------------------------------------------------------------------------
-- Should return 25:
--   select public.free_trade_cap();
--
-- Should list trades_enforce_cap:
--   select tgname from pg_trigger where tgrelid = 'public.trades'::regclass and not tgisinternal;
--
-- As a signed-in free user, should return a number; as a kit owner, null:
--   select public.trades_remaining();
