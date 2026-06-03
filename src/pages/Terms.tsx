import { LegalLayout } from '../components/LegalLayout'

const CONTACT_EMAIL = 'kai.lam0@gmail.com'

export function Terms() {
  return (
    <LegalLayout title="Conditions générales d'utilisation" updatedAt="3 juin 2026">
      <section>
        <h2 className="text-xl font-bold text-ink">1. Objet</h2>
        <p className="mt-2">
          Les présentes conditions générales d'utilisation (CGU) régissent
          l'accès et l'usage de Co-Todo, un service d'organisation familiale
          partagée destiné aux co-parents. En créant un compte, vous acceptez
          sans réserve les présentes CGU.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">2. Accès au service</h2>
        <p className="mt-2">
          Le service est accessible gratuitement à toute personne majeure
          disposant d'un accès à Internet. L'éditeur s'efforce d'assurer une
          disponibilité continue mais ne peut être tenu responsable des
          interruptions liées à la maintenance ou à des causes indépendantes de
          sa volonté.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">3. Compte utilisateur</h2>
        <p className="mt-2">
          La création d'un compte requiert un prénom, une adresse e-mail valide
          et un mot de passe. Vous êtes responsable de la confidentialité de vos
          identifiants et de toute activité réalisée depuis votre compte.
          L'appairage familial s'effectue via un code d'invitation temporaire
          que vous partagez de votre propre initiative avec l'autre parent.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">4. Règles d'usage</h2>
        <p className="mt-2">Vous vous engagez à ne pas :</p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>
            renseigner de données nominatives ou sensibles concernant des
            mineurs (utilisez uniquement des prénoms ou pseudonymes) ;
          </li>
          <li>
            utiliser le service à des fins illicites ou contraires à l'ordre
            public ;
          </li>
          <li>
            tenter de perturber, contourner ou compromettre la sécurité du
            service.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">5. Données personnelles</h2>
        <p className="mt-2">
          Le traitement de vos données est détaillé dans la{' '}
          <a className="text-primary hover:underline" href="/confidentialite">
            politique de confidentialité
          </a>
          , qui fait partie intégrante des présentes CGU.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">6. Responsabilité</h2>
        <p className="mt-2">
          Co-Todo est un outil d'aide à l'organisation. L'éditeur ne saurait être
          tenu responsable des décisions prises par les utilisateurs sur la base
          des informations affichées (notamment les conseils d'habillage liés à
          la météo, fournis à titre purement indicatif).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">7. Résiliation</h2>
        <p className="mt-2">
          Vous pouvez supprimer votre compte à tout moment depuis votre espace
          personnel. La suppression entraîne une anonymisation irréversible de
          vos données, dans les conditions décrites dans la politique de
          confidentialité.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">8. Modification des CGU</h2>
        <p className="mt-2">
          L'éditeur se réserve le droit de modifier les présentes CGU à tout
          moment. La version applicable est celle en vigueur à la date de votre
          utilisation du service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-ink">9. Droit applicable</h2>
        <p className="mt-2">
          Les présentes CGU sont soumises au droit français. Pour toute question,
          vous pouvez contacter l'éditeur à{' '}
          <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  )
}
