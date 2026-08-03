-- Porfilr — track which kit buyers have been nudged, so we only ever email them once.
--
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- The daily cron (api/notify/domain.js -> sendKitNudges) emails Trader Kit buyers who paid
-- but stalled before their track record went live. This column stops it re-sending: once
-- someone is nudged (or found to be fully set up), they're marked and skipped forever.

alter table public.template_purchases
  add column if not exists kit_nudged_at timestamptz;

comment on column public.template_purchases.kit_nudged_at is
  'When the stalled-setup reminder was sent (or the buyer was found fully set up). Null = not yet checked.';

-- The cron scans for un-nudged buyers of a template; keep that lookup cheap.
create index if not exists template_purchases_nudge_idx
  on public.template_purchases (template_id, kit_nudged_at);
