/** Longueur minimale imposée à la création/modification d'un mot de passe. */
export const MIN_PASSWORD_LENGTH = 8

/**
 * Texte d'aide affiché sous les champs de mot de passe pour décrire la
 * politique de robustesse exigée.
 */
export const PASSWORD_HINT =
  '8 caractères minimum, avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'

/**
 * Valide la robustesse d'un mot de passe selon la politique : au moins
 * 8 caractères, une majuscule, une minuscule, un chiffre et un caractère
 * spécial. Renvoie un message d'erreur en français, ou `null` si valide.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`
  }
  if (!/[A-Z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une majuscule.'
  }
  if (!/[a-z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une minuscule.'
  }
  if (!/[0-9]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un chiffre.'
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un caractère spécial.'
  }
  return null
}

/**
 * Valide un nouveau mot de passe (robustesse) et sa confirmation. Renvoie un
 * message d'erreur en français, ou `null` si tout est valide.
 */
export function validateNewPassword(
  password: string,
  confirm: string,
): string | null {
  const strengthError = validatePasswordStrength(password)
  if (strengthError) {
    return strengthError
  }
  if (password !== confirm) {
    return 'Les mots de passe ne correspondent pas.'
  }
  return null
}
