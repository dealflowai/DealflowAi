-- Enable the cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Drop existing cron job if it exists
SELECT cron.unschedule('monthly-token-grant-job') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monthly-token-grant-job'
);

-- Create a cron job that runs daily at 9 AM UTC to check for users due for monthly tokens
SELECT cron.schedule(
  'monthly-token-grant-job',
  '0 9 * * *', -- Daily at 9 AM UTC
  $$
  SELECT 
    net.http_post(
      url := 'https://whrtmdoktihsctssdyjq.supabase.co/functions/v1/monthly-token-grant',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocnRtZG9rdGloc2N0c3NkeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODA5MDEsImV4cCI6MjA2NzA1NjkwMX0.VZIZzfcL0hybiNZxinHjsOsChiuNckYRX-bj_p-T6Pg"}'::jsonb,
      body := '{"source": "cron_job", "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);