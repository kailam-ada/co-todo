-- Phase 10 — Champs « Lieu » et « Notes » sur les tâches.
alter table public.tasks
  add column if not exists location text,
  add column if not exists notes text;
