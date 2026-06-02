import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { geocodeCity } from '../lib/weather'
import type { Family } from '../types'

export interface UseFamily {
  family: Family | null
  loading: boolean
  saveLocation: (city: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useFamily(): UseFamily {
  const { profile } = useAuth()
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const load = useCallback(async (): Promise<void> => {
    if (!profile) return
    const { data } = await supabase
      .from('families')
      .select('*')
      .eq('id', profile.family_id)
      .maybeSingle()
    setFamily((data as Family | null) ?? null)
    setLoading(false)
  }, [profile])

  useEffect(() => {
    // setState uniquement après await (asynchrone) — faux positif de la règle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const saveLocation = useCallback(
    async (city: string): Promise<void> => {
      if (!profile) throw new Error('Profil indisponible')
      const geo = await geocodeCity(city)
      if (!geo) throw new Error('Ville introuvable. Vérifiez l’orthographe.')
      const { error } = await supabase.from('families').upsert({
        id: profile.family_id,
        city: geo.name,
        postal_code: geo.postalCode,
        latitude: geo.latitude,
        longitude: geo.longitude,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      await load()
    },
    [profile, load],
  )

  return { family, loading: loading && Boolean(profile), saveLocation, refresh: load }
}
