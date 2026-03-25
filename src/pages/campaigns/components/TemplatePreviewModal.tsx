import { useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { X as XIcon, Monitor as MonitorIcon, Smartphone as SmartphoneIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Template {
    id: number
    name: string
    category: string
    previewImage?: string
}

interface TemplatePreviewModalProps {
    isOpen: boolean
    onClose: () => void
    template: Template | null
}

export function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
    const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

    if (!template) return null

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                <DialogPrimitive.Content 
                    className={cn(
                        "fixed inset-0 w-screen h-screen z-[100] bg-[#F4F7FE] dark:bg-[#0B1437] overflow-hidden flex flex-col focus:outline-none",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full",
                        "duration-500 ease-in-out shadow-none border-none"
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* SaaS Header */}
                        <div className="bg-white dark:bg-[#111C44] px-10 py-5 flex items-center justify-between border-b border-gray-100 dark:border-white/5 z-20 shadow-sm shrink-0">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">
                                    {template.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#4318FF]">
                                        {template.category}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
                                    <span className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">
                                        Preview Mode
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 bg-[#F4F7FE] dark:bg-white/5 p-1 rounded-2xl">
                                <Button 
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("desktop")}
                                    className={cn(
                                        "rounded-xl px-5 h-9 font-bold transition-all border-none text-xs",
                                        viewMode === "desktop" 
                                            ? "bg-white dark:bg-[#1b254b] shadow-sm text-[#4318FF] dark:text-white" 
                                            : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
                                    )}
                                >
                                    <MonitorIcon className="w-3.5 h-3.5 mr-2" />
                                    Desktop
                                </Button>
                                <Button 
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("mobile")}
                                    className={cn(
                                        "rounded-xl px-5 h-9 font-bold transition-all border-none text-xs",
                                        viewMode === "mobile" 
                                            ? "bg-white dark:bg-[#1b254b] shadow-sm text-[#4318FF] dark:text-white" 
                                            : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
                                    )}
                                >
                                    <SmartphoneIcon className="w-3.5 h-3.5 mr-2" />
                                    Mobile
                                </Button>
                            </div>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onClose}
                                className="bg-[#F4F7FE] dark:bg-white/5 text-[#A3AED0] hover:text-red-500 rounded-xl transition-all h-11 w-11"
                            >
                                <XIcon className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Scrollable Preview Area */}
                        <div className="flex-1 overflow-y-auto p-12 lg:p-16 flex items-start justify-center bg-[#F4F7FE] dark:bg-[#0B1437]">
                            <div 
                                className={cn(
                                    "bg-white dark:bg-[#111C44] transition-all duration-500 transform-gpu relative shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-none shrink-0",
                                    viewMode === "desktop" 
                                        ? "w-[768px] rounded-[24px] border-[0px] border-transparent mt-0 mb-12 shadow-sm" 
                                        : "w-[375px] rounded-[48px] border-[10px] border-[#1b254b] dark:border-white/10 mt-10 mb-12"
                                )}
                            >
                                {/* Mock Email Content */}
                                <div className={cn(
                                    "text-left h-full flex flex-col transition-all duration-500",
                                    viewMode === "desktop" ? "p-14" : "p-8 pt-12"
                                )}>
                                    <header className="flex items-center justify-center mb-10">
                                        <div className="px-5 py-2.5 bg-[#F4F7FE] dark:bg-white/5 rounded-xl font-black text-[#4318FF] text-xs tracking-[0.2em] uppercase">
                                            ULTRAHEALERS
                                        </div>
                                    </header>
                                    
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <h1 className={cn(
                                                "font-extrabold text-[#1b254b] dark:text-white leading-tight transition-all duration-500",
                                                viewMode === "desktop" ? "text-3xl" : "text-2xl"
                                            )}>
                                                Hello {'{{first_name}}'},
                                            </h1>
                                            <p className={cn(
                                                "text-[#718096] dark:text-[#A3AED0] leading-relaxed font-medium transition-all duration-500",
                                                viewMode === "desktop" ? "text-base max-w-md" : "text-sm"
                                            )}>
                                                Explore new updates to your journey. Meditation just got more rewarding.
                                            </p>
                                        </div>

                                        <div className="w-full aspect-[2/1] bg-[#F4F7FE] dark:bg-white/5 rounded-2xl relative overflow-hidden flex items-center justify-center border border-gray-100 dark:border-white/5">
                                             <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest bg-white dark:bg-[#111C44] px-4 py-2 rounded-lg shadow-sm">
                                                Main Banner Preview
                                             </p>
                                        </div>

                                        <div className="space-y-6">
                                            <p className={cn(
                                                "text-[#718096] dark:text-[#A3AED0] leading-relaxed font-medium transition-all duration-500",
                                                viewMode === "desktop" ? "text-base" : "text-sm"
                                            )}>
                                                Check out our newest retreats and exclusive healing sessions today.
                                            </p>
                                            
                                            <div className="flex justify-start">
                                                <div className="bg-[#4318FF] text-white px-10 py-5 rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-[#4318FF]/20 cursor-pointer hover:bg-[#3311CC] transition-all hover:scale-[1.02] active:scale-[0.98]">
                                                    Discover Now
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <footer className="mt-20 pt-10 text-center space-y-6 border-t border-gray-100 dark:border-white/5 pb-8">
                                        <div className="flex items-center justify-center gap-5">
                                            {[ "FB", "IG", "TW" ].map((social) => (
                                                <div key={social} className="w-8 h-8 rounded-full bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#A3AED0] font-bold text-[10px] hover:text-[#4318FF] transition-colors cursor-pointer">
                                                    {social}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-[#A3AED0] font-black uppercase tracking-[0.2em]">
                                                © 2026 UltraHealers HQ
                                            </p>
                                            <div className="flex items-center justify-center gap-4 text-[10px] font-black text-[#4318FF] uppercase tracking-[0.1em]">
                                                <a href="#" className="hover:underline">Preferences</a>
                                                <span className="text-gray-200 dark:text-white/10 opacity-50">/</span>
                                                <a href="#" className="hover:underline">Unsubscribe</a>
                                            </div>
                                        </div>
                                    </footer>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}
