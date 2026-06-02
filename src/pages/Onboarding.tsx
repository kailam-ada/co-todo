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
    return <Navigate to="/compte" replace />
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Co-Todo
      </h1>
      <p className="mt-3 max-w-xl text-lg text-slate-700">
        L'organisation familiale partagée, pensée pour alléger la charge mentale
        des co-parents.
      </p>

      <ul className="mt-10 grid w-full gap-4 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <li
            key={pillar.title}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm"
          >
            <span className="text-3xl" aria-hidden="true">
              {pillar.icon}
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              {pillar.title}
            </h2>
            <p className="text-sm text-slate-700">{pillar.description}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link
          to="/inscription"
          className="flex min-h-[44px] items-center justify-center rounded-lg bg-indigo-700 px-5 font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
        >
          Créer un compte
        </Link>
        <Link
          to="/connexion"
          className="flex min-h-[44px] items-center justify-center rounded-lg border border-slate-400 px-5 font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
        >
          J'ai déjà un compte
        </Link>
      </div>
    </main>
  )
}
