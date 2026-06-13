import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlanningBonusWidget } from './PlanningBonusWidget'

describe('PlanningBonusWidget', () => {
  it('affiche le total estimé et le détail « base + bonus »', () => {
    render(<PlanningBonusWidget level="complete" bonus={10} total={15} />)
    const widget = screen.getByRole('region', {
      name: 'Points estimés à la création',
    })
    expect(widget).toHaveTextContent('15')
    expect(widget).toHaveTextContent('5 base')
    expect(widget).toHaveTextContent('+ 10 bonus')
  })

  it('marque l’étape de planification active selon le niveau', () => {
    render(<PlanningBonusWidget level="partial" bonus={5} total={10} />)
    // l’étape correspondant au niveau courant porte aria-current="step"
    expect(screen.getByText('Partiel').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )
    // une étape supérieure non atteinte n’est pas l’étape courante
    expect(screen.getByText('Total').closest('li')).not.toHaveAttribute(
      'aria-current',
    )
  })
})
