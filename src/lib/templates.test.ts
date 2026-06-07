import { describe, it, expect } from 'vitest'
import {
  assigneeKey,
  formValuesFromTask,
  formValuesFromTemplate,
  templateRowFromTask,
} from './templates'
import type { Task, TaskTemplate } from '../types'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    family_id: 'fam',
    created_by: 'me',
    assigned_to: 'me',
    title: 'Sortie piscine',
    status: 'TODO',
    shared: false,
    temporal_planning: { start_date: '2026-06-01', end_date: '2026-06-10', time: '17:30' },
    sub_tasks: [{ id: 's1', label: 'Maillot', done: false }],
    recurrence: { frequency: 'weekly' },
    reminders: [{ offset: '1h' }],
    location: 'Piscine municipale',
    notes: 'Penser au bonnet',
    tags: [{ label: 'Natation', color: '#073841' }],
    points_value: 10,
    completed_at: null,
    created_at: '2026-06-01T00:00:00Z',
    ...overrides,
  }
}

function makeTemplate(overrides: Partial<TaskTemplate> = {}): TaskTemplate {
  return {
    id: 'tpl1',
    family_id: 'fam',
    created_by: 'me',
    name: 'Modèle piscine',
    title: 'Sortie piscine',
    assigned_to: 'me',
    shared: false,
    temporal_planning: { time: '17:30' },
    sub_tasks: [{ id: 's1', label: 'Maillot', done: false }],
    recurrence: { frequency: 'weekly' },
    reminders: [{ offset: '1h' }],
    location: 'Piscine municipale',
    notes: 'Penser au bonnet',
    tags: [{ label: 'Natation', color: '#073841' }],
    created_at: '2026-06-01T00:00:00Z',
    ...overrides,
  }
}

describe('templateRowFromTask', () => {
  it('écarte les dates absolues mais conserve l’heure', () => {
    const row = templateRowFromTask(makeTask(), 'Modèle piscine', 'fam', 'me')
    expect(row.temporal_planning).toEqual({ time: '17:30' })
  })
  it('copie l’ossature de la tâche', () => {
    const row = templateRowFromTask(makeTask(), 'Modèle piscine', 'fam', 'me')
    expect(row.name).toBe('Modèle piscine')
    expect(row.title).toBe('Sortie piscine')
    expect(row.sub_tasks).toHaveLength(1)
    expect(row.tags).toEqual([{ label: 'Natation', color: '#073841' }])
    expect(row.recurrence).toEqual({ frequency: 'weekly' })
  })
  it('retombe sur le titre si le nom est vide', () => {
    const row = templateRowFromTask(makeTask(), '   ', 'fam', 'me')
    expect(row.name).toBe('Sortie piscine')
  })
})

describe('assigneeKey', () => {
  it('partagé → both', () => {
    expect(assigneeKey(null, true, 'me', 'co')).toBe('both')
  })
  it('assigné à moi → me', () => {
    expect(assigneeKey('me', false, 'me', 'co')).toBe('me')
  })
  it('assigné au co-parent → son id', () => {
    expect(assigneeKey('co', false, 'me', 'co')).toBe('co')
  })
  it('non attribué → pool', () => {
    expect(assigneeKey(null, false, 'me', 'co')).toBe('pool')
  })
})

describe('formValuesFromTask', () => {
  it('conserve les dates absolues (début + échéance) et l’ossature', () => {
    const v = formValuesFromTask(makeTask(), 'me', 'co')
    expect(v.startDate).toBe('2026-06-01')
    expect(v.endDate).toBe('2026-06-10')
    expect(v.time).toBe('17:30')
    expect(v.recurrence).toBe('weekly')
    expect(v.reminder).toBe('1h')
    expect(v.title).toBe('Sortie piscine')
    expect(v.subTasks).toHaveLength(1)
    expect(v.tags).toEqual([{ label: 'Natation', color: '#073841' }])
    expect(v.showAdvanced).toBe(true)
  })
  it('mappe la clé d’assignation selon assigned_to / shared', () => {
    expect(formValuesFromTask(makeTask({ shared: true, assigned_to: null }), 'me', 'co').assignee).toBe('both')
    expect(formValuesFromTask(makeTask({ assigned_to: 'co', shared: false }), 'me', 'co').assignee).toBe('co')
    expect(formValuesFromTask(makeTask({ assigned_to: null, shared: false }), 'me', 'co').assignee).toBe('pool')
  })
  it('préserve l’état done des sous-tâches existantes', () => {
    const task = makeTask({ sub_tasks: [{ id: 's1', label: 'Maillot', done: true }] })
    expect(formValuesFromTask(task, 'me', 'co').subTasks[0].done).toBe(true)
  })
  it('showAdvanced reste faux pour une tâche minimale (échéance seule)', () => {
    const minimal = makeTask({
      temporal_planning: { end_date: '2026-06-10' },
      recurrence: null,
      reminders: null,
      notes: null,
      sub_tasks: [],
    })
    const v = formValuesFromTask(minimal, 'me', 'co')
    expect(v.endDate).toBe('2026-06-10')
    expect(v.showAdvanced).toBe(false)
  })
})

describe('formValuesFromTemplate', () => {
  it('pré-remplit les champs sans date absolue', () => {
    const v = formValuesFromTemplate(makeTemplate(), 'me', 'co')
    expect(v.startDate).toBe('')
    expect(v.endDate).toBe('')
    expect(v.time).toBe('17:30')
    expect(v.recurrence).toBe('weekly')
    expect(v.reminder).toBe('1h')
    expect(v.assignee).toBe('me')
    expect(v.tags).toHaveLength(1)
    expect(v.showAdvanced).toBe(true)
  })
  it('showAdvanced reste faux pour un modèle minimal', () => {
    const minimal = makeTemplate({
      temporal_planning: {},
      recurrence: null,
      reminders: null,
      notes: null,
      sub_tasks: [],
    })
    const v = formValuesFromTemplate(minimal, 'me', 'co')
    expect(v.showAdvanced).toBe(false)
  })
})
