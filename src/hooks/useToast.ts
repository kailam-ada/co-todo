import { useContext } from 'react'
import { ToastContext } from '../contexts/toast-context'
import type { ToastContextValue } from '../contexts/toast-context'

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (ctx === undefined) {
    throw new Error("useToast doit être utilisé dans un ToastProvider")
  }
  return ctx
}
