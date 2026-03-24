import { Button } from "@/components/ui/button"
import { Plus, Mail, Pencil, Copy, Trash2 } from "lucide-react"

export function Templates() {
    const templates = [
        { id: 1, name: 'Welcome Email (Healer)', category: 'Onboarding' },
        { id: 2, name: 'Subscription Renewal', category: 'Transactional' },
        { id: 3, name: 'New Retreat Launch', category: 'Marketing' },
        { id: 4, name: 'Booking Confirmation', category: 'Transactional' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Email Templates</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Manage your reusable email layouts and content blocks.
                    </p>
                </div>
                <Button className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-full px-6 py-5 font-bold shadow-[0_10px_20px_0_rgba(67,24,255,0.15)] transition-all">
                    <Plus className="mr-2 h-5 w-5" />
                    New Template
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates.map((template) => (
                    <div key={template.id} className="group bg-white dark:bg-[#111C44] rounded-[24px] overflow-hidden shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 transition-all hover:shadow-xl">
                        <div className="aspect-[4/3] bg-[#F4F7FE] dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex items-center justify-center relative">
                            <Mail className="h-12 w-12 text-[#A3AED0]/50" />
                            <div className="absolute inset-0 bg-[#4318FF]/0 group-hover:bg-[#4318FF]/5 transition-colors" />
                        </div>
                        <div className="p-6">
                            <p className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider mb-1">{template.category}</p>
                            <h4 className="text-lg font-bold text-[#1b254b] dark:text-white mb-4 line-clamp-1">{template.name}</h4>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 rounded-xl text-[#4318FF] dark:text-white">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-[#A3AED0]">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
