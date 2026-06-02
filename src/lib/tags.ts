import type { Tag, Task } from '../types'

/**
 * Palette d'étiquettes dérivée de la charte. Chaque couleur a un ratio de
 * contraste suffisant (≥ 3:1) sur fond clair pour la pastille (RGAA 2.1) ; le
 * libellé reste toujours affiché à côté, l'information n'est jamais portée par
 * la seule couleur.
 */
export const TAG_COLORS = [
  '#073841', // primary
  '#c77127', // accent
  '#15663d', // success
  '#a8232f', // danger
  '#0b5fff', // focus
  '#6b3fa0', // violet
  '#0f6e6e', // teal
  '#8a4b1f', // brun
] as const

export const MAX_TAGS = 6
export const MAX_TAG_LENGTH = 24

/** Normalise un libellé : trim + espaces compactés + longueur bornée. */
export function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').slice(0, MAX_TAG_LENGTH)
}

/**
 * Couleur déterministe pour un libellé : la même étiquette obtient toujours la
 * même couleur de la palette, où qu'elle apparaisse.
 */
export function colorForLabel(label: string): string {
  const key = normalizeLabel(label).toLowerCase()
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

/** Crée un tag normalisé avec sa couleur déterministe. */
export function makeTag(label: string): Tag {
  const clean = normalizeLabel(label)
  return { label: clean, color: colorForLabel(clean) }
}

/**
 * Ajoute un tag à la liste : ignore les libellés vides, les doublons
 * (insensible à la casse) et respecte la limite de `MAX_TAGS`.
 */
export function addTag(tags: Tag[], label: string): Tag[] {
  const clean = normalizeLabel(label)
  if (!clean || tags.length >= MAX_TAGS) return tags
  const lower = clean.toLowerCase()
  if (tags.some((t) => t.label.toLowerCase() === lower)) return tags
  return [...tags, makeTag(clean)]
}

/** Retire un tag par son libellé (insensible à la casse). */
export function removeTag(tags: Tag[], label: string): Tag[] {
  const lower = normalizeLabel(label).toLowerCase()
  return tags.filter((t) => t.label.toLowerCase() !== lower)
}

/**
 * Étiquettes distinctes déjà utilisées dans le foyer, triées par fréquence
 * décroissante, en excluant celles déjà sélectionnées. Sert de suggestions.
 */
export function tagSuggestions(
  tasks: readonly { tags: Tag[] | null }[],
  selected: Tag[] = [],
): Tag[] {
  const taken = new Set(selected.map((t) => t.label.toLowerCase()))
  const counts = new Map<string, { tag: Tag; count: number }>()
  for (const task of tasks) {
    for (const tag of task.tags ?? []) {
      const lower = tag.label.toLowerCase()
      if (taken.has(lower)) continue
      const entry = counts.get(lower)
      if (entry) entry.count += 1
      else counts.set(lower, { tag, count: 1 })
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.tag.label.localeCompare(b.tag.label))
    .map((e) => e.tag)
}

/** Vrai si la tâche porte une étiquette donnée (insensible à la casse). */
export function taskHasTag(task: Task, label: string): boolean {
  const lower = normalizeLabel(label).toLowerCase()
  return (task.tags ?? []).some((t) => t.label.toLowerCase() === lower)
}

/**
 * Vrai si le titre OU une étiquette de la tâche contient la requête (recherche
 * insensible à la casse).
 */
export function taskMatchesQuery(task: Task, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (task.title.toLowerCase().includes(q)) return true
  return (task.tags ?? []).some((t) => t.label.toLowerCase().includes(q))
}
