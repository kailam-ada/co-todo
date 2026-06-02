-- Phase 10 (C3) — Étiquettes / tags libres colorés sur les tâches.
-- tags : [{ label, color }] — couleur dérivée de la charte, libellé libre.
alter table public.tasks
  add column if not exists tags jsonb not null default '[]'::jsonb;
