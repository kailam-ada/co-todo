import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { AppHeader } from '../components/AppHeader'
import { MobileTabBar } from '../components/MobileTabBar'
import { TaskCard } from '../components/TaskCard'
import type { AssigneeBadge } from '../components/TaskCard'
import { TaskDetailModal } from '../components/TaskDetailModal'
import { Alert } from '../components/Alert'
import {
  filterTasks,
  sortTasks,
  taskAccent,
  type TaskFilter,
  type TaskSort,
} from '../lib/taskFilters'
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
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sort, setSort] = useState<TaskSort>('due')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalBusy, setModalBusy] = useState(false)

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null

  const visible = useMemo(
    () => sortTasks(filterTasks(tasks, filter), sort),
    [tasks, filter, sort],
  )

  if (!me || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted" role="status">
        Chargement…
      </div>
    )
  }

  async function run(id: string, fn: (id: string) => Promise<void>): Promise<void> {
    setBusyId(id)
    await fn(id)
    setBusyId(null)
  }

  async function modalUpdate(id: string, patch: Partial<Task>): Promise<void> {
    setModalBusy(true)
    await updateTask(id, patch)
    setModalBusy(false)
  }

  async function modalComplete(id: string): Promise<void> {
    setModalBusy(true)
    await completeTask(id)
    setModalBusy(false)
    setSelectedId(null)
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
                ? { label: 'Prendre', fn: claimTask }
                : mineOrShared
                  ? { label: 'Terminer', fn: completeTask }
                  : null
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  accent={taskAccent(task)}
                  assignee={assigneeBadge(task, me, coParent)}
                  actionLabel={action?.label}
                  onAction={action ? () => void run(task.id, action.fn) : undefined}
                  onOpen={() => setSelectedId(task.id)}
                  busy={busyId === task.id}
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
          onClose={() => setSelectedId(null)}
          onComplete={(id) => void modalComplete(id)}
          onUpdate={(id, patch) => void modalUpdate(id, patch)}
        />
      )}
    </div>
  )
}
