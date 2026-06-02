export type ProfileStatus = 'ACTIVE' | 'ANONYMIZED'

export interface Family {
  id: string
  city: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
}

export type TaskStatus = 'TODO' | 'COMPLETED'

export interface TemporalPlanning {
  start_date?: string | null
  end_date?: string | null
  time?: string | null
}

export interface SubTask {
  id: string
  label: string
  done: boolean
}

export interface Task {
  id: string
  family_id: string
  created_by: string | null
  assigned_to: string | null
  title: string
  status: TaskStatus
  shared: boolean
  temporal_planning: TemporalPlanning
  sub_tasks: SubTask[]
  recurrence: Record<string, unknown> | null
  reminders: unknown[] | null
  location: string | null
  notes: string | null
  points_value: number
  completed_at: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  first_name: string | null
  parent_label: string | null
  avatar_color: string
  family_id: string
  points: number
  status: ProfileStatus
  created_at: string
}
