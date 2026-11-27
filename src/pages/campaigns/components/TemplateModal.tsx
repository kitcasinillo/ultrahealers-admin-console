import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X } from "lucide-react"
import toast from "react-hot-toast"
import { uploadCampaignImage } from "@/api/campaigns"

interface Template {
    id: string
    name: string
    category: string
    previewImage?: string
    lastEdited?: string
    content?: string
}

interface TemplateModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (template: Partial<Template>) => void
    template?: Template | null
    title: string
}

const CATEGORIES = ["Onboarding", "Transactional", "Marketing", "Content", "Newsletter", "Other"]

export function TemplateModal({ isOpen, onClose, onSave, template, title }: TemplateModalProps) {
    const [name, setName] = useState("")
    const [category, setCategory] = useState("Other")
    const [previewImage, setPreviewImage] = useState("")
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (template) {
            setName(template.name)
            setCategory(template.category)
            setPreviewImage(template.previewImage || "")
        } else {
            setName("")
            setCategory("Other")
            setPreviewImage("")
        }
    }, [template, isOpen])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            setUploading(true)
            const url = await uploadCampaignImage(file, "campaign-templates")
            setPreviewImage(url)
            toast.success("Banner image uploaded")
        } catch (err: any) {
            toast.error(err?.message || "Failed to upload image")
        } finally {
            setUploading(false)
            e.target.value = ""
        }
    }

    const handleSave = () => {
        if (!name.trim()) return
        onSave({ name, category, previewImage: previewImage.trim() })
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-[24px] bg-white dark:bg-[#111C44] border-transparent dark:border-white/5 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#1b254b] dark:text-white">
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-bold text-[#1b254b] dark:text-white ml-1">
                            Template Name
                        </label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-xl border-gray-100 dark:border-white/10 focus:ring-[#4318FF] h-12"
                            placeholder="e.g. Summer Sale Announcement"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="category" className="text-sm font-bold text-[#1b254b] dark:text-white ml-1">
                            Category
                        </label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="rounded-xl border-gray-100 dark:border-white/10 h-12">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 dark:border-white/10 shadow-xl">
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="font-medium">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-bold text-[#1b254b] dark:text-white ml-1">
                            Banner / Preview Image (Optional)
                        </label>
                        <label className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-[#F4F7FE]/50 dark:bg-white/5 px-4 py-3 text-xs font-bold text-[#4318FF] hover:border-[#4318FF]/50 cursor-pointer transition-colors">
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Upload Image (PNG, JPG, WebP)
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploading}
                                onChange={handleUpload}
                            />
                        </label>
                        <Input
                            value={previewImage}
                            onChange={(e) => setPreviewImage(e.target.value)}
                            className="rounded-xl border-gray-100 dark:border-white/10 focus:ring-[#4318FF] h-11 text-xs"
                            placeholder="Or paste image URL..."
                        />
                        {previewImage.trim() && (
                            <div className="relative rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 max-h-[140px]">
                                <img
                                    src={previewImage.trim()}
                                    alt="Template banner preview"
                                    className="w-full h-[140px] object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setPreviewImage("")}
                                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                                    aria-label="Remove image"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter className="mt-4 gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="rounded-full font-bold text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white flex-1"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave}
                        className="rounded-full font-bold bg-[#4318FF] hover:bg-[#3311CC] text-white shadow-lg shadow-blue-200 dark:shadow-none flex-1"
                        disabled={!name.trim() || uploading}
                    >
                        Save Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
