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

interface Template {
    id: number
    name: string
    category: string
    previewImage?: string
    lastEdited?: string
}

interface TemplateModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (template: Partial<Template>) => void
    template?: Template | null
    title: string
}

const CATEGORIES = ["Onboarding", "Transactional", "Marketing", "Newsletter", "Other"]

export function TemplateModal({ isOpen, onClose, onSave, template, title }: TemplateModalProps) {
    const [name, setName] = useState("")
    const [category, setCategory] = useState("Other")

    useEffect(() => {
        if (template) {
            setName(template.name)
            setCategory(template.category)
        } else {
            setName("")
            setCategory("Other")
        }
    }, [template, isOpen])

    const handleSave = () => {
        if (!name.trim()) return
        onSave({ name, category })
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
                        disabled={!name.trim()}
                    >
                        Save Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
