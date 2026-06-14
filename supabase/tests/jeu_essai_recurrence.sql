-- =============================================================================
-- Jeu d'essai serveur (CP9) — Génération d'occurrence récurrente & moteur de points
-- -----------------------------------------------------------------------------
-- Vérifie la logique exécutée EN BASE (triggers PostgreSQL), impossible à couvrir
-- par les tests unitaires côté client :
--   • generate_next_occurrence  (récurrence à la complétion)
--   • award_creation_points / award_execution_points  (moteur de points)
--
-- Couvre le NOMINAL **et un CAS LIMITE** : récurrence mensuelle d'une échéance au
-- 31 janvier → bornée au 28 février (parité avec « + interval '1 month' »).
--
-- ISOLATION TOTALE : un PROFIL DE TEST ÉPHÉMÈRE (`__e1_test__@cotodo.test`, dans son
-- propre foyer, id fixe `…0000e1`) est créé, utilisé, puis tout est annulé par ROLLBACK.
-- Aucune donnée réelle n'est touchée, rien n'est persisté, aucune table créée.
--
-- EXÉCUTION : coller l'intégralité dans l'éditeur SQL Supabase et lancer (Run).
-- La grille de contrôle (4 lignes, verdict « OK ») s'affiche avant l'annulation.
-- =============================================================================

begin;

-- 0) Profil de test éphémère. L'insertion dans auth.users déclenche le trigger
--    handle_new_user qui crée le profil (foyer dédié, points = 0). Annulé par ROLLBACK.
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values ('00000000-0000-4000-8000-0000000000e1',
        '__e1_test__@cotodo.test',
        '{"first_name":"E1-Test"}'::jsonb,
        'authenticated', 'authenticated');

-- 1) Jeu de données : 3 tâches mensuelles (nominal · cas limite · bascule d'année),
--    avec une seule échéance renseignée (bonus de planification attendu : +2 chacune).
insert into public.tasks (family_id, created_by, assigned_to, title, status,
                          temporal_planning, recurrence)
select (select family_id from public.profiles where id = '00000000-0000-4000-8000-0000000000e1'),
       '00000000-0000-4000-8000-0000000000e1',
       '00000000-0000-4000-8000-0000000000e1',
       '__E1_TEST__ ' || lbl, 'TODO',
       jsonb_build_object('end_date', d), '{"frequency":"monthly"}'::jsonb
from (values ('nominal',       '2026-06-10'),
             ('cas limite',    '2026-01-31'),
             ('bascule annee', '2026-12-15')) as v(lbl, d);

-- 2) Complétion → déclenche la génération de l'occurrence suivante (+15 pts d'exécution).
update public.tasks
set status = 'COMPLETED', completed_at = now()
where created_by = '00000000-0000-4000-8000-0000000000e1' and not auto_generated;

-- 3) CONTRÔLE UNIQUE (occurrences + points) — attendu vs obtenu, une grille.
--    Points : création 3 × (5 + 2 bonus échéance) = 21 · exécution 3 × 15 = 45 · total 66.
--    Les occurrences régénérées (auto_generated) NE re-créditent PAS la création.
select 'occurrence' as type,
       parent.title as controle,
       exp.attendu,
       occ.temporal_planning ->> 'end_date' as obtenu,
       case when occ.temporal_planning ->> 'end_date' = exp.attendu then 'OK' else 'KO' end as verdict
from public.tasks parent
join lateral (
  select temporal_planning from public.tasks o
  where o.created_by = parent.created_by and o.auto_generated and o.title = parent.title
  order by created_at desc limit 1
) occ on true
join (values ('__E1_TEST__ nominal',       '2026-07-10'),
             ('__E1_TEST__ cas limite',    '2026-02-28'),
             ('__E1_TEST__ bascule annee', '2027-01-15')) as exp(title, attendu)
  on exp.title = parent.title
where parent.created_by = '00000000-0000-4000-8000-0000000000e1' and not parent.auto_generated
union all
select 'points', 'delta profil de test', '66', p.points::text,
       case when p.points = 66 then 'OK' else 'KO' end
from public.profiles p
where p.id = '00000000-0000-4000-8000-0000000000e1'
order by type, controle;

-- 4) ROLLBACK : annule le profil de test, les tâches et les points.
--    (Aucune ligne « __E1_TEST__ » ni utilisateur de test ne subsiste en base.)
rollback;
