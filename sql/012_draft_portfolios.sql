-- Porfilr — journal-first: portfolios that exist before they're published.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- WHY: the journal lives at /journal/:slug and hangs off a portfolios row, so a trader had
-- to build and publish a page before logging a single trade. That order is why six of eight
-- kit owners never logged anything — we asked for the work before giving them the reason.
--
-- A DRAFT is a portfolios row with status='draft': it gives the journal a home and holds
-- the trades, but has no generated HTML and is not publicly reachable. Publishing adopts
-- the same row (api/templates/create-portfolio.js), so trades stay attached to it.

-- ---------------------------------------------------------------------------
-- 1. A draft has no file
-- ---------------------------------------------------------------------------
-- file_path points at the generated HTML in storage. A draft has never been rendered, so
-- there is nothing to point at. This was the only NOT NULL column blocking a draft insert
-- (verified by probing every other column).
alter table public.portfolios
  alter column file_path drop not null;

-- ---------------------------------------------------------------------------
-- 2. A published page must always have one
-- ---------------------------------------------------------------------------
-- Dropping the NOT NULL above would otherwise let an ACTIVE page exist with no file, which
-- would serve a 404 to real visitors. Narrow the rule instead of removing it.
alter table public.portfolios
  drop constraint if exists portfolios_active_needs_file;

alter table public.portfolios
  add constraint portfolios_active_needs_file
  check (status <> 'active' or file_path is not null);

-- ---------------------------------------------------------------------------
-- 3. One draft per user per template
-- ---------------------------------------------------------------------------
-- /journal creates a draft if it can't find one. Without this, a double-click or two tabs
-- could leave a user with several empty journals and their trades split across them.
create unique index if not exists portfolios_one_draft_per_template
  on public.portfolios (user_id, template_id)
  where status = 'draft';

comment on index public.portfolios_one_draft_per_template is
  'A user may hold at most one unpublished journal per template.';

-- ---------------------------------------------------------------------------
-- 4. Verify
-- ---------------------------------------------------------------------------
-- file_path should be nullable:
--   select is_nullable from information_schema.columns
--   where table_name = 'portfolios' and column_name = 'file_path';
--
-- Should refuse (active with no file):
--   insert into public.portfolios (user_id, slug, template_id, status)
--   values (auth.uid(), 'test-active-nofile', 'trader-template', 'active');
--
-- Existing rows are untouched — all 18 are status='active' with a file_path.
