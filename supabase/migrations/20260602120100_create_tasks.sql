-- Phase 1 — Table `tasks`
-- temporal_planning : { start_date, end_date, time }
-- sub_tasks         : [{ id, label, done }]
-- recurrence        : { frequency, interval, ... } | null
-- reminders         : [{ offset, channel }] | null

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  created_by uuid references public.profiles (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  title text not null,
  status text not null default 'TODO' check (status in ('TODO', 'COMPLETED')),
  temporal_planning jsonb not null default '{}'::jsonb,
  sub_tasks jsonb not null default '[]'::jsonb,
  recurrence jsonb,
  reminders jsonb,
  points_value integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_family_id_idx on public.tasks (family_id);
create index tasks_assigned_to_idx on public.tasks (assigned_to);
