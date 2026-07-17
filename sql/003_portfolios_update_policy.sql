-- Porfilr — fix: authenticated users cannot UPDATE their own portfolios.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- THE BUG
-- public.portfolios has RLS policies for SELECT, INSERT and DELETE (authenticated) and
-- ALL (service_role) — but no UPDATE policy. RLS denies by default, so every
-- client-side update silently affects ZERO rows and returns NO error. The UI reports
-- success; the database never changed.
--
-- What this broke:
--   * Trade journal — starting_balance and journal_enabled never saved, so the live
--     track record could never be switched on.
--   * Custom domains — ProDashboard writes custom_domain/domain_verified straight from
--     the client. Silently broken for every Pro user, long before the journal existed.
--
-- Anything going through an /api route was unaffected: those use the service key, which
-- has the ALL policy and bypasses RLS. That's why publishing always worked and made
-- this invisible.

-- ---------------------------------------------------------------------------
-- 1. Row gate: you may only touch your own portfolios
-- ---------------------------------------------------------------------------
drop policy if exists "Users can update own portfolios" on public.portfolios;

-- USING decides which existing rows you may update.
-- WITH CHECK decides what they're allowed to become — without it a user could hand
-- their portfolio to someone else by rewriting user_id.
create policy "Users can update own portfolios"
  on public.portfolios for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 2. Column gate: only the columns the browser legitimately owns
-- ---------------------------------------------------------------------------
-- RLS gates ROWS, not COLUMNS. Supabase grants UPDATE on the whole table to
-- `authenticated` by default, so the policy above would also let a user rewrite
-- form_data, slug, file_path, deployed_url or views directly from the browser —
-- bypassing the publish pipeline that generates the actual HTML. Those columns must
-- only ever be written by /api routes using the service key.
--
-- So: revoke the blanket grant, then re-grant exactly the four columns the client
-- writes today.
revoke update on public.portfolios from authenticated;

grant update (
  starting_balance,   -- trade journal setup
  journal_enabled,    -- trade journal toggle
  custom_domain,      -- ProDashboard: add/remove a domain
  domain_verified     -- ProDashboard writes false when (re)setting a domain
) on public.portfolios to authenticated;

-- NOTE on domain_verified: a user can now set it true themselves. That grants nothing
-- on its own — api/p/index.js only serves a custom domain whose DNS actually resolves
-- to us, which requires controlling the domain. api/domains/verify.js remains the real
-- check. It's granted only because the existing client code writes `false` in the same
-- statement as custom_domain, and a partial column grant would fail the whole update.
-- If that client code is ever changed to stop writing it, drop it from this grant.

-- ---------------------------------------------------------------------------
-- 3. Verify
-- ---------------------------------------------------------------------------
-- Should now list SELECT, INSERT, UPDATE, DELETE for authenticated (+ ALL for service_role):
--   select policyname, cmd, roles from pg_policies where tablename = 'portfolios';
--
-- Should list exactly the four columns granted above:
--   select column_name, privilege_type
--   from information_schema.column_privileges
--   where table_name = 'portfolios' and grantee = 'authenticated' and privilege_type = 'UPDATE';
