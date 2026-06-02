import type { TemporalPlanning } from '../types'

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Journalière',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
  yearly: 'Annuelle',
}

const FREQUENCIES = new Set<string>(['daily', 'weekly', 'monthly', 'yearly'])

export function isFrequency(value: unknown): value is Frequency {
  return typeof value === 'string' && FREQUENCIES.has(value)
}

/** Lit la fréquence d'un objet `recurrence` si elle est valide. */
export function recurrenceFrequency(
  recurrence: Record<string, unknown> | null,
): Frequency | null {
  const freq = recurrence?.frequency
  return isFrequency(freq) ? freq : null
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function format(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`
}

function addDays(y: number, m: number, d: number, n: number): string {
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + n)
  return format(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

/**
 * Ajoute `n` mois en bornant au dernier jour du mois cible, à l'identique de
 * PostgreSQL `+ interval '1 month'` (ex. 31 janv. + 1 mois = 28 févr.).
 */
function addMonths(y: number, m: number, d: number, n: number): string {
  const total = (m - 1) + n
  const ny = y + Math.floor(total / 12)
  const nm = (((total % 12) + 12) % 12) + 1
  const lastDay = new Date(Date.UTC(ny, nm, 0)).getUTCDate()
  return format(ny, nm, Math.min(d, lastDay))
}

/**
 * Date de la prochaine occurrence (chaîne `YYYY-MM-DD`) en avançant d'un pas de
 * récurrence. Miroir du trigger SQL `generate_next_occurrence`.
 */
export function nextOccurrenceDate(dateStr: string, freq: Frequency): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return dateStr
  switch (freq) {
    case 'daily':
      return addDays(y, m, d, 1)
    case 'weekly':
      return addDays(y, m, d, 7)
    case 'monthly':
      return addMonths(y, m, d, 1)
    case 'yearly':
      return addMonths(y, m, d, 12)
  }
}

/**
 * Échéance de la prochaine occurrence si la tâche est récurrente ET a une
 * échéance (condition de génération côté serveur). `null` sinon.
 */
export function nextOccurrenceEnd(
  recurrence: Record<string, unknown> | null,
  planning: TemporalPlanning,
): string | null {
  const freq = recurrenceFrequency(recurrence)
  const end = planning.end_date
  if (!freq || !end) return null
  return nextOccurrenceDate(end, freq)
}
