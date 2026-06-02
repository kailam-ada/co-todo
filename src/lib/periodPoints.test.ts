import { describe, it, expect } from 'vitest'
import { periodStart, periodPoints } from './periodPoints'
import type { Task } from '../types'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: Math.random().toString(36).slice(2),
    family_id: 'fam',
    created_by: 'me',
    assigned_to: null,
    title: 'T',
    status: 'TODO',
    shared: false,
    temporal_planning: {},
    sub_tasks: [],
    recurrence: null,
    reminders: null,
    location: null,
    notes: null,
    tags: [],
    points_value: 5,
    completed_at: null,
    created_at: '2026-06-10T08:00:00Z',
    ...overrides,
  }
}

describe('periodStart', () => {
  it('mois : 1er du mois courant', () => {
    const s = periodStart('month', new Date('2026-06-15T12:00:00'))
    expect(s.getDate()).toBe(1)
    expect(s.getMonth()).toBe(5)
  })

  it('semaine : lundi de la semaine courante', () => {
    // 2026-06-10 est un mercredi → lundi = 2026-06-08
    const s = periodStart('week', new Date('2026-06-10T12:00:00'))
    expect(s.getDay()).toBe(1)
    expect(s.getDate()).toBe(8)
  })
})

describe('periodPoints', () => {
  const start = new Date('2026-06-01T00:00:00Z')

  it('création : points_value au créateur', () => {
    const tasks = [
      makeTask({ created_by: 'me', points_value: 7, created_at: '2026-06-05T00:00:00Z' }),
      makeTask({ created_by: 'co', points_value: 10, created_at: '2026-06-06T00:00:00Z' }),
      // hors période → ignorée
      makeTask({ created_by: 'me', points_value: 99, created_at: '2026-05-01T00:00:00Z' }),
    ]
    expect(periodPoints(tasks, start, 'me', 'co')).toEqual({ a: 7, b: 10, total: 17 })
  })

  it('exécution : +15 à l’assigné, +7 chacun si partagée', () => {
    const tasks = [
      makeTask({
        created_by: null,
        assigned_to: 'me',
        status: 'COMPLETED',
        completed_at: '2026-06-07T00:00:00Z',
      }),
      makeTask({
        created_by: null,
        shared: true,
        status: 'COMPLETED',
        completed_at: '2026-06-07T00:00:00Z',
      }),
    ]
    expect(periodPoints(tasks, start, 'me', 'co')).toEqual({ a: 22, b: 7, total: 29 })
  })

  it('ignore les complétions hors période', () => {
    const tasks = [
      makeTask({
        created_by: null,
        assigned_to: 'me',
        status: 'COMPLETED',
        completed_at: '2026-05-20T00:00:00Z',
      }),
    ]
    expect(periodPoints(tasks, start, 'me', 'co')).toEqual({ a: 0, b: 0, total: 0 })
  })
})
