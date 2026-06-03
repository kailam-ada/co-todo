import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useAuth } from '../hooks/useAuth'
import { describeAuthError } from '../lib/authErrors'
import { TextField } from '../components/TextField'
import { Alert } from '../components/Alert'
import { Captcha } from '../components/Captcha'
import { captchaEnabled } from '../lib/captcha'

export function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await resetPasswordForEmail(email, captchaToken ?? undefined)
      setSent(true)
    } catch (err) {
      setError(describeAuthError(err))
      captchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-ink">Mot de passe oublié</h1>
      <p className="mt-2 text-muted">
        Indiquez votre email : nous vous enverrons un lien pour définir un nouveau
        mot de passe.
      </p>

      {sent ? (
        <div className="mt-6 flex flex-col gap-4">
          <Alert variant="success">
            Si un compte existe pour cette adresse, un e-mail de réinitialisation
            vient d'être envoyé. Pensez à vérifier vos spams.
          </Alert>
          <Link
            to="/connexion"
            className="flex min-h-[44px] items-center justify-center rounded-lg border border-line-strong bg-surface px-5 font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          {error && <Alert variant="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />

          <Captcha ref={captchaRef} onToken={setCaptchaToken} />

          <button
            type="submit"
            disabled={submitting || !email || (captchaEnabled && !captchaToken)}
            className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/connexion" className="font-bold text-primary underline">
          Retour à la connexion
        </Link>
      </p>
    </main>
  )
}
