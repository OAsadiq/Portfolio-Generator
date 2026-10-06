-- Porfilr — "I've paid" claims for payments we take by hand.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- WHY THIS EXISTS
-- Paystack and Flutterwave both require a Nigerian entity we don't have, so naira sales
-- are collected by bank transfer and fulfilled with scripts/grant-kit.mjs. Until this
-- table, the handoff lived in DMs: someone pays, messages us, and the reference sits in a
-- chat thread until it's actioned or lost.
--
-- WHAT THIS IS NOT
-- Not a payment. A row here is a CLAIM — somebody saying they sent money. Nothing is
-- granted by it. The money is still verified by eye against the bank statement, and access
-- is still granted deliberately. Treat every row as untrusted user input, because that is
-- exactly what it is.
--
-- The value is only that the queue is now somewhere we can see it, rather than in a DM.

create table if not exists public.payment_claims (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  email         text not null,
  -- What they're buying. A kit's template id ('trader-template'), or 'pro'. Deliberately
  -- NOT defaulted to the trader kit: manual payment is for every product we sell, now and
  -- for kits that don't exist yet. A default here would quietly misfile the first
  -- photographer kit sale as a trading one.
  product       text not null,
  method        text not null,                    -- bank_transfer | usdt
  amount_major  numeric,                          -- what they say they sent, in naira/USDT
  currency      text not null default 'NGN',
  reference     text,                             -- transfer id / tx hash, as typed
  note          text,
  status        text not null default 'pending',  -- pending | fulfilled | rejected
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_note text
);

create index if not exists payment_claims_status_idx on public.payment_claims (status, created_at desc);
create index if not exists payment_claims_email_idx  on public.payment_claims (lower(email));

comment on table public.payment_claims is
  'Unverified "I have paid" submissions for manual payment methods. A row grants nothing — fulfilment is scripts/grant-kit.mjs after checking the money actually arrived.';
comment on column public.payment_claims.status is
  'pending until a human checks the bank statement. Never set by the claimant.';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- Anyone may file a claim, including a logged-out buyer (they may have paid before making
-- an account). Nobody may read them back, because one person's claim contains another
-- person's email and payment reference. Only the service key — i.e. the grant script —
-- sees the queue.
alter table public.payment_claims enable row level security;

drop policy if exists "anyone can file a claim" on public.payment_claims;
create policy "anyone can file a claim"
  on public.payment_claims for insert
  to anon, authenticated
  with check (
    -- Cheap sanity bounds so the table can't be used as free text storage.
    length(email) between 5 and 200
    and length(coalesce(reference, '')) <= 200
    and length(coalesce(note, '')) <= 500
    and length(product) between 2 and 100
    and method in ('bank_transfer', 'usdt')
    and status = 'pending'
  );

-- No select/update/delete policies at all: with RLS on, that denies every client.

-- ---------------------------------------------------------------------------
-- Reading the queue (service key only)
-- ---------------------------------------------------------------------------
--   select created_at, email, method, amount_major, currency, reference, status
--   from public.payment_claims where status = 'pending' order by created_at;
--
-- Or: node scripts/grant-kit.mjs --claims
