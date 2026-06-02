import { Link, NavLink } from 'react-router-dom'
import type { Profile } from '../types'
import { Avatar } from './Avatar'
import { WeatherWidget } from './WeatherWidget'

interface Props {
  profile: Profile
}

const NAV = [
  { to: '/tableau-de-bord', label: 'Tableau de bord' },
  { to: '/reserve', label: 'Réserve' },
]

export function AppHeader({ profile }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link
          to="/tableau-de-bord"
          className="flex items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
        >
          <img src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight text-ink">Co-Todo</span>
        </Link>

        <nav className="ml-3 hidden gap-1 sm:flex" aria-label="Navigation principale">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream ${
                  isActive
                    ? 'text-primary underline decoration-2 underline-offset-8'
                    : 'text-ink-2 hover:bg-surface-2'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <span className="flex-1" />

        <WeatherWidget />

        <Link
          to="/compte"
          aria-label="Mon compte"
          className="flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 font-bold text-ink-2 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
        >
          <Avatar name={profile.first_name} color={profile.avatar_color} />
          <span className="hidden text-sm sm:inline">
            {profile.first_name ?? 'Mon compte'}
          </span>
        </Link>
      </div>
    </header>
  )
}
