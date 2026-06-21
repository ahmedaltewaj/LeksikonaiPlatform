SELECT cron.schedule(
  'send-onboarding-welcome',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/onboarding/email/send-scheduled?type=welcome',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-onboarding-setup-complete',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/onboarding/email/send-scheduled?type=setup_complete',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-onboarding-day1-tips',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/onboarding/email/send-scheduled?type=day1_tips',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-onboarding-day2-followup',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/onboarding/email/send-scheduled?type=day2_followup',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-onboarding-day3-checkin',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/onboarding/email/send-scheduled?type=day3_checkin',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-onboarding-day7-stats',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/onboarding/email/send-scheduled?type=day7_stats',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-onboarding-day14-activation',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/onboarding/email/send-scheduled?type=day14_activation',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-onboarding-day30-nps',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url => (
      SELECT value::text FROM vault.secrets
      WHERE name = 'INTERNAL_API_URL'
    ) || '/api/onboarding/email/send-scheduled?type=day30_nps',
    headers => '{"Content-Type": "application/json"}'::jsonb,
    body => '{"source":"pg_cron"}'::jsonb
  );
  $$
);

SELECT jobname, schedule, active FROM cron.job WHERE jobname LIKE 'send-onboarding%';