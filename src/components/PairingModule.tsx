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
    <section className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Appairage familial</h2>
        <p className="mt-1 text-sm text-slate-700">
          Reliez votre compte à celui de votre co-parent pour partager le même
          foyer.
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <h3 className="font-medium text-slate-900">Inviter mon co-parent</h3>
        {genError && <Alert variant="error">{genError}</Alert>}
        {generatedCode ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-700">
              Transmettez ce code (valable 24&nbsp;h) à votre co-parent :
            </p>
            <p
              className="select-all rounded-lg bg-slate-100 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-slate-900"
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
          className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-indigo-700 px-5 font-semibold text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 disabled:opacity-60"
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
        className="flex flex-col gap-3 border-t border-slate-100 pt-4"
        noValidate
      >
        <h3 className="font-medium text-slate-900">J'ai reçu un code</h3>
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
          className="flex min-h-[44px] items-center justify-center rounded-lg bg-indigo-700 px-5 font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {redeeming ? 'Liaison…' : 'Rejoindre le foyer'}
        </button>
      </form>
    </section>
  )
}
