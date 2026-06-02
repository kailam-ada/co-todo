import { useEffect, useId, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Abonnement Supabase Realtime aux changements des tables `tasks` et `profiles`
 * du foyer courant. À chaque évènement (insert/update/delete) propagé par un
 * co-parent, `onChange` est appelé pour rafraîchir les données.
 *
 * Le topic est unique par instance afin que plusieurs consommateurs sur une même
 * page (dashboard + jauge) n'entrent pas en collision. La RLS limite déjà les
 * évènements reçus au foyer ; le filtre `family_id` ajoute la sélection serveur.
 */
export function useFamilyRealtime(
  familyId: string | null | undefined,
  onChange: () => void,
): void {
  const cb = useRef(onChange)
  useEffect(() => {
    cb.current = onChange
  })

  const instanceId = useId()

  useEffect(() => {
    if (!familyId) return
    const handler = (): void => cb.current()
    const filter = `family_id=eq.${familyId}`
    const channel = supabase
      .channel(`family-${familyId}-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter },
        handler,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter },
        handler,
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [familyId, instanceId])
}
