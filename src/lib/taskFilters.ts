import type { Task } from '../types'

export type TaskFilter = 'all' | 'unassigned' | 'week' | 'points'
export type TaskSort = 'due' | 'points' | 'created'

/** Seuil « Beaucoup de points » (valeur de création de la tâche). */
export const HIGH_POINTS_THRESHOLD = 10

function endTime(task: Task): number {
  const end = task.temporal_planning.end_date
  if (!end) return Number.POSITIVE_INFINITY
  const t = new Date(end).getTime()
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t
}

/** Filtre la liste de tâches selon le chip sélectionné. `now` injecté pour les tests. */
export function filterTasks(
  tasks: Task[],
  filter: TaskFilter,
  now: Date = new Date(),
): Task[] {
  switch (filter) {
    case 'unassigned':
      return tasks.filter((t) => t.assigned_to === null && !t.shared)
    case 'points':
      return tasks.filter((t) => t.points_value >= HIGH_POINTS_THRESHOLD)
    case 'week': {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime()
      const end = start + 7 * 86_400_000
      return tasks.filter((t) => {
        const e = endTime(t)
        return e >= start && e < end
      })
    }
    case 'all':
    default:
      return tasks
  }
}

export type TaskAccent = 'urgent' | 'bonus' | 'none'

/**
 * Indicateur visuel d'une tâche : `urgent` si l'échéance est aujourd'hui ou
 * passée, sinon `bonus` si la tâche vaut beaucoup de points, sinon `none`.
 */
export function taskAccent(task: Task, now: Date = new Date()): TaskAccent {
  const end = task.temporal_planning.end_date
  if (end) {
    const due = new Date(end)
    if (!Number.isNaN(due.getTime())) {
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      )
      const diffDays = Math.round(
        (due.getTime() - startOfToday.getTime()) / 86_400_000,
      )
      if (diffDays <= 0) return 'urgent'
    }
  }
  if (task.points_value >= HIGH_POINTS_THRESHOLD) return 'bonus'
  return 'none'
}

/** Trie une copie de la liste selon le critère choisi. */
export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const copy = [...tasks]
  switch (sort) {
    case 'points':
      return copy.sort((a, b) => b.points_value - a.points_value)
    case 'created':
      return copy.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
    case 'due':
    default:
      return copy.sort((a, b) => endTime(a) - endTime(b))
  }
}
