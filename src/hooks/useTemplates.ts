import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { templateRowFromTask } from '../lib/templates'
import type { Task, TaskTemplate } from '../types'

export interface TemplatesData {
  templates: TaskTemplate[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  saveFromTask: (task: Task, name: string) => Promise<boolean>
  remove: (id: string) => Promise<void>
}

export function useTemplates(): TemplatesData {
  const { profile } = useAuth()
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (): Promise<void> => {
    if (!profile) return
    const { data, error: loadError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('family_id', profile.family_id)
      .order('created_at', { ascending: false })
    setError(loadError?.message ?? null)
    if (data) setTemplates(data as TaskTemplate[])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    // setState uniquement après await (asynchrone) — faux positif de la règle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const saveFromTask = useCallback(
    async (task: Task, name: string): Promise<boolean> => {
      if (!profile) return false
      const row = templateRowFromTask(task, name, profile.family_id, profile.id)
      const { error: insertError } = await supabase
        .from('task_templates')
        .insert(row)
      if (insertError) {
        setError(insertError.message)
        return false
      }
      await load()
      return true
    },
    [load, profile],
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const { error: deleteError } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id)
      if (deleteError) {
        setError(deleteError.message)
        return
      }
      await load()
    },
    [load],
  )

  return {
    templates,
    loading: loading && Boolean(profile),
    error,
    refresh: load,
    saveFromTask,
    remove,
  }
}
