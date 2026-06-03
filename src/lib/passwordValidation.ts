/** Longueur minimale imposée par Supabase Auth. */
export const MIN_PASSWORD_LENGTH = 6

/**
 * Valide un nouveau mot de passe et sa confirmation. Renvoie un message d'erreur
 * en français, ou `null` si tout est valide.
 */
export function validateNewPassword(
  password: string,
  confirm: string,
): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`
  }
  if (password !== confirm) {
    return 'Les mots de passe ne correspondent pas.'
  }
  return null
}
