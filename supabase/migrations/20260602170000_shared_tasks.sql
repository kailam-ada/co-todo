-- Phase 7 — Assignation partagée « Les deux — 50/50 ».
-- Une tâche partagée est co-détenue par les deux parents : shared = true,
-- assigned_to = null. À la complétion, +7 pts à chaque parent ACTIVE du foyer.

alter table public.tasks
  add column if not exists shared boolean not null default false;

-- Mise à jour du trigger d'exécution pour gérer le cas partagé.
create or replace function public.award_execution_points()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'COMPLETED' and old.status is distinct from 'COMPLETED' then
    if new.shared then
      -- Tâche partagée : +7 pts à chaque parent actif du foyer.
      update public.profiles
      set points = points + 7
      where family_id = new.family_id
        and status = 'ACTIVE';
    elsif new.assigned_to is not null then
      -- Tâche assignée : 15 pts au parent responsable.
      update public.profiles
      set points = points + 15
      where id = new.assigned_to;
    end if;
  end if;
  return new;
end;
$$;
