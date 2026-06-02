-- Phase 11 (D1) — Réinversion des points à l'annulation d'une complétion.
-- Si une tâche repasse de COMPLETED à un autre statut (undo), on retire les
-- points d'exécution précédemment octroyés (15, ou 7/parent pour une tâche
-- partagée), sans descendre sous 0.

create or replace function public.award_execution_points()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Attribution : passage à COMPLETED
  if new.status = 'COMPLETED' and old.status is distinct from 'COMPLETED' then
    if new.shared then
      update public.profiles
      set points = points + 7
      where family_id = new.family_id and status = 'ACTIVE';
    elsif new.assigned_to is not null then
      update public.profiles
      set points = points + 15
      where id = new.assigned_to;
    end if;

  -- Réinversion : sortie de COMPLETED (annulation)
  elsif old.status = 'COMPLETED' and new.status is distinct from 'COMPLETED' then
    if old.shared then
      update public.profiles
      set points = greatest(0, points - 7)
      where family_id = old.family_id and status = 'ACTIVE';
    elsif old.assigned_to is not null then
      update public.profiles
      set points = greatest(0, points - 15)
      where id = old.assigned_to;
    end if;
  end if;

  return new;
end;
$$;
