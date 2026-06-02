-- Phase 1 — Table publique `profiles` reliée à auth.users
-- Chaque nouveau compte démarre dans son propre foyer (family_id généré par défaut).
-- L'appairage familial (Phase 0.5) fusionnera deux profils sous un family_id partagé.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  parent_label text,
  avatar_color text not null default '#4f46e5',
  family_id uuid not null default gen_random_uuid(),
  points integer not null default 0,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'ANONYMIZED')),
  created_at timestamptz not null default now()
);

create index profiles_family_id_idx on public.profiles (family_id);

-- Trigger : à la création d'un compte auth, créer automatiquement le profil
-- en récupérant le prénom depuis les métadonnées d'inscription.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Helper : family_id de l'utilisateur courant (SECURITY DEFINER pour éviter
-- la récursion RLS lorsqu'une politique de `profiles` doit lire `profiles`).
create or replace function public.current_family_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select family_id from public.profiles where id = auth.uid();
$$;
