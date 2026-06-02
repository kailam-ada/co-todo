-- Phase 1 — Durcissement des fonctions SECURITY DEFINER (advisors sécurité)
-- Objectif : ne pas exposer ces fonctions via l'API REST (/rest/v1/rpc/...).

-- 1) Helper de cloisonnement déplacé dans un schéma `private` non exposé.
create schema if not exists private;

create or replace function private.current_family_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select family_id from public.profiles where id = auth.uid();
$$;

grant usage on schema private to authenticated;
grant execute on function private.current_family_id() to authenticated;

-- 2) Recréer les politiques RLS pour pointer vers private.current_family_id().
drop policy "profiles_select_own_or_family" on public.profiles;
create policy "profiles_select_own_or_family"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or family_id = private.current_family_id()
  );

drop policy "tasks_select_family" on public.tasks;
create policy "tasks_select_family"
  on public.tasks
  for select
  to authenticated
  using (family_id = private.current_family_id());

drop policy "tasks_insert_family" on public.tasks;
create policy "tasks_insert_family"
  on public.tasks
  for insert
  to authenticated
  with check (family_id = private.current_family_id());

drop policy "tasks_update_family" on public.tasks;
create policy "tasks_update_family"
  on public.tasks
  for update
  to authenticated
  using (family_id = private.current_family_id())
  with check (family_id = private.current_family_id());

drop policy "tasks_delete_family" on public.tasks;
create policy "tasks_delete_family"
  on public.tasks
  for delete
  to authenticated
  using (family_id = private.current_family_id());

-- 3) Supprimer l'ancien helper exposé dans public.
drop function public.current_family_id();

-- 4) La fonction trigger n'a pas à être appelable via l'API : on révoque EXECUTE.
--    (Les triggers s'exécutent indépendamment de ce privilège.)
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
