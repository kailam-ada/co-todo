import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { usePeriodTasks } from '../hooks/usePeriodTasks'
import { useTemplates } from '../hooks/useTemplates'
import { AppHeader } from '../components/AppHeader'
import { BalanceGauge } from '../components/BalanceGauge'
import { Tabs } from '../components/Tabs'
import type { TabItem } from '../components/Tabs'
import { panelId, tabId } from '../lib/tabs'
import { TaskCard } from '../components/TaskCard'
import { MobileTabBar } from '../components/MobileTabBar'
import { TaskDetailModal } from '../components/TaskDetailModal'
import { Alert } from '../components/Alert'
import { taskAccent } from '../lib/taskFilters'
import { tagSuggestions } from '../lib/tags'
import { periodPoints, periodStart, type Period } from '../lib/periodPoints'
import { useToast } from '../hooks/useToast'
import type { Task } from '../types'

const DATE_FMT = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function Dashboard() {
  const {
    loading,
    error,
    me,
    coParent,
    tasks,
    myTasks,
    poolTasks,
    completeTask,
    claimTask,
    updateTask,
  } = useDashboard()
  const { showToast } = useToast()
  const { saveFromTask } = useTemplates()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('month')
  const { tasks: periodTasks } = usePeriodTasks(period)
  const [active, setActive] = useState<'mine' | 'pool'>('mine')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalBusy, setModalBusy] = useState(false)

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null
  const tagPool = useMemo(() => tagSuggestions(tasks), [tasks])

  if (!me || loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-muted"
        role="status"
      >
        Chargement…
      </div>
    )
  }

  const pp = periodPoints(periodTasks, periodStart(period), me.id, coParent?.id ?? null)

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

  function renderList(list: Task[], kind: 'mine' | 'pool') {
    if (list.length === 0) {
      return (
        <p className="rounded-card border border-dashed border-line-strong bg-surface px-4 py-8 text-center text-muted">
          {kind === 'mine'
            ? 'Aucune tâche ne vous est assignée. Profitez-en, ou prenez-en une dans « À prendre ».'
            : 'La réserve est vide. Créez une tâche.'}
        </p>
      )
    }
    return (
      <ul className="flex flex-col gap-2">
        {list.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            accent={taskAccent(task)}
            actionLabel={kind === 'mine' ? 'Terminer' : 'Prendre'}
            busy={busyId === task.id}
            onAction={() =>
              void (kind === 'mine' ? handleComplete(task) : handleClaim(task))
            }
            onOpen={() => setSelectedId(task.id)}
          />
        ))}
      </ul>
    )
  }

  const tabs: TabItem[] = [
    { id: 'mine', label: 'Mes tâches', count: myTasks.length },
    { id: 'pool', label: 'À prendre', count: poolTasks.length },
  ]

  return (
    <div className="min-h-screen">
      <AppHeader profile={me} />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            Bonjour {me.first_name ?? ''}
          </h1>
          <p className="mt-1 text-muted">
            {capitalize(DATE_FMT.format(new Date()))} · voici l'équilibre de la
            charge.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <BalanceGauge
          meName={me.first_name ?? 'Vous'}
          coParentName={coParent?.first_name ?? null}
          aPoints={pp.a}
          bPoints={pp.b}
          period={period}
          onPeriodChange={setPeriod}
        />

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="lg:hidden">
              <Tabs
                tabs={tabs}
                value={active}
                onChange={(id) => setActive(id as 'mine' | 'pool')}
                ariaLabel="Filtrer les tâches"
              />
            </div>
            <h2 className="hidden text-lg font-bold text-ink lg:block">Vos tâches</h2>
            <Link
              to="/creation"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream max-sm:w-full"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true" className="h-5 w-5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Créer une tâche
            </Link>
          </div>

          {/* Mobile / tablette : onglets + panneau */}
          <div
            role="tabpanel"
            id={panelId(active)}
            aria-labelledby={tabId(active)}
            className="mt-4 lg:hidden"
          >
            {renderList(active === 'mine' ? myTasks : poolTasks, active)}
          </div>

          {/* Desktop : deux colonnes */}
          <div className="mt-4 hidden gap-5 lg:grid lg:grid-cols-2">
            <section aria-label="Mes tâches">
              <h3 className="mb-2 font-bold text-ink">
                Mes tâches{' '}
                <span className="font-mono text-sm text-muted">{myTasks.length}</span>
              </h3>
              {renderList(myTasks, 'mine')}
            </section>
            <section aria-label="À prendre">
              <h3 className="mb-2 font-bold text-ink">
                À prendre{' '}
                <span className="font-mono text-sm text-muted">{poolTasks.length}</span>
              </h3>
              {renderList(poolTasks, 'pool')}
            </section>
          </div>
        </div>
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
