import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = "md"
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isMounted) return null;

    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
    };

    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
                isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0B1437]/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-[#111C44] rounded-2xl shadow-2xl border border-white dark:border-white/5 overflow-hidden transform transition-all duration-300 ${
                    isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-0">
                    <h3 className="text-lg font-bold text-[#1B254B] dark:text-white tracking-tight">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-[#F4F7FE] dark:bg-white/5 text-[#A3AED0] hover:text-[#4318FF] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 pb-6 flex justify-end gap-2.5">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
