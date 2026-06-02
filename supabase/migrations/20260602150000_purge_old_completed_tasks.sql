-- Phase 4 — Effacement automatique des tâches complétées après 24 mois glissants.
-- Fonction SECURITY DEFINER (purge transverse aux foyers, hors RLS) NON exposée
-- à l'API : EXECUTE révoqué pour anon/authenticated. Planifiée via pg_cron.

create or replace function public.purge_old_completed_tasks()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.tasks
  where status = 'COMPLETED'
    and completed_at is not null
    and completed_at < now() - interval '24 months';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke execute on function public.purge_old_completed_tasks() from public;
revoke execute on function public.purge_old_completed_tasks() from anon;
revoke execute on function public.purge_old_completed_tasks() from authenticated;

-- Planification quotidienne (03:00) via pg_cron.
create extension if not exists pg_cron;

select cron.unschedule('purge-completed-24m')
where exists (select 1 from cron.job where jobname = 'purge-completed-24m');

select cron.schedule(
  'purge-completed-24m',
  '0 3 * * *',
  $$ select public.purge_old_completed_tasks() $$
);
