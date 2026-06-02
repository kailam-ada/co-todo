interface Props {
  variant: 'error' | 'success' | 'info'
  children: string
}

const STYLES: Record<Props['variant'], { box: string; label: string; icon: string }> = {
  error: {
    box: 'border-rose-300 bg-rose-50 text-rose-900',
    label: 'Erreur',
    icon: '⚠️',
  },
  success: {
    box: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    label: 'Succès',
    icon: '✅',
  },
  info: {
    box: 'border-slate-300 bg-slate-50 text-slate-900',
    label: 'Information',
    icon: 'ℹ️',
  },
}

export function Alert({ variant, children }: Props) {
  const style = STYLES[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${style.box}`}
    >
      <span aria-hidden="true">{style.icon}</span>
      <span>
        <span className="sr-only">{style.label} : </span>
        {children}
      </span>
    </div>
  )
}
