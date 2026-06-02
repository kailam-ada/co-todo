import { describe, it, expect } from 'vitest'
import {
  isFrequency,
  nextOccurrenceDate,
  nextOccurrenceEnd,
  recurrenceFrequency,
} from './recurrence'

describe('nextOccurrenceDate', () => {
  it('journalière : +1 jour', () => {
    expect(nextOccurrenceDate('2026-06-10', 'daily')).toBe('2026-06-11')
  })
  it('hebdomadaire : +7 jours', () => {
    expect(nextOccurrenceDate('2026-06-10', 'weekly')).toBe('2026-06-17')
  })
  it('hebdomadaire : franchit le mois', () => {
    expect(nextOccurrenceDate('2026-06-28', 'weekly')).toBe('2026-07-05')
  })
  it('mensuelle : +1 mois', () => {
    expect(nextOccurrenceDate('2026-06-10', 'monthly')).toBe('2026-07-10')
  })
  it('mensuelle : borne au dernier jour du mois (31 janv. → 28 févr.)', () => {
    expect(nextOccurrenceDate('2026-01-31', 'monthly')).toBe('2026-02-28')
  })
  it('mensuelle : décembre → janvier de l’année suivante', () => {
    expect(nextOccurrenceDate('2026-12-15', 'monthly')).toBe('2027-01-15')
  })
  it('annuelle : +1 an', () => {
    expect(nextOccurrenceDate('2026-06-10', 'yearly')).toBe('2027-06-10')
  })
  it('annuelle : 29 févr. bissextile → 28 févr.', () => {
    expect(nextOccurrenceDate('2028-02-29', 'yearly')).toBe('2029-02-28')
  })
})

describe('isFrequency / recurrenceFrequency', () => {
  it('valide les fréquences connues', () => {
    expect(isFrequency('weekly')).toBe(true)
    expect(isFrequency('none')).toBe(false)
    expect(isFrequency(undefined)).toBe(false)
  })
  it('lit la fréquence depuis un objet recurrence', () => {
    expect(recurrenceFrequency({ frequency: 'monthly' })).toBe('monthly')
    expect(recurrenceFrequency(null)).toBe(null)
    expect(recurrenceFrequency({ frequency: 'bogus' })).toBe(null)
  })
})

describe('nextOccurrenceEnd', () => {
  it('renvoie l’échéance avancée pour une tâche récurrente datée', () => {
    expect(
      nextOccurrenceEnd({ frequency: 'weekly' }, { end_date: '2026-06-10' }),
    ).toBe('2026-06-17')
  })
  it('null sans récurrence', () => {
    expect(nextOccurrenceEnd(null, { end_date: '2026-06-10' })).toBe(null)
  })
  it('null sans échéance (condition de génération serveur)', () => {
    expect(nextOccurrenceEnd({ frequency: 'weekly' }, {})).toBe(null)
  })
})
