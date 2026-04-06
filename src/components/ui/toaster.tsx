import * as React from "react"
import { Toast, type ToastProps } from "./toast"

type ToastItem = Omit<ToastProps, "onClose">

interface ToasterContext {
  toasts: ToastItem[]
  toast: (item: Omit<ToastItem, "id">) => string
  removeToast: (id: string) => void
}

const useToasterState = () => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...item, id }])
    
    const duration = item.duration || 5000
    if (duration !== Infinity) {
      setTimeout(() => removeToast(id), duration)
    }
    return id
  }, [removeToast])

  return { toasts, toast, removeToast }
}

const ToasterContext = React.createContext<ToasterContext | null>(null)

export const ToasterProvider = ({ children }: { children: React.ReactNode }) => {
  const state = useToasterState()
  return (
    <ToasterContext.Provider value={state}>
      {children}
      <Toaster toasts={state.toasts} removeToast={state.removeToast} />
    </ToasterContext.Provider>
  )
}

const Toaster = ({ toasts, removeToast }: { toasts: ToastItem[], removeToast: (id: string) => void }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex max-h-screen w-full flex-col p-4 lg:max-w-[420px] gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  )
}

export const useToast = () => {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error("useToast must be used within a ToasterProvider")
  }
  return context
}
