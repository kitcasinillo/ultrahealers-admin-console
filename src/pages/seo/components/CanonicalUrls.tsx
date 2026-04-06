import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search, Trash2, Link as LinkIcon, Info, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

interface CanonicalMapping {
    id: string;
    path: string;
    canonical: string;
    status: 'Active' | 'Redirecting';
}

export function CanonicalUrls() {
    const [mappings, setMappings] = useState<CanonicalMapping[]>([
        { id: "1", path: "/retreats/bali", canonical: "https://ultrahealers.com/retreats/yoga-bali", status: 'Active' },
        { id: "2", path: "/listings/energy", canonical: "https://ultrahealers.com/listings/energy-heal", status: 'Redirecting' }
    ]);

    const [searchQuery, setSearchQuery] = useState("");
    const [newPath, setNewPath] = useState("");
    const [newCanonical, setNewCanonical] = useState("");

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [mappingToDelete, setMappingToDelete] = useState<CanonicalMapping | null>(null);

    const handleAdd = () => {
        if (!newPath || !newCanonical) {
             toast.error("Both internal path and canonical URL are required.");
             return;
        }
        const newEntry: CanonicalMapping = {
            id: Date.now().toString(),
            path: newPath,
            canonical: newCanonical,
            status: 'Active'
        };
        setMappings([newEntry, ...mappings]);
        setNewPath("");
        setNewCanonical("");
        toast.success("Canonical mapping registry updated.");
    };

    const initiateRemove = (mapping: CanonicalMapping) => {
        setMappingToDelete(mapping);
        setIsDeleteDialogOpen(true);
    };

    const confirmRemove = () => {
        if (mappingToDelete) {
            setMappings(mappings.filter(m => m.id !== mappingToDelete.id));
            toast.success("Canonical entry removed.");
            setIsDeleteDialogOpen(false);
            setMappingToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-[#4318FF]" />
                        Canonical Mapping Registry
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-[#A3AED0]">Define the authoritative source for your platform routes to prevent SEO cannibalization.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[#1b254b] dark:text-white font-bold text-sm">Internal Path</Label>
                                <Input 
                                    value={newPath}
                                    onChange={(e) => setNewPath(e.target.value)}
                                    placeholder="e.g. /retreats/bali-escape" 
                                    className="h-11 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[#1b254b] dark:text-white font-bold text-sm">Authoritative (Canonical) URL</Label>
                                <Input 
                                    value={newCanonical}
                                    onChange={(e) => setNewCanonical(e.target.value)}
                                    placeholder="e.g. https://ultrahealers.com/retreats/bali" 
                                    className="h-11 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF]"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#f2f6ff] dark:bg-[#4318FF]/5 p-4 rounded-xl border border-[#4318FF]/10 flex gap-3">
                                <Info className="w-5 h-5 text-[#4318FF] shrink-0" />
                                <p className="text-[11px] text-[#2D3748] dark:text-[#A3AED0] font-medium leading-relaxed italic">
                                    Authoritative URLs inform search crawlers which version of a page is the "master" to group metrics and avoid duplicate content hits.
                                </p>
                            </div>
                            <Button onClick={handleAdd} className="w-full h-11 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold transition-all shadow-md">
                                Add Mapping Entry
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h4 className="font-bold text-lg text-[#1b254b] dark:text-white">Authoritative Registry</h4>
                            <p className="text-xs text-[#A3AED0] font-medium tracking-tight">Crawl-ready mappings injected into app head.</p>
                        </div>
                        <div className="relative group max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3AED0] focus-within:text-[#4318FF] transition-colors" />
                            <Input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search mapping..." 
                                className="pl-11 h-10 rounded-lg border-gray-100 dark:border-white/10 bg-white dark:bg-[#111C44]"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5 text-[#A3AED0] text-[11px] uppercase font-bold tracking-widest">
                                    <th className="py-4 px-6">Source Path</th>
                                    <th className="py-4 px-6">Canonical Target</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {mappings.filter(m => m.path.includes(searchQuery)).map(mapping => (
                                    <tr key={mapping.id} className="text-xs hover:bg-gray-50/30 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4 px-6 font-bold text-[#1b254b] dark:text-white">{mapping.path}</td>
                                        <td className="py-4 px-6 font-medium text-[#707EAE] italic">{mapping.canonical}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 w-fit">
                                                <div className={`w-1 h-1 rounded-full ${
                                                    mapping.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'
                                                }`} />
                                                <span className="text-[10px] font-bold text-[#707EAE]">
                                                    {mapping.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => initiateRemove(mapping)}
                                                className="h-8 w-8 rounded-lg border-gray-200 dark:border-white/5 text-[#A3AED0] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="py-2">
                            Are you sure you want to delete the canonical mapping for <strong className="text-[#1b254b] dark:text-white">{mappingToDelete?.path}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4 flex gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmRemove} className="bg-red-500 hover:bg-red-600 text-white">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
