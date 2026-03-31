import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "./button"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "primary"
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive"
}: ConfirmModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[200] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-[24px] bg-white dark:bg-[#111C44] p-8 shadow-2xl animate-in zoom-in-95 duration-200 focus:outline-none border border-transparent dark:border-white/5">
          <div className="flex flex-col items-center text-center">
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
              variant === 'destructive' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'
            }`}>
              {variant === 'destructive' ? <AlertTriangle className="h-8 w-8" /> : <X className="h-8 w-8" />}
            </div>
            
            <DialogPrimitive.Title className="text-2xl font-bold text-[#1b254b] dark:text-white">
              {title}
            </DialogPrimitive.Title>
            
            <DialogPrimitive.Description className="mt-4 text-[#A3AED0] font-medium leading-relaxed">
              {description}
            </DialogPrimitive.Description>
            
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="flex-1 rounded-full font-bold text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
              >
                {cancelText}
              </Button>
              <Button 
                onClick={onConfirm}
                className={`flex-1 rounded-full font-bold shadow-lg transition-all ${
                  variant === 'destructive' 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200 dark:shadow-none' 
                  : 'bg-[#4318FF] hover:bg-[#3311CC] text-white shadow-blue-200 dark:shadow-none'
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
          
          <DialogPrimitive.Close className="absolute right-6 top-6 rounded-lg opacity-40 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
