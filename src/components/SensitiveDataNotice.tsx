/**
 * Avertissement RGPD affiché sous les champs de texte libre : rappelle de ne
 * pas saisir de données sensibles, surtout concernant des mineurs.
 */
export function SensitiveDataNotice() {
  return (
    <p className="flex items-start gap-1.5 rounded-md bg-surface-2 px-2.5 py-2 text-xs text-ink-2">
      <span aria-hidden="true">🔒</span>
      <span>
        <span className="font-bold">Confidentialité :</span> n'indiquez pas de
        données sensibles (santé, religion, opinions…). Pour les enfants,
        utilisez uniquement un prénom ou un pseudonyme.
      </span>
    </p>
  )
}
