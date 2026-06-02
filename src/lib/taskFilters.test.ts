import { describe, it, expect } from 'vitest'
import { filterTasks, sortTasks, taskAccent } from './taskFilters'
import type { Task } from '../types'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: Math.random().toString(36).slice(2),
    family_id: 'fam',
    created_by: 'a',
    assigned_to: null,
    title: 'Tâche',
    status: 'TODO',
    shared: false,
    temporal_planning: {},
    sub_tasks: [],
    recurrence: null,
    reminders: null,
    location: null,
    notes: null,
    points_value: 5,
    completed_at: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const NOW = new Date('2026-06-10T12:00:00Z')

describe('filterTasks', () => {
  const unassigned = makeTask({ assigned_to: null, shared: false })
  const mine = makeTask({ assigned_to: 'me' })
  const shared = makeTask({ assigned_to: null, shared: true })
  const highPoints = makeTask({ points_value: 12 })
  const thisWeek = makeTask({ temporal_planning: { end_date: '2026-06-12' } })
  const farLater = makeTask({ temporal_planning: { end_date: '2026-09-01' } })
  const all = [unassigned, mine, shared, highPoints, thisWeek, farLater]

  it('« Toutes » ne filtre rien', () => {
    expect(filterTasks(all, 'all', NOW)).toHaveLength(all.length)
  })

  it('« Non attribuées » exclut les assignées ET les partagées', () => {
    const res = filterTasks(all, 'unassigned', NOW)
    expect(res).toContain(unassigned)
    expect(res).toContain(highPoints) // non assignée par défaut
    expect(res).not.toContain(mine)
    expect(res).not.toContain(shared)
  })

  it('« Beaucoup de points » garde ≥ 10 pts', () => {
    const res = filterTasks(all, 'points', NOW)
    expect(res).toContain(highPoints)
    expect(res).not.toContain(unassigned) // 5 pts
  })

  it('« Cette semaine » garde les échéances dans les 7 prochains jours', () => {
    const res = filterTasks(all, 'week', NOW)
    expect(res).toContain(thisWeek)
    expect(res).not.toContain(farLater)
  })
})

describe('sortTasks', () => {
  const a = makeTask({
    points_value: 5,
    created_at: '2026-01-01T00:00:00Z',
    temporal_planning: { end_date: '2026-06-20' },
  })
  const b = makeTask({
    points_value: 15,
    created_at: '2026-02-01T00:00:00Z',
    temporal_planning: { end_date: '2026-06-12' },
  })

  it('par points (desc)', () => {
    expect(sortTasks([a, b], 'points')[0]).toBe(b)
  })

  it('par échéance (asc)', () => {
    expect(sortTasks([a, b], 'due')[0]).toBe(b)
  })

  it('par création (asc) et ne mute pas l’entrée', () => {
    const input = [b, a]
    const out = sortTasks(input, 'created')
    expect(out[0]).toBe(a)
    expect(input[0]).toBe(b) // immutabilité
  })
})

describe('taskAccent', () => {
  it('« urgent » si l’échéance est aujourd’hui ou passée', () => {
    const overdue = makeTask({ temporal_planning: { end_date: '2026-06-05' } })
    const today = makeTask({ temporal_planning: { end_date: '2026-06-10' } })
    expect(taskAccent(overdue, NOW)).toBe('urgent')
    expect(taskAccent(today, NOW)).toBe('urgent')
  })

  it('« bonus » si beaucoup de points et échéance future', () => {
    const t = makeTask({
      points_value: 14,
      temporal_planning: { end_date: '2026-07-01' },
    })
    expect(taskAccent(t, NOW)).toBe('bonus')
  })

  it('« none » sinon', () => {
    const t = makeTask({
      points_value: 5,
      temporal_planning: { end_date: '2026-07-01' },
    })
    expect(taskAccent(t, NOW)).toBe('none')
  })
})
