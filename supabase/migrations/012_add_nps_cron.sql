SELECT cron.schedule(
  'check-nps-eligibility',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/nps/check-eligibility',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);