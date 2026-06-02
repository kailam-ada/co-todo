-- Phase 3.5 — Table `families` : configuration au niveau du foyer
-- (localisation géographique pour la météo, sans GPS en direct — RGPD).
-- `id` correspond au `family_id` partagé par les profils du foyer.

create table public.families (
  id uuid primary key,
  city text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;

-- Lecture / écriture réservées aux membres du foyer (cloisonnement strict).
create policy "families_select_own"
  on public.families
  for select
  to authenticated
  using (id = private.current_family_id());

create policy "families_insert_own"
  on public.families
  for insert
  to authenticated
  with check (id = private.current_family_id());

create policy "families_update_own"
  on public.families
  for update
  to authenticated
  using (id = private.current_family_id())
  with check (id = private.current_family_id());
