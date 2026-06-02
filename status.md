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
- [ ] Concevoir la page d'accueil d'onboarding (Présentation de l'application en 3 points clés)
- [ ] Développer le formulaire de Connexion avec gestion explicite des erreurs Supabase Auth
- [ ] Créer le formulaire d'Inscription (Email, Password, Prénom inséré dans les options de métadonnées)
- [ ] Intégrer la case à cocher de consentement RGPD obligatoire et bloquante pour l'inscription
- [ ] Créer la page de paramètres "Mon Compte" (Modification du prénom, label parent, couleur d'avatar)
- [ ] Développer le module d'appairage : Génération du code unique à 6 caractères de synchronisation familiale
- [ ] Développer le module d'appairage : Liaison des deux comptes via le code (Assignation du même `family_id`)
- [ ] Implémenter le bouton d'action "Supprimer mon compte" connecté à la fonction d'anonymisation
- [ ] Valider et fusionner la Pull Request sur GitHub

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

## 📱 Phase 2 : Dashboard "Focus Action" Mobile-First & Accessible
**Branche cible :** `feature/dashboard-ui`
- [ ] Développer la structure de page adaptative (Mobile-First 1 colonne / Desktop multi-colonnes)
- [ ] Implémenter l'en-tête contenant la jauge d'équilibre textuelle (Accessible daltonisme)
- [ ] Créer le conteneur d'onglets (Tabs) interactifs : "Mes tâches" et "À prendre"
- [ ] Concevoir le design des cartes de tâches à fort contraste (Ratio 4.5:1 min)
- [ ] Intégrer les boutons de validation rapide à droite (Cible tactile de 44x44px min)
- [ ] Ajouter l'alternative clavier et lecteur d'écran (Bouton d'action standard) pour le Pool de tâches
- [ ] Intégrer le bouton flottant (FAB) de création de tâche
- [ ] Valider et fusionner la Pull Request sur GitHub

---

## 📝 Phase 3 : Formulaire à Divulgation Progressive & Moteur de Points
**Branche cible :** `feature/advanced-task-form`
- [ ] Créer la vue initiale minimale du formulaire (Titre, assignation, échéance)
- [ ] Implémenter le bouton d'extension de planification avancée (`+ Options de planification et récurrence`)
- [ ] Développer les champs temporels avancés (Date de début, heure de la tâche)
- [ ] Configurer le sous-formulaire de récurrence (Journalière, Hebdomadaire, Mensuelle, Annuelle)
- [ ] Implémenter le sélecteur de rappels personnalisés
- [ ] Coder l'algorithme de calcul en temps réel du "Bonus de Planification" (+2, +5, +10 pts)
- [ ] Intégrer le widget visuel d'incitation affichant le bonus estimé en haut du formulaire
- [ ] Sécuriser les formulaires en liant des balises `<label>` persistantes au-dessus de chaque input
- [ ] Valider et fusionner la Pull Request sur GitHub

---

## 🌤️ Phase 3.5 : Module Météo & Conseils Logistiques d'Habillage
**Branche cible :** `feature/weather-clothing-widget`
- [ ] Ajouter le champ de configuration géographique (`postal_code` ou `city`) dans la table liée à la famille
- [ ] Développer le service d'appel API asynchrone vers Open-Meteo (Sans clé API, respect de la vie privée)
- [ ] Implémenter l'algorithme d'analyse météo et de conversion en recommandations textuelles d'habillement enfants
- [ ] Concevoir le composant d'interface compact `WeatherWidget.tsx` pour l'en-tête du Dashboard
- [ ] Assurer la conformité RGAA (Textes alternatifs obligatoires sur les icônes météo, contrastes conformes)
- [ ] Valider et fusionner la Pull Request sur GitHub

---

## 🔒 Phase 4 : Confidentialité & Protection des Données (RGPD)
**Branche cible :** `security/privacy-features`
- [ ] Configurer un message d'avertissement sous les champs de texte libre pour interdire la saisie de données sensibles
- [ ] Développer l'utilitaire d'anonymisation irréversible en cas de suppression de compte (Remplacement par "Ex-coparent")
- [ ] Implémenter la logique d'effacement automatique des données complétées après 24 mois glissants
- [ ] Auditer le code pour s'assurer qu'aucune variable ou clé API Supabase n'est écrite en dur (Vérification des variables `VITE_`)
- [ ] Valider et fusionner la Pull Request sur GitHub

---

## ⛓️ Phase 5 : Fiabilité & Stratégie de Tests (Vitest)
**Branche cible :** `test/points-logic`
- [x] Ajouter le script `"test": "vitest"` dans le fichier `package.json`
- [ ] Rédiger les tests unitaires pour le Bonus de Planification Minimal (+2 pts)
- [ ] Rédiger les tests unitaires pour le Bonus de Planification Partiel (+5 pts)
- [ ] Rédiger les tests unitaires pour le Bonus "Zéro Cerveau" (+10 pts)
- [ ] Rédiger le test de validation d'attribution exclusive des 15 points d'exécution à l'ID `assigned_to`
- [ ] Rédiger le test vérifiant que la complétude des sous-tâches individuelles rapporte strictement 0 pt
- [ ] Exécuter la suite complète de tests locaux au statut vert
- [ ] Valider et fusionner la dernière Pull Request sur GitHub
