-- Porfilr — kit entitlements: make template_purchases safe to rely on.
--
-- Run this in the Supabase SQL editor BEFORE selling the Trader Kit. Safe to re-run.
--
-- template_purchases is now the source of truth for "does this user own this kit?".
-- The app reads it from the browser (AuthContext.ownedTemplates) and writes it from the
-- server (Stripe webhook, and the referral-credit grant). Three things must hold, and
-- none of them are guaranteed today — the table is empty, so nothing has ever exercised it.

-- ---------------------------------------------------------------------------
-- 1. A free kit has no payment intent
-- ---------------------------------------------------------------------------
-- The referral-credit grant inserts stripe_payment_intent_id = null (no Stripe session
-- involved). A NOT NULL here would fail that insert — and it would fail for the first
-- person who ever earned a free kit, which is the worst possible moment to find out.
alter table public.template_purchases alter column stripe_payment_intent_id drop not null;

-- ---------------------------------------------------------------------------
-- 2. One purchase per user per template
-- ---------------------------------------------------------------------------
-- Makes double-granting impossible at the database level rather than trusting app logic:
-- a double-clicked checkout, a Stripe webhook retry (they do retry), and the referral
-- grant racing a paid purchase all collapse to one row.
create unique index if not exists template_purchases_user_template_uniq
  on public.template_purchases (user_id, template_id);

-- ---------------------------------------------------------------------------
-- 3. RLS — the user must be able to SEE what they bought
-- ---------------------------------------------------------------------------
-- This is the trap that just bit portfolios: RLS denies by default, so with no SELECT
-- policy the browser reads an empty list, ownsTemplate() returns false, and a paying
-- customer is locked out of the kit they just bought — with no error anywhere.
--
-- Reads only. Writes stay server-side (service key): a user must never be able to grant
-- themselves a kit by inserting a row from the console.
alter table public.template_purchases enable row level security;

drop policy if exists "Users can view own template purchases" on public.template_purchases;
create policy "Users can view own template purchases"
  on public.template_purchases for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Deliberately NO insert/update/delete policy for `authenticated`.
-- The service role bypasses RLS, which is how the webhook and the referral grant write.
revoke insert, update, delete on public.template_purchases from authenticated;

-- ---------------------------------------------------------------------------
-- 4. Verify
-- ---------------------------------------------------------------------------
--   select policyname, cmd, roles from pg_policies where tablename = 'template_purchases';
--   -- expect: SELECT for {authenticated}
--
--   select column_name, is_nullable from information_schema.columns
--   where table_name = 'template_purchases' and column_name = 'stripe_payment_intent_id';
--   -- expect: YES
