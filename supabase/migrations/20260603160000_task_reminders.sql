-- Phase 12 (E2) — Rappels de tâches par e-mail.
-- Suivi de l'envoi (`reminder_sent_at`) + fonction qui liste les rappels dus,
-- avec leurs destinataires (parent assigné, ou tous les parents actifs si la
-- tâche est partagée ou en réserve). L'envoi est réalisé par l'edge function
-- `send-reminders`, planifiée côté dashboard.

alter table public.tasks
  add column if not exists reminder_sent_at timestamptz;

create or replace function public.due_task_reminders()
returns table (
  task_id uuid,
  title text,
  due timestamptz,
  recipient_email text,
  recipient_name text
)
language sql
security definer
set search_path = ''
as $$
  with candidates as (
    select
      t.id,
      t.title,
      t.family_id,
      t.assigned_to,
      t.shared,
      ((t.temporal_planning ->> 'end_date') || ' ' || (t.temporal_planning ->> 'time'))::timestamptz as due_ts,
      case t.reminders -> 0 ->> 'offset'
        when '10m' then interval '10 minutes'
        when '1h'  then interval '1 hour'
        when '1d'  then interval '1 day'
        else interval '0'
      end as lead
    from public.tasks t
    where t.status = 'TODO'
      and t.reminder_sent_at is null
      and t.reminders is not null
      and jsonb_array_length(t.reminders) > 0
      and nullif(t.temporal_planning ->> 'end_date', '') is not null
      and nullif(t.temporal_planning ->> 'time', '') is not null
  )
  select c.id, c.title, c.due_ts, p.email, p.first_name
  from candidates c
  join public.profiles p
    on p.family_id = c.family_id
   and p.status = 'ACTIVE'
   and p.email is not null
   and (case when c.shared or c.assigned_to is null then true
             else p.id = c.assigned_to end)
  where now() >= (c.due_ts - c.lead);
$$;

revoke execute on function public.due_task_reminders() from public, anon, authenticated;
