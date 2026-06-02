interface Props {
  variant: 'error' | 'success' | 'info'
  children: string
}

const STYLES: Record<Props['variant'], { box: string; label: string; icon: string }> = {
  error: {
    box: 'border-danger bg-danger-soft text-danger-hover',
    label: 'Erreur',
    icon: '⚠️',
  },
  success: {
    box: 'border-success bg-success-soft text-success-hover',
    label: 'Succès',
    icon: '✅',
  },
  info: {
    box: 'border-line bg-surface-2 text-ink-2',
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
