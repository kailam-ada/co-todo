import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Pillar {
  icon: string
  title: string
  description: string
}

const PILLARS: Pillar[] = [
  {
    icon: '🎯',
    title: 'Focus action',
    description:
      "Une seule chose à la fois. L'app met en avant la prochaine action concrète, sans liste interminable.",
  },
  {
    icon: '⚖️',
    title: 'Équilibre',
    description:
      'Répartissez la charge mentale entre co-parents grâce à une jauge claire et lisible.',
  },
  {
    icon: '🌿',
    title: 'Zéro culpabilité',
    description:
      'Pas de score qui punit. Co-Todo valorise la planification et le partage, pas la performance.',
  },
]

export function Onboarding() {
  const { session, loading } = useAuth()

  if (!loading && session) {
    return <Navigate to="/tableau-de-bord" replace />
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <img src="/logo.svg" alt="" width={72} height={72} className="h-16 w-16" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Co-Todo
      </h1>
      <p className="mt-3 max-w-xl text-lg text-muted">
        L'organisation familiale partagée, pensée pour alléger la charge mentale
        des co-parents.
      </p>

      <ul className="mt-10 grid w-full gap-4 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <li
            key={pillar.title}
            className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface p-5 text-center shadow-sm"
          >
            <span className="text-3xl" aria-hidden="true">
              {pillar.icon}
            </span>
            <h2 className="text-lg font-bold text-ink">{pillar.title}</h2>
            <p className="text-sm text-muted">{pillar.description}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link
          to="/inscription"
          className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
        >
          Créer un compte
        </Link>
        <Link
          to="/connexion"
          className="flex min-h-[44px] items-center justify-center rounded-lg border border-line-strong px-5 font-bold text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
        >
          J'ai déjà un compte
        </Link>
      </div>

      <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
        <Link to="/confidentialite" className="hover:text-ink hover:underline">
          Confidentialité
        </Link>
        <Link to="/mentions-legales" className="hover:text-ink hover:underline">
          Mentions légales
        </Link>
        <Link to="/cgu" className="hover:text-ink hover:underline">
          CGU
        </Link>
      </footer>
    </main>
  )
}
