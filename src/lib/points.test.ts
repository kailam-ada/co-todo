import { describe, it, expect } from 'vitest'
import {
  computePlanningBonus,
  creationPoints,
  executionPointsFor,
  subtaskCompletionPoints,
  BASE_CREATION_POINTS,
  EXECUTION_POINTS,
  type PlanningInput,
} from './points'

const EMPTY: PlanningInput = {
  hasEndDate: false,
  hasStartDate: false,
  hasTime: false,
  hasRecurrence: false,
  hasSubtasks: false,
  hasReminder: false,
}

describe('computePlanningBonus', () => {
  it('aucun bonus sans aucune planification', () => {
    expect(computePlanningBonus(EMPTY)).toEqual({ level: 'none', bonus: 0 })
  })

  it('+2 (Minimal) : seule l’échéance est valide', () => {
    const result = computePlanningBonus({ ...EMPTY, hasEndDate: true })
    expect(result).toEqual({ level: 'minimal', bonus: 2 })
  })

  it('reste Minimal si début + fin mais pas d’heure', () => {
    const result = computePlanningBonus({
      ...EMPTY,
      hasEndDate: true,
      hasStartDate: true,
    })
    expect(result.bonus).toBe(2)
  })

  it('+5 (Partiel) : début + fin + heure', () => {
    const result = computePlanningBonus({
      ...EMPTY,
      hasEndDate: true,
      hasStartDate: true,
      hasTime: true,
    })
    expect(result).toEqual({ level: 'partial', bonus: 5 })
  })

  describe('+10 (Total) : Partiel ET une condition supplémentaire', () => {
    const partial: PlanningInput = {
      ...EMPTY,
      hasEndDate: true,
      hasStartDate: true,
      hasTime: true,
    }

    it('via récurrence', () => {
      expect(computePlanningBonus({ ...partial, hasRecurrence: true })).toEqual(
        { level: 'complete', bonus: 10 },
      )
    })

    it('via sous-tâches', () => {
      expect(computePlanningBonus({ ...partial, hasSubtasks: true })).toEqual({
        level: 'complete',
        bonus: 10,
      })
    })

    it('via rappel', () => {
      expect(computePlanningBonus({ ...partial, hasReminder: true })).toEqual({
        level: 'complete',
        bonus: 10,
      })
    })

    it('PAS Total si la condition supplémentaire sans le niveau Partiel', () => {
      const result = computePlanningBonus({
        ...EMPTY,
        hasEndDate: true,
        hasSubtasks: true,
      })
      expect(result.bonus).toBe(2)
    })
  })
})

describe('creationPoints', () => {
  it('5 pts de base sans bonus', () => {
    expect(creationPoints(EMPTY)).toBe(BASE_CREATION_POINTS)
    expect(creationPoints(EMPTY)).toBe(5)
  })

  it('7 / 10 / 15 selon le bonus', () => {
    expect(creationPoints({ ...EMPTY, hasEndDate: true })).toBe(7)
    expect(
      creationPoints({
        ...EMPTY,
        hasEndDate: true,
        hasStartDate: true,
        hasTime: true,
      }),
    ).toBe(10)
    expect(
      creationPoints({
        ...EMPTY,
        hasEndDate: true,
        hasStartDate: true,
        hasTime: true,
        hasRecurrence: true,
      }),
    ).toBe(15)
  })
})

describe('executionPointsFor', () => {
  it('attribue 15 pts exclusivement au parent assigné', () => {
    expect(executionPointsFor('parent-a')).toEqual({
      recipientId: 'parent-a',
      points: EXECUTION_POINTS,
    })
    expect(EXECUTION_POINTS).toBe(15)
  })

  it('aucune attribution si la tâche n’est pas assignée', () => {
    expect(executionPointsFor(null)).toEqual({ recipientId: null, points: 0 })
  })
})

describe('subtaskCompletionPoints', () => {
  it('une sous-tâche validée rapporte strictement 0 pt', () => {
    expect(subtaskCompletionPoints()).toBe(0)
  })
})
