import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { periodStart, type Period } from '../lib/periodPoints'
import type { Task } from '../types'

/**
 * Tâches du foyer créées OU complétées depuis le début de la période, pour le
 * calcul des points de la jauge. La RLS limite déjà au foyer courant.
 */
export function usePeriodTasks(period: Period): { tasks: Task[]; loading: boolean } {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const startIso = periodStart(period).toISOString()

  const load = useCallback(async (): Promise<void> => {
    if (!profile) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .or(`created_at.gte.${startIso},completed_at.gte.${startIso}`)
    if (data) setTasks(data as Task[])
    setLoading(false)
  }, [profile, startIso])

  useEffect(() => {
    // setState uniquement après await (asynchrone) — faux positif de la règle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  return { tasks, loading: loading && Boolean(profile) }
}
