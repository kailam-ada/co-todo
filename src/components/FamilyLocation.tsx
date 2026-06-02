import { useId, useState } from 'react'
import { useFamily } from '../hooks/useFamily'
import { Alert } from './Alert'

export function FamilyLocation() {
  const { family, saveLocation } = useFamily()
  const inputId = useId()
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    if (!city.trim()) return
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      await saveLocation(city.trim())
      setSuccess(true)
      setCity('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-sm"
      noValidate
    >
      <div>
        <h2 className="text-lg font-bold text-ink">Localisation du foyer</h2>
        <p className="mt-1 text-sm text-muted">
          Utilisée pour la météo et les conseils d'habillement. Aucune
          géolocalisation GPS : seule la ville est enregistrée (RGPD).
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">Localisation mise à jour.</Alert>}

      {family?.city && (
        <p className="text-sm text-ink-2">
          Ville actuelle : <span className="font-bold">{family.city}</span>
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-bold text-ink-2">
          Ville
        </label>
        <input
          id={inputId}
          className="min-h-[44px] w-full rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={family?.city ?? 'Lyon'}
          autoComplete="address-level2"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !city.trim()}
        className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Recherche…' : 'Enregistrer la ville'}
      </button>
    </form>
  )
}
