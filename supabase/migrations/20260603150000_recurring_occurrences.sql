-- Phase 12 (E1) — Génération des occurrences récurrentes.
-- À la complétion d'une tâche récurrente (avec échéance), une nouvelle tâche
-- TODO est créée avec les dates avancées d'un pas de récurrence. Les points de
-- création (5 + bonus) ne sont crédités QUE sur la 1re occurrence : les
-- occurrences régénérées portent `auto_generated = true` et sont ignorées par
-- le trigger d'attribution à la création. Les points d'exécution restent dus à
-- chaque complétion.

-- 1) Marqueur d'occurrence régénérée automatiquement.
alter table public.tasks
  add column if not exists auto_generated boolean not null default false;

-- 2) Le trigger de création ignore les occurrences régénérées.
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
  -- Les occurrences régénérées ne re-créditent pas les points de création.
  if coalesce(new.auto_generated, false) then
    return new;
  end if;

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

-- 3) Génération de la prochaine occurrence à la complétion.
create or replace function public.generate_next_occurrence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  freq text := new.recurrence ->> 'frequency';
  step interval;
  end_txt text := nullif(new.temporal_planning ->> 'end_date', '');
  start_txt text := nullif(new.temporal_planning ->> 'start_date', '');
  new_planning jsonb := new.temporal_planning;
  reset_subs jsonb;
begin
  if new.status = 'COMPLETED'
     and old.status is distinct from 'COMPLETED'
     and new.recurrence is not null
     and end_txt is not null then

    step := case freq
      when 'daily'   then interval '1 day'
      when 'weekly'  then interval '7 days'
      when 'monthly' then interval '1 month'
      when 'yearly'  then interval '1 year'
      else null
    end;

    if step is null then
      return new;
    end if;

    new_planning := jsonb_set(
      new_planning, '{end_date}',
      to_jsonb(to_char((end_txt::date) + step, 'YYYY-MM-DD'))
    );
    if start_txt is not null then
      new_planning := jsonb_set(
        new_planning, '{start_date}',
        to_jsonb(to_char((start_txt::date) + step, 'YYYY-MM-DD'))
      );
    end if;

    reset_subs := (
      select coalesce(jsonb_agg(jsonb_set(elem, '{done}', 'false'::jsonb)), '[]'::jsonb)
      from jsonb_array_elements(coalesce(new.sub_tasks, '[]'::jsonb)) elem
    );

    insert into public.tasks (
      family_id, created_by, assigned_to, title, status, shared,
      temporal_planning, sub_tasks, recurrence, reminders,
      location, notes, tags, points_value, auto_generated
    ) values (
      new.family_id, new.created_by, new.assigned_to, new.title, 'TODO', new.shared,
      new_planning, reset_subs, new.recurrence, new.reminders,
      new.location, new.notes, new.tags, new.points_value, true
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.generate_next_occurrence() from public, anon, authenticated;

drop trigger if exists trg_generate_next_occurrence on public.tasks;
create trigger trg_generate_next_occurrence
  after update on public.tasks
  for each row execute function public.generate_next_occurrence();
