import { useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useAuth } from '../hooks/useAuth'
import { describeAuthError } from '../lib/authErrors'
import { TextField } from '../components/TextField'
import { Alert } from '../components/Alert'
import { Captcha } from '../components/Captcha'
import { captchaEnabled } from '../lib/captcha'

export function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const consentId = useId()

  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)
    if (!consent) {
      setError('Vous devez accepter les CGU et la politique de confidentialité pour continuer.')
      return
    }
    setSubmitting(true)
    try {
      await signUp({ email, password, firstName, captchaToken: captchaToken ?? undefined })
      setRegistered(true)
    } catch (err) {
      setError(describeAuthError(err))
      captchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (registered) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <h1 className="text-2xl font-bold text-ink">Compte créé</h1>
        <div className="mt-4">
          <Alert variant="success">
            Vérifiez votre boîte mail pour confirmer votre adresse, puis
            connectez-vous.
          </Alert>
        </div>
        <button
          type="button"
          onClick={() => navigate('/connexion')}
          className="mt-6 flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
        >
          Aller à la connexion
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-ink">Créer un compte</h1>
      <p className="mt-2 text-muted">Quelques informations pour démarrer.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <TextField
          label="Prénom"
          value={firstName}
          onChange={setFirstName}
          required
          autoComplete="given-name"
        />
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
          autoComplete="new-password"
          hint="6 caractères minimum."
        />

        <div className="flex items-start gap-3">
          <input
            id={consentId}
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong text-primary focus:ring-2 focus:ring-primary"
          />
          <label htmlFor={consentId} className="text-sm text-ink-2">
            J'accepte les{' '}
            <Link
              to="/cgu"
              className="font-medium text-primary hover:underline"
              target="_blank"
            >
              conditions générales d'utilisation
            </Link>{' '}
            et que mes données soient traitées conformément à la{' '}
            <Link
              to="/confidentialite"
              className="font-medium text-primary hover:underline"
              target="_blank"
            >
              politique de confidentialité
            </Link>{' '}
            (RGPD). Co-Todo ne collecte que les données nécessaires au
            fonctionnement du foyer.
            <span className="text-danger" aria-hidden="true">
              {' '}
              *
            </span>
          </label>
        </div>

        <Captcha ref={captchaRef} onToken={setCaptchaToken} />

        <button
          type="submit"
          disabled={submitting || !consent || (captchaEnabled && !captchaToken)}
          className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà inscrit ?{' '}
        <Link to="/connexion" className="font-bold text-primary underline">
          Se connecter
        </Link>
      </p>
    </main>
  )
}
