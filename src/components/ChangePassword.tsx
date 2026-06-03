import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { describeAuthError } from '../lib/authErrors'
import { validateNewPassword, PASSWORD_HINT } from '../lib/passwordValidation'
import { TextField } from './TextField'
import { Alert } from './Alert'

export function ChangePassword() {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    const invalid = validateNewPassword(password, confirm)
    if (invalid) {
      setError(invalid)
      setDone(false)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await updatePassword(password)
      setDone(true)
      setPassword('')
      setConfirm('')
    } catch (err) {
      setError(describeAuthError(err))
      setDone(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <h2 className="text-lg font-bold text-ink">Changer mon mot de passe</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        {done && <Alert variant="success">Votre mot de passe a été mis à jour.</Alert>}

        <TextField
          label="Nouveau mot de passe"
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
          hint={PASSWORD_HINT}
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
          className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60 sm:self-start sm:px-8"
        >
          {submitting ? 'Mise à jour…' : 'Mettre à jour'}
        </button>
      </form>
    </section>
  )
}
