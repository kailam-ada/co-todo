# Co-Todo

> Application web responsive qui aide deux coparents à se répartir équitablement la **charge mentale** de l'organisation du foyer.

**Application en production :** [co-todo.vercel.app](https://co-todo.vercel.app)

---

## Présentation

### Le problème

Dans la plupart des foyers, l'organisation du quotidien (rendez-vous médicaux, activités des enfants, courses, logistique scolaire) repose sur une **charge mentale déséquilibrée**, le plus souvent invisible : anticiper, planifier et coordonner représentent un travail réel rarement reconnu. Les outils existants — agendas partagés, listes de tâches génériques, messageries — matérialisent les tâches **mais pas l'effort** et entretiennent des frictions émotionnelles (refuser une tâche oblige à se justifier).

### La solution

Co-Todo combine **trois piliers** :

- 🎯 **Focus action** — l'application met en avant la prochaine action concrète plutôt qu'une liste interminable
- ⚖️ **Équilibre** — une *jauge d'équité* visualise la répartition de la charge entre les deux parents
- 🤝 **Zéro culpabilité** — la *réserve* commune permet de ne pas prendre une tâche sans avoir à se justifier

L'innovation centrale est un **moteur de gamification à deux composantes** qui distingue :

- l'**effort de planification** (anticiper une échéance, configurer une récurrence, découper en sous-tâches) — récompensé à la création de la tâche
- l'**effort d'exécution** (réaliser la tâche) — récompensé à la complétion

### Fonctionnalités clés

- **Appairage familial sécurisé** par code à 6 caractères (aucun courriel tiers ne circule entre les comptes)
- **Réserve partagée** : tâches « à prendre » sans justification, glisser-déposer ou bouton dédié
- **Tâches partagées 50/50** entre les deux parents avec attribution équitable des points
- **Récurrence** (quotidienne / hebdomadaire / mensuelle / annuelle) avec génération automatique de la prochaine occurrence
- **Modèles de tâches** réutilisables
- **Module météo** (Open-Meteo) avec conseils d'habillage pour les enfants — sans géolocalisation GPS
- **Rappels par e-mail** avant l'échéance
- **Synchronisation temps réel** entre coparents
- **Accessibilité native** RGAA v4 / WCAG 2.2 AA (contrastes ≥ 4,5:1, cibles tactiles 44 px, indépendance de la couleur, *reflow* 320-1920 px)
- ***Privacy by design* RGPD** : cloisonnement par foyer via Row Level Security, anonymisation irréversible à la suppression de compte, hébergement européen (`eu-west-1`)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Build / dev server | **Vite** |
| Bibliothèque UI | **React 19** |
| Langage | **TypeScript** (mode strict, `any` interdit) |
| Styles | **Tailwind CSS v4** (charte centralisée par `@theme`) |
| Routage | **React Router** |
| Back-end *serverless* | **Supabase** (PostgreSQL, Auth, Row Level Security, Realtime, Edge Functions) |
| Tests | **Vitest** + Testing Library |
| Anti-bot | **Cloudflare Turnstile** (CAPTCHA respectueux de la vie privée) |
| E-mails | **Brevo** (SMTP + API transactionnelle) |
| Météo | **Open-Meteo** (gratuit, sans clé, sans pistage) |
| Hébergement | **Vercel** (CDN edge, déploiement continu) |

---

## Mise en place du projet (pas-à-pas)

Cette procédure permet de reconstituer une instance fonctionnelle à partir d'un poste vierge.

### Prérequis

- **Node.js ≥ 20** (le projet est développé sous Node 22) et **npm**
- **Git**
- Un compte **GitHub**, un compte **Supabase**, un compte **Vercel**
- *(optionnel)* Un compte **Brevo** pour la délivrabilité des e-mails et l'envoi des rappels

### Étape 1 — Récupérer le code

```bash
git clone https://github.com/kailam-ada/co-todo.git
cd co-todo
npm install            # installe les dépendances aux versions figées (package-lock.json)
```

### Étape 2 — Créer le back-end Supabase

1. Créer un **nouveau projet** sur [supabase.com](https://supabase.com) — région **`eu-west-1`** recommandée pour la conformité RGPD.
2. **Appliquer le schéma** en exécutant, dans l'ordre, les **19 migrations** du dossier [`supabase/migrations/`](supabase/migrations/) :
   - Via le **SQL Editor** du tableau de bord Supabase (copier-coller chaque migration dans l'ordre chronologique de leur préfixe),
   - **OU** via la **CLI Supabase** (recommandé) :
     ```bash
     npx supabase link --project-ref <votre-project-ref>
     npx supabase db push
     ```
   Cette étape crée toutes les tables (`families`, `profiles`, `tasks`, `family_invitations`, `task_templates`), les politiques **RLS**, les fonctions `SECURITY DEFINER` et les déclencheurs (moteur de points, génération d'occurrences récurrentes, etc.).
3. **Déployer l'Edge Function** des rappels par e-mail :
   ```bash
   npx supabase functions deploy send-reminders
   ```

### Étape 3 — Configurer les variables d'environnement

```bash
cp .env.example .env
```

Puis renseigner les **trois variables** dans `.env` (valeurs trouvées dans *Supabase Dashboard → Project Settings → API*) :

| Variable | Valeur | Détails |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://<votre-projet>.supabase.co` | URL de l'API Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (clé `anon` publique) | Clé publique côté client (les droits réels sont fixés par la RLS) |
| `VITE_TURNSTILE_SITE_KEY` | (laisser vide en local) | Clé publique CAPTCHA — utiliser la clé de test Cloudflare `1x00000000000000000000AA` pour activer le widget sans configuration |

Toutes ces variables sont préfixées `VITE_` car elles sont exposées au navigateur ; **aucun secret privé ne doit être placé ici**.

### Étape 4 — Lancer en local

```bash
npm run dev      # serveur de développement sur http://localhost:5173
npm run test     # (optionnel) vérifier que la suite Vitest est verte
```

L'application est immédiatement utilisable : il suffit de créer un compte et de cocher le consentement RGPD pour entrer.

### Étape 5 — Services tiers optionnels

#### CAPTCHA Cloudflare Turnstile (recommandé en production)

1. Créer un widget Turnstile sur [Cloudflare](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Renseigner `VITE_TURNSTILE_SITE_KEY` dans `.env`
3. Activer la protection dans *Supabase Dashboard → Auth → Attack Protection* (avec la clé secrète Turnstile)

#### Rappels par e-mail (Brevo)

1. Configurer le **SMTP Brevo** dans *Supabase Dashboard → Auth → SMTP Settings* (pour les e-mails de confirmation / réinitialisation de mot de passe)
2. Pour les rappels de tâches, définir les secrets de l'Edge Function depuis le tableau de bord Supabase :
   ```
   BREVO_API_KEY=<votre-clé-API-Brevo>
   REMINDER_SENDER_EMAIL=<adresse-expéditeur-vérifiée>
   ```
3. Planifier l'Edge Function via *Supabase Cron* (exécution régulière, par exemple toutes les 10 minutes)

### Étape 6 — Déployer en production (Vercel)

1. Connecter le dépôt GitHub à [Vercel](https://vercel.com) — le *framework* est détecté automatiquement (Vite)
2. Renseigner les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`) dans *Project Settings → Environment Variables*
3. Ajouter l'URL `https://<votre-domaine>/reinitialiser-mot-de-passe` aux **Redirect URLs** de *Supabase Dashboard → Auth → URL Configuration*
4. Chaque `push` sur `main` déclenche désormais le *build* et le déploiement automatiques. Chaque *pull request* génère un déploiement de prévisualisation dédié.

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement Vite sur `http://localhost:5173` (rechargement à chaud) |
| `npm run build` | Vérifie les types (`tsc -b`) **puis** produit le *build* de production dans `dist/`. Le typage doit passer pour que le *build* aboutisse. |
| `npm run test` | Exécute la suite de tests Vitest |
| `npm run lint` | Analyse statique ESLint sur l'ensemble du code |
| `npm run preview` | Sert le *build* de production localement (utile pour tester un livrable) |

---

## Architecture du dépôt

```
co-todo/
├── src/
│   ├── pages/         # Écrans (un fichier par route) — Dashboard, SignIn, SignUp, Reserve, …
│   ├── components/    # Composants d'interface réutilisables (TaskCard, TextField, Captcha, …)
│   ├── contexts/      # Fournisseurs d'état global (AuthProvider, ToastProvider)
│   ├── hooks/         # Hooks personnalisés (useDashboard, useFamilyRealtime, useTemplates, …)
│   ├── lib/           # Logique métier pure (points, taskFilters, recurrence, …) + tests unitaires
│   ├── assets/        # Images, icônes
│   ├── test/          # Configuration des tests
│   └── App.tsx, main.tsx, index.css, types.ts
├── supabase/
│   ├── migrations/    # 19 migrations SQL versionnées (schéma, RLS, fonctions, triggers)
│   └── functions/
│       └── send-reminders/  # Edge Function d'envoi des rappels e-mail
├── public/            # Assets statiques (favicon, robots.txt)
├── design/            # Sources de design (charte, wireframes)
├── CLAUDE.md          # Guide de contribution assistée par IA (règles non négociables)
├── CHANGELOG.md       # Historique des versions au format Keep a Changelog
├── BACKLOG.md         # Backlog priorisé (P1/P2/P3, effort S/M/L)
├── status.md          # Suivi d'avancement par phases
└── VERSION            # Version sémantique courante (actuellement 0.25.1)
```

L'architecture front est **organisée en couches** :

1. **Présentation** (`pages/`, `components/`)
2. **Logique applicative / état** (`contexts/`, `hooks/`)
3. **Métier pur et testable** (`lib/` — fonctions sans effet de bord)
4. **Accès aux données** (`lib/supabase.ts` — client `supabase-js`)

---

## Tests

La logique métier critique est couverte par des **tests unitaires Vitest**. Huit modules sont actuellement testés (`assignment`, `passwordValidation`, `periodPoints`, `points`, `recurrence`, `tags`, `taskFilters`, `templates`) — toutes les fonctions sont **pures**, donc testables sans base de données ni navigateur.

```bash
npm run test            # exécution unique
npm run test -- --watch # mode interactif
```

La suite doit être **verte avant toute fusion** de *pull request*.

---

## Workflow de contribution

Le projet suit un modèle ***feature branching*** discipliné, proche de *GitHub Flow* :

1. La branche `main` est **toujours déployable** ; aucun développement n'y est poussé directement. Elle est protégée côté GitHub (suppression et `force push` interdits).
2. Chaque fonctionnalité est développée dans une **branche dédiée** : `feature/…`, `fix/…`, `security/…`, `test/…`.
3. La livraison passe par une ***pull request* relue**, dont la fusion déclenche le déploiement Vercel.
4. Les commits suivent la convention **Conventional Commits** :

   ```
   feat: ajouter le module météo
   fix: corriger le bornage de récurrence mensuelle
   security: durcir la politique RLS sur task_templates
   test: étendre les cas du moteur de points
   chore: bumper VERSION en 0.25.1
   docs: enrichir le dictionnaire de données
   ```

5. **`npm run test` et `npm run build` doivent passer** avant chaque fusion.
6. Le fichier `status.md` est mis à jour à chaque fusion ; `CHANGELOG.md` et `VERSION` sont incrémentés à chaque lot livré.

---

## Sécurité & RGPD (en bref)

- **Cloisonnement par foyer** via Row Level Security : chaque opération sur `tasks`, `profiles`, `families`, `task_templates` est filtrée par le `family_id` de l'utilisateur courant. Aucun chemin d'accès ne peut le contourner, même en forgeant une requête.
- **Mots de passe** : hachés par Supabase Auth (`bcrypt`), jamais accessibles à l'application.
- **Politique de robustesse** : 8 caractères minimum, majuscule, minuscule, chiffre et caractère spécial (centralisée dans `lib/passwordValidation.ts`).
- **CAPTCHA** sur la connexion et l'inscription (Cloudflare Turnstile).
- **Minimisation RGPD** : seuls les prénoms sont collectés ; aucune donnée nominative ni sensible sur les mineurs.
- **Droit à l'oubli (art. 17)** : la suppression de compte déclenche une **anonymisation irréversible** (statut `ANONYMIZED`, e-mail et prénom purgés ; le coparent voit « Ex-coparent »).
- **Rétention** : une tâche planifiée `pg_cron` purge quotidiennement les tâches complétées de plus de **24 mois glissants**.
- **Secrets** : aucune clé n'est écrite en dur ; tout transite par les variables d'environnement (`VITE_` côté client, secrets serveur côté Edge Functions).

Les règles complètes (RGAA, moteur de points, *privacy by design*) sont formalisées dans [`CLAUDE.md`](CLAUDE.md).

---

## Documentation associée

| Fichier | Rôle |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Guide de contribution assistée par IA : stack, normes de code, accessibilité, RGPD, moteur de points |
| [`CHANGELOG.md`](CHANGELOG.md) | Historique des versions (format *Keep a Changelog*) |
| [`BACKLOG.md`](BACKLOG.md) | Backlog produit priorisé (priorités P1/P2/P3, effort S/M/L) |
| [`status.md`](status.md) | Suivi d'avancement par phases — source de vérité unique de l'état du projet |
| [`VERSION`](VERSION) | Version sémantique courante |

---

**Production :** [co-todo.vercel.app](https://co-todo.vercel.app) · **Dépôt :** [github.com/kailam-ada/co-todo](https://github.com/kailam-ada/co-todo)
