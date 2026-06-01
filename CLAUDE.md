# Configuration Système Co-Todo (Instructions Claude Code)

Ce fichier définit les directives architecturales, de style, de conformité réglementaire, de flux utilisateur et de fonctionnalités logistiques que Claude Code doit obligatoirement respecter pour toute modification ou création de code au sein du projet Co-Todo.

## 🛠️ Stack Technique & Commandes Clés
- **Frontend :** Vite + React + TypeScript + Tailwind CSS
- **Backend/BaaS :** Supabase (PostgreSQL, Auth, RLS)
- **Tests :** Vitest
- **Commande de Dev :** `npm run dev`
- **Commande de Test :** `npm run test`
- **Commande de Build :** `npm run build`

## 🎨 Normes de Code & Style Guide
- **TypeScript Strict :** Typage obligatoire de toutes les variables et fonctions, interdiction absolue d'utiliser `any`.
- **Composants :** Composants fonctionnels React typés avec des interfaces pour les Props (`interface Props`).
- **Styles :** Utilisation exclusive des classes utilitaires Tailwind CSS.
- **Git Flow :** Toujours travailler dans des branches de fonctionnalités isolées (`feature/`, `security/`, `test/`). Ne jamais écrire directement sur la branche `main`.
- **Commits :** Respecter scrupuleusement les *Conventional Commits* (`feat:`, `fix:`, `chore:`, `test:`, `security:`).

## 🔐 Tunnel d'Authentification & Gestion des Comptes
- **Onboarding :** Créer une interface d'accueil épurée présentant les 3 piliers (Focus action, Équilibre, Zéro culpabilité) avec des accès clairs aux formulaires.
- **Inscription (SignUp) :** Utiliser `auth.signUp` de Supabase. Les métadonnées d'inscription doivent impérativement inclure le prénom dans les options : `options: { data: { first_name: '...' } }`.
- **Consentement :** Le formulaire d'inscription doit obligatoirement inclure une checkbox de consentement RGPD non pré-cochée et bloquante.
- **Connexion (SignIn) :** Utiliser `auth.signInWithPassword` avec une gestion explicite et accessible des erreurs d'authentification.

## 🔗 Mécanisme d'Appairage Familial (Zéro Mail Tiers)
L'association de deux comptes sous un même foyer doit respecter le protocole d'échange sécurisé suivant :
1. **Génération :** Si l'utilisateur n'a pas de `family_id`, l'interface de gestion de compte permet de générer un code d'invitation unique à 6 caractères alphanumériques.
2. **Stockage :** Ce code est stocké de manière temporaire dans une table intermédiaire `family_invitations` avec l'ID du profil émetteur et une date d'expiration (24 heures).
3. **Consommation :** Le co-parent saisit ce code dans son interface. Le système valide le code, crée un nouvel `family_id` unique (UUID), et met à jour le champ `family_id` des deux profils correspondants, puis supprime l'invitation consommée.

## 🌤️ Module Météo & Conseil Habillage
- **Données :** Utiliser l'API météo gratuite et légère Open-Meteo API (sans clé API et respectueuse de la vie privée).
- **Localisation :** Récupérer la ville ou le code postal depuis les données de configuration de la famille liées au `family_id` dans Supabase (pas de géolocalisation GPS en direct, conforme RGPD).
- **Règles d'Habillage (Business Logic Front) :**
  - Si Pluie / Précipitations ➔ Afficher un indicateur textuel et icône "Imperméable / Parapluie 🌂"
  - Si Température < 12°C ➔ Afficher "Gros manteau requis 🧥"
  - Si Température entre 12°C et 18°C ➔ Afficher "Veste légère ou pull nécessaire 🧥"
  - Si Température > 22°C + Grand Soleil ➔ Afficher "Casquette & Crème solaire 🧢"
- **Accessibilité (RGAA) :** Les icônes météo (soleil, nuage, pluie) doivent obligatoirement avoir un équivalent textuel accessible (`aria-label` ou texte brut alternatif) pour les lecteurs d'écran.

## ♿ Contraintes d'Accessibilité (RGAA v4 / WCAG 2.2 AA)
Chaque composant UI généré doit valider ces 5 commandements ergonomiques :
1. **Reflow (10.11) :** Interface 100% responsive (de 320px à 1920px), aucun défilement horizontal toléré.
2. **Contrastes (3.2) :** Ratio minimal de 4.5:1 pour le texte courant et 3:1 pour les composants graphiques, icônes et bordures.
3. **Indépendance de la couleur (2.1) :** Ne jamais transmettre une information (scores, jauges, erreurs) uniquement par la couleur. Toujours doubler avec du texte brut ou des icônes descriptives.
4. **Formulaires (11.1) :** Chaque balise `<input>` doit obligatoirement être associée à un `<label>` persistant positionné visuellement au-dessus d'elle.
5. **Cibles tactiles :** Tous les boutons et éléments interactifs doivent mesurer au minimum 44x44px sur mobile. Doubler systématiquement les mécanismes de glisser-déposer par des boutons d'action navigables au clavier.

## 🔒 Règles de Confidentialité & Sécurité (RGPD - Privacy by Design)
1. **Minimisation :** Interdiction de collecter des données d'identité nominatives ou sensibles pour les mineurs (utiliser uniquement des prénoms ou pseudonymes).
2. **Cloisonnement (RLS) :** Toutes les requêtes vers les tables (`tasks`, `profiles`) doivent être filtrées par le token utilisateur actif et valider l'appartenance stricte au `family_id` via les Row Level Security de Supabase.
3. **Droit à l'oubli (Art. 17) :** L'action "Supprimer mon compte" doit déclencher une fonction d'anonymisation irréversible. La ligne du profil passe son statut à `"ANONYMIZED"`, l'email et le prénom sont purgés, et l'affichage chez le co-parent devient `"Ex-coparent"` afin de préserver l'intégrité de l'historique des tâches de ce dernier.
4. **Secrets :** Utiliser exclusivement des variables d'environnement préfixées par `VITE_`. Interdiction d'écrire une clé API ou un identifiant en dur dans le code.

## 🧮 Algorithme du Moteur de Points (Règles Métier)
- **Création d'une tâche :** 5 pts octroyés au créateur (uniquement sur la première occurrence si la tâche est récurrente).
- **Bonus de Planification (Progressif) :**
  - `+2 pts` (Minimal) : Si seule la date de fin (échéance) est valide.
  - `+5 pts` (Partiel) : Si Date de début + Date de fin + Heure précise sont valides.
  - `+10 pts` (Total Zéro Cerveau) : Si le niveau Partiel est validé **ET** au moins une condition suivante est remplie : (Récurrence configurée OU Liste de sous-tâches non vide OU Rappel personnalisé configuré).
- **Exécution :** 15 pts attribués *exclusivement* au parent stocké dans le champ `assigned_to` au moment exact du passage de la tâche parente au statut `COMPLETED`.
- **Sous-tâches :** Rapportent strictement `0 pt` lors de leur validation individuelle (rôle de guidage méthodologique uniquement).
