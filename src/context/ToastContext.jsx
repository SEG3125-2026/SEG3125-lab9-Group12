/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createId } from '../utils/createId'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timeoutMap = useRef({})

  useEffect(() => {
    const activeTimeouts = timeoutMap.current

    return () => {
      Object.values(activeTimeouts).forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [])

  function dismissToast(toastId) {
    if (timeoutMap.current[toastId]) {
      window.clearTimeout(timeoutMap.current[toastId])
      delete timeoutMap.current[toastId]
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId))
  }

  function pushToast(toast) {
    const id = createId('toast-')
    const duration = toast.duration ?? 5000

    setToasts((currentToasts) => [...currentToasts, { ...toast, id }])

    timeoutMap.current[id] = window.setTimeout(() => {
      dismissToast(id)
    }, duration)

    return id
  }

  function runToastAction(toastId) {
    const matchingToast = toasts.find((toast) => toast.id === toastId)

    matchingToast?.onAction?.()
    dismissToast(toastId)
  }

  return (
    <ToastContext.Provider value={{ toasts, pushToast, dismissToast, runToastAction }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
