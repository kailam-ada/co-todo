import type { Profile } from '../types'

interface Props {
  me: Profile
  coParent: Profile | null
}

const A_STRIPES =
  'repeating-linear-gradient(135deg, rgba(255,255,255,.18) 0 5px, transparent 5px 11px)'
const B_STRIPES =
  'repeating-linear-gradient(45deg, rgba(0,0,0,.12) 0 5px, transparent 5px 11px)'

export function BalanceGauge({ me, coParent }: Props) {
  const aPoints = me.points
  const bPoints = coParent?.points ?? 0
  const total = aPoints + bPoints
  const aPct = total === 0 ? 50 : Math.round((aPoints / total) * 100)
  const bPct = 100 - aPct
  const meName = me.first_name ?? 'Vous'
  const bName = coParent?.first_name ?? 'Co-parent'

  return (
    <section
      aria-labelledby="gauge-title"
      className="rounded-card border border-line bg-surface p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="gauge-title" className="text-xl font-bold text-ink">
            Jauge de charge
          </h2>
          <p className="font-mono text-xs uppercase tracking-wide text-muted">
            Ce mois-ci · {total} pts au total
          </p>
        </div>
        <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-bold text-ink-2">
          Ce mois-ci
        </span>
      </div>

      <p className="mt-3 text-sm text-muted">
        Comment l'effort se répartit entre vous et votre co-parent. On visualise
        l'équilibre, jamais la faute.
      </p>

      {total === 0 ? (
        <div className="mt-4 flex h-16 items-center justify-center rounded-lg border border-line-strong bg-surface-2 px-4 text-center text-sm font-bold text-muted">
          Pas encore de points ce mois-ci — l'équilibre s'affichera dès les
          premières tâches terminées.
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Répartition de la charge : ${meName} ${aPct}%, ${bName} ${bPct}%.`}
          className="mt-4 flex h-16 overflow-hidden rounded-lg border border-line-strong"
        >
          <div
            className="flex items-center gap-2 px-4 font-bold text-white"
            style={{ width: `${aPct}%`, backgroundColor: 'var(--color-primary)', backgroundImage: A_STRIPES }}
          >
            <span className="truncate">{meName} · Vous</span>
            <span className="ml-auto font-mono">{aPct}%</span>
          </div>
          <div
            className="flex items-center gap-2 px-4 font-bold text-ink"
            style={{ width: `${bPct}%`, backgroundColor: 'var(--color-accent)', backgroundImage: B_STRIPES }}
          >
            <span className="truncate">{bName}</span>
            <span className="ml-auto font-mono">{bPct}%</span>
          </div>
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        <li className="flex items-center gap-3 rounded-lg border border-line bg-cream px-3 py-2.5">
          <span
            className="h-4 w-4 shrink-0 rounded"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-ink">{meName} — Vous</span>
          <span className="ml-auto font-mono font-bold text-ink-2">
            {aPoints} pts
          </span>
        </li>
        {coParent ? (
          <li className="flex items-center gap-3 rounded-lg border border-line bg-cream px-3 py-2.5">
            <span
              className="h-4 w-4 shrink-0 rounded"
              style={{ backgroundColor: 'var(--color-accent)' }}
              aria-hidden="true"
            />
            <span className="text-sm font-bold text-ink">{bName}</span>
            <span className="ml-auto font-mono font-bold text-ink-2">
              {bPoints} pts
            </span>
          </li>
        ) : (
          <li className="rounded-lg border border-dashed border-line-strong bg-cream px-3 py-2.5 text-sm text-muted">
            Reliez votre co-parent (page Mon compte) pour visualiser l'équilibre
            du foyer.
          </li>
        )}
      </ul>
    </section>
  )
}
