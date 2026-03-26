import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Search, Trash2, Edit3, PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface MetaOverride {
    id: string;
    entity: string;
    title: string;
    description: string;
    type: 'Healer' | 'Retreat' | 'Listing' | 'General';
}

export function MetaManager() {
    const [overrides, setOverrides] = useState<MetaOverride[]>([
        { id: "1", entity: "/retreats/yoga-bali", title: "Premium Yoga Retreat Bali | UltraHealers", description: "Join our exclusive 7-day yoga journey in Ubud.", type: 'Retreat' },
        { id: "2", entity: "/healers/dr-smith", title: "Dr. Smith - Reiki Master | UltraHealers", description: "Experienced energy healer specializing in trauma recovery.", type: 'Healer' }
    ]);

    const [target, setTarget] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleApply = () => {
        if (!target || !title) {
            toast.error("Target entity and Custom Title are required.");
            return;
        }

        const type = target.includes(':') ? target.split(':')[0] as any : 'General';
        const formattedTarget = target.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

        if (editingId) {
            setOverrides(overrides.map(item => 
                item.id === editingId 
                ? { ...item, entity: formattedTarget, title, description, type } 
                : item
            ));
            toast.success(`Override updated for ${formattedTarget}`);
            setEditingId(null);
        } else {
            const newOverride: MetaOverride = {
                id: Date.now().toString(),
                entity: formattedTarget,
                title,
                description,
                type: type || 'General'
            };
            setOverrides([newOverride, ...overrides]);
            toast.success(`Override applied for ${formattedTarget}`);
        }

        setTarget("");
        setTitle("");
        setDescription("");
    };

    const handleEdit = (item: MetaOverride) => {
        setEditingId(item.id);
        // Find the matching select value if possible, or reconstruct it
        const targetValue = `${item.type}: ${item.entity.includes(':') ? item.entity.split(': ')[1] : item.entity}`;
        setTarget(targetValue);
        setTitle(item.title);
        setDescription(item.description);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRemove = (id: string, entityName: string) => {
        setOverrides(overrides.filter(item => item.id !== id));
        toast.success(`Removed override for ${entityName}`);
    };

    const filteredOverrides = overrides.filter(item => {
        const matchesSearch = item.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || item.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                            <PlusCircle className={`w-5 h-5 ${editingId ? 'text-orange-500' : 'text-[#4318FF]'}`} />
                            {editingId ? 'Edit Meta Override' : 'Create Meta Override'}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-[#A3AED0]">
                            {editingId ? `Modifying existing override for ${target}` : 'Set custom SEO tags for specific healers, retreats, or listings.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[#1b254b] dark:text-white font-bold text-sm">Target Entity</Label>
                            <Select value={target} onValueChange={setTarget}>
                                <SelectTrigger className="w-full h-11 rounded-xl bg-white dark:bg-[#0B1437] border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#4318FF]/50 transition-all dark:text-white">
                                    <SelectValue placeholder="Select an Entity to Override..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#0B1437] border-gray-200 dark:border-white/10">
                                    <SelectItem value="Healer: Emma Watson">Healer: Emma Watson</SelectItem>
                                    <SelectItem value="Retreat: Bali Yoga Getaway">Retreat: Bali Yoga Getaway</SelectItem>
                                    <SelectItem value="Listing: Holistic Reiki Session">Listing: Holistic Reiki Session</SelectItem>
                                    <SelectItem value="Healer: Marcus Aurelius">Healer: Marcus Aurelius</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#1b254b] dark:text-white font-bold text-sm">Custom Title Tag</Label>
                            <Input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Emma Watson - Premium Holistic Healer" 
                                className="h-11 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF]"
                            />
                            <p className="text-[10px] flex justify-between px-1">
                                <span className="text-[#A3AED0] font-medium">Ideal: 50-60 chars</span>
                                <span className={`${title.length > 60 ? 'text-red-500 font-bold' : 'text-[#A3AED0] font-medium'}`}>{title.length}/60</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Content Snippet</CardTitle>
                        <CardDescription className="text-xs font-medium text-[#A3AED0]">Define the meta description as it appears in SERP.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[#1b254b] dark:text-white font-bold text-sm">Meta Description</Label>
                            <Textarea 
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                placeholder="A brief and engaging description showing in search results..." 
                                className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] min-h-[110px] resize-none"
                            />
                            <p className="text-[10px] flex justify-between px-1">
                                <span className="text-[#A3AED0] font-medium">Ideal: 150-160 chars</span>
                                <span className={`${description.length > 160 ? 'text-red-500 font-bold' : 'text-[#A3AED0] font-medium'}`}>{description.length}/160</span>
                            </p>
                        </div>

                        <Button 
                            onClick={handleApply} 
                            className={`w-full h-11 text-white rounded-xl font-bold transition-all shadow-md ${
                                editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#4318FF] hover:bg-[#3311CC]'
                            }`}
                        >
                            {editingId ? 'Update SEO Override' : 'Apply SEO Override'}
                        </Button>
                        {editingId && (
                            <Button variant="ghost" className="w-full text-xs text-[#A3AED0] hover:text-[#1b254b]" onClick={() => {
                                setEditingId(null);
                                setTarget("");
                                setTitle("");
                                setDescription("");
                            }}>
                                Cancel Editing
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                             Active Overrides
                             <span className="bg-[#4318FF] text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-lg shadow-[#4318FF]/20">
                                {overrides.length}
                            </span>
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-[#A3AED0]">Manage existing custom tags across the platform.</CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {['All', 'Healer', 'Retreat', 'Listing'].map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    activeFilter === filter
                                    ? "bg-[#F4F7FE] text-[#4318FF] border border-[#4318FF]/20"
                                    : "bg-white dark:bg-white/5 text-[#A3AED0] border border-gray-100 dark:border-white/10 shadow-sm"
                                }`}
                            >
                                {filter}s
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 border-b border-gray-100 dark:border-white/5">
                        <div className="relative group max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors" />
                            <Input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter by entity or title..." 
                                className="pl-11 h-10 rounded-lg border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#0B1437] focus:ring-[#4318FF]"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {filteredOverrides.length > 0 ? filteredOverrides.map((item) => (
                            <div key={item.id} className="p-5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-tight bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400 border border-gray-200/50 dark:border-white/5">
                                                {item.type}
                                            </span>
                                            <h5 className="font-bold text-[#1b254b] dark:text-white text-sm tracking-tight">{item.entity}</h5>
                                        </div>
                                        <p className="font-bold text-[#1b254b]/70 dark:text-white/70 text-xs">{item.title}</p>
                                        <p className="text-xs text-[#A3AED0] font-medium line-clamp-2 max-w-2xl">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => handleEdit(item)}
                                            className="h-8 w-8 rounded-lg border-gray-200 dark:border-white/5 text-[#A3AED0] hover:text-[#4318FF] transition-all"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => handleRemove(item.id, item.entity)}
                                            className="h-8 w-8 rounded-lg border-gray-200 dark:border-white/5 text-[#A3AED0] hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="text-[#A3AED0] w-6 h-6" />
                                </div>
                                <h6 className="font-bold text-[#1b254b] dark:text-white">No overrides found</h6>
                                <p className="text-xs text-[#A3AED0] mt-1 font-medium">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
