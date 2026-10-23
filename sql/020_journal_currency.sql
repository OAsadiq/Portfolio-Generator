-- Porfilr — what currency a trader's numbers are in.
--
-- Run this in the Supabase SQL editor BEFORE deploying the matching client change.
-- Safe to re-run.
--
-- WHY
-- Trades store bare numbers and nothing records the unit. Inside the journal that's fine:
-- the trader knows their own currency. But the published page and the shareable report
-- card are read by STRANGERS, who default to dollars — so a Lagos trader's ₦450,000 month
-- reads as $450k to everyone who sees it.
--
-- That is misleading by omission, and it cuts directly against what Porfilr sells: numbers
-- people can take at face value. It also creates a perverse incentive, where the least
-- honest-looking pages are the most impressive ones.
--
-- The published page was already doing this: the equity line and the chart axis both
-- hardcoded "$" regardless of who was looking.
--
-- SCOPE
-- One declaration per journal, set once. NOT per-trade, and no conversion ever — we state
-- the unit, we don't do FX. Unset stays valid: a bare number still prints, and the UI
-- nudges rather than blocks.
--
-- WHY ON `portfolios` AND NOT A USER TABLE
-- It belongs beside `starting_balance`, which is the number it denominates — a balance of
-- 20,000 is meaningless without it. A trader has one journal, so this is account-level in
-- practice, and it keeps the published page (which renders from a portfolio row) able to
-- format money without a second lookup.

alter table public.portfolios
  add column if not exists currency text;

comment on column public.portfolios.currency is
  'ISO-ish code for every money figure on this journal and its page: USD, NGN, EUR, GBP, USDT, etc. See api/_lib/money.js for the accepted list. NULL means undeclared — print bare numbers, never assume dollars.';

-- Deliberately NOT defaulted to 'USD'. A default would silently label every existing
-- trader's numbers as dollars, which is the exact wrong guess for the audience we are
-- actually reaching, and they would never know it had been made for them.

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Everyone starts undeclared:
--   select currency, count(*) from public.portfolios group by 1;
--
-- Journals that show money publicly but haven't declared a unit — the ones worth nudging:
--   select slug from public.portfolios
--   where template_id = 'trader-template' and journal_enabled and currency is null;
