import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Item {
  to: string
  label: string
  icon: ReactNode
}

const ITEMS: Item[] = [
  {
    to: '/tableau-de-bord',
    label: 'Accueil',
    icon: (
      <path d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10" />
    ),
  },
  {
    to: '/reserve',
    label: 'Réserve',
    icon: <path d="M4 6h16M4 12h16M4 18h10" />,
  },
  {
    to: '/creation',
    label: 'Créer',
    icon: <path d="M12 5v14M5 12h14" />,
  },
]

export function MobileTabBar() {
  return (
    <nav
      aria-label="Navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface sm:hidden"
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary ${
              isActive
                ? 'bg-primary-soft text-primary'
                : 'text-muted hover:text-ink'
            }`
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-6 w-6"
          >
            {item.icon}
          </svg>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
