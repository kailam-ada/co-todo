import type { Tag } from '../types'

interface Props {
  tags: Tag[]
  className?: string
}

/** Affichage en lecture seule d'une liste d'étiquettes (pastille + libellé). */
export function TagList({ tags, className = '' }: Props) {
  if (!tags || tags.length === 0) return null
  return (
    <ul aria-label="Étiquettes" className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <li
          key={tag.label}
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs font-bold text-ink-2"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          {tag.label}
        </li>
      ))}
    </ul>
  )
}
