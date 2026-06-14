# Changelog

Toutes les modifications notables de Co-Todo sont consignées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

Versions `0.x` : l'application est en construction active, l'API et le schéma de
données peuvent encore évoluer.

## [0.26.5] - 2026-06-14
### Sécurité
- En-têtes de réponse HTTP de sécurité ajoutés dans `vercel.json` sur toutes les
  routes : `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Strict-Transport-Security` (HSTS) et `Permissions-Policy`
  (géolocalisation, caméra, micro, paiement et USB désactivés).
- Configuration Dependabot (`.github/dependabot.yml`) : mises à jour de
  dépendances hebdomadaires, correctifs mineurs et patch groupés.

## [0.26.4] - 2026-06-14
### Ajouté
- Jeu d'essai serveur versionné (`supabase/tests/jeu_essai_recurrence.sql`) :
  vérifie en base la génération d'occurrence récurrente et le moteur de points,
  avec un **cas limite** (récurrence mensuelle 31 janv → 28 févr borné). Profil
  de test éphémère + transaction annulée (`ROLLBACK`) → aucune donnée persistée.

## [0.26.3] - 2026-06-13
### Corrigé
- Jauge de charge sur mobile : le pourcentage d'un coparent à faible part
  n'apparaissait plus (segment trop étroit, texte rogné par `overflow-hidden`).
  Les segments tronquent désormais proprement le nom (`min-w-0`) en conservant
  le pourcentage, et la légende affiche `X% · N pts` pour chaque parent — le
  pourcentage reste lisible quelle que soit la largeur de la barre.

## [0.26.2] - 2026-06-13
### Ajouté
- Activation des rappels par e-mail : planification de l'edge function
  `send-reminders` toutes les 5 min via `pg_cron` + `pg_net` (migration
  `20260613120000_schedule_send_reminders_cron.sql`). Les secrets Brevo
  (`BREVO_API_KEY`, `REMINDER_SENDER_EMAIL`) sont configurés côté projet ; envoi
  validé en production (HTTP 200).

## [0.26.1] - 2026-06-13
### Modifié
- Sous-titre de la page Réserve : remplacement du terme technique « backlog »
  par une formulation plus accessible (« Les tâches partagées du foyer, à se
  répartir. »). Aucun changement de logique.

## [0.26.0] - 2026-06-12
### Ajouté
- Tests de composants (Vitest + Testing Library) : `Alert` (états succès /
  erreur / information, rôles ARIA `status` et `alert`), `TextField`
  (association label–champ, champ requis, cible tactile 44 px,
  `aria-describedby`, remontée `onChange`), `PlanningBonusWidget` (total estimé
  et étape de planification active) et `ProtectedRoute` (état de chargement,
  redirection en l'absence de session, rendu du contenu protégé). Suite portée
  à **102 tests** verts. Aucun changement de code applicatif.

### Sécurité
- Protection de la branche `main` sur GitHub : push forcé (`--force`) et
  suppression de la branche interdits, appliqués à tous. Aucune exigence de
  revue ni de status checks (flux solo conservé). *(réglage côté dépôt GitHub,
  sans changement de code.)*

## [0.25.1] - 2026-06-07
### Corrigé
- Affordance des éléments interactifs : les `<button>` (et `[role="button"]`,
  `<summary>`, libellés de cases à cocher / boutons radio) affichent désormais
  le curseur « main » au survol, et `not-allowed` lorsqu'ils sont désactivés.
  Règle CSS globale dans `index.css` — auparavant aucun élément n'avait
  `cursor: pointer`, rendant certains contrôles peu identifiables comme
  cliquables.

## [0.25.0] - 2026-06-07
### Ajouté
- Édition complète d'une tâche existante : bouton « Modifier » dans le détail
  d'une tâche (tableau de bord et réserve) ouvrant le formulaire pré-rempli
  (route `/modifier/:id`). Tous les champs sont modifiables — titre,
  assignation, dates de début/échéance, heure, **récurrence**, rappel, lieu,
  notes, sous-tâches et étiquettes.
### Note
- Les points de création (5 + bonus) ne sont pas recalculés ni re-crédités lors
  d'une édition : ils restent figés à la création (les triggers d'attribution
  ne se déclenchent qu'à l'INSERT ou au passage à `COMPLETED`). Fonctionnalité
  entièrement côté client, sans migration de base.

## [0.24.0] - 2026-06-03
### Modifié
- Politique de robustesse des mots de passe renforcée : 8 caractères minimum
  avec au moins une majuscule, une minuscule, un chiffre et un caractère
  spécial. Appliquée à l'inscription, à la réinitialisation et au changement de
  mot de passe (fonction partagée `validatePasswordStrength`).
- Inscription : validation côté client du mot de passe avant l'appel Supabase
  (auparavant aucune vérification locale). Textes d'aide et message d'erreur
  Supabase (`weak_password`) alignés sur la nouvelle politique.
### Note
- *(côté dashboard, recommandé)* Aligner la politique côté serveur dans Supabase
  (Auth → Password requirements) : longueur ≥ 8 et caractères requis, pour que
  la règle soit aussi appliquée hors du formulaire.

## [0.23.0] - 2026-06-03
### Ajouté
- Pages légales : politique de confidentialité (`/confidentialite`), mentions
  légales (`/mentions-legales`) et conditions générales d'utilisation (`/cgu`),
  avec une mise en page partagée et une navigation croisée entre les trois.
- Liens légaux en pied de page de l'accueil et liens cliquables réels dans la
  case de consentement de l'inscription (politique de confidentialité + CGU),
  qui remplacent l'ancien texte non cliquable.

## [0.22.0] - 2026-06-03
### Ajouté
- Mot de passe oublié : page de demande (`/mot-de-passe-oublie`) avec e-mail de
  réinitialisation, et page de définition d'un nouveau mot de passe
  (`/reinitialiser-mot-de-passe`) via le lien reçu. Lien « Mot de passe oublié ? »
  sur la page de connexion.
- Changement de mot de passe depuis « Mon compte » (nouveau mot de passe +
  confirmation).
### Note
- Côté dashboard Supabase : ajouter `…/reinitialiser-mot-de-passe` aux Redirect
  URLs (Auth → URL Configuration) pour les environnements concernés.

## [0.21.0] - 2026-06-03
### Ajouté
- Rappels de tâches par e-mail (E2) : suivi `reminder_sent_at`, fonction
  `due_task_reminders()` qui liste les rappels dus et leurs destinataires
  (parent assigné, ou tous les parents actifs si la tâche est partagée ou en
  réserve), et edge function `send-reminders` qui envoie via Brevo.
- Affichage du rappel configuré dans la fenêtre de détail d'une tâche.
### Note
- L'envoi nécessite, côté dashboard Supabase : les secrets `BREVO_API_KEY` /
  `REMINDER_SENDER_EMAIL` de l'edge function et sa planification (Cron).

## [0.20.0] - 2026-06-03
### Ajouté
- Génération automatique des occurrences récurrentes (E1) : compléter une tâche
  récurrente datée crée la prochaine occurrence (dates avancées d'un pas, sous-
  tâches réinitialisées).
- Aperçu « prochaine occurrence » dans la fenêtre de détail d'une tâche
  récurrente.
### Modifié
- Les points de création (5 + bonus) ne sont attribués qu'à la première
  occurrence ; les occurrences régénérées (`auto_generated`) ne les recréditent
  pas. Les points d'exécution restent dus à chaque complétion.

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

[0.22.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.22.0
[0.21.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.21.0
[0.20.0]: https://github.com/kailam-ada/co-todo/releases/tag/v0.20.0
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
