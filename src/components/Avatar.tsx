interface Props {
  name: string | null
  color: string
  size?: 'sm' | 'md'
}

/** Choisit encre vs blanc selon la luminance du fond (contraste RGAA). */
function contrastText(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const int = parseInt(m[1], 16)
  const channel = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const lum =
    0.2126 * channel((int >> 16) & 255) +
    0.7152 * channel((int >> 8) & 255) +
    0.0722 * channel(int & 255)
  return lum > 0.4 ? '#1b1a17' : '#ffffff'
}

export function Avatar({ name, color, size = 'md' }: Props) {
  const initial = name?.trim().charAt(0).toUpperCase() || '?'
  const dimension = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${dimension}`}
      style={{ backgroundColor: color, color: contrastText(color) }}
    >
      {initial}
    </span>
  )
}
