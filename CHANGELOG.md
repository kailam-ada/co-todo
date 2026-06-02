# Changelog

Toutes les modifications notables de Co-Todo sont consignées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

Versions `0.x` : l'application est en construction active, l'API et le schéma de
données peuvent encore évoluer.

## [0.19.0] - 2026-06-03
### Ajouté
- Synchronisation en temps réel entre co-parents (D2) : les créations,
  complétions, réattributions et mises à jour de points apparaissent sans
  rafraîchir, via Supabase Realtime (`tasks` et `profiles`).

## [0.18.0] - 2026-06-03
### Ajouté
- Modèles de tâches réutilisables (C5) : « Transformer en modèle » depuis la
  fenêtre de détail, et « Partir d'un modèle » qui pré-remplit le formulaire de
  création (les dates sont laissées à renseigner).
- Gestion des modèles : suppression depuis le sélecteur de création.
- Table `task_templates` cloisonnée par foyer (RLS) + 9 tests unitaires de
  mapping tâche ⇆ modèle.

## [0.17.0] - 2026-06-03
### Ajouté
- Étiquettes (tags) libres et colorées sur les tâches : création à la volée,
  couleur déterministe issue de la charte, dédoublonnage et limite à 6 tags.
- Éditeur d'étiquettes avec suggestions des tags déjà utilisés dans le foyer
  (création de tâche et fenêtre de détail).
- Filtre par étiquette et recherche élargie aux tags dans la Réserve.
- 17 tests unitaires couvrant la logique d'étiquettes (`src/lib/tags.ts`).
### Sécurité
- Migration additive `tasks.tags jsonb`, cloisonnée par `family_id` via RLS.

## [0.16.0] - 2026-06-03
### Ajouté
- Glisser-déposer dans la Réserve pour (ré)assigner une tâche à un parent
  (A5), avec alternative clavier conforme RGAA.

## [0.15.1] - 2026-06-03
### Corrigé
- Barre d'onglets mobile manquante sur la page de création de tâche.

## [0.15.0] - 2026-06-03
### Ajouté
- Jauge d'équilibre calculée par période (cette semaine / ce mois-ci) (A7).
- Tableau de bord sur deux colonnes en desktop (A8).

## [0.14.0] - 2026-06-03
### Ajouté
- Toasts de confirmation avec action « Annuler » (undo), y compris la
  réinversion des points (D1).
- Barre de recherche des tâches dans la Réserve (A6).

## [0.13.0] - 2026-06-02
### Ajouté
- Formulaire de création avancé : cartes d'attribution visuelles, projection
  « Impact sur la jauge » en direct, champs Lieu et Notes (Phase 10).

## [0.12.0] - 2026-06-02
### Ajouté
- Fenêtre de détail d'une tâche : sous-tâches cochables, réattribution
  (Moi / Coparent / Les deux / Réserve), report d'échéance, indicateurs
  d'urgence et de bonus sur les cartes (Phase 9).

## [0.11.0] - 2026-06-02
### Ajouté
- Écran « Réserve de tâches » dédié avec navigation haute et barre d'onglets
  mobile, filtres (chips) et tri (échéance / points / création) (Phase 8).

## [0.10.0] - 2026-06-02
### Ajouté
- Assignation partagée « Les deux — 50/50 » : tâche co-détenue par les deux
  parents, créditant +7 points à chacun à la complétion (Phase 7).

## [0.9.0] - 2026-06-02
### Ajouté
- Déploiement en production sur Vercel (CI/CD au push sur `main`) avec
  réécritures SPA pour react-router.
- Protection CAPTCHA Cloudflare Turnstile sur la connexion et l'inscription.
### Modifié
- Délivrabilité des e-mails de confirmation via SMTP personnalisé (Brevo).

## [0.8.0] - 2026-06-02
### Ajouté
- Moteur de points : attribution effective aux profils (création + bonus,
  exécution) via déclencheurs PostgreSQL.
- Suite de tests Vitest validant les bonus de planification et les règles
  d'attribution (Phase 5).

## [0.7.0] - 2026-06-02
### Ajouté
- Avertissements sous les champs de texte libre contre la saisie de données
  sensibles.
- Effacement automatique des données complétées après 24 mois glissants.
### Sécurité
- Anonymisation irréversible du compte à la suppression (« Ex-coparent »).
- Audit des secrets : aucune clé écrite en dur, variables `VITE_` uniquement
  (Phase 4).

## [0.6.0] - 2026-06-02
### Ajouté
- Module météo et conseils d'habillage des enfants via l'API Open-Meteo
  (sans clé, respectueuse de la vie privée), widget compact du dashboard
  conforme RGAA (Phase 3.5).

## [0.5.0] - 2026-06-02
### Ajouté
- Formulaire de création à divulgation progressive : planification avancée,
  récurrence, rappels, sous-tâches.
- Calcul en temps réel du « Bonus de Planification » (+2 / +5 / +10 pts) avec
  widget d'incitation (Phase 3).
### Modifié
- Remplacement du bouton flottant (FAB) par un bouton « Créer une tâche ».

## [0.4.0] - 2026-06-02
### Ajouté
- Tableau de bord « Focus Action » mobile-first : jauge d'équilibre textuelle
  accessible, onglets « Mes tâches » / « À prendre », cartes à fort contraste,
  validation rapide (cibles tactiles ≥ 44px) (Phase 2).

## [0.3.0] - 2026-06-02
### Ajouté
- Charte graphique Co-Todo : logo « deux cercles » conforme RGAA AA, polices
  Atkinson Hyperlegible et JetBrains Mono, tokens exposés en utilitaires
  Tailwind. Restylage de l'onboarding et des écrans d'authentification
  (Phase 1.5).

## [0.2.0] - 2026-06-02
### Ajouté
- Onboarding, inscription et connexion (Supabase Auth) avec consentement RGPD
  bloquant.
- Page « Mon Compte » (prénom, label parent, couleur d'avatar).
- Appairage familial par code à 6 caractères (zéro e-mail tiers) et
  suppression de compte connectée à l'anonymisation (Phase 0.5).

## [0.1.0] - 2026-06-02
### Ajouté
- Initialisation du projet : Vite + React + TypeScript, Tailwind CSS, Vitest,
  client Supabase (Phase 0).
- Schéma Supabase initial : tables `profiles`, `tasks`, `family_invitations`,
  trigger de création de profil et Row Level Security cloisonnée par
  `family_id` (Phase 1).

[0.19.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.19.0
[0.18.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.18.0
[0.17.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.17.0
[0.16.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.16.0
[0.15.1]: https://github.com/kailam-ada/co-todo/releases/tag/v0.15.1
[0.15.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.15.0
[0.14.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.14.0
[0.13.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.13.0
[0.12.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.12.0
[0.11.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.11.0
[0.10.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.10.0
[0.9.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.9.0
[0.8.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.8.0
[0.7.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.7.0
[0.6.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.6.0
[0.5.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.5.0
[0.4.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.4.0
[0.3.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.3.0
[0.2.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.2.0
[0.1.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.1.0
