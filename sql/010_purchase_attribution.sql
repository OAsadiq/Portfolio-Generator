-- Porfilr — record WHO drove each purchase, so commission is provable.
--
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- THE GAP THIS CLOSES
-- We track link clicks (events.ref_click) but nothing tied a completed purchase back to
-- the person who drove it. With growth people on commission, "which sale was mine?" has to
-- be answerable from data, not from memory or goodwill.
--
-- Attribution is captured in the browser (first-touch utm_content, set when someone lands
-- via porfilr.com/r/<code>), passed through Stripe checkout metadata, and written here by
-- the webhook.

alter table public.template_purchases
  add column if not exists attribution text;

comment on column public.template_purchases.attribution is
  'utm_content of the link that drove this purchase (e.g. "ayo", "team_c2"). Null = organic or unattributed. Basis for commission.';

create index if not exists template_purchases_attribution_idx
  on public.template_purchases (attribution);
