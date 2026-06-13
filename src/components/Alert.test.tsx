import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  it('rend une erreur avec le rôle « alert » et le libellé « Erreur »', () => {
    render(<Alert variant="error">Quelque chose a échoué</Alert>)
    const box = screen.getByRole('alert')
    expect(box).toHaveTextContent('Erreur')
    expect(box).toHaveTextContent('Quelque chose a échoué')
  })

  it('rend un succès avec le rôle « status » et le libellé « Succès »', () => {
    render(<Alert variant="success">Modifications enregistrées</Alert>)
    const box = screen.getByRole('status')
    expect(box).toHaveTextContent('Succès')
    expect(box).toHaveTextContent('Modifications enregistrées')
  })

  it('rend une information avec le rôle « status » et le libellé « Information »', () => {
    render(<Alert variant="info">À noter</Alert>)
    const box = screen.getByRole('status')
    expect(box).toHaveTextContent('Information')
    expect(box).toHaveTextContent('À noter')
  })
})
