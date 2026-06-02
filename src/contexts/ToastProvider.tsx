import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './toast-context'
import type { ToastOptions } from './toast-context'

interface ToastItem {
  id: string
  message: string
  onUndo?: () => void
}

const DURATION_MS = 6000

interface Props {
  children: ReactNode
}

export function ToastProvider({ children }: Props) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id: string): void => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const timer = timers.current[id]
    if (timer) {
      clearTimeout(timer)
      delete timers.current[id]
    }
  }, [])

  const showToast = useCallback(
    (message: string, options?: ToastOptions): void => {
      const id = crypto.randomUUID()
      setToasts((list) => [...list, { id, message, onUndo: options?.onUndo }])
      timers.current[id] = setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
        aria-live="polite"
        role="status"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex w-full max-w-sm items-center gap-3 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white shadow-lg"
          >
            <span className="flex-1">{toast.message}</span>
            {toast.onUndo && (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo?.()
                  dismiss(toast.id)
                }}
                className="rounded px-2 py-1 font-bold text-accent-soft underline hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Annuler
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Fermer la notification"
              className="text-white/70 hover:text-white focus:outline-none"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
