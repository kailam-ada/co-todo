import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Alert } from '../components/Alert'
import { ProfileForm } from '../components/ProfileForm'
import { PairingModule } from '../components/PairingModule'

export function Account() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(): Promise<void> {
    setDeleteError(null)
    setDeleting(true)
    const { error } = await supabase.rpc('anonymize_account')
    if (error) {
      setDeleting(false)
      setDeleteError(error.message)
      return
    }
    await signOut()
    navigate('/', { replace: true })
  }

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <p className="text-slate-700" role="status">
          Chargement du profil…
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Mon compte</h1>
        <button
          type="button"
          onClick={() => void signOut().then(() => navigate('/'))}
          className="flex min-h-[44px] items-center justify-center rounded-lg border border-slate-400 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
        >
          Se déconnecter
        </button>
      </header>

      <ProfileForm key={profile.id} profile={profile} />

      <PairingModule />

      <section className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5">
        <h2 className="text-lg font-semibold text-rose-900">Supprimer mon compte</h2>
        <p className="text-sm text-rose-900">
          Cette action est irréversible. Vos données personnelles sont
          anonymisées ; votre co-parent verra « Ex-coparent » à votre place,
          sans perdre l'historique des tâches.
        </p>
        {deleteError && <Alert variant="error">{deleteError}</Alert>}

        {confirmingDelete ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-rose-700 px-5 font-semibold text-white hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2 disabled:opacity-60"
            >
              {deleting ? 'Suppression…' : 'Confirmer la suppression'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-slate-400 px-5 font-semibold text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex min-h-[44px] items-center justify-center rounded-lg border border-rose-700 px-5 font-semibold text-rose-700 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2"
          >
            Supprimer mon compte
          </button>
        )}
      </section>
    </main>
  )
}
