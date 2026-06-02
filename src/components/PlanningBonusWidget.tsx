import type { BonusLevel } from '../lib/points'
import { BASE_CREATION_POINTS } from '../lib/points'

interface Props {
  level: BonusLevel
  bonus: number
  total: number
}

const STEPS: { id: BonusLevel; name: string; pts: string }[] = [
  { id: 'minimal', name: 'Minimal', pts: '+2' },
  { id: 'partial', name: 'Partiel', pts: '+5' },
  { id: 'complete', name: 'Total', pts: '+10' },
]

const RANK: Record<BonusLevel, number> = {
  none: 0,
  minimal: 1,
  partial: 2,
  complete: 3,
}

export function PlanningBonusWidget({ level, bonus, total }: Props) {
  return (
    <section
      aria-label="Points estimés à la création"
      className="rounded-card border border-line bg-surface p-5 shadow-sm"
    >
      <div className="flex items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <p className="text-3xl font-bold leading-none text-ink">
            {total}
            <span className="ml-1 text-base font-bold text-muted">pts</span>
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-muted">
            à la création de la tâche
          </p>
        </div>
        <p className="text-right font-mono text-sm text-ink-2">
          {BASE_CREATION_POINTS} base
          <span className="text-accent"> + {bonus} bonus</span>
        </p>
      </div>

      <p className="mt-3 mb-2 text-sm font-bold text-ink">
        Bonus de planification
      </p>
      <ol className="grid grid-cols-3 gap-1">
        {STEPS.map((step) => {
          const reached = RANK[level] >= RANK[step.id]
          const current = level === step.id
          return (
            <li
              key={step.id}
              aria-current={current ? 'step' : undefined}
              className={`rounded-md border px-2 py-2 text-center ${
                reached
                  ? 'border-accent bg-accent text-white'
                  : 'border-line bg-cream text-muted'
              } ${current ? 'ring-2 ring-accent-soft' : ''}`}
            >
              <span className="block text-xs font-bold">{step.name}</span>
              <span className="block font-mono text-sm font-bold">
                {step.pts}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-xs text-muted">
        Plus la tâche est planifiée (dates, heure, récurrence, sous-tâches,
        rappel), plus le bonus est élevé.
      </p>
    </section>
  )
}
