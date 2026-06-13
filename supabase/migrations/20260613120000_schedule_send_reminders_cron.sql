-- Phase 12 (E2) — Planification de l'envoi des rappels par e-mail.
-- Appelle l'edge function `send-reminders` toutes les 5 minutes via pg_cron + pg_net.
-- La fonction est protégée par `verify_jwt` : l'appel porte donc un Bearer.
-- On utilise la CLÉ PUBLISHABLE (sb_publishable_…), publique par conception
-- (déjà exposée dans le bundle front) — ce n'est PAS un secret. La fonction, elle,
-- utilise sa propre SUPABASE_SERVICE_ROLE_KEY (secret serveur) pour ses écritures.
-- Les secrets BREVO_API_KEY / REMINDER_SENDER_EMAIL sont posés côté projet
-- (Edge Functions → Secrets), hors de ce dépôt.

create extension if not exists pg_net;

select cron.unschedule('send-reminders-5min')
where exists (select 1 from cron.job where jobname = 'send-reminders-5min');

select cron.schedule(
  'send-reminders-5min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://wovkgomznlhuusvhtrbd.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer sb_publishable_v6YNt171zqvJXilDCQhuyQ_0zD2VAX6'
    ),
    body    := '{}'::jsonb
  );
  $$
);
