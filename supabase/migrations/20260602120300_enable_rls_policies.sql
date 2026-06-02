-- Phase 1 — Row Level Security : cloisonnement strict par foyer (family_id)

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.family_invitations enable row level security;

-- PROFILES ------------------------------------------------------------------
-- Lecture : son propre profil OU les profils du même foyer.
create policy "profiles_select_own_or_family"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or family_id = public.current_family_id()
  );

-- Mise à jour : uniquement son propre profil.
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- (Insertion gérée par le trigger handle_new_user en SECURITY DEFINER.)
-- (Suppression gérée par la fonction d'anonymisation — Phase 4.)

-- TASKS ---------------------------------------------------------------------
-- Cloisonnement total : un utilisateur ne voit et ne modifie que les tâches
-- de son propre foyer.
create policy "tasks_select_family"
  on public.tasks
  for select
  to authenticated
  using (family_id = public.current_family_id());

create policy "tasks_insert_family"
  on public.tasks
  for insert
  to authenticated
  with check (family_id = public.current_family_id());

create policy "tasks_update_family"
  on public.tasks
  for update
  to authenticated
  using (family_id = public.current_family_id())
  with check (family_id = public.current_family_id());

create policy "tasks_delete_family"
  on public.tasks
  for delete
  to authenticated
  using (family_id = public.current_family_id());

-- FAMILY_INVITATIONS --------------------------------------------------------
-- L'émetteur gère uniquement ses propres invitations.
-- La consommation d'un code par un tiers passera par une fonction
-- SECURITY DEFINER (Phase 0.5), qui contourne la RLS de façon contrôlée.
create policy "invitations_owner_select"
  on public.family_invitations
  for select
  to authenticated
  using (inviter_profile_id = auth.uid());

create policy "invitations_owner_insert"
  on public.family_invitations
  for insert
  to authenticated
  with check (inviter_profile_id = auth.uid());

create policy "invitations_owner_delete"
  on public.family_invitations
  for delete
  to authenticated
  using (inviter_profile_id = auth.uid());
