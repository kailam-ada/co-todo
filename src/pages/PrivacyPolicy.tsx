import { LegalLayout } from '../components/LegalLayout'

const CONTACT_EMAIL = 'kai.lam0@gmail.com'

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Politique de confidentialité" updatedAt="3 juin 2026">
      <section>
        <p>
          Co-Todo accorde une importance particulière à la protection de vos
          données personnelles et à celles de votre foyer. Cette politique
          décrit, conformément au Règlement Général sur la Protection des
          Données (RGPD), quelles données sont collectées, pourquoi, et comment
          vous pouvez exercer vos droits.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Responsable du traitement</h2>
        <p className="mt-2">
          Le service Co-Todo est édité par un particulier. Pour toute question
          relative à vos données, vous pouvez écrire à{' '}
          <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Données collectées</h2>
        <p className="mt-2">
          Co-Todo applique le principe de minimisation : seules les données
          strictement nécessaires au fonctionnement du foyer sont collectées.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>
            <strong>Compte :</strong> votre prénom et votre adresse e-mail.
          </li>
          <li>
            <strong>Foyer :</strong> la ville ou le code postal du foyer (pour le
            module météo), sans aucune géolocalisation GPS en temps réel.
          </li>
          <li>
            <strong>Usage :</strong> les tâches, sous-tâches, échéances et points
            que vous créez ou complétez.
          </li>
        </ul>
        <p className="mt-3">
          <strong>Mineurs :</strong> aucune donnée d'identité nominative ni
          donnée sensible concernant des enfants n'est collectée. Seuls des
          prénoms ou pseudonymes sont utilisés.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Finalités et base légale</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>
            Création et gestion de votre compte et de l'appairage familial —{' '}
            <em>exécution du service</em>.
          </li>
          <li>
            Affichage des tâches partagées et de la jauge d'équilibre —{' '}
            <em>exécution du service</em>.
          </li>
          <li>
            Conseil d'habillage selon la météo locale —{' '}
            <em>votre consentement</em>, recueilli à l'inscription.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Hébergement et sous-traitants</h2>
        <p className="mt-2">
          Vos données sont stockées et traitées par les prestataires suivants :
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>
            <strong>Supabase</strong> (base de données, authentification) — accès
            cloisonné par foyer via des règles de sécurité au niveau des lignes
            (Row Level Security).
          </li>
          <li>
            <strong>Vercel</strong> — hébergement de l'application web.
          </li>
          <li>
            <strong>Open-Meteo</strong> — fournisseur de données météo, sans clé
            d'API et respectueux de la vie privée. Aucune donnée personnelle ne
            lui est transmise.
          </li>
          <li>
            <strong>Cloudflare Turnstile</strong> — protection anti-robot des
            formulaires (lorsqu'activée), sans suivi publicitaire.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Durée de conservation</h2>
        <p className="mt-2">
          Vos données sont conservées tant que votre compte est actif. Les codes
          d'invitation familiale expirent automatiquement après 24 heures.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">
          Droit à l'oubli et suppression de compte
        </h2>
        <p className="mt-2">
          Vous pouvez supprimer votre compte à tout moment depuis votre espace
          personnel. Cette action déclenche une anonymisation irréversible :
          votre e-mail et votre prénom sont purgés, et votre profil apparaît
          comme « Ex-coparent » chez l'autre parent afin de préserver
          l'historique des tâches partagées.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">Vos droits</h2>
        <p className="mt-2">
          Conformément au RGPD, vous disposez d'un droit d'accès, de
          rectification, d'effacement, de limitation, de portabilité et
          d'opposition. Vous pouvez les exercer en écrivant à{' '}
          <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Vous avez également le droit d'introduire une réclamation auprès de
          la CNIL (
          <a
            className="text-primary hover:underline"
            href="https://www.cnil.fr"
            target="_blank"
            rel="noreferrer"
          >
            www.cnil.fr
          </a>
          ).
        </p>
      </section>
    </LegalLayout>
  )
}
