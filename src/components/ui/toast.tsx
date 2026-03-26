import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
  onClose: (id: string) => void
}

export const Toast = ({ id, title, description, variant = "default", onClose }: ToastProps) => {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border p-6 pr-8 shadow-lg transition-all animate-in slide-in-from-right-full h-[88px]",
        variant === "default" && "bg-white dark:bg-[#111C44] border-gray-100 dark:border-white/5",
        variant === "destructive" && "destructive group border-red-500 bg-red-500 text-white",
        variant === "success" && "border-green-500 bg-green-500 text-white"
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-bold">{title}</div>}
        {description && <div className="text-xs font-medium opacity-90">{description}</div>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-inherit opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
