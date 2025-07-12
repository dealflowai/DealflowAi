-- Fix the net extension reference (should be http)
-- First unschedule the existing job
SELECT cron.unschedule('monthly-token-grant-job');

-- Create the corrected cron job
SELECT cron.schedule(
  'monthly-token-grant-job',
  '0 9 * * *', -- Daily at 9 AM UTC
  $$
  SELECT 
    http_post(
      'https://whrtmdoktihsctssdyjq.supabase.co/functions/v1/monthly-token-grant',
      '{"source": "cron_job", "timestamp": "' || now() || '"}',
      'application/json',
      ARRAY[
        http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocnRtZG9rdGloc2N0c3NkeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODA5MDEsImV4cCI6MjA2NzA1NjkwMX0.VZIZzfcL0hybiNZxinHjsOsChiuNckYRX-bj_p-T6Pg'),
        http_header('Content-Type', 'application/json')
      ]
    ) as request_id;
  $$
);