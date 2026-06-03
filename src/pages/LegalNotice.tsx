import { LegalLayout } from '../components/LegalLayout'

const CONTACT_EMAIL = 'kai.lam0@gmail.com'

export function LegalNotice() {
  return (
    <LegalLayout title="Mentions légales" updatedAt="3 juin 2026">
      <section>
        <h2 className="text-xl font-bold text-ink">Éditeur du service</h2>
        <p className="mt-2">
          Le service Co-Todo est édité à titre individuel par un particulier.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>
            <strong>Nom de l'éditeur :</strong> Kai LAM
          </li>
          <li>
            <strong>Contact :</strong>{' '}
            <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Hébergement</h2>
        <p className="mt-2">
          L'application est hébergée par <strong>Vercel Inc.</strong>, 340 S
          Lemon Ave #4133, Walnut, CA 91789, États-Unis —{' '}
          <a
            className="text-primary hover:underline"
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
          >
            vercel.com
          </a>
          .
        </p>
        <p className="mt-2">
          Les données sont stockées via <strong>Supabase</strong> —{' '}
          <a
            className="text-primary hover:underline"
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
          >
            supabase.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Propriété intellectuelle</h2>
        <p className="mt-2">
          L'ensemble des contenus, marques et éléments graphiques du service
          Co-Todo sont protégés. Toute reproduction ou réutilisation sans
          autorisation préalable de l'éditeur est interdite.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Données personnelles</h2>
        <p className="mt-2">
          Le traitement de vos données personnelles est décrit dans notre{' '}
          <a className="text-primary hover:underline" href="/confidentialite">
            politique de confidentialité
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  )
}
