import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  title: string
  updatedAt: string
  children: ReactNode
}

export function LegalLayout({ title, updatedAt, children }: Props) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-12">
      <Link
        to="/"
        className="inline-flex min-h-[44px] items-center self-start text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
      >
        ← Retour à l'accueil
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : {updatedAt}</p>

      <div className="legal-content mt-8 flex flex-col gap-6 text-ink-2">
        {children}
      </div>

      <nav
        aria-label="Pages légales"
        className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm"
      >
        <Link to="/confidentialite" className="text-primary hover:underline">
          Politique de confidentialité
        </Link>
        <Link to="/mentions-legales" className="text-primary hover:underline">
          Mentions légales
        </Link>
        <Link to="/cgu" className="text-primary hover:underline">
          Conditions générales d'utilisation
        </Link>
      </nav>
    </main>
  )
}
