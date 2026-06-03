import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useAuth } from '../hooks/useAuth'
import { describeAuthError } from '../lib/authErrors'
import { TextField } from '../components/TextField'
import { Alert } from '../components/Alert'
import { Captcha } from '../components/Captcha'
import { captchaEnabled } from '../lib/captcha'

export function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password, captchaToken ?? undefined)
      navigate('/tableau-de-bord', { replace: true })
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
      <h1 className="text-2xl font-bold text-ink">Connexion</h1>
      <p className="mt-2 text-muted">Heureux de vous revoir.</p>

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
        <TextField
          label="Mot de passe"
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
        />

        <div className="-mt-1 text-right">
          <Link
            to="/mot-de-passe-oublie"
            className="text-sm font-bold text-primary underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Captcha ref={captchaRef} onToken={setCaptchaToken} />

        <button
          type="submit"
          disabled={submitting || (captchaEnabled && !captchaToken)}
          className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="font-bold text-primary underline">
          Créer un compte
        </Link>
      </p>
    </main>
  )
}
