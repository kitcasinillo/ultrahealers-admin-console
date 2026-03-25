import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Mail, Pencil, Copy, Trash2, Eye } from "lucide-react"
import toast from "react-hot-toast"
import { SubNav } from "../components/SubNav"

type Template = {
    id: number
    name: string
    category: string
    previewImage?: string
    lastEdited?: string
}

const initialTemplates: Template[] = [
    { 
        id: 1, 
        name: 'Welcome Email (Healer)', 
        category: 'Onboarding',
        previewImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
        lastEdited: '2 days ago'
    },
    { 
        id: 2, 
        name: 'Subscription Renewal', 
        category: 'Transactional',
        previewImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=400&q=80',
        lastEdited: '5 days ago'
    },
    { 
        id: 3, 
        name: 'New Retreat Launch', 
        category: 'Marketing',
        previewImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
        lastEdited: '1 week ago'
    },
    { 
        id: 4, 
        name: 'Booking Confirmation', 
        category: 'Transactional',
        previewImage: 'https://images.unsplash.com/photo-1586769852044-692d6e3703a0?auto=format&fit=crop&w=400&q=80',
        lastEdited: '2 weeks ago'
    },
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
                lastEdited: 'Just now'
            }
            setTemplates([newTemplate, ...templates])
            toast.success("Template created successfully")
        }
    }

    const handleEdit = (template: Template) => {
        const newName = window.prompt("Update template name:", template.name)
        if (newName && newName !== template.name) {
            setTemplates(templates.map(t => t.id === template.id ? { ...t, name: newName, lastEdited: 'Just now' } : t))
            toast.success("Template updated")
        } else if (newName === template.name) {
            toast.success(`Opening editor for ${template.name}...`)
        }
    }

    const handleDuplicate = (template: Template) => {
        const duplicatedTemplate = {
            ...template,
            id: Date.now(),
            name: `${template.name} (Copy)`,
            lastEdited: 'Just now'
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
                    <div key={template.id} className="group bg-white dark:bg-[#111C44] rounded-[32px] overflow-hidden shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 transition-all hover:shadow-2xl flex flex-col hover:-translate-y-1">
                        <div className="aspect-[3/4] bg-[#F4F7FE] dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex items-center justify-center relative overflow-hidden">
                            {template.previewImage ? (
                                <img 
                                    src={template.previewImage} 
                                    alt={template.name} 
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        // Auto-fallback if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            const fallback = document.createElement('div');
                                            fallback.className = "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F4F7FE] to-[#E9EDF7] dark:from-white/5 dark:to-white/10";
                                            fallback.innerHTML = `
                                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4318FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail mb-2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                                <p class="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest px-4 text-center">Preview Unavailable</p>
                                            `;
                                            parent.appendChild(fallback);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F4F7FE] to-[#E9EDF7] dark:from-white/5 dark:to-white/10">
                                    <Mail className="h-10 w-10 text-[#4318FF]" />
                                    <p className="text-[10px] font-black text-[#A3AED0] mt-3 uppercase tracking-widest text-center">No Preview Available</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-[#1b254b]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="bg-white text-[#4318FF] hover:bg-white/90 border-none shadow-2xl font-black rounded-full px-8 py-5 h-auto text-xs uppercase tracking-widest"
                                    onClick={() => handlePreview(template)}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                </Button>
                            </div>
                            <div className="absolute top-5 left-5">
                                <span className="bg-white/95 dark:bg-[#111C44]/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-[#1b254b] dark:text-white uppercase tracking-wider shadow-sm">
                                    {template.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1 text-left">
                            <h4 className="text-lg font-bold text-[#1b254b] dark:text-white mb-1 line-clamp-1">{template.name}</h4>
                            <p className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider mb-6">
                                Edited <span className="text-[#1b254b] dark:text-white/70">{template.lastEdited}</span>
                            </p>
                            
                            <div className="flex items-center gap-2 mt-auto">
                                <Button 
                                    variant="ghost" 
                                    className="flex-1 rounded-2xl bg-[#4318FF]/5 text-[#4318FF] hover:bg-[#4318FF]/10 font-bold text-xs h-11 transition-colors"
                                    onClick={() => handleEdit(template)}
                                >
                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                    Edit Template
                                </Button>
                                <div className="flex gap-1.5">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-11 w-11 rounded-2xl bg-[#F4F7FE] dark:bg-white/5 text-[#A3AED0] hover:text-[#4318FF] transition-colors"
                                        onClick={() => handleDuplicate(template)}
                                        title="Duplicate"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-11 w-11 rounded-2xl bg-red-50 dark:bg-red-500/5 text-red-300 hover:text-red-500 transition-colors"
                                        onClick={() => handleDelete(template.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
