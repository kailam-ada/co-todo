import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-muted"
        role="status"
        aria-live="polite"
      >
        Chargement…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/connexion" replace />
  }

  return <>{children}</>
}
