import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextField } from './TextField'

describe('TextField', () => {
  it('associe le label à l’input (le champ est accessible par son intitulé)', () => {
    render(<TextField label="Adresse e-mail" value="" onChange={() => {}} />)
    // getByLabelText échoue si le <label> n’est pas correctement lié à l’<input>.
    expect(screen.getByLabelText('Adresse e-mail')).toBeInTheDocument()
  })

  it('marque un champ requis (astérisque visible + attribut required)', () => {
    render(<TextField label="Mot de passe" value="" onChange={() => {}} required />)
    expect(screen.getByLabelText(/Mot de passe/)).toBeRequired()
    expect(screen.getByText('Mot de passe', { exact: false })).toHaveTextContent('*')
  })

  it('garantit une cible tactile d’au moins 44 px (RGAA)', () => {
    render(<TextField label="Nom" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Nom')).toHaveClass('min-h-[44px]')
  })

  it('relie l’indice au champ via aria-describedby', () => {
    render(<TextField label="Code" value="" onChange={() => {}} hint="6 caractères" />)
    const input = screen.getByLabelText('Code')
    const hint = screen.getByText('6 caractères')
    expect(input).toHaveAttribute('aria-describedby', hint.id)
  })

  it('remonte la valeur saisie via onChange', () => {
    const onChange = vi.fn()
    render(<TextField label="Prénom" value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Sophie' } })
    expect(onChange).toHaveBeenCalledWith('Sophie')
  })
})
