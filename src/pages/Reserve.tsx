import { useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { useTemplates } from '../hooks/useTemplates'
import { AppHeader } from '../components/AppHeader'
import { MobileTabBar } from '../components/MobileTabBar'
import { TaskCard } from '../components/TaskCard'
import type { AssigneeBadge } from '../components/TaskCard'
import { TaskDetailModal } from '../components/TaskDetailModal'
import { Avatar } from '../components/Avatar'
import { Alert } from '../components/Alert'
import { useToast } from '../hooks/useToast'
import { assignmentPatch, type AssignmentKey } from '../lib/assignment'
import {
  filterTasks,
  sortTasks,
  taskAccent,
  type TaskFilter,
  type TaskSort,
} from '../lib/taskFilters'
import { tagSuggestions, taskHasTag, taskMatchesQuery } from '../lib/tags'
import type { Profile, Task } from '../types'

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'unassigned', label: 'Non attribuées' },
  { id: 'week', label: 'Cette semaine' },
  { id: 'points', label: 'Beaucoup de points' },
]

function assigneeBadge(
  task: Task,
  me: Profile,
  coParent: Profile | null,
): AssigneeBadge {
  if (task.shared) return { label: 'Les deux', color: null }
  if (task.assigned_to === me.id)
    return { label: 'Vous', color: me.avatar_color }
  if (coParent && task.assigned_to === coParent.id)
    return { label: coParent.first_name ?? 'Co-parent', color: coParent.avatar_color }
  return { label: 'Non attribuée', color: null }
}

export function Reserve() {
  const { loading, error, me, coParent, tasks, completeTask, claimTask, updateTask } =
    useDashboard()
  const { showToast } = useToast()
  const { saveFromTask } = useTemplates()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sort, setSort] = useState<TaskSort>('due')
  const [query, setQuery] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalBusy, setModalBusy] = useState(false)
  const [dragOver, setDragOver] = useState<AssignmentKey | null>(null)
  const dragTaskId = useRef<string | null>(null)

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null

  function handleDragStart(event: React.DragEvent, id: string): void {
    dragTaskId.current = id
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const tagPool = useMemo(() => tagSuggestions(tasks), [tasks])

  const visible = useMemo(() => {
    let base = tasks.filter((t) => taskMatchesQuery(t, query))
    if (tagFilter) base = base.filter((t) => taskHasTag(t, tagFilter))
    return sortTasks(filterTasks(base, filter), sort)
  }, [tasks, filter, sort, query, tagFilter])

  if (!me || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted" role="status">
        Chargement…
      </div>
    )
  }

  async function handleComplete(task: Task): Promise<void> {
    setBusyId(task.id)
    await completeTask(task.id)
    setBusyId(null)
    showToast(`« ${task.title} » terminée`, {
      onUndo: () =>
        void updateTask(task.id, { status: 'TODO', completed_at: null }),
    })
  }

  async function handleClaim(task: Task): Promise<void> {
    setBusyId(task.id)
    await claimTask(task.id)
    setBusyId(null)
    showToast(`« ${task.title} » ajoutée à vos tâches`, {
      onUndo: () => void updateTask(task.id, { assigned_to: null }),
    })
  }

  async function modalUpdate(id: string, patch: Partial<Task>): Promise<void> {
    setModalBusy(true)
    await updateTask(id, patch)
    setModalBusy(false)
  }

  async function modalComplete(id: string): Promise<void> {
    const task = tasks.find((t) => t.id === id)
    setModalBusy(true)
    await completeTask(id)
    setModalBusy(false)
    setSelectedId(null)
    if (task) {
      showToast(`« ${task.title} » terminée`, {
        onUndo: () =>
          void updateTask(id, { status: 'TODO', completed_at: null }),
      })
    }
  }

  const buckets: { key: AssignmentKey; label: string; icon: ReactNode }[] = [
    { key: 'me', label: 'Vous', icon: <Avatar name={me.first_name} color={me.avatar_color} size="sm" /> },
    ...(coParent
      ? [
          { key: 'co' as const, label: coParent.first_name ?? 'Co-parent', icon: <Avatar name={coParent.first_name} color={coParent.avatar_color} size="sm" /> },
          { key: 'both' as const, label: 'Les deux', icon: <span aria-hidden="true">👥</span> },
        ]
      : []),
    { key: 'pool', label: 'Réserve', icon: <span aria-hidden="true">📥</span> },
  ]

  async function handleDrop(key: AssignmentKey): Promise<void> {
    const id = dragTaskId.current
    dragTaskId.current = null
    setDragOver(null)
    if (!id || !me) return
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const prev = { assigned_to: task.assigned_to, shared: task.shared }
    await updateTask(id, assignmentPatch(key, me.id, coParent?.id ?? null))
    const label = buckets.find((b) => b.key === key)?.label ?? ''
    showToast(`« ${task.title} » → ${label}`, {
      onUndo: () => void updateTask(id, prev),
    })
  }

  return (
    <div className="min-h-screen">
      <AppHeader profile={me} />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:pb-12">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">
              Réserve de tâches
            </h1>
            <p className="mt-1 text-muted">
              Le backlog partagé du foyer. Prenez une tâche ou validez les vôtres.
            </p>
          </div>
          <Link
            to="/creation"
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream max-sm:w-full"
          >
            + Créer une tâche
          </Link>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {/* Recherche */}
        <div className="mb-3">
          <label htmlFor="search" className="sr-only">
            Rechercher une tâche
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une tâche…"
            className="min-h-[44px] w-full rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Toolbar : filtres + tri */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtres">
            {FILTERS.map((f) => {
              const active = f.id === filter
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={active}
                  className={`min-h-[36px] rounded-full border px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-line bg-surface text-ink-2 hover:border-line-strong'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-bold text-ink-2">
              Tri
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as TaskSort)}
              className="min-h-[36px] rounded-lg border border-line-strong bg-surface px-2 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary"
            >
              <option value="due">Échéance</option>
              <option value="points">Points</option>
              <option value="created">Création</option>
            </select>
          </div>
        </div>

        {/* Filtre par étiquette */}
        {tagPool.length > 0 && (
          <div
            className="mb-4 flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filtrer par étiquette"
          >
            <span className="text-xs font-bold text-muted">Étiquettes :</span>
            {tagPool.map((tag) => {
              const active = tagFilter?.toLowerCase() === tag.label.toLowerCase()
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setTagFilter(active ? null : tag.label)}
                  aria-pressed={active}
                  className={`inline-flex min-h-[32px] items-center gap-1 rounded-full border px-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-line bg-surface text-ink-2 hover:border-line-strong'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: active ? '#ffffff' : tag.color }}
                  />
                  {tag.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Buckets de dépôt (glisser-déposer, desktop) */}
        <div className="mb-4 hidden sm:block">
          <p className="mb-2 text-xs text-muted">
            Glissez une tâche vers un parent pour l'assigner (ou ouvrez-la pour
            réassigner au clavier).
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {buckets.map((b) => (
              <div
                key={b.key}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(b.key)
                }}
                onDragLeave={() => setDragOver((cur) => (cur === b.key ? null : cur))}
                onDrop={(e) => {
                  e.preventDefault()
                  void handleDrop(b.key)
                }}
                className={`flex min-h-[56px] items-center justify-center gap-2 rounded-lg border-2 border-dashed px-2 text-sm font-bold ${
                  dragOver === b.key
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line-strong bg-surface text-ink-2'
                }`}
              >
                {b.icon}
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-card border border-dashed border-line-strong bg-surface px-4 py-10 text-center text-muted">
            Aucune tâche pour ce filtre.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((task) => {
              const unassigned = task.assigned_to === null && !task.shared
              const mineOrShared = task.assigned_to === me.id || task.shared
              const action = unassigned
                ? { label: 'Prendre', run: () => handleClaim(task) }
                : mineOrShared
                  ? { label: 'Terminer', run: () => handleComplete(task) }
                  : null
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  accent={taskAccent(task)}
                  assignee={assigneeBadge(task, me, coParent)}
                  actionLabel={action?.label}
                  onAction={action ? () => void action.run() : undefined}
                  onOpen={() => setSelectedId(task.id)}
                  busy={busyId === task.id}
                  draggable
                  onDragStartTask={(e) => handleDragStart(e, task.id)}
                />
              )
            })}
          </ul>
        )}
      </main>

      <MobileTabBar />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          me={me}
          coParent={coParent}
          busy={modalBusy}
          suggestions={tagPool}
          onClose={() => setSelectedId(null)}
          onComplete={(id) => void modalComplete(id)}
          onUpdate={(id, patch) => void modalUpdate(id, patch)}
          onEdit={(id) => navigate(`/modifier/${id}`)}
          onSaveTemplate={(name) => saveFromTask(selectedTask, name)}
        />
      )}
    </div>
  )
}
