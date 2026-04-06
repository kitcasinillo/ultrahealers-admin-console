import { useState } from "react";
import type { Control } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import type { SettingsFormValues } from "../schema";

interface FeatureFlagSettingsProps {
    control: Control<SettingsFormValues, any>;
}

export function FeatureFlagSettings({ control }: FeatureFlagSettingsProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "featureFlags",
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newFlag, setNewFlag] = useState({ id: "", label: "", description: "", tier: "free" as "free" | "premium" });
    const [flagToDelete, setFlagToDelete] = useState<number | null>(null);

    const handleAddFlag = () => {
        if (!newFlag.id || !newFlag.label) {
            toast.error("Please provide both an ID and a display label.");
            return;
        }

        const exists = fields.some((f) => f.id === newFlag.id);
        if (exists) {
            toast.error(`A flag with ID "${newFlag.id}" already exists.`);
            return;
        }
        
        append({
            id: newFlag.id,
            label: newFlag.label,
            description: newFlag.description,
            tier: newFlag.tier,
            enabled: false,
        });
        
        toast.success(`Custom flag "${newFlag.label}" created! Remember to save changes.`);
        setNewFlag({ id: "", label: "", description: "", tier: "free" });
        setIsDialogOpen(false);
    };

    const confirmDelete = () => {
        if (flagToDelete !== null) {
            remove(flagToDelete);
            toast.success("Custom flag removed. Remember to save changes.");
            setFlagToDelete(null);
        }
    };

    const isDefaultFlag = (id: string) => {
        return ["basic_listings", "messaging", "basic_analytics", "unlimited_listings", "advanced_analytics", "priority_support", "custom_branding"].includes(id);
    };

    const renderFlag = (index: number) => {
        const field = fields[index];
        const isDefault = isDefaultFlag(field.id);
        
        return (
            <FormField
                key={field.id}
                control={control}
                name={`featureFlags.${index}.enabled`}
                render={({ field: formField }) => (
                    <FormItem className="relative flex flex-row items-center justify-between rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 p-4 shadow-sm group">
                        <div className="space-y-0.5 flex-1 pr-4">
                            <FormLabel className="text-sm font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                                {field.label}
                                {!isDefault && (
                                    <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-sm bg-gray-100 text-gray-500">Custom</Badge>
                                )}
                            </FormLabel>
                            <FormDescription className="text-xs">
                                {field.description}
                                <span className="block mt-1 font-mono text-[10px] text-gray-400">ID: {field.id}</span>
                            </FormDescription>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-3">
                            <FormControl>
                                <Switch
                                    checked={formField.value}
                                    onCheckedChange={(checked) => {
                                        formField.onChange(checked);
                                        toast.success(`"${field.label}" has been ${checked ? 'enabled' : 'disabled'}.`);
                                    }}
                                    className="data-[state=checked]:bg-[#4318FF]"
                                />
                            </FormControl>
                            {!isDefault && (
                                <button
                                    type="button"
                                    onClick={() => setFlagToDelete(index)}
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all cursor-pointer p-1.5 bg-white dark:bg-[#111C44] rounded-full shadow-sm border border-gray-100 dark:border-white/5"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </FormItem>
                )}
            />
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-extrabold text-[#1b254b] dark:text-white">Feature Access Controls</h3>
                    <p className="text-sm text-[#A3AED0] dark:text-gray-400 font-medium mt-1">Dynamically gate modules and functionality based on active subscription tiers.</p>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#4318FF] hover:bg-[#3311CC] text-white font-bold rounded-xl px-5 h-10 shadow-[0_6px_14px_0_rgba(67,24,255,0.15)] transition-all shrink-0">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Custom Flag
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Feature Flag</DialogTitle>
                            <DialogDescription>
                                Create a custom feature flag for gating new functionality.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Identifier (ID)</Label>
                                <Input 
                                    placeholder="e.g. experimental_mode" 
                                    value={newFlag.id} 
                                    onChange={(e) => setNewFlag({...newFlag, id: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                />
                                <p className="text-[10px] text-gray-500">Must be unique, lowercase, and no spaces.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Display Label</Label>
                                <Input 
                                    placeholder="e.g. Experimental Mode" 
                                    value={newFlag.label} 
                                    onChange={(e) => setNewFlag({...newFlag, label: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input 
                                    placeholder="Brief explanation of this feature" 
                                    value={newFlag.description} 
                                    onChange={(e) => setNewFlag({...newFlag, description: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Tier</Label>
                                <Select value={newFlag.tier} onValueChange={(val: "free"|"premium") => setNewFlag({...newFlag, tier: val})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">Free Tier</SelectItem>
                                        <SelectItem value="premium">Premium Tier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddFlag} disabled={!newFlag.id || !newFlag.label} className="bg-[#4318FF] hover:bg-[#3311CC]">Confirm Add</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Free Tier Features</CardTitle>
                        <CardDescription className="text-xs font-medium">Core platform modules available to all users.</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-wider text-gray-500 border-gray-200">Standard</Badge>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {fields.map((field, index) => field.tier === "free" ? renderFlag(index) : null)}
                        {fields.filter(f => f.tier === "free").length === 0 && (
                            <p className="text-sm text-gray-500 italic col-span-2">No free tier feature flags.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Premium Tier Features</CardTitle>
                        <CardDescription className="text-xs font-medium">Advanced functionality for upgraded healer profiles.</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-wider text-[#4318FF] border-[#4318FF]/20 bg-[#F4F7FE]">Premium</Badge>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {fields.map((field, index) => field.tier === "premium" ? renderFlag(index) : null)}
                        {fields.filter(f => f.tier === "premium").length === 0 && (
                            <p className="text-sm text-gray-500 italic col-span-2">No premium tier feature flags.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={flagToDelete !== null} onOpenChange={(open) => !open && setFlagToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Custom Flag</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this custom flag? This action cannot be undone. Remember to save your platform settings for the changes to take effect.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFlagToDelete(null)}>Cancel</Button>
                        <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

