import { describe, it, expect } from 'vitest'
import { validateNewPassword, MIN_PASSWORD_LENGTH } from './passwordValidation'

describe('validateNewPassword', () => {
  it('accepte un mot de passe valide et confirmé', () => {
    expect(validateNewPassword('secret123', 'secret123')).toBeNull()
  })
  it('refuse un mot de passe trop court', () => {
    expect(validateNewPassword('abc', 'abc')).toMatch(/au moins/)
  })
  it('refuse une confirmation différente', () => {
    expect(validateNewPassword('secret123', 'secret124')).toMatch(
      /ne correspondent pas/,
    )
  })
  it('borne minimale exacte acceptée', () => {
    const pw = 'a'.repeat(MIN_PASSWORD_LENGTH)
    expect(validateNewPassword(pw, pw)).toBeNull()
  })
})
