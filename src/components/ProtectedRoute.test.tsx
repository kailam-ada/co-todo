import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { AuthContextValue } from '../contexts/auth-context'

// On isole le composant de son contexte d’authentification réel.
vi.mock('../hooks/useAuth')
import { useAuth } from '../hooks/useAuth'
import { ProtectedRoute } from './ProtectedRoute'

const mockUseAuth = vi.mocked(useAuth)

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/prive']}>
      <Routes>
        <Route
          path="/prive"
          element={
            <ProtectedRoute>
              <p>Contenu privé</p>
            </ProtectedRoute>
          }
        />
        <Route path="/connexion" element={<p>Page de connexion</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => mockUseAuth.mockReset())

  it('affiche un état de chargement tant que la session se charge', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
    } as unknown as AuthContextValue)
    renderProtected()
    expect(screen.getByRole('status')).toHaveTextContent('Chargement')
    expect(screen.queryByText('Contenu privé')).not.toBeInTheDocument()
  })

  it('redirige vers la connexion en l’absence de session', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: false,
    } as unknown as AuthContextValue)
    renderProtected()
    expect(screen.getByText('Page de connexion')).toBeInTheDocument()
    expect(screen.queryByText('Contenu privé')).not.toBeInTheDocument()
  })

  it('rend le contenu protégé lorsqu’une session existe', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      loading: false,
    } as unknown as AuthContextValue)
    renderProtected()
    expect(screen.getByText('Contenu privé')).toBeInTheDocument()
  })
})
