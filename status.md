# 📊 État d'Avancement du Projet : Co-Todo

Ce fichier sert de Source de Vérité unique pour le suivi du développement. Les cases doivent être cochées (`- [x]`) à la fin de chaque build, de chaque implémentation de fonctionnalité ou de chaque fusion de branche (Pull Request) par Claude Code ou par toi-même.

---

## 🏗️ Phase 0 : Configuration de l'Environnement & Initialisation
- [x] Initialiser l'application avec Vite (`react-ts`)
- [x] Installer et configurer Tailwind CSS (via `@tailwindcss/vite` — Tailwind v4, sans `postcss`/`autoprefixer`)
- [x] Installer le client JavaScript Supabase (`@supabase/supabase-js`)
- [x] Installer le framework de test Vitest
- [x] Configurer les variables d'environnement locales dans `.env`
- [x] Initialiser le dépôt Git local et configurer le fichier `.gitignore`
- [x] Créer le dépôt GitHub distant et lier la branche `main`

---

## 🔐 Phase 0.5 : Onboarding, Authentification & Appairage (RGPD)
**Branche cible :** `feature/auth-onboarding`
- [x] Concevoir la page d'accueil d'onboarding (Présentation de l'application en 3 points clés)
- [x] Développer le formulaire de Connexion avec gestion explicite des erreurs Supabase Auth
- [x] Créer le formulaire d'Inscription (Email, Password, Prénom inséré dans les options de métadonnées)
- [x] Intégrer la case à cocher de consentement RGPD obligatoire et bloquante pour l'inscription
- [x] Créer la page de paramètres "Mon Compte" (Modification du prénom, label parent, couleur d'avatar)
- [x] Développer le module d'appairage : Génération du code unique à 6 caractères de synchronisation familiale
- [x] Développer le module d'appairage : Liaison des deux comptes via le code (Assignation du même `family_id`)
- [x] Implémenter le bouton d'action "Supprimer mon compte" connecté à la fonction d'anonymisation
- [x] *(non anticipé)* Créer les fonctions RPC Supabase `generate_family_invitation`, `redeem_family_invitation` et `anonymize_account` (migration `pairing_and_anonymization_rpc`)
- [x] Valider et fusionner la Pull Request sur GitHub
- [ ] *(non anticipé · différé)* Passe E2E du parcours de **connexion dans l'UI** — bloquée pendant les tests par le rate-limit Supabase Auth ; logique d'appairage, RLS et anonymisation déjà validées via SQL

---

## 🗄️ Phase 1 : Base de Données & Sécurité Cloisonnée (Supabase SQL)
**Branche cible :** `feature/supabase-schema`
- [x] Créer l'architecture des dossiers `/supabase/migrations/`
- [x] Générer le script SQL de migration `01_create_tasks_table.sql` et la table intermédiaire `family_invitations`
- [x] Définir la structure stricte de la table `tasks` (ID, temporal_planning JSON, sub_tasks JSON...)
- [x] Définir la table publique `profiles` connectée à `auth.users` via un trigger PostgreSQL automatique
- [x] Activer les Row Level Security (RLS) sur Supabase pour toutes les tables publiques
- [x] Implémenter la politique RLS de cloisonnement strict par `family_id`
- [x] Exécuter la migration sur l'instance Supabase en production
- [x] Valider et fusionner la Pull Request sur GitHub

---

## 🎨 Phase 1.5 : Design System & Charte Graphique *(non anticipée)*
**Branche cible :** `feature/design-system`
> Étape ajoutée a posteriori : intégration de la charte, du logo et des wireframes réalisés sur Claude Design, comme fondation visuelle des phases UI (2, 3, 3.5).
- [x] Récupérer la charte graphique, le logo et les wireframes (export Claude Design)
- [x] Intégrer le logo « deux cercles » conforme RGAA AA + favicon (`public/logo.svg`)
- [x] Charger les polices Atkinson Hyperlegible (texte) + JetBrains Mono (chiffres/labels)
- [x] Exposer les tokens de la charte en utilitaires Tailwind via `@theme` (couleurs, typo, rayons)
- [x] Restyler l'onboarding, la connexion, l'inscription et la page compte selon la charte
- [x] Versionner les fichiers de design de référence (Brand & UI Kit, Hi-Fi, logo) dans `design/`
- [x] Valider et fusionner la Pull Request sur GitHub

---

## 📱 Phase 2 : Dashboard "Focus Action" Mobile-First & Accessible
**Branche cible :** `feature/dashboard-ui`
- [x] Développer la structure de page adaptative (Mobile-First 1 colonne / Desktop multi-colonnes)
- [x] Implémenter l'en-tête contenant la jauge d'équilibre textuelle (Accessible daltonisme)
- [x] Créer le conteneur d'onglets (Tabs) interactifs : "Mes tâches" et "À prendre"
- [x] Concevoir le design des cartes de tâches à fort contraste (Ratio 4.5:1 min)
- [x] Intégrer les boutons de validation rapide à droite (Cible tactile de 44x44px min)
- [x] Ajouter l'alternative clavier et lecteur d'écran (Bouton d'action standard) pour le Pool de tâches
- [x] Intégrer le bouton de création de tâche *(FAB remplacé par un bouton « Créer une tâche » à la demande)*
- [x] Valider et fusionner la Pull Request sur GitHub

---

## 📝 Phase 3 : Formulaire à Divulgation Progressive & Moteur de Points
**Branche cible :** `feature/advanced-task-form`
- [x] Créer la vue initiale minimale du formulaire (Titre, assignation, échéance)
- [x] Implémenter le bouton d'extension de planification avancée (`+ Options de planification et récurrence`)
- [x] Développer les champs temporels avancés (Date de début, heure de la tâche)
- [x] Configurer le sous-formulaire de récurrence (Journalière, Hebdomadaire, Mensuelle, Annuelle)
- [x] Implémenter le sélecteur de rappels personnalisés
- [x] Coder l'algorithme de calcul en temps réel du "Bonus de Planification" (+2, +5, +10 pts)
- [x] Intégrer le widget visuel d'incitation affichant le bonus estimé en haut du formulaire
- [x] Sécuriser les formulaires en liant des balises `<label>` persistantes au-dessus de chaque input
- [x] Valider et fusionner la Pull Request sur GitHub
- [x] *(reporté Phase 5 → fait)* Attribution effective des points aux profils (5+bonus à la création, 15 à l'exécution)

---

## 🌤️ Phase 3.5 : Module Météo & Conseils Logistiques d'Habillage
**Branche cible :** `feature/weather-clothing-widget`
- [x] Ajouter le champ de configuration géographique (`postal_code` ou `city`) dans la table liée à la famille *(table `families`)*
- [x] Développer le service d'appel API asynchrone vers Open-Meteo (Sans clé API, respect de la vie privée)
- [x] Implémenter l'algorithme d'analyse météo et de conversion en recommandations textuelles d'habillement enfants
- [x] Concevoir le composant d'interface compact `WeatherWidget.tsx` pour l'en-tête du Dashboard
- [x] Assurer la conformité RGAA (Textes alternatifs obligatoires sur les icônes météo, contrastes conformes)
- [x] Valider et fusionner la Pull Request sur GitHub

---

## 🔒 Phase 4 : Confidentialité & Protection des Données (RGPD)
**Branche cible :** `security/privacy-features`
- [x] Configurer un message d'avertissement sous les champs de texte libre pour interdire la saisie de données sensibles
- [x] Développer l'utilitaire d'anonymisation irréversible en cas de suppression de compte (Remplacement par "Ex-coparent") *(livré en Phase 0.5)*
- [x] Implémenter la logique d'effacement automatique des données complétées après 24 mois glissants *(fonction + pg_cron quotidien)*
- [x] Auditer le code pour s'assurer qu'aucune variable ou clé API Supabase n'est écrite en dur (Vérification des variables `VITE_`)
- [x] Valider et fusionner la Pull Request sur GitHub

---

## ⛓️ Phase 5 : Fiabilité & Stratégie de Tests (Vitest)
**Branche cible :** `test/points-logic`
- [x] Ajouter le script `"test": "vitest"` dans le fichier `package.json`
- [x] Rédiger les tests unitaires pour le Bonus de Planification Minimal (+2 pts)
- [x] Rédiger les tests unitaires pour le Bonus de Planification Partiel (+5 pts)
- [x] Rédiger les tests unitaires pour le Bonus "Zéro Cerveau" (+10 pts)
- [x] Rédiger le test de validation d'attribution exclusive des 15 points d'exécution à l'ID `assigned_to`
- [x] Rédiger le test vérifiant que la complétude des sous-tâches individuelles rapporte strictement 0 pt
- [x] Exécuter la suite complète de tests locaux au statut vert *(13/13)*
- [x] Valider et fusionner la dernière Pull Request sur GitHub
- [x] *(reporté Phase 3 → fait)* Attribution effective des points aux profils (création 5+bonus, exécution 15) via triggers Postgres

---

## 🚀 Phase 6 : Déploiement & Durcissement *(non anticipée)*
**Branches cibles :** `chore/vercel-config`, `feature/auth-captcha`
> Étapes ajoutées après le plan initial : mise en production et sécurité de l'authentification.
- [x] Config Vercel `vercel.json` (réécritures SPA pour react-router)
- [x] Déploiement en production sur Vercel — https://co-todo.vercel.app (CI/CD à chaque push sur `main`)
- [x] Configuration des variables d'env Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [x] Parcours complet validé en prod (inscription → confirmation → connexion → création/complétion → jauge de points)
- [x] CAPTCHA Cloudflare Turnstile sur Connexion & Inscription (conditionnel à `VITE_TURNSTILE_SITE_KEY`)
- [x] *(côté dashboard)* Activer la protection CAPTCHA dans Supabase (Auth → Attack Protection) + `VITE_TURNSTILE_SITE_KEY` dans Vercel
- [x] *(côté dashboard)* SMTP perso (Brevo) pour la délivrabilité email — emails de confirmation reçus, fini les bounces
- [ ] *(côté dashboard, recommandé)* Activer « Leaked Password Protection » (Auth → Password protection)
