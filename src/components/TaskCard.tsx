import type { Task } from '../types'
import { formatDue } from '../lib/dates'
import type { TaskAccent } from '../lib/taskFilters'

export interface AssigneeBadge {
  label: string
  color: string | null
}

interface Props {
  task: Task
  actionLabel?: string
  onAction?: () => void
  onOpen?: () => void
  busy?: boolean
  assignee?: AssigneeBadge | null
  accent?: TaskAccent
  draggable?: boolean
  onDragStartTask?: (event: React.DragEvent) => void
}

const ACCENT_BORDER: Record<TaskAccent, string> = {
  urgent: 'border-l-danger',
  bonus: 'border-l-accent',
  none: 'border-l-line-strong',
}

export function TaskCard({
  task,
  actionLabel,
  onAction,
  onOpen,
  busy = false,
  assignee = null,
  accent = 'none',
  draggable = false,
  onDragStartTask,
}: Props) {
  const due = formatDue(task.temporal_planning)

  const content = (
    <>
      {due && (
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          {due}
        </p>
      )}
      <p className="font-bold leading-snug text-ink">{task.title}</p>
      {assignee && (
        <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-ink-2">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full border border-line"
            style={assignee.color ? { backgroundColor: assignee.color } : undefined}
          />
          {assignee.label}
        </span>
      )}
    </>
  )

  return (
    <li
      draggable={draggable}
      onDragStart={onDragStartTask}
      className={`flex items-center gap-3 rounded-lg border border-line border-l-4 bg-surface p-3.5 ${ACCENT_BORDER[accent]} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-label={`Détails : ${task.title}`}
          className="min-w-0 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        >
          {content}
        </button>
      ) : (
        <div className="min-w-0 flex-1">{content}</div>
      )}

      {task.points_value > 0 && (
        <span className="shrink-0 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-sm font-bold text-ink-2">
          {task.points_value} pt
        </span>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={busy}
          aria-label={`${actionLabel} : ${task.title}`}
          className="flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-60"
        >
          {actionLabel}
        </button>
      )}
    </li>
  )
}
