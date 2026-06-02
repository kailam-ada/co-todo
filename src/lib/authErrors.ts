import { AuthError } from '@supabase/supabase-js'

export function describeAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'Email ou mot de passe incorrect.'
      case 'email_not_confirmed':
        return 'Veuillez confirmer votre email avant de vous connecter.'
      case 'user_already_exists':
      case 'email_exists':
        return 'Un compte existe déjà avec cet email.'
      case 'weak_password':
        return 'Mot de passe trop faible (6 caractères minimum).'
      case 'over_email_send_rate_limit':
        return 'Trop de tentatives. Réessayez dans quelques minutes.'
      default:
        return error.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Une erreur inattendue est survenue.'
}
