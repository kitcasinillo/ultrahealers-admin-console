import { useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { X as XIcon, Monitor as MonitorIcon, Smartphone as SmartphoneIcon, Pencil, Eye, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

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
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    
    // Editable state for the email content
    const [emailContent, setEmailContent] = useState({
        title: "Hello {{first_name}},",
        subtitle: "Explore new updates to your journey. Meditation just got more rewarding.",
        body: "Check out our newest retreats and exclusive healing sessions today.",
        buttonText: "Discover Now",
    })
    
    // TRACKING CHANGES
    const [lastSavedContent, setLastSavedContent] = useState(JSON.stringify(emailContent))
    const [showUnsavedModal, setShowUnsavedModal] = useState<{ active: boolean, type: 'close' | 'preview' }>({ 
        active: false, 
        type: 'close' 
    })

    const hasChanges = lastSavedContent !== JSON.stringify(emailContent)

    if (!template) return null

    const handleSave = () => {
        setIsSaving(true)
        // Simulate an API call
        setTimeout(() => {
            setLastSavedContent(JSON.stringify(emailContent))
            setIsSaving(false)
            setIsEditing(false)
            toast.success("Template changes saved successfully!", {
                style: {
                    borderRadius: '12px',
                    background: '#111C44',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)'
                },
                iconTheme: {
                    primary: '#4318FF',
                    secondary: '#fff',
                },
            })
        }, 800)
    }

    const handleCloseAttempt = () => {
        if (isEditing && hasChanges) {
            setShowUnsavedModal({ active: true, type: 'close' })
        } else {
            onClose()
        }
    }

    const handlePreviewAttempt = () => {
        if (isEditing && hasChanges) {
            setShowUnsavedModal({ active: true, type: 'preview' })
        } else {
            setIsEditing(false)
        }
    }

    const insertTag = (field: keyof typeof emailContent, tag: string) => {
        setEmailContent(prev => ({
            ...prev,
            [field]: prev[field] + ` {{${tag}}}`
        }))
    }

    const QuickTags = ({ field }: { field: keyof typeof emailContent }) => (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {[ 'first_name', 'last_name', 'email' ].map((tag) => (
                <button
                    key={tag}
                    onClick={() => insertTag(field, tag)}
                    className="px-2 py-1 text-[10px] font-bold text-[#4318FF] bg-[#F4F7FE] dark:bg-[#4318FF]/10 dark:text-blue-400 rounded-lg hover:bg-[#4318FF] hover:text-white dark:hover:bg-[#4318FF] dark:hover:text-white transition-all border border-transparent hover:shadow-md active:scale-95"
                >
                    + {tag}
                </button>
            ))}
        </div>
    )

    return (
        <>
        <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => {
            if (!open) handleCloseAttempt()
        }}>
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
                        <div className="bg-white dark:bg-[#111C44] px-6 lg:px-10 py-5 flex items-center justify-between border-b border-gray-100 dark:border-white/5 z-20 shadow-sm shrink-0">
                            <div className="flex flex-col gap-0.5 max-w-[200px] sm:max-w-none">
                                <DialogPrimitive.Title asChild>
                                    <h3 className="text-xl font-bold text-[#1b254b] dark:text-white truncate">
                                        {template.name}
                                    </h3>
                                </DialogPrimitive.Title>
                                <DialogPrimitive.Description className="sr-only">
                                    Preview and edit the {template.category} email template content.
                                </DialogPrimitive.Description>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#4318FF]">
                                        {template.category}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
                                    <span className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">
                                        {isEditing ? "Edit Mode" : "Preview Mode"}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Edit / Preview Toggle */}
                                <div className="hidden sm:flex items-center gap-1.5 bg-[#F4F7FE] dark:bg-white/5 p-1 rounded-2xl mr-4 overflow-hidden">
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={handlePreviewAttempt}
                                        className={cn(
                                            "rounded-xl px-4 lg:px-5 h-9 font-bold transition-all border-none text-xs",
                                            !isEditing 
                                                ? "bg-white dark:bg-[#1b254b] shadow-sm text-[#4318FF] dark:text-white" 
                                                : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
                                        )}
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-2" />
                                        Preview
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className={cn(
                                            "rounded-xl px-4 lg:px-5 h-9 font-bold transition-all border-none text-xs",
                                            isEditing 
                                                ? "bg-white dark:bg-[#1b254b] shadow-sm text-[#4318FF] dark:text-white" 
                                                : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
                                        )}
                                    >
                                        <Pencil className="w-3.5 h-3.5 mr-2" />
                                        Edit
                                    </Button>
                                </div>

                                {/* Desktop / Mobile Toggle */}
                                <div className="hidden sm:flex items-center gap-1.5 bg-[#F4F7FE] dark:bg-white/5 p-1 rounded-2xl">
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode("desktop")}
                                        className={cn(
                                            "rounded-xl px-4 lg:px-5 h-9 font-bold transition-all border-none text-xs",
                                            viewMode === "desktop" 
                                                ? "bg-white dark:bg-[#1b254b] shadow-sm text-[#4318FF] dark:text-white" 
                                                : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
                                        )}
                                    >
                                        <MonitorIcon className="w-3.5 h-3.5 mr-2 hidden lg:inline" />
                                        Desktop
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode("mobile")}
                                        className={cn(
                                            "rounded-xl px-4 lg:px-5 h-9 font-bold transition-all border-none text-xs",
                                            viewMode === "mobile" 
                                                ? "bg-white dark:bg-[#1b254b] shadow-sm text-[#4318FF] dark:text-white" 
                                                : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
                                        )}
                                    >
                                        <SmartphoneIcon className="w-3.5 h-3.5 mr-2 hidden lg:inline" />
                                        Mobile
                                    </Button>
                                </div>

                                {/* Save Button (only in edit mode) */}
                                {isEditing && (
                                    <Button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl px-6 font-bold shadow-[0_10px_20px_0_rgba(67,24,255,0.15)] transition-all ml-4"
                                    >
                                        {isSaving ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Settings
                                            </>
                                        )}
                                    </Button>
                                )}

                                <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-2" />

                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handleCloseAttempt}
                                    className="bg-[#F4F7FE] dark:bg-white/5 text-[#A3AED0] hover:text-red-500 rounded-xl transition-all h-11 w-11 shrink-0"
                                >
                                    <XIcon className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
                            {/* Editor Sidebar (Slides in) */}
                            <div className={cn(
                                "flex-shrink-0 bg-white dark:bg-[#111C44] border-r border-gray-100 dark:border-white/5 transition-all duration-300 ease-in-out z-10 overflow-y-auto w-full lg:w-[400px] absolute lg:relative h-full",
                                isEditing ? "translate-x-0" : "-translate-x-full lg:hidden lg:w-0"
                            )}>
                                <div className="p-8 space-y-8 h-full">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-bold text-[#1b254b] dark:text-white">Email Contents</h4>
                                        <p className="text-sm text-[#A3AED0] font-medium">Customize the copy for this template.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1b254b] dark:text-white">Headline</label>
                                            <Input 
                                                value={emailContent.title}
                                                onChange={(e) => setEmailContent({...emailContent, title: e.target.value})}
                                                className="bg-[#F4F7FE] dark:bg-white/5 border-transparent focus-visible:ring-[#4318FF] focus-visible:border-[#4318FF] rounded-xl h-12"
                                            />
                                            <QuickTags field="title" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1b254b] dark:text-white">Subtitle</label>
                                            <textarea 
                                                value={emailContent.subtitle}
                                                onChange={(e) => setEmailContent({...emailContent, subtitle: e.target.value})}
                                                className="w-full flex min-h-[80px] w-full rounded-xl border border-transparent bg-[#F4F7FE] dark:bg-white/5 px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4318FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[#1b254b] dark:text-white placeholder:text-[#A3AED0]"
                                                rows={3}
                                            />
                                            <QuickTags field="subtitle" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1b254b] dark:text-white">Main Body Content</label>
                                            <textarea 
                                                value={emailContent.body}
                                                onChange={(e) => setEmailContent({...emailContent, body: e.target.value})}
                                                className="w-full flex min-h-[120px] w-full rounded-xl border border-transparent bg-[#F4F7FE] dark:bg-white/5 px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4318FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[#1b254b] dark:text-white placeholder:text-[#A3AED0]"
                                                rows={4}
                                            />
                                            <QuickTags field="body" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1b254b] dark:text-white">Call to Action Text</label>
                                            <Input 
                                                value={emailContent.buttonText}
                                                onChange={(e) => setEmailContent({...emailContent, buttonText: e.target.value})}
                                                className="bg-[#F4F7FE] dark:bg-white/5 border-transparent focus-visible:ring-[#4318FF] focus-visible:border-[#4318FF] rounded-xl h-12"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/50">
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                                                <strong>Tip:</strong> You can use variables like <code className="bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded text-[10px]">{"{{first_name}}"}</code> to personalize your emails based on recipient data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Preview Area */}
                            <div className={cn(
                                "flex-1 overflow-y-auto p-4 sm:p-12 lg:p-16 flex items-start justify-center bg-[#F4F7FE] dark:bg-[#0B1437] transition-all",
                                isEditing ? "opacity-30 lg:opacity-100 pointer-events-none lg:pointer-events-auto" : "opacity-100"
                            )}>
                                <div 
                                    className={cn(
                                        "bg-white dark:bg-[#111C44] transition-all duration-500 transform-gpu relative shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-none shrink-0",
                                        viewMode === "desktop" 
                                            ? "w-full max-w-[768px] rounded-[24px] border-[0px] border-transparent mt-0 mb-12 shadow-sm" 
                                            : "w-[375px] rounded-[48px] border-[10px] border-[#1b254b] dark:border-white/10 my-10"
                                    )}
                                >
                                    {/* Mock Email Content */}
                                    <div className={cn(
                                        "text-left h-full flex flex-col transition-all duration-500",
                                        viewMode === "desktop" ? "p-8 sm:p-14" : "p-8 pt-12"
                                    )}>
                                        <header className="flex items-center justify-center mb-10">
                                            <div className="px-5 py-2.5 bg-[#F4F7FE] dark:bg-white/5 rounded-xl font-black text-[#4318FF] text-xs tracking-[0.2em] uppercase">
                                                ULTRAHEALERS
                                            </div>
                                        </header>
                                        
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <h1 className={cn(
                                                    "font-extrabold text-[#1b254b] dark:text-white leading-tight transition-all duration-500 whitespace-pre-wrap",
                                                    viewMode === "desktop" ? "text-3xl" : "text-2xl"
                                                )}>
                                                    {emailContent.title}
                                                </h1>
                                                <p className={cn(
                                                    "text-[#718096] dark:text-[#A3AED0] leading-relaxed font-medium transition-all duration-500 whitespace-pre-wrap",
                                                    viewMode === "desktop" ? "text-base max-w-md" : "text-sm"
                                                )}>
                                                    {emailContent.subtitle}
                                                </p>
                                            </div>

                                            <div className="w-full aspect-[2/1] bg-[#F4F7FE] dark:bg-white/5 rounded-2xl relative overflow-hidden flex items-center justify-center border border-gray-100 dark:border-white/5 group">
                                                 <div className="absolute inset-0 bg-[#4318FF] opacity-0 group-hover:opacity-10 transition-opacity flex items-center justify-center" />
                                                 <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest bg-white dark:bg-[#111C44] px-4 py-2 rounded-lg shadow-sm z-10 transition-transform group-hover:scale-110">
                                                    Main Banner Preview
                                                 </p>
                                            </div>

                                            <div className="space-y-6">
                                                <p className={cn(
                                                    "text-[#718096] dark:text-[#A3AED0] leading-relaxed font-medium transition-all duration-500 whitespace-pre-wrap",
                                                    viewMode === "desktop" ? "text-base" : "text-sm"
                                                )}>
                                                    {emailContent.body}
                                                </p>
                                                
                                                <div className="flex justify-start">
                                                    <div className="bg-[#4318FF] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-[#4318FF]/20 cursor-pointer hover:bg-[#3311CC] transition-all hover:scale-[1.02] active:scale-[0.98] text-center w-full sm:w-auto">
                                                        {emailContent.buttonText}
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
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        <ConfirmModal 
            isOpen={showUnsavedModal.active}
            onClose={() => setShowUnsavedModal({ ...showUnsavedModal, active: false })}
            onConfirm={() => {
                setShowUnsavedModal({ ...showUnsavedModal, active: false })
                if (showUnsavedModal.type === 'close') {
                    onClose()
                } else {
                    setEmailContent(JSON.parse(lastSavedContent)) // Revert changes
                    setIsEditing(false)
                }
            }}
            title="Unsaved Changes"
            description="You have unsaved modifications in this template. Are you sure you want to discard them? This action cannot be undone."
            confirmText="Discard Changes"
            variant="destructive"
        />
        </>
    )
}
