import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { TextField } from './TextField'
import { Alert } from './Alert'

export function PairingModule() {
  const { refreshProfile } = useAuth()

  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const [inputCode, setInputCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  async function handleGenerate(): Promise<void> {
    setGenError(null)
    setGenerating(true)
    const { data, error } = await supabase.rpc('generate_family_invitation')
    setGenerating(false)
    if (error) {
      setGenError(error.message)
      return
    }
    setGeneratedCode(data as string)
  }

  async function handleRedeem(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setRedeemError(null)
    setRedeemSuccess(false)
    setRedeeming(true)
    const { error } = await supabase.rpc('redeem_family_invitation', {
      p_code: inputCode,
    })
    if (error) {
      setRedeeming(false)
      setRedeemError(error.message)
      return
    }
    await refreshProfile()
    setRedeeming(false)
    setRedeemSuccess(true)
    setInputCode('')
  }

  return (
    <section className="flex flex-col gap-6 rounded-card border border-line bg-surface p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-ink">Appairage familial</h2>
        <p className="mt-1 text-sm text-muted">
          Reliez votre compte à celui de votre co-parent pour partager le même
          foyer.
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <h3 className="font-bold text-ink">Inviter mon co-parent</h3>
        {genError && <Alert variant="error">{genError}</Alert>}
        {generatedCode ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted">
              Transmettez ce code (valable 24&nbsp;h) à votre co-parent :
            </p>
            <p
              className="select-all rounded-lg bg-primary-soft px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] text-primary"
              aria-label={`Code d'appairage : ${generatedCode.split('').join(' ')}`}
            >
              {generatedCode}
            </p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-primary px-5 font-bold text-primary hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-60"
        >
          {generating
            ? 'Génération…'
            : generatedCode
              ? 'Générer un nouveau code'
              : 'Générer un code d’invitation'}
        </button>
      </div>

      <form
        onSubmit={handleRedeem}
        className="flex flex-col gap-3 border-t border-line pt-4"
        noValidate
      >
        <h3 className="font-bold text-ink">J'ai reçu un code</h3>
        {redeemError && <Alert variant="error">{redeemError}</Alert>}
        {redeemSuccess && (
          <Alert variant="success">
            Comptes reliés ! Vous partagez désormais le même foyer.
          </Alert>
        )}
        <TextField
          label="Code d'appairage"
          value={inputCode}
          onChange={setInputCode}
          required
          placeholder="ABC123"
        />
        <button
          type="submit"
          disabled={redeeming || inputCode.trim().length === 0}
          className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {redeeming ? 'Liaison…' : 'Rejoindre le foyer'}
        </button>
      </form>
    </section>
  )
}
