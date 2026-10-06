-- Porfilr — record HOW a kit was paid for, and in WHAT currency.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- WHY
-- Paystack and Flutterwave are closed to us (both require a Nigerian entity, which we
-- don't have), so Nigerian sales have to be collected by hand for now — bank transfer or
-- USDT — and fulfilled with scripts/grant-kit.mjs. The moment that happens, `amount`
-- stops being "US cents" and starts being a number whose meaning depends on the sale.
--
-- THE BUG THIS PREVENTS
-- `amount` is in MINOR units. A ₦25,000 sale stores 2500000, and every reader assumes
-- cents:
--   • ProDashboard shows the customer "$25,000 one-time" — a user-facing lie.
--   • sendFounderSaleAlert emails you "$25,000".
--   • Lifetime revenue becomes unaddable without knowing which row was which.
-- Storing the currency alongside the number is the only way any of those can be right.
--
-- WHY `provider` TOO
-- Today a zero amount means "free grant" and a non-zero means "Stripe". Once manual sales
-- exist, that inference breaks. Being explicit also makes the eventual Paystack work a
-- smaller change, since the column it needs will already be here.

alter table public.template_purchases
  add column if not exists currency    text,
  add column if not exists provider    text,
  add column if not exists payment_ref text;

-- Backfill. Everything that exists today is either a Stripe sale in USD or a free grant.
update public.template_purchases
   set currency = coalesce(currency, 'USD'),
       provider = coalesce(provider, case when amount > 0 then 'stripe' else 'grant' end),
       payment_ref = coalesce(payment_ref, stripe_payment_intent_id)
 where currency is null or provider is null;

alter table public.template_purchases
  alter column currency set default 'USD',
  alter column provider set default 'stripe';

comment on column public.template_purchases.currency is
  'ISO code for `amount`: USD, NGN, or USDT. `amount` is always in MINOR units (cents/kobo), so it cannot be read without this.';
comment on column public.template_purchases.provider is
  'stripe | manual_transfer | manual_usdt | grant | referral. A zero amount with provider <> grant is a bug.';
comment on column public.template_purchases.payment_ref is
  'Provider reference: Stripe payment_intent, a bank transfer id, or a crypto tx hash. Null for grants.';

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Nothing should be left unlabelled:
--   select provider, currency, count(*), sum(amount)
--   from public.template_purchases group by 1,2 order by 1,2;
--
-- Real revenue, kept separate per currency because it cannot be summed across them:
--   select currency, count(*) as sales, sum(amount)/100.0 as gross
--   from public.template_purchases
--   where amount > 0 and provider <> 'grant'
--   group by currency;
