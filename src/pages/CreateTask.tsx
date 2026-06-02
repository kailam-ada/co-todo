import { useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useFamilyMembers } from '../hooks/useFamilyMembers'
import { AppHeader } from '../components/AppHeader'
import { Alert } from '../components/Alert'
import { PlanningBonusWidget } from '../components/PlanningBonusWidget'
import { SensitiveDataNotice } from '../components/SensitiveDataNotice'
import { computePlanningBonus, creationPoints } from '../lib/points'
import type { SubTask } from '../types'

const INPUT =
  'min-h-[44px] w-full rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary'

type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
type Reminder = 'none' | '10m' | '1h' | '1d'

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: 'Aucune',
  daily: 'Journalière',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
  yearly: 'Annuelle',
}

const REMINDER_LABELS: Record<Reminder, string> = {
  none: 'Aucun',
  '10m': '10 minutes avant',
  '1h': '1 heure avant',
  '1d': '1 jour avant',
}

export function CreateTask() {
  const { profile: me } = useAuth()
  const { members } = useFamilyMembers()
  const navigate = useNavigate()

  const titleId = useId()
  const assignId = useId()
  const endId = useId()
  const startId = useId()
  const timeId = useId()
  const recId = useId()
  const remId = useId()
  const subId = useId()

  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState<string>('me')
  const [endDate, setEndDate] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [time, setTime] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence>('none')
  const [reminder, setReminder] = useState<Reminder>('none')
  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [subDraft, setSubDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coParent = members.find((m) => m.id !== me?.id) ?? null

  const planningInput = useMemo(
    () => ({
      hasEndDate: Boolean(endDate),
      hasStartDate: showAdvanced && Boolean(startDate),
      hasTime: showAdvanced && Boolean(time),
      hasRecurrence: showAdvanced && recurrence !== 'none',
      hasSubtasks: subTasks.length > 0,
      hasReminder: showAdvanced && reminder !== 'none',
    }),
    [endDate, showAdvanced, startDate, time, recurrence, reminder, subTasks],
  )

  const { level, bonus } = computePlanningBonus(planningInput)
  const total = creationPoints(planningInput)

  function addSubTask(): void {
    const label = subDraft.trim()
    if (!label) return
    setSubTasks((list) => [
      ...list,
      { id: crypto.randomUUID(), label, done: false },
    ])
    setSubDraft('')
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    if (!me || !title.trim()) return
    setError(null)
    setSubmitting(true)

    const { error: insertError } = await supabase.from('tasks').insert({
      family_id: me.family_id,
      created_by: me.id,
      assigned_to:
        assignee === 'pool' || assignee === 'both'
          ? null
          : assignee === 'me'
            ? me.id
            : assignee,
      shared: assignee === 'both',
      title: title.trim(),
      status: 'TODO',
      temporal_planning: {
        start_date: showAdvanced && startDate ? startDate : null,
        end_date: endDate || null,
        time: showAdvanced && time ? time : null,
      },
      sub_tasks: subTasks,
      recurrence:
        showAdvanced && recurrence !== 'none' ? { frequency: recurrence } : null,
      reminders: showAdvanced && reminder !== 'none' ? [{ offset: reminder }] : null,
      points_value: total,
    })

    if (insertError) {
      setSubmitting(false)
      setError(insertError.message)
      return
    }
    navigate('/tableau-de-bord', { replace: true })
  }

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted" role="status">
        Chargement…
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AppHeader profile={me} />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Nouvelle tâche</h1>
          <p className="mt-1 text-muted">
            Renseignez les détails — les points et le bonus de planification se
            calculent en direct.
          </p>
        </div>

        <div className="mb-6">
          <PlanningBonusWidget level={level} bonus={bonus} total={total} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {error && <Alert variant="error">{error}</Alert>}

          {/* Titre & contexte */}
          <fieldset className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
            <legend className="px-1 text-lg font-bold text-ink">Titre & contexte</legend>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={titleId} className="text-sm font-bold text-ink-2">
                Titre de la tâche <span className="text-danger" aria-hidden="true">*</span>
              </label>
              <input
                id={titleId}
                className={INPUT}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Déposer Lila à la natation"
                required
              />
              <p className="text-sm text-muted">
                Un nom court et orienté action. Visible par les deux co-parents.
              </p>
              <SensitiveDataNotice />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={assignId} className="text-sm font-bold text-ink-2">
                Assignation
              </label>
              <select
                id={assignId}
                className={INPUT}
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="me">{me.first_name ?? 'Moi'} (vous)</option>
                {coParent && (
                  <option value={coParent.id}>{coParent.first_name ?? 'Co-parent'}</option>
                )}
                {coParent && <option value="both">Les deux — 50/50</option>}
                <option value="pool">Réserve (à prendre)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={endId} className="text-sm font-bold text-ink-2">
                Échéance
              </label>
              <input
                id={endId}
                type="date"
                className={INPUT}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </fieldset>

          {/* Toggle options avancées */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface px-5 font-bold text-primary hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
          >
            {showAdvanced ? '− Masquer les options' : '+ Options de planification et récurrence'}
          </button>

          {showAdvanced && (
            <fieldset className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
              <legend className="px-1 text-lg font-bold text-ink">
                Planification avancée
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={startId} className="text-sm font-bold text-ink-2">
                    Date de début
                  </label>
                  <input
                    id={startId}
                    type="date"
                    className={INPUT}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={timeId} className="text-sm font-bold text-ink-2">
                    Heure de la tâche
                  </label>
                  <input
                    id={timeId}
                    type="time"
                    className={INPUT}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={recId} className="text-sm font-bold text-ink-2">
                  Récurrence
                </label>
                <select
                  id={recId}
                  className={INPUT}
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                >
                  {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((key) => (
                    <option key={key} value={key}>
                      {RECURRENCE_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={remId} className="text-sm font-bold text-ink-2">
                  Rappel personnalisé
                </label>
                <select
                  id={remId}
                  className={INPUT}
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value as Reminder)}
                >
                  {(Object.keys(REMINDER_LABELS) as Reminder[]).map((key) => (
                    <option key={key} value={key}>
                      {REMINDER_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sous-tâches */}
              <div className="flex flex-col gap-2">
                <label htmlFor={subId} className="text-sm font-bold text-ink-2">
                  Sous-tâches
                </label>
                <SensitiveDataNotice />
                {subTasks.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {subTasks.map((st) => (
                      <li
                        key={st.id}
                        className="flex items-center gap-2 rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                      >
                        <span className="flex-1">{st.label}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSubTasks((list) => list.filter((x) => x.id !== st.id))
                          }
                          aria-label={`Supprimer la sous-tâche : ${st.label}`}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-danger focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <input
                    id={subId}
                    className={INPUT}
                    value={subDraft}
                    onChange={(e) => setSubDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSubTask()
                      }
                    }}
                    placeholder="Ajouter une sous-tâche"
                  />
                  <button
                    type="button"
                    onClick={addSubTask}
                    className="flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </fieldset>
          )}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
            >
              {submitting ? 'Création…' : `Créer la tâche (${total} pts)`}
            </button>
            <Link
              to="/tableau-de-bord"
              className="flex min-h-[44px] items-center justify-center rounded-lg border border-line-strong bg-surface px-6 font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
            >
              Annuler
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
