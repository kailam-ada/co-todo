import { useId, useMemo, useState } from 'react'
import type { Tag } from '../types'
import { addTag, removeTag, MAX_TAGS } from '../lib/tags'

interface Props {
  tags: Tag[]
  onChange: (tags: Tag[]) => void
  suggestions?: Tag[]
  disabled?: boolean
}

/** Éditeur d'étiquettes : chips supprimables + saisie libre + suggestions. */
export function TagEditor({ tags, onChange, suggestions = [], disabled = false }: Props) {
  const inputId = useId()
  const [draft, setDraft] = useState('')

  const selectedLower = useMemo(
    () => new Set(tags.map((t) => t.label.toLowerCase())),
    [tags],
  )
  const visibleSuggestions = suggestions
    .filter((s) => !selectedLower.has(s.label.toLowerCase()))
    .slice(0, 8)

  const full = tags.length >= MAX_TAGS

  function commit(label: string): void {
    const next = addTag(tags, label)
    if (next !== tags) onChange(next)
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Étiquettes sélectionnées">
          {tags.map((tag) => (
            <li
              key={tag.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 py-1 pl-2.5 pr-1 text-sm font-bold text-ink-2"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.label}
              <button
                type="button"
                onClick={() => onChange(removeTag(tags, tag.label))}
                disabled={disabled}
                aria-label={`Retirer l'étiquette : ${tag.label}`}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-3 hover:text-danger focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <div className="flex gap-2">
          <input
            id={inputId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commit(draft)
              }
            }}
            disabled={disabled}
            placeholder="Rechercher ou créer une étiquette…"
            autoComplete="off"
            className="min-h-[44px] w-full rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => commit(draft)}
            disabled={disabled || !draft.trim()}
            className="flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ajouter
          </button>
        </div>
      )}

      {full && (
        <p className="text-sm text-muted">Limite de {MAX_TAGS} étiquettes atteinte.</p>
      )}

      {!full && visibleSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">Déjà utilisées :</span>
          {visibleSuggestions.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => commit(tag.label)}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong bg-surface px-2 py-1 text-xs font-bold text-ink-2 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
