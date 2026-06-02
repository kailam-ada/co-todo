interface Props {
  meName: string
  coParentName: string | null
  /** Points projetés du foyer après cette tâche (création + exécution estimée). */
  aProjected: number
  bProjected: number
  /** Points gagnés immédiatement par le créateur (à la création). */
  gainNow: number
}

const A_STRIPES =
  'repeating-linear-gradient(135deg, rgba(255,255,255,.18) 0 5px, transparent 5px 11px)'
const B_STRIPES =
  'repeating-linear-gradient(45deg, rgba(0,0,0,.12) 0 5px, transparent 5px 11px)'

export function ImpactGauge({
  meName,
  coParentName,
  aProjected,
  bProjected,
  gainNow,
}: Props) {
  if (!coParentName) {
    return (
      <section className="rounded-card border border-line bg-surface p-4 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Impact sur la jauge</h2>
        <p className="mt-1 text-sm text-muted">
          Vous gagnez <span className="font-bold text-ink">{gainNow} pts</span> à
          la création. Reliez un co-parent pour visualiser l'équilibre.
        </p>
      </section>
    )
  }

  const total = aProjected + bProjected
  const aPct = total === 0 ? 50 : Math.round((aProjected / total) * 100)
  const bPct = 100 - aPct

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-sm">
      <h2 className="text-sm font-bold text-ink">Impact sur la jauge</h2>
      <p className="mt-1 mb-2 font-mono text-xs uppercase tracking-wide text-muted">
        Projection après cette tâche
      </p>
      <div
        role="img"
        aria-label={`Projection : ${meName} ${aPct}%, ${coParentName} ${bPct}%.`}
        className="flex h-10 overflow-hidden rounded-lg border border-line-strong"
      >
        {aPct > 0 && (
          <div
            className="flex items-center justify-center text-xs font-bold text-white"
            style={{ width: `${aPct}%`, backgroundColor: 'var(--color-primary)', backgroundImage: A_STRIPES }}
          >
            {aPct}%
          </div>
        )}
        {bPct > 0 && (
          <div
            className="flex items-center justify-center text-xs font-bold text-ink"
            style={{ width: `${bPct}%`, backgroundColor: 'var(--color-accent)', backgroundImage: B_STRIPES }}
          >
            {bPct}%
          </div>
        )}
      </div>
    </section>
  )
}
