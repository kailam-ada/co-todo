import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { AppHeader } from '../components/AppHeader'
import { BalanceGauge } from '../components/BalanceGauge'
import { Tabs } from '../components/Tabs'
import type { TabItem } from '../components/Tabs'
import { panelId, tabId } from '../lib/tabs'
import { TaskCard } from '../components/TaskCard'
import { Alert } from '../components/Alert'

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
    myTasks,
    poolTasks,
    completeTask,
    claimTask,
  } = useDashboard()
  const [active, setActive] = useState<'mine' | 'pool'>('mine')
  const [busyId, setBusyId] = useState<string | null>(null)

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

  async function run(id: string, fn: (id: string) => Promise<void>): Promise<void> {
    setBusyId(id)
    await fn(id)
    setBusyId(null)
  }

  const tabs: TabItem[] = [
    { id: 'mine', label: 'Mes tâches', count: myTasks.length },
    { id: 'pool', label: 'À prendre', count: poolTasks.length },
  ]

  return (
    <div className="min-h-screen">
      <AppHeader profile={me} />

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            Bonjour {me.first_name ?? ''}
          </h1>
          <p className="mt-1 text-muted">
            {capitalize(DATE_FMT.format(new Date()))} · voici l'équilibre de la
            charge ce mois-ci.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <BalanceGauge me={me} coParent={coParent} />

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              tabs={tabs}
              value={active}
              onChange={(id) => setActive(id as 'mine' | 'pool')}
              ariaLabel="Filtrer les tâches"
            />
            <Link
              to="/creation"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream max-sm:w-full"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Créer une tâche
            </Link>
          </div>

          <div
            role="tabpanel"
            id={panelId(active)}
            aria-labelledby={tabId(active)}
            className="mt-4"
          >
            {active === 'mine' ? (
              myTasks.length === 0 ? (
                <p className="rounded-card border border-dashed border-line-strong bg-surface px-4 py-8 text-center text-muted">
                  Aucune tâche ne vous est assignée. Profitez-en, ou prenez-en
                  une dans « À prendre ».
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {myTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      actionLabel="Terminer"
                      busy={busyId === task.id}
                      onAction={() => void run(task.id, completeTask)}
                    />
                  ))}
                </ul>
              )
            ) : poolTasks.length === 0 ? (
              <p className="rounded-card border border-dashed border-line-strong bg-surface px-4 py-8 text-center text-muted">
                La réserve est vide. Créez une tâche avec le bouton «&nbsp;+&nbsp;».
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {poolTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    actionLabel="Prendre"
                    busy={busyId === task.id}
                    onAction={() => void run(task.id, claimTask)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
