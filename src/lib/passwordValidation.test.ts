import { describe, it, expect } from 'vitest'
import {
  validateNewPassword,
  validatePasswordStrength,
  MIN_PASSWORD_LENGTH,
} from './passwordValidation'

const VALID = 'Secret1!'

describe('validatePasswordStrength', () => {
  it('accepte un mot de passe conforme à la politique', () => {
    expect(validatePasswordStrength(VALID)).toBeNull()
  })
  it('refuse un mot de passe trop court', () => {
    expect(validatePasswordStrength('Ab1!')).toMatch(/au moins 8/)
  })
  it('refuse sans majuscule', () => {
    expect(validatePasswordStrength('secret1!')).toMatch(/majuscule/)
  })
  it('refuse sans minuscule', () => {
    expect(validatePasswordStrength('SECRET1!')).toMatch(/minuscule/)
  })
  it('refuse sans chiffre', () => {
    expect(validatePasswordStrength('Secret!!')).toMatch(/chiffre/)
  })
  it('refuse sans caractère spécial', () => {
    expect(validatePasswordStrength('Secret12')).toMatch(/spécial/)
  })
  it('borne minimale exacte conforme acceptée', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8)
    expect(validatePasswordStrength('Abcd123!')).toBeNull()
  })
})

describe('validateNewPassword', () => {
  it('accepte un mot de passe valide et confirmé', () => {
    expect(validateNewPassword(VALID, VALID)).toBeNull()
  })
  it('refuse un mot de passe faible avant même la confirmation', () => {
    expect(validateNewPassword('abc', 'abc')).toMatch(/au moins 8/)
  })
  it('refuse une confirmation différente', () => {
    expect(validateNewPassword(VALID, 'Secret2!')).toMatch(
      /ne correspondent pas/,
    )
  })
})
