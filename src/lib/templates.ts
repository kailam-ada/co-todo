import type { SubTask, Tag, Task, TaskTemplate } from '../types'

/**
 * Ligne à insérer dans `task_templates` à partir d'une tâche existante.
 * Les dates absolues (début/échéance) sont écartées : un modèle est réutilisable
 * et porte l'ossature (heure, récurrence, sous-tâches, étiquettes…), pas un jour
 * précis du calendrier.
 */
export function templateRowFromTask(
  task: Task,
  name: string,
  familyId: string,
  createdBy: string | null,
): Omit<TaskTemplate, 'id' | 'created_at'> {
  return {
    family_id: familyId,
    created_by: createdBy,
    name: name.trim() || task.title,
    title: task.title,
    assigned_to: task.assigned_to,
    shared: task.shared,
    temporal_planning: { time: task.temporal_planning.time ?? null },
    sub_tasks: task.sub_tasks,
    recurrence: task.recurrence,
    reminders: task.reminders,
    location: task.location,
    notes: task.notes,
    tags: task.tags ?? [],
  }
}

export type RecurrenceKey = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
export type ReminderKey = 'none' | '10m' | '1h' | '1d'

export interface TemplateFormValues {
  title: string
  assignee: string
  startDate: string
  endDate: string
  time: string
  recurrence: RecurrenceKey
  reminder: ReminderKey
  location: string
  notes: string
  subTasks: SubTask[]
  tags: Tag[]
  showAdvanced: boolean
}

/** Clé d'assignation du formulaire à partir des champs `assigned_to` / `shared`. */
export function assigneeKey(
  assignedTo: string | null,
  shared: boolean,
  meId: string,
  coParentId: string | null,
): string {
  if (shared) return 'both'
  if (assignedTo === meId) return 'me'
  if (coParentId && assignedTo === coParentId) return coParentId
  return 'pool'
}

/**
 * Pré-remplit les champs du formulaire à partir d'une tâche existante (édition).
 * Contrairement à un modèle, on conserve les dates absolues (début / échéance).
 */
export function formValuesFromTask(
  task: Task,
  meId: string,
  coParentId: string | null,
): TemplateFormValues {
  const startDate = task.temporal_planning.start_date ?? ''
  const endDate = task.temporal_planning.end_date ?? ''
  const time = task.temporal_planning.time ?? ''
  const recurrence = (task.recurrence?.frequency as RecurrenceKey) ?? 'none'
  const reminderEntry = task.reminders?.[0] as { offset?: ReminderKey } | undefined
  const reminder = reminderEntry?.offset ?? 'none'
  const notes = task.notes ?? ''
  const subTasks = task.sub_tasks ?? []

  return {
    title: task.title,
    assignee: assigneeKey(task.assigned_to, task.shared, meId, coParentId),
    startDate,
    endDate,
    time,
    recurrence,
    reminder,
    location: task.location ?? '',
    notes,
    subTasks,
    tags: task.tags ?? [],
    showAdvanced:
      Boolean(startDate) ||
      Boolean(time) ||
      recurrence !== 'none' ||
      reminder !== 'none' ||
      Boolean(notes) ||
      subTasks.length > 0,
  }
}

/** Pré-remplit les champs du formulaire de création à partir d'un modèle. */
export function formValuesFromTemplate(
  template: TaskTemplate,
  meId: string,
  coParentId: string | null,
): TemplateFormValues {
  const time = template.temporal_planning.time ?? ''
  const recurrence = (template.recurrence?.frequency as RecurrenceKey) ?? 'none'
  const reminderEntry = template.reminders?.[0] as { offset?: ReminderKey } | undefined
  const reminder = reminderEntry?.offset ?? 'none'
  const notes = template.notes ?? ''
  const subTasks = template.sub_tasks ?? []

  return {
    title: template.title,
    assignee: assigneeKey(template.assigned_to, template.shared, meId, coParentId),
    startDate: '',
    endDate: '',
    time,
    recurrence,
    reminder,
    location: template.location ?? '',
    notes,
    subTasks,
    tags: template.tags ?? [],
    showAdvanced:
      Boolean(time) ||
      recurrence !== 'none' ||
      reminder !== 'none' ||
      Boolean(notes) ||
      subTasks.length > 0,
  }
}
