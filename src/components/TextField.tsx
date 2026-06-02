import { useId } from 'react'

interface Props {
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  required?: boolean
  autoComplete?: string
  placeholder?: string
  hint?: string
}

export function TextField({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete,
  placeholder,
  hint,
}: Props) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
        {required && (
          <span className="text-rose-700" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-slate-600">
          {hint}
        </p>
      )}
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[44px] rounded-lg border border-slate-400 bg-white px-3 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
      />
    </div>
  )
}
