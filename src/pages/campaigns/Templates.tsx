import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Mail, Pencil, Copy, Trash2, Eye } from "lucide-react"
import toast from "react-hot-toast"
import { SubNav } from "./SubNav"

type Template = {
    id: number
    name: string
    category: string
}

const initialTemplates: Template[] = [
    { id: 1, name: 'Welcome Email (Healer)', category: 'Onboarding' },
    { id: 2, name: 'Subscription Renewal', category: 'Transactional' },
    { id: 3, name: 'New Retreat Launch', category: 'Marketing' },
    { id: 4, name: 'Booking Confirmation', category: 'Transactional' },
]

export function Templates() {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates)

    const handleCreate = () => {
        const name = window.prompt("Enter new template name:")
        if (name) {
            const newTemplate: Template = {
                id: Date.now(),
                name,
                category: 'Custom',
            }
            setTemplates([newTemplate, ...templates])
            toast.success("Template created successfully")
        }
    }

    const handleEdit = (template: Template) => {
        const newName = window.prompt("Update template name:", template.name)
        if (newName && newName !== template.name) {
            setTemplates(templates.map(t => t.id === template.id ? { ...t, name: newName } : t))
            toast.success("Template updated")
        } else if (newName === template.name) {
            // Edit content mock
            toast.success(`Opening editor for ${template.name}...`)
        }
    }

    const handleDuplicate = (template: Template) => {
        const duplicatedTemplate = {
            ...template,
            id: Date.now(),
            name: `${template.name} (Copy)`
        }
        setTemplates([duplicatedTemplate, ...templates])
        toast.success("Template duplicated")
    }

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            setTemplates(templates.filter(t => t.id !== id))
            toast.success("Template deleted")
        }
    }

    const handlePreview = (template: Template) => {
        toast.success(`Previewing: ${template.name}`)
    }

    return (
        <div className="space-y-6">
            <SubNav />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Email Templates</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Manage your reusable email layouts and content blocks.
                    </p>
                </div>
                <Button 
                    onClick={handleCreate}
                    className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-full px-6 py-5 font-bold shadow-[0_10px_20px_0_rgba(67,24,255,0.15)] transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    New Template
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates.map((template) => (
                    <div key={template.id} className="group bg-white dark:bg-[#111C44] rounded-[24px] overflow-hidden shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 transition-all hover:shadow-xl flex flex-col">
                        <div className="aspect-[4/3] bg-[#F4F7FE] dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex items-center justify-center relative">
                            <Mail className="h-12 w-12 text-[#A3AED0]/50" />
                            <div className="absolute inset-0 bg-[#4318FF]/0 group-hover:bg-[#4318FF]/5 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="bg-white/90 text-[#4318FF] hover:bg-white border shadow-sm"
                                    onClick={() => handlePreview(template)}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                </Button>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1 text-left">
                            <p className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider mb-1">{template.category}</p>
                            <h4 className="text-lg font-bold text-[#1b254b] dark:text-white mb-4 line-clamp-1">{template.name}</h4>
                            <div className="flex items-center gap-2 mt-auto">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1 rounded-xl text-[#4318FF] dark:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                                    onClick={() => handleEdit(template)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                                    onClick={() => handleDuplicate(template)}
                                    title="Duplicate"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(template.id)}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {templates.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[#F4F7FE] dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-8 w-8 text-[#A3AED0]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1b254b] dark:text-white mb-2">No templates found</h3>
                        <p className="text-[#A3AED0] mb-6">Create your first email template to get started.</p>
                        <Button 
                            onClick={handleCreate}
                            className="bg-white dark:bg-[#111C44] text-[#1b254b] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full font-bold shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
