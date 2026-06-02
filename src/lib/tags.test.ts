import { describe, it, expect } from 'vitest'
import {
  addTag,
  colorForLabel,
  makeTag,
  normalizeLabel,
  removeTag,
  tagSuggestions,
  taskHasTag,
  taskMatchesQuery,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  TAG_COLORS,
} from './tags'
import type { Tag, Task } from '../types'

function makeTask(tags: Tag[], title = 'Tâche'): Task {
  return {
    id: Math.random().toString(36).slice(2),
    family_id: 'fam',
    created_by: 'me',
    assigned_to: null,
    title,
    status: 'TODO',
    shared: false,
    temporal_planning: {},
    sub_tasks: [],
    recurrence: null,
    reminders: null,
    location: null,
    notes: null,
    tags,
    points_value: 5,
    completed_at: null,
    created_at: '2026-06-10T08:00:00Z',
  }
}

describe('normalizeLabel', () => {
  it('trim et compacte les espaces', () => {
    expect(normalizeLabel('  Natation   du   soir ')).toBe('Natation du soir')
  })
  it('borne la longueur', () => {
    expect(normalizeLabel('a'.repeat(40))).toHaveLength(MAX_TAG_LENGTH)
  })
})

describe('colorForLabel', () => {
  it('est déterministe (même libellé → même couleur)', () => {
    expect(colorForLabel('Natation')).toBe(colorForLabel('Natation'))
  })
  it('ignore la casse et les espaces de bord', () => {
    expect(colorForLabel(' natation ')).toBe(colorForLabel('Natation'))
  })
  it('retourne toujours une couleur de la palette', () => {
    expect(TAG_COLORS).toContain(colorForLabel('Lila'))
  })
})

describe('makeTag', () => {
  it('crée un tag normalisé avec sa couleur', () => {
    const t = makeTag('  Sport ')
    expect(t).toEqual({ label: 'Sport', color: colorForLabel('Sport') })
  })
})

describe('addTag', () => {
  it('ajoute un tag valide', () => {
    expect(addTag([], 'Sport')).toHaveLength(1)
  })
  it('ignore les libellés vides', () => {
    expect(addTag([], '   ')).toHaveLength(0)
  })
  it('refuse les doublons insensibles à la casse', () => {
    const tags = addTag([], 'Sport')
    expect(addTag(tags, 'sport')).toHaveLength(1)
  })
  it('respecte la limite MAX_TAGS', () => {
    let tags: Tag[] = []
    for (let i = 0; i < MAX_TAGS + 3; i += 1) tags = addTag(tags, `tag${i}`)
    expect(tags).toHaveLength(MAX_TAGS)
  })
})

describe('removeTag', () => {
  it('retire le tag ciblé (insensible à la casse)', () => {
    const tags = addTag(addTag([], 'Sport'), 'École')
    expect(removeTag(tags, 'sport')).toEqual([makeTag('École')])
  })
})

describe('tagSuggestions', () => {
  it('liste les tags distincts triés par fréquence', () => {
    const tasks = [
      makeTask([makeTag('Sport'), makeTag('Lila')]),
      makeTask([makeTag('Sport')]),
      makeTask([makeTag('École')]),
    ]
    const labels = tagSuggestions(tasks).map((t) => t.label)
    expect(labels[0]).toBe('Sport')
    expect(labels).toContain('Lila')
    expect(labels).toContain('École')
  })
  it('exclut les tags déjà sélectionnés', () => {
    const tasks = [makeTask([makeTag('Sport'), makeTag('Lila')])]
    const labels = tagSuggestions(tasks, [makeTag('sport')]).map((t) => t.label)
    expect(labels).toEqual(['Lila'])
  })
})

describe('taskHasTag', () => {
  it('reconnaît une étiquette portée par la tâche', () => {
    const task = makeTask([makeTag('Sport')])
    expect(taskHasTag(task, 'sport')).toBe(true)
    expect(taskHasTag(task, 'École')).toBe(false)
  })
})

describe('taskMatchesQuery', () => {
  const task = makeTask([makeTag('Natation')], 'Déposer Lila')
  it('vrai pour une requête vide', () => {
    expect(taskMatchesQuery(task, '  ')).toBe(true)
  })
  it('matche le titre', () => {
    expect(taskMatchesQuery(task, 'lila')).toBe(true)
  })
  it('matche une étiquette', () => {
    expect(taskMatchesQuery(task, 'natat')).toBe(true)
  })
  it('faux si rien ne correspond', () => {
    expect(taskMatchesQuery(task, 'dentiste')).toBe(false)
  })
})
