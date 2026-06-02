-- Phase 5 — Attribution effective des points (server-authoritative).
-- Création : 5 pts + bonus de planification au créateur (calculé en SQL,
-- miroir de src/lib/points.ts). Exécution : 15 pts à l'assigné au passage
-- à COMPLETED. Fonctions SECURITY DEFINER (mise à jour de profils du foyer
-- hors RLS), non exposées à l'API.

-- 1) Attribution à la création
create or replace function public.award_creation_points()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  bonus int := 0;
  has_end   boolean := nullif(new.temporal_planning ->> 'end_date', '') is not null;
  has_start boolean := nullif(new.temporal_planning ->> 'start_date', '') is not null;
  has_time  boolean := nullif(new.temporal_planning ->> 'time', '') is not null;
  has_rec   boolean := new.recurrence is not null;
  has_sub   boolean := jsonb_array_length(coalesce(new.sub_tasks, '[]'::jsonb)) > 0;
  has_rem   boolean := new.reminders is not null
                       and jsonb_array_length(new.reminders) > 0;
  is_partial boolean;
begin
  is_partial := has_start and has_end and has_time;
  if is_partial and (has_rec or has_sub or has_rem) then
    bonus := 10;
  elsif is_partial then
    bonus := 5;
  elsif has_end then
    bonus := 2;
  end if;

  if new.created_by is not null then
    update public.profiles
    set points = points + 5 + bonus
    where id = new.created_by;
  end if;
  return new;
end;
$$;

revoke execute on function public.award_creation_points() from public, anon, authenticated;

drop trigger if exists trg_award_creation on public.tasks;
create trigger trg_award_creation
  after insert on public.tasks
  for each row execute function public.award_creation_points();

-- 2) Attribution à l'exécution (15 pts, exclusivement à assigned_to)
create or replace function public.award_execution_points()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'COMPLETED'
     and old.status is distinct from 'COMPLETED'
     and new.assigned_to is not null then
    update public.profiles
    set points = points + 15
    where id = new.assigned_to;
  end if;
  return new;
end;
$$;

revoke execute on function public.award_execution_points() from public, anon, authenticated;

drop trigger if exists trg_award_execution on public.tasks;
create trigger trg_award_execution
  after update on public.tasks
  for each row execute function public.award_execution_points();
