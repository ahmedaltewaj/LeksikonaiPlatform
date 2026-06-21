-- Migration: 009_add_weekly_digest_cron
-- Schedule: Every Monday 08:00 UTC (9:00 AM CET)
-- Calls the digest-send edge function endpoint

SELECT cron.schedule(
  'send-weekly-digest',
  '0 8 * * 1',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/digests/send',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

-- Verify the schedule
SELECT * FROM cron.job WHERE jobname = 'send-weekly-digest';