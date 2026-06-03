import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { describeAuthError } from '../lib/authErrors'
import { validateNewPassword } from '../lib/passwordValidation'
import { TextField } from '../components/TextField'
import { Alert } from '../components/Alert'

export function ResetPassword() {
  const { session, loading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    const invalid = validateNewPassword(password, confirm)
    if (invalid) {
      setError(invalid)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await updatePassword(password)
      navigate('/tableau-de-bord', { replace: true })
    } catch (err) {
      setError(describeAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted" role="status">
        Vérification du lien…
      </main>
    )
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <h1 className="text-2xl font-bold text-ink">Lien invalide ou expiré</h1>
        <p className="mt-2 text-muted">
          Ce lien de réinitialisation n'est plus valable. Demandez-en un nouveau.
        </p>
        <Link
          to="/mot-de-passe-oublie"
          className="mt-6 flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
        >
          Demander un nouveau lien
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-ink">Nouveau mot de passe</h1>
      <p className="mt-2 text-muted">Choisissez un nouveau mot de passe pour votre compte.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <TextField
          label="Nouveau mot de passe"
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
          hint="6 caractères minimum."
        />
        <TextField
          label="Confirmer le mot de passe"
          type="password"
          value={confirm}
          onChange={setConfirm}
          required
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={submitting || !password || !confirm}
          className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Enregistrement…' : 'Définir le mot de passe'}
        </button>
      </form>
    </main>
  )
}
