/* ----------------------------------------------------------------------
   Moteur de points Co-Todo — fonctions pures (testées en Phase 5).
   Règles métier (CLAUDE.md) :
   - Création : 5 pts de base au créateur (1re occurrence si récurrente).
   - Bonus de planification (progressif) :
       +2  (Minimal) : au moins l'échéance (date de fin) est valide.
       +5  (Partiel) : date de début + date de fin + heure valides.
       +10 (Total)   : niveau Partiel ET (récurrence OU sous-tâches OU rappel).
   - Exécution : 15 pts au parent `assigned_to` au passage à COMPLETED.
   - Sous-tâches : 0 pt à la validation individuelle.
---------------------------------------------------------------------- */

export type BonusLevel = 'none' | 'minimal' | 'partial' | 'complete'

export interface PlanningInput {
  hasEndDate: boolean
  hasStartDate: boolean
  hasTime: boolean
  hasRecurrence: boolean
  hasSubtasks: boolean
  hasReminder: boolean
}

export interface PlanningBonus {
  level: BonusLevel
  bonus: 0 | 2 | 5 | 10
}

export const BASE_CREATION_POINTS = 5
export const EXECUTION_POINTS = 15

export function computePlanningBonus(input: PlanningInput): PlanningBonus {
  const partial = input.hasStartDate && input.hasEndDate && input.hasTime
  const complete =
    partial && (input.hasRecurrence || input.hasSubtasks || input.hasReminder)

  if (complete) return { level: 'complete', bonus: 10 }
  if (partial) return { level: 'partial', bonus: 5 }
  if (input.hasEndDate) return { level: 'minimal', bonus: 2 }
  return { level: 'none', bonus: 0 }
}

/** Points totaux octroyés au créateur (base + bonus de planification). */
export function creationPoints(input: PlanningInput): number {
  return BASE_CREATION_POINTS + computePlanningBonus(input).bonus
}

export interface ExecutionAward {
  recipientId: string | null
  points: number
}

/**
 * Attribution des 15 pts d'exécution au passage à COMPLETED : exclusivement
 * au parent stocké dans `assigned_to`. Aucune attribution si non assignée.
 */
export function executionPointsFor(assignedTo: string | null): ExecutionAward {
  if (!assignedTo) return { recipientId: null, points: 0 }
  return { recipientId: assignedTo, points: EXECUTION_POINTS }
}

/** Une sous-tâche validée individuellement ne rapporte aucun point. */
export const SUBTASK_COMPLETION_POINTS = 0
export function subtaskCompletionPoints(): number {
  return SUBTASK_COMPLETION_POINTS
}
