import type { Task } from '../types'

export type Period = 'month' | 'week'

export const PERIOD_LABELS: Record<Period, string> = {
  month: 'Ce mois-ci',
  week: 'Cette semaine',
}

/** Début de la période sélectionnée (lundi pour la semaine, 1er du mois). */
export function periodStart(period: Period, now: Date = new Date()): Date {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'week') {
    const offset = (day.getDay() + 6) % 7 // lundi = 0
    day.setDate(day.getDate() - offset)
    return day
  }
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export interface PeriodPoints {
  a: number
  b: number
  total: number
}

/**
 * Points gagnés sur la période, calculés depuis les tâches :
 * - création : `points_value` au créateur (tâche créée dans la période)
 * - exécution : +15 à l'assigné, ou +7 à chaque parent si partagée
 *   (tâche complétée dans la période).
 */
export function periodPoints(
  tasks: Task[],
  start: Date,
  meId: string,
  coId: string | null,
): PeriodPoints {
  let a = 0
  let b = 0
  const s = start.getTime()

  for (const t of tasks) {
    if (t.created_by && new Date(t.created_at).getTime() >= s) {
      if (t.created_by === meId) a += t.points_value
      else if (coId && t.created_by === coId) b += t.points_value
    }
    if (
      t.status === 'COMPLETED' &&
      t.completed_at &&
      new Date(t.completed_at).getTime() >= s
    ) {
      if (t.shared) {
        a += 7
        if (coId) b += 7
      } else if (t.assigned_to === meId) {
        a += 15
      } else if (coId && t.assigned_to === coId) {
        b += 15
      }
    }
  }

  return { a, b, total: a + b }
}
