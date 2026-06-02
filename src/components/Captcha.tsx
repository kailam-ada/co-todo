import { forwardRef } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { TURNSTILE_SITE_KEY } from '../lib/captcha'

interface Props {
  onToken: (token: string | null) => void
}

/**
 * Widget CAPTCHA Cloudflare Turnstile. Ne rend rien si aucune site key n'est
 * configurée (CAPTCHA désactivé). La ref permet de réinitialiser le widget
 * après une tentative échouée (un jeton est à usage unique).
 */
export const Captcha = forwardRef<TurnstileInstance | undefined, Props>(
  function Captcha({ onToken }, ref) {
    if (!TURNSTILE_SITE_KEY) return null
    return (
      <Turnstile
        ref={ref}
        siteKey={TURNSTILE_SITE_KEY}
        options={{ theme: 'light', language: 'fr' }}
        onSuccess={(token) => onToken(token)}
        onExpire={() => onToken(null)}
        onError={() => onToken(null)}
      />
    )
  },
)
