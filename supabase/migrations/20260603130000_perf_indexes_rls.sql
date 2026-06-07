-- Perf (advisors) — sans changement fonctionnel ni de sécurité.
-- 1) Index couvrants sur les FK secondaires non indexées.
-- 2) RLS : envelopper auth.uid() dans (select auth.uid()) pour l'évaluer
--    une seule fois (initplan) au lieu d'une fois par ligne.

-- 1) Index couvrants
create index if not exists tasks_created_by_idx
  on public.tasks (created_by);
create index if not exists task_templates_created_by_idx
  on public.task_templates (created_by);
create index if not exists task_templates_assigned_to_idx
  on public.task_templates (assigned_to);
create index if not exists family_invitations_inviter_idx
  on public.family_invitations (inviter_profile_id);

-- 2) Politiques RLS optimisées (logique d'accès identique)
drop policy if exists "profiles_select_own_or_family" on public.profiles;
create policy "profiles_select_own_or_family"
  on public.profiles for select to authenticated
  using ((id = (select auth.uid())) or (family_id = private.current_family_id()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "invitations_owner_select" on public.family_invitations;
create policy "invitations_owner_select"
  on public.family_invitations for select to authenticated
  using (inviter_profile_id = (select auth.uid()));

drop policy if exists "invitations_owner_insert" on public.family_invitations;
create policy "invitations_owner_insert"
  on public.family_invitations for insert to authenticated
  with check (inviter_profile_id = (select auth.uid()));

drop policy if exists "invitations_owner_delete" on public.family_invitations;
create policy "invitations_owner_delete"
  on public.family_invitations for delete to authenticated
  using (inviter_profile_id = (select auth.uid()));
