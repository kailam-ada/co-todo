import { Link } from 'react-router-dom'

export function CreateTaskStub() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 text-center">
      <img src="/logo.svg" alt="" width={56} height={56} className="mx-auto h-14 w-14" />
      <h1 className="mt-4 text-2xl font-bold text-ink">Nouvelle tâche</h1>
      <p className="mt-2 text-muted">
        Le formulaire de création (divulgation progressive + moteur de points)
        arrive à la Phase&nbsp;3.
      </p>
      <Link
        to="/tableau-de-bord"
        className="mt-6 flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
      >
        Retour au tableau de bord
      </Link>
    </main>
  )
}
