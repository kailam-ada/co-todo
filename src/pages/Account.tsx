import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Alert } from '../components/Alert'
import { ProfileForm } from '../components/ProfileForm'
import { FamilyLocation } from '../components/FamilyLocation'
import { PairingModule } from '../components/PairingModule'
import { ChangePassword } from '../components/ChangePassword'

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
        <p className="text-muted" role="status">
          Chargement du profil…
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/tableau-de-bord"
            aria-label="Retour au tableau de bord"
            className="rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
          >
            <img src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9" />
          </Link>
          <h1 className="text-2xl font-bold text-ink">Mon compte</h1>
        </div>
        <button
          type="button"
          onClick={() => void signOut().then(() => navigate('/'))}
          className="flex min-h-[44px] items-center justify-center rounded-lg border border-line-strong px-4 text-sm font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
        >
          Se déconnecter
        </button>
      </header>

      <ProfileForm key={profile.id} profile={profile} />

      <FamilyLocation />

      <PairingModule />

      <ChangePassword />

      <section className="flex flex-col gap-3 rounded-card border border-danger/40 bg-danger-soft p-5">
        <h2 className="text-lg font-bold text-danger-hover">Supprimer mon compte</h2>
        <p className="text-sm text-danger-hover">
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
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-danger px-5 font-bold text-white hover:bg-danger-hover focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:ring-offset-danger-soft disabled:opacity-60"
            >
              {deleting ? 'Suppression…' : 'Confirmer la suppression'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-line-strong bg-surface px-5 font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-danger-soft"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex min-h-[44px] items-center justify-center rounded-lg border border-danger bg-surface px-5 font-bold text-danger hover:bg-surface focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:ring-offset-danger-soft"
          >
            Supprimer mon compte
          </button>
        )}
      </section>
    </main>
  )
}
