import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Profile, Task } from '../types'

export interface DashboardData {
  loading: boolean
  error: string | null
  me: Profile | null
  coParent: Profile | null
  members: Profile[]
  tasks: Task[]
  myTasks: Task[]
  poolTasks: Task[]
  refresh: () => Promise<void>
  completeTask: (id: string) => Promise<void>
  claimTask: (id: string) => Promise<void>
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>
}

export function useDashboard(): DashboardData {
  const { profile } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (): Promise<void> => {
    if (!profile) return
    const [membersRes, tasksRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: true }),
      supabase
        .from('tasks')
        .select('*')
        .eq('status', 'TODO')
        .order('created_at', { ascending: true }),
    ])

    const loadError = membersRes.error?.message ?? tasksRes.error?.message ?? null
    setError(loadError)
    if (membersRes.data) setMembers(membersRes.data as Profile[])
    if (tasksRes.data) setTasks(tasksRes.data as Task[])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    // `load` ne déclenche des setState qu'après l'await (asynchrone, non
    // synchrone) ; la règle ne trace pas la frontière await — faux positif.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const completeTask = useCallback(
    async (id: string): Promise<void> => {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .eq('id', id)
      if (updateError) {
        setError(updateError.message)
        return
      }
      await load()
    },
    [load],
  )

  const claimTask = useCallback(
    async (id: string): Promise<void> => {
      if (!profile) return
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ assigned_to: profile.id })
        .eq('id', id)
      if (updateError) {
        setError(updateError.message)
        return
      }
      await load()
    },
    [load, profile],
  )

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>): Promise<void> => {
      const { error: updateError } = await supabase
        .from('tasks')
        .update(patch)
        .eq('id', id)
      if (updateError) {
        setError(updateError.message)
        return
      }
      await load()
    },
    [load],
  )

  const me = profile
  const coParent =
    members.find((member) => member.id !== profile?.id) ?? null
  const myTasks = tasks.filter(
    (task) => task.assigned_to === profile?.id || task.shared,
  )
  const poolTasks = tasks.filter(
    (task) => task.assigned_to === null && !task.shared,
  )

  return {
    loading: loading && Boolean(profile),
    error,
    me,
    coParent,
    members,
    tasks,
    myTasks,
    poolTasks,
    refresh: load,
    completeTask,
    claimTask,
    updateTask,
  }
}
