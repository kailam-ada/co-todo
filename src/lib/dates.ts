import type { TemporalPlanning } from '../types'

/**
 * Échéance compacte façon maquette : « VEN » si l'échéance tombe dans les
 * 7 prochains jours, sinon « 4 JUIN ». Renvoie null si aucune échéance.
 */
export function formatDue(planning: TemporalPlanning): string | null {
  const end = planning.end_date
  if (!end) return null

  const date = new Date(end)
  if (Number.isNaN(date.getTime())) return null

  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
  const diffDays = Math.round(
    (date.getTime() - startOfToday.getTime()) / 86_400_000,
  )

  if (diffDays >= 0 && diffDays < 7) {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
      .format(date)
      .replace('.', '')
      .toUpperCase()
  }

  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
    .format(date)
    .replace('.', '')
    .toUpperCase()
}
