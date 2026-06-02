import { createContext } from 'react'

export interface ToastOptions {
  onUndo?: () => void
}

export interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
)
