-- Porfilr — fix: deleting a portfolio fails when it has contact-form messages.
--
--   ERROR: update or delete on table "portfolios" violates foreign key constraint
--          "leads_portfolio_id_fkey" on table "leads"
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- Cause: leads.portfolio_id references portfolios(id) with no delete rule, so Postgres
-- defaults to NO ACTION and refuses to delete any portfolio that has ever received a
-- message. The bug only surfaces once a portfolio actually has leads.
--
-- Fix: ON DELETE SET NULL — the message survives, it just stops pointing at a page.
--
-- Why SET NULL and not CASCADE: leads are real people who contacted the user about
-- work. Deleting a page should not silently destroy the enquiries it generated —
-- that's the user's inbox, not page content, and it isn't what "delete portfolio"
-- promises. Two things confirm SET NULL is the intended shape:
--   * The dashboard reads leads by user_id, not portfolio_id, so messages stay
--     visible in Messages with no portfolio attached.
--   * api/contact.js already inserts `portfolio_id: portfolio?.id || null`, so a null
--     portfolio_id is an existing, expected state — not a new edge case.

-- SET NULL requires the column to be nullable. It should be already (contact.js writes
-- nulls today), but a NOT NULL here would make the new rule fail at delete time rather
-- than now, so normalise it explicitly.
alter table public.leads alter column portfolio_id drop not null;

alter table public.leads drop constraint if exists leads_portfolio_id_fkey;

alter table public.leads
  add constraint leads_portfolio_id_fkey
  foreign key (portfolio_id)
  references public.portfolios(id)
  on delete set null;

comment on column public.leads.portfolio_id is
  'The portfolio this message came through. NULL once that portfolio is deleted — the message itself is kept.';
