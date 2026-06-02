-- Phase 1 — Table intermédiaire `family_invitations`
-- Code d'appairage à 6 caractères, expiration 24h.
-- La génération et la consommation du code (logique d'appairage) seront
-- implémentées en Phase 0.5 via des fonctions SECURITY DEFINER.

create table public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  inviter_profile_id uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);

create index family_invitations_code_idx on public.family_invitations (code);
