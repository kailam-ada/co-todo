import { Link } from 'react-router-dom'

export function Fab() {
  return (
    <Link
      to="/creation"
      aria-label="Créer une tâche"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-cream"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  )
}
