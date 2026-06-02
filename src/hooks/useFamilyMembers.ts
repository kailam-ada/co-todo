import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Profile } from '../types'

export function useFamilyMembers(): { members: Profile[]; loading: boolean } {
  const { profile } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const load = useCallback(async (): Promise<void> => {
    if (!profile) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', profile.family_id)
      .order('created_at', { ascending: true })
    if (data) setMembers(data as Profile[])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    // setState uniquement après await (asynchrone) — faux positif de la règle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  return { members, loading: loading && Boolean(profile) }
}
