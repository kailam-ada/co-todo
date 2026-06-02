import { useEffect, useId, useRef, useState } from 'react'
import type { Profile, Tag, Task } from '../types'
import { TagEditor } from './TagEditor'
import {
  FREQUENCY_LABELS,
  nextOccurrenceEnd,
  recurrenceFrequency,
} from '../lib/recurrence'

const NEXT_DATE_FMT = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return NEXT_DATE_FMT.format(new Date(y, m - 1, d))
}

const REMINDER_LABELS: Record<string, string> = {
  '10m': '10 minutes avant l’échéance',
  '1h': '1 heure avant l’échéance',
  '1d': '1 jour avant l’échéance',
}

function reminderLabel(reminders: unknown[] | null): string | null {
  const first = reminders?.[0] as { offset?: string } | undefined
  return first?.offset ? (REMINDER_LABELS[first.offset] ?? null) : null
}

interface Props {
  task: Task
  me: Profile
  coParent: Profile | null
  busy?: boolean
  suggestions?: Tag[]
  onClose: () => void
  onComplete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Task>) => void
  onSaveTemplate?: (name: string) => Promise<boolean>
}

type Assignment = 'me' | 'co' | 'both' | 'pool'

export function TaskDetailModal({
  task,
  me,
  coParent,
  busy = false,
  suggestions = [],
  onClose,
  onComplete,
  onUpdate,
  onSaveTemplate,
}: Props) {
  const titleId = useId()
  const templateId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateName, setTemplateName] = useState(task.title)
  const [templateSaved, setTemplateSaved] = useState(false)
  const [templateBusy, setTemplateBusy] = useState(false)

  async function saveTemplate(): Promise<void> {
    if (!onSaveTemplate) return
    setTemplateBusy(true)
    const ok = await onSaveTemplate(templateName.trim() || task.title)
    setTemplateBusy(false)
    if (ok) {
      setTemplateSaved(true)
      setTemplateOpen(false)
    }
  }

  useEffect(() => {
    closeRef.current?.focus()
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const current: Assignment = task.shared
    ? 'both'
    : task.assigned_to === me.id
      ? 'me'
      : coParent && task.assigned_to === coParent.id
        ? 'co'
        : 'pool'

  function reassign(a: Assignment): void {
    const patch: Partial<Task> =
      a === 'me'
        ? { assigned_to: me.id, shared: false }
        : a === 'co' && coParent
          ? { assigned_to: coParent.id, shared: false }
          : a === 'both'
            ? { assigned_to: null, shared: true }
            : { assigned_to: null, shared: false }
    onUpdate(task.id, patch)
  }

  function reschedule(date: string): void {
    onUpdate(task.id, {
      temporal_planning: { ...task.temporal_planning, end_date: date || null },
    })
  }

  function toggleSubtask(subId: string): void {
    onUpdate(task.id, {
      sub_tasks: task.sub_tasks.map((s) =>
        s.id === subId ? { ...s, done: !s.done } : s,
      ),
    })
  }

  const options: { id: Assignment; label: string; show: boolean }[] = [
    { id: 'me', label: 'Vous', show: true },
    { id: 'co', label: coParent?.first_name ?? 'Co-parent', show: Boolean(coParent) },
    { id: 'both', label: 'Les deux', show: Boolean(coParent) },
    { id: 'pool', label: 'Réserve', show: true },
  ]

  const doneCount = task.sub_tasks.filter((s) => s.done).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl font-bold text-ink">
            {task.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            ✕
          </button>
        </div>

        {task.points_value > 0 && (
          <p className="mt-1 font-mono text-sm text-muted">
            {task.points_value} pts
          </p>
        )}

        {/* Responsable */}
        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-ink-2">Responsable</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {options
              .filter((o) => o.show)
              .map((o) => {
                const active = o.id === current
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => reassign(o.id)}
                    disabled={busy}
                    aria-pressed={active}
                    className={`min-h-[40px] rounded-lg border px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 ${
                      active
                        ? 'border-primary bg-primary text-white'
                        : 'border-line bg-surface text-ink-2 hover:border-line-strong'
                    }`}
                  >
                    {o.label}
                  </button>
                )
              })}
          </div>
        </fieldset>

        {/* Échéance */}
        <div className="mt-5 flex flex-col gap-1.5">
          <label htmlFor={`${titleId}-due`} className="text-sm font-bold text-ink-2">
            Échéance
          </label>
          <input
            id={`${titleId}-due`}
            type="date"
            value={task.temporal_planning.end_date ?? ''}
            onChange={(e) => reschedule(e.target.value)}
            disabled={busy}
            className="min-h-[44px] w-full rounded-lg border border-line-strong bg-surface px-3 text-ink focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Récurrence */}
        {(() => {
          const freq = recurrenceFrequency(task.recurrence)
          if (!freq) return null
          const nextEnd = nextOccurrenceEnd(task.recurrence, task.temporal_planning)
          return (
            <div className="mt-5">
              <p className="text-sm font-bold text-ink-2">Récurrence</p>
              <p className="mt-1 text-sm text-muted">
                <span aria-hidden="true">↻ </span>
                {FREQUENCY_LABELS[freq]}
                {nextEnd
                  ? ` · prochaine occurrence le ${formatIsoDate(nextEnd)}`
                  : ' — ajoutez une échéance pour générer les occurrences'}
              </p>
            </div>
          )
        })()}

        {/* Rappel */}
        {reminderLabel(task.reminders) && (
          <div className="mt-5">
            <p className="text-sm font-bold text-ink-2">Rappel</p>
            <p className="mt-1 text-sm text-muted">
              <span aria-hidden="true">🔔 </span>
              {reminderLabel(task.reminders)} · e-mail au parent concerné
            </p>
          </div>
        )}

        {/* Étiquettes */}
        <div className="mt-5">
          <p className="text-sm font-bold text-ink-2">Étiquettes</p>
          <div className="mt-2">
            <TagEditor
              tags={task.tags ?? []}
              onChange={(tags) => onUpdate(task.id, { tags })}
              suggestions={suggestions}
              disabled={busy}
            />
          </div>
        </div>

        {/* Sous-tâches */}
        <div className="mt-5">
          <p className="text-sm font-bold text-ink-2">
            Sous-tâches{' '}
            {task.sub_tasks.length > 0 && (
              <span className="font-mono text-muted">
                ({doneCount}/{task.sub_tasks.length})
              </span>
            )}
          </p>
          {task.sub_tasks.length === 0 ? (
            <p className="mt-1 text-sm text-muted">Aucune sous-tâche.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {task.sub_tasks.map((s) => (
                <li key={s.id}>
                  <label className="flex items-center gap-2.5 rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={() => toggleSubtask(s.id)}
                      disabled={busy}
                      className="h-5 w-5 rounded border-line-strong text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className={s.done ? 'text-muted line-through' : ''}>
                      {s.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Transformer en modèle */}
        {onSaveTemplate && (
          <div className="mt-5 border-t border-line pt-4">
            {templateSaved ? (
              <p className="text-sm font-bold text-success">
                Modèle enregistré. Réutilisable depuis « Créer une tâche ».
              </p>
            ) : templateOpen ? (
              <div className="flex flex-col gap-2">
                <label htmlFor={templateId} className="text-sm font-bold text-ink-2">
                  Nom du modèle
                </label>
                <div className="flex gap-2">
                  <input
                    id={templateId}
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="min-h-[44px] w-full rounded-lg border border-line-strong bg-surface px-3 text-ink focus:border-primary focus:ring-2 focus:ring-primary"
                    placeholder="Sortie piscine"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => void saveTemplate()}
                    disabled={templateBusy}
                    className="flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-primary px-4 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-60"
                  >
                    {templateBusy ? '…' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTemplateOpen(true)}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
              >
                Transformer en modèle
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => onComplete(task.id)}
            disabled={busy}
            className="flex min-h-[44px] items-center justify-center rounded-lg bg-success px-5 font-bold text-white hover:bg-success-hover focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-60 sm:flex-1"
          >
            Terminer la tâche
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] items-center justify-center rounded-lg border border-line-strong bg-surface px-5 font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
