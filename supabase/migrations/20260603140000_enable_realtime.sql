-- Phase 11 (D2) — Activer Supabase Realtime sur les tables synchronisées entre
-- co-parents. La RLS continue de filtrer les évènements reçus par foyer.
-- Idempotent : on n'ajoute la table à la publication que si elle n'y est pas.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;
