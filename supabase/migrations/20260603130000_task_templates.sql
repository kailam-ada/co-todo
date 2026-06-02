-- Phase 10 (C5) — Modèles de tâches réutilisables, cloisonnés par foyer.
-- Un modèle conserve l'ossature d'une tâche (titre, planning, sous-tâches,
-- récurrence, rappels, lieu, notes, étiquettes, assignation par défaut), sans
-- statut ni complétion. L'instanciation crée une vraie tâche via le formulaire.

create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  created_by uuid references public.profiles (id) on delete set null,
  name text not null,
  title text not null,
  assigned_to uuid references public.profiles (id) on delete set null,
  shared boolean not null default false,
  temporal_planning jsonb not null default '{}'::jsonb,
  sub_tasks jsonb not null default '[]'::jsonb,
  recurrence jsonb,
  reminders jsonb,
  location text,
  notes text,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index task_templates_family_id_idx on public.task_templates (family_id);

alter table public.task_templates enable row level security;

create policy "task_templates_select_family"
  on public.task_templates
  for select
  to authenticated
  using (family_id = private.current_family_id());

create policy "task_templates_insert_family"
  on public.task_templates
  for insert
  to authenticated
  with check (family_id = private.current_family_id());

create policy "task_templates_update_family"
  on public.task_templates
  for update
  to authenticated
  using (family_id = private.current_family_id())
  with check (family_id = private.current_family_id());

create policy "task_templates_delete_family"
  on public.task_templates
  for delete
  to authenticated
  using (family_id = private.current_family_id());
