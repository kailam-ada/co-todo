import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Profile } from '../types'
import { TextField } from './TextField'
import { Alert } from './Alert'

const AVATAR_COLORS: { value: string; name: string }[] = [
  { value: '#4f46e5', name: 'Indigo' },
  { value: '#db2777', name: 'Rose' },
  { value: '#0891b2', name: 'Cyan' },
  { value: '#16a34a', name: 'Vert' },
  { value: '#ea580c', name: 'Orange' },
  { value: '#7c3aed', name: 'Violet' },
]

interface Props {
  profile: Profile
}

export function ProfileForm({ profile }: Props) {
  const { refreshProfile } = useAuth()
  const [firstName, setFirstName] = useState(profile.first_name ?? '')
  const [parentLabel, setParentLabel] = useState(profile.parent_label ?? '')
  const [avatarColor, setAvatarColor] = useState(profile.avatar_color)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        parent_label: parentLabel || null,
        avatar_color: avatarColor,
      })
      .eq('id', profile.id)
    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    await refreshProfile()
    setSuccess(true)
  }

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      noValidate
    >
      <h2 className="text-lg font-semibold text-slate-900">Profil</h2>
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">Profil mis à jour.</Alert>}

      <TextField label="Prénom" value={firstName} onChange={setFirstName} required />
      <TextField
        label="Label parent"
        value={parentLabel}
        onChange={setParentLabel}
        placeholder="Papa, Maman, Parent 2…"
        hint="Affiché à votre co-parent."
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-slate-800">
          Couleur d'avatar
        </legend>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((color) => {
            const selected = avatarColor === color.value
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => setAvatarColor(color.value)}
                aria-pressed={selected}
                aria-label={`Couleur ${color.name}${selected ? ' (sélectionnée)' : ''}`}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${selected ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}
                style={{ backgroundColor: color.value }}
              >
                {selected && <span aria-hidden="true">✓</span>}
              </button>
            )
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={saving}
        className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-indigo-700 px-5 font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 disabled:opacity-60"
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}
