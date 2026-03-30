import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'destructive' | 'warning';
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  icon
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    primary: 'bg-[#4318FF] hover:bg-[#3311CC] shadow-[0_10px_20px_0_rgba(67,24,255,0.15)]',
    destructive: 'bg-red-500 hover:bg-red-600 shadow-[0_10px_20px_0_rgba(239,68,68,0.15)]',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-[0_10px_20px_0_rgba(245,158,11,0.15)]'
  };

  const iconStyles = {
    primary: 'bg-blue-50 text-[#4318FF] dark:bg-[#1B254B] dark:text-blue-400',
    destructive: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400',
    warning: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b1437]/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-[20px] bg-white dark:bg-[#111C44] p-8 text-left align-middle shadow-2xl transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-gray-100 dark:border-white/10">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl",
            iconStyles[variant]
          )}>
            {icon || <AlertTriangle size={32} />}
          </div>

          <h3 className="mb-2 text-2xl font-bold text-[#1B254B] dark:text-white">
            {title}
          </h3>
          
          <p className="mb-8 text-sm font-medium text-[#A3AED0] dark:text-gray-400 leading-relaxed">
            {description}
          </p>

          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl h-12 font-bold text-[#A3AED0] hover:text-[#1B254B] dark:hover:text-white border-gray-200 dark:border-white/10"
            >
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "flex-1 rounded-xl h-12 font-bold text-white transition-all active:scale-[0.98]",
                variantStyles[variant]
              )}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
