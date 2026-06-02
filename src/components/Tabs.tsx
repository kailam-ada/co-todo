import { useRef } from 'react'
import { tabId, panelId } from '../lib/tabs'

export interface TabItem {
  id: string
  label: string
  count?: number
}

interface Props {
  tabs: TabItem[]
  value: string
  onChange: (id: string) => void
  ariaLabel: string
}

export function Tabs({ tabs, value, onChange, ariaLabel }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  function handleKey(event: React.KeyboardEvent, index: number): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const dir = event.key === 'ArrowRight' ? 1 : -1
    const next = (index + dir + tabs.length) % tabs.length
    const nextTab = tabs[next]
    onChange(nextTab.id)
    refs.current[nextTab.id]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex gap-1 rounded-xl border border-line bg-surface p-1"
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el
            }}
            type="button"
            role="tab"
            id={tabId(tab.id)}
            aria-selected={selected}
            aria-controls={panelId(tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKey(event, index)}
            className={`flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
              selected
                ? 'bg-primary text-white'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                  selected ? 'bg-white/20 text-white' : 'bg-surface-2 text-ink-2'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
