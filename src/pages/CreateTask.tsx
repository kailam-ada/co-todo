import { useEffect, useId, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useFamilyMembers } from '../hooks/useFamilyMembers'
import { useTemplates } from '../hooks/useTemplates'
import { AppHeader } from '../components/AppHeader'
import { MobileTabBar } from '../components/MobileTabBar'
import { Alert } from '../components/Alert'
import { PlanningBonusWidget } from '../components/PlanningBonusWidget'
import { SensitiveDataNotice } from '../components/SensitiveDataNotice'
import { ImpactGauge } from '../components/ImpactGauge'
import { Avatar } from '../components/Avatar'
import { TagEditor } from '../components/TagEditor'
import { computePlanningBonus, creationPoints } from '../lib/points'
import { tagSuggestions } from '../lib/tags'
import {
  formValuesFromTask,
  formValuesFromTemplate,
  type TemplateFormValues,
} from '../lib/templates'
import type { SubTask, Tag, Task, TaskTemplate } from '../types'

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
  const { templates, remove: removeTemplate } = useTemplates()
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const isEdit = Boolean(editId)

  const titleId = useId()
  const assignId = useId()
  const endId = useId()
  const startId = useId()
  const timeId = useId()
  const recId = useId()
  const remId = useId()
  const subId = useId()
  const locId = useId()
  const notesId = useId()

  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState<string>('me')
  const [endDate, setEndDate] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [time, setTime] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence>('none')
  const [reminder, setReminder] = useState<Reminder>('none')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [tagPool, setTagPool] = useState<Tag[]>([])
  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [subDraft, setSubDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingTask, setLoadingTask] = useState(isEdit)

  const coParent = members.find((m) => m.id !== me?.id) ?? null

  function applyFormValues(v: TemplateFormValues): void {
    setTitle(v.title)
    setAssignee(v.assignee)
    setStartDate(v.startDate)
    setEndDate(v.endDate)
    setTime(v.time)
    setRecurrence(v.recurrence)
    setReminder(v.reminder)
    setLocation(v.location)
    setNotes(v.notes)
    setTags(v.tags)
    setSubTasks(v.subTasks)
    setShowAdvanced(v.showAdvanced)
  }

  // Mode édition : charger la tâche et pré-remplir le formulaire.
  useEffect(() => {
    if (!isEdit || !editId || !me) return
    let cancelled = false
    void supabase
      .from('tasks')
      .select('*')
      .eq('id', editId)
      .single()
      .then(({ data, error: loadError }) => {
        if (cancelled) return
        if (loadError || !data) {
          setError("Cette tâche est introuvable ou n'est plus accessible.")
          setLoadingTask(false)
          return
        }
        const task = data as Task
        applyFormValues(
          formValuesFromTask(task, me.id, coParent?.id ?? null),
        )
        setSubTasks(task.sub_tasks ?? [])
        setLoadingTask(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editId, me?.id, coParent?.id])

  useEffect(() => {
    const familyId = me?.family_id
    if (!familyId) return
    let cancelled = false
    void supabase
      .from('tasks')
      .select('tags')
      .eq('family_id', familyId)
      .then(({ data }) => {
        if (cancelled || !data) return
        setTagPool(tagSuggestions(data as { tags: Tag[] | null }[]))
      })
    return () => {
      cancelled = true
    }
  }, [me?.family_id])

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

  function applyTemplate(template: TaskTemplate): void {
    if (!me) return
    const v = formValuesFromTemplate(template, me.id, coParent?.id ?? null)
    applyFormValues(v)
    // Un modèle instancie une nouvelle tâche : sous-tâches neuves et non cochées.
    setSubTasks(
      v.subTasks.map((s) => ({ ...s, id: crypto.randomUUID(), done: false })),
    )
  }

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

    const assignedTo =
      assignee === 'pool' || assignee === 'both'
        ? null
        : assignee === 'me'
          ? me.id
          : assignee

    if (isEdit && editId) {
      // Édition : persistance non conditionnée par `showAdvanced` pour ne pas
      // perdre de données si le panneau avancé est replié. Les points de
      // création restent figés (pas de re-crédit, pas de recalcul de points_value).
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          assigned_to: assignedTo,
          shared: assignee === 'both',
          title: title.trim(),
          temporal_planning: {
            start_date: startDate || null,
            end_date: endDate || null,
            time: time || null,
          },
          sub_tasks: subTasks,
          recurrence: recurrence !== 'none' ? { frequency: recurrence } : null,
          reminders: reminder !== 'none' ? [{ offset: reminder }] : null,
          location: location.trim() || null,
          notes: notes.trim() || null,
          tags,
        })
        .eq('id', editId)

      if (updateError) {
        setSubmitting(false)
        setError(updateError.message)
        return
      }
      navigate(-1)
      return
    }

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
      location: location.trim() || null,
      notes: showAdvanced && notes.trim() ? notes.trim() : null,
      tags,
      points_value: total,
    })

    if (insertError) {
      setSubmitting(false)
      setError(insertError.message)
      return
    }
    navigate('/tableau-de-bord', { replace: true })
  }

  if (!me || loadingTask) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted" role="status">
        Chargement…
      </div>
    )
  }

  const assignOptions: { value: string; label: string; icon: ReactNode }[] = [
    {
      value: 'me',
      label: 'Vous',
      icon: <Avatar name={me.first_name} color={me.avatar_color} size="sm" />,
    },
    ...(coParent
      ? [
          {
            value: coParent.id,
            label: coParent.first_name ?? 'Co-parent',
            icon: <Avatar name={coParent.first_name} color={coParent.avatar_color} size="sm" />,
          },
          {
            value: 'both',
            label: 'Les deux',
            icon: (
              <span className="flex">
                <Avatar name={me.first_name} color={me.avatar_color} size="sm" />
                <span className="-ml-2">
                  <Avatar name={coParent.first_name} color={coParent.avatar_color} size="sm" />
                </span>
              </span>
            ),
          },
        ]
      : []),
    {
      value: 'pool',
      label: 'Réserve',
      icon: (
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-line-strong text-muted">
          ?
        </span>
      ),
    },
  ]

  // Impact projeté sur la jauge : création (au créateur) + exécution estimée.
  const execMe = assignee === 'me' ? 15 : assignee === 'both' ? 7 : 0
  const execCo =
    coParent && assignee === coParent.id ? 15 : assignee === 'both' ? 7 : 0
  const aProjected = me.points + total + execMe
  const bProjected = (coParent?.points ?? 0) + execCo

  return (
    <div className="min-h-screen">
      <AppHeader profile={me} />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            {isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h1>
          <p className="mt-1 text-muted">
            {isEdit
              ? 'Ajustez les détails de la tâche. Les points de création ne sont pas recalculés.'
              : 'Renseignez les détails — les points et le bonus de planification se calculent en direct.'}
          </p>
        </div>

        {!isEdit && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <PlanningBonusWidget level={level} bonus={bonus} total={total} />
            <ImpactGauge
              meName={me.first_name ?? 'Vous'}
              coParentName={coParent?.first_name ?? null}
              aProjected={aProjected}
              bProjected={bProjected}
              gainNow={total}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {error && <Alert variant="error">{error}</Alert>}

          {!isEdit && templates.length > 0 && (
            <fieldset className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
              <legend className="px-1 text-lg font-bold text-ink">
                Partir d'un modèle
              </legend>
              <p className="text-sm text-muted">
                Pré-remplit le formulaire. Vous pourrez tout ajuster avant de créer.
              </p>
              <ul className="flex flex-wrap gap-2">
                {templates.map((tpl) => (
                  <li
                    key={tpl.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 py-1 pl-1 pr-1 text-sm font-bold text-ink-2"
                  >
                    <button
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="min-h-[36px] rounded-full px-3 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {tpl.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeTemplate(tpl.id)}
                      aria-label={`Supprimer le modèle : ${tpl.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-3 hover:text-danger focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}

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

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-bold text-ink-2" id={assignId}>
                Assignation
              </legend>
              <div
                role="radiogroup"
                aria-labelledby={assignId}
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {assignOptions.map((opt) => {
                  const active = assignee === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setAssignee(opt.value)}
                      className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
                        active
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-line bg-surface text-ink-2 hover:border-line-strong'
                      }`}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={locId} className="text-sm font-bold text-ink-2">
                Lieu
              </label>
              <input
                id={locId}
                className={INPUT}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Piscine municipale, école…"
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-ink-2">Étiquettes</span>
              <TagEditor tags={tags} onChange={setTags} suggestions={tagPool} />
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

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor={notesId} className="text-sm font-bold text-ink-2">
                  Notes (facultatif)
                </label>
                <textarea
                  id={notesId}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Précisions utiles pour la tâche…"
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                />
                <SensitiveDataNotice />
              </div>
            </fieldset>
          )}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
            >
              {isEdit
                ? submitting
                  ? 'Enregistrement…'
                  : 'Enregistrer les modifications'
                : submitting
                  ? 'Création…'
                  : `Créer la tâche (${total} pts)`}
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

      <MobileTabBar />
    </div>
  )
}
