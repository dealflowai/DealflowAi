-- Enable the cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the http extension for making HTTP requests  
CREATE EXTENSION IF NOT EXISTS http;

-- Drop existing automated scraper cron job if it exists
SELECT cron.unschedule('automated-scraper-job') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'automated-scraper-job'
);

-- Create a cron job that runs every hour to check for users due for automated scraping
SELECT cron.schedule(
  'automated-scraper-job',
  '0 * * * *', -- Every hour at the top of the hour
  $$
  SELECT 
    http_post(
      'https://whrtmdoktihsctssdyjq.supabase.co/functions/v1/automated-scraper',
      '{"source": "cron_job", "timestamp": "' || now() || '"}',
      'application/json',
      ARRAY[
        http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocnRtZG9rdGloc2N0c3NkeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODA5MDEsImV4cCI6MjA2NzA1NjkwMX0.VZIZzfcL0hybiNZxinHjsOsChiuNckYRX-bj_p-T6Pg'),
        http_header('Content-Type', 'application/json')
      ]
    ) as request_id;
  $$
);