/** Clé publique Turnstile (site key). CAPTCHA actif uniquement si définie. */
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''

export const captchaEnabled = TURNSTILE_SITE_KEY.length > 0
