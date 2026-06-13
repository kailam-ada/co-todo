import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceGauge } from './BalanceGauge'

const noop = () => {}

describe('BalanceGauge', () => {
  it('affiche le pourcentage de chaque parent dans la légende, même quand une part est faible (lisible sur mobile)', () => {
    // Régression : avec un faible %, le texte du segment était rogné par overflow-hidden.
    // La légende (pleine largeur) garantit désormais la lisibilité du pourcentage.
    render(
      <BalanceGauge
        meName="Alice"
        coParentName="Bob"
        aPoints={85}
        bPoints={15}
        period="month"
        onPeriodChange={noop}
      />,
    )
    expect(screen.getByText('85% · 85 pts')).toBeInTheDocument()
    expect(screen.getByText('15% · 15 pts')).toBeInTheDocument()
  })

  it("n'affiche pas de pourcentage trompeur dans la légende quand il n'y a aucun point", () => {
    render(
      <BalanceGauge
        meName="Alice"
        coParentName="Bob"
        aPoints={0}
        bPoints={0}
        period="month"
        onPeriodChange={noop}
      />,
    )
    expect(screen.getAllByText('0 pts')).toHaveLength(2)
    expect(screen.queryByText(/%/)).toBeNull()
  })
})
