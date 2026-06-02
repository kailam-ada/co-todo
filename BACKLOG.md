# 📋 Backlog produit — Co-Todo

Écarts entre la maquette **Hi-Fi** (`design/Co-Todo Hi-Fi.html`) et l'app livrée (phases 0→5 + déploiement).
Sert de feuille de route pour les prochaines itérations.

**Légende**
- Priorité : **P1** (haute / structurant) · **P2** (moyenne) · **P3** (plus tard)
- Effort : **S** (≈ ½ j) · **M** (1–2 j) · **L** (3 j +)
- Les estimations sont indicatives, à ajuster.

---

## 🧭 Épic A — Réserve de tâches & navigation

| # | Item | Prio | Effort | Notes |
|---|------|------|--------|-------|
| A1 | Écran **Réserve de tâches** dédié (route `/reserve`) | P1 | M | Remplace/complète l'onglet « À prendre » du dashboard |
| A2 | Nav haute **Tableau de bord / Réserve** + **barre d'onglets mobile** (bas) | P1 | S | `.mobile-tabbar` de la maquette |
| A3 | **Filtres** (chips : Toutes, Non attribuées, Cette semaine, Beaucoup de points) | P1 | M | |
| A4 | **Tri** (échéance / points / date de création) | P2 | S | |
| A5 | **Glisser-déposer** vers *buckets* parent pour attribuer | P2 | L | Garder l'alternative bouton « Prendre » (RGAA) |
| A6 | **Barre de recherche** de tâches | P2 | M | |
| A7 | **Sélecteur de période** fonctionnel (Ce mois-ci / Cette semaine) | P2 | M | Impacte la jauge + les listes |
| A8 | **Dashboard 2 colonnes** desktop (Mes tâches + Réserve) | P3 | S | Aujourd'hui : onglets |

## 🗂️ Épic B — Détail & cycle de vie d'une tâche

| # | Item | Prio | Effort | Notes |
|---|------|------|--------|-------|
| B1 | **Modal de détail** (clic sur une carte) | P1 | M | Détails, responsable, actions |
| B2 | **Sous-tâches cochables** après création (affichage + toggle persisté) | P1 | M | Update `sub_tasks` JSON ; 0 pt (règle métier) |
| B3 | **Réattribuer** une tâche (Moi / Coparent / Les deux) | P1 | S | |
| B4 | **Reporter** (replanifier l'échéance) | P2 | S | |
| B5 | **Indicateurs urgence / bonus** sur les cartes (bordure colorée) | P2 | S | `.task-row.urgent` / `.bonus` |

## 📝 Épic C — Formulaire de création avancé

| # | Item | Prio | Effort | Notes |
|---|------|------|--------|-------|
| C1 | **Cartes d'attribution** visuelles + **« Les deux — 50/50 »** | P1 | M | Voir décision modèle ci-dessous |
| C2 | Rail **« Impact sur la jauge »** + total estimé live | P2 | M | Effet de la tâche sur l'équilibre A/B |
| C3 | **Tags / étiquettes** (avec catégories) | P2 | M | DB : `tags jsonb` sur tasks, ou table dédiée |
| C4 | Champs **Lieu** + **Notes** | P2 | S | DB : `location text`, `notes text` |
| C5 | **Modèles** (partir d'une tâche récurrente) + « Transformer en modèle » | P3 | L | DB : table `task_templates` |

## 🔔 Épic D — Feedback & temps réel

| # | Item | Prio | Effort | Notes |
|---|------|------|--------|-------|
| D1 | **Toasts** de confirmation + **« Annuler »** (undo) | P1 | M | Transverse (validation, attribution…) |
| D2 | **Temps réel** Supabase (Realtime) entre co-parents | P3 | M | Hors maquette, cohérent avec le partage |

## ⚙️ Épic E — Logique métier

| # | Item | Prio | Effort | Notes |
|---|------|------|--------|-------|
| E1 | **Génération des occurrences récurrentes** (+ « 5 pts 1re occurrence ») | P2 | L | Cron ou création à la complétion |
| E2 | **Rappels réels** (notifications) | P3 | L | Infra : edge function/cron + canal (email/push) |

---

## 🗄️ Impacts base de données à prévoir

- **tasks** : ajouter `location text`, `notes text`, `tags jsonb` (ou tables dédiées tags).
- **« Les deux — 50/50 »** : le modèle actuel a `assigned_to` (un seul UUID) ou `null`. Décision à prendre :
  - option simple : champ `shared boolean` (partage 50/50 entre les 2 parents), l'attribution des points d'exécution se répartit ;
  - ou table d'assignation multiple. → **à cadrer avant C1/B3.**
- **task_templates** : nouvelle table (titre, planning, sous-tâches, récurrence…) pour C5.
- **Récurrence (E1)** : générateur d'occurrences (pg_cron ou trigger à la complétion) ; adapter le trigger de points pour ne créditer la création que sur la 1re occurrence.

---

## 🚦 Séquencement recommandé (1 PR par lot)

1. **`feature/pool-screen`** — A2 + A1 + A3 + A4 (Réserve + nav + filtres + tri)
2. **`feature/task-detail`** — B1 + B2 + B3 + B4 + B5 (modal, sous-tâches, réattribuer, reporter, indicateurs)
3. **`feature/toasts`** — D1 (toasts + undo, transverse — peut être fait tôt)
4. **`feature/create-advanced`** — C1 + C4 + C2 (attribution + lieu/notes + impact jauge)
5. **`feature/tags`** — C3 · **`feature/pool-dnd`** — A5 · **`feature/search-period`** — A6 + A7
6. **`feature/recurrence`** — E1 · **`feature/templates`** — C5
7. **`feature/realtime`** — D2 · **`feature/reminders`** — E2

> Chaque lot suit le flux habituel : branche dédiée → tests/build verts → vérif navigateur → PR → merge, et mise à jour de `status.md`.
