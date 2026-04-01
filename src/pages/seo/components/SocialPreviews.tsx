import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Image as ImageIcon, Upload, Facebook, Twitter, Smartphone, Monitor, Share2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function SocialPreviews() {
    const [entity, setEntity] = useState("global");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [previewPlatform, setPreviewPlatform] = useState<'facebook' | 'twitter'>('facebook');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                 toast.error("File is too large. Limit is 2MB.");
                 e.target.value = '';
                 return;
            }
            const url = URL.createObjectURL(file);
            setImagePreview(url);
            toast.success("Image preview loaded");
        }
        e.target.value = '';
    };

    const handleUpdate = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 800)),
            {
                loading: 'Updating social metadata...',
                success: `Social preview updated for ${entity === 'global' ? 'Global Defaults' : entity}`,
                error: 'Failed to update social preview',
            }
        );
    };

    return (
        <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[#4318FF]" />
                    Social Media Assets
                </CardTitle>
                <CardDescription className="text-xs font-medium text-[#A3AED0]">Configure how your platform appears when shared on social networks.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Editor Column */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[#1b254b] dark:text-white font-bold text-sm">Target Context</Label>
                            <Select value={entity} onValueChange={setEntity}>
                                <SelectTrigger className="w-full h-11 rounded-xl bg-white dark:bg-[#0B1437] border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#4318FF]/50 transition-all dark:text-white font-medium">
                                    <SelectValue placeholder="Select Context..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#0B1437] border-gray-200 dark:border-white/10">
                                    <SelectItem value="global">Global Defaults (App Homepage)</SelectItem>
                                    <SelectItem value="retreats-index">Retreats Index Page</SelectItem>
                                    <SelectItem value="retreat:yoga-bali">Retreat: Premium Yoga Bali</SelectItem>
                                    <SelectItem value="modalities">Modalities Index</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#1b254b] dark:text-white font-bold text-sm">OG Title</Label>
                            <Input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="UltraHealers - Find your perfect healer" 
                                className="h-11 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#1b254b] dark:text-white font-bold text-sm">OG Description</Label>
                            <Input 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Discover and book holistic healing..." 
                                className="h-11 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF]"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[#1b254b] dark:text-white font-bold text-sm block">Banner Image (1200x630)</Label>
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/5 group hover:border-[#4318FF]/50 transition-all h-40 cursor-pointer relative overflow-hidden">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all" alt="OG Preview" />
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setImagePreview(null);
                                                toast.success("Image removed");
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-md z-20 cursor-pointer"
                                            title="Remove image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div className="bg-white dark:bg-[#0B1437] p-3 rounded-full mb-3 shadow-md text-[#4318FF] inline-block">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <p className="font-bold text-sm text-[#1b254b] dark:text-white">Click to upload assets</p>
                                        <p className="text-[10px] text-[#A3AED0] mt-1">PNG, JPG or WebP (Max 2MB)</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    {/* Preview / Mockup Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-[#1b254b] dark:text-white font-bold text-sm">Platform Preview</Label>
                            <div className="flex bg-[#F4F7FE] dark:bg-white/5 p-1 rounded-lg">
                                <button 
                                    onClick={() => setPreviewPlatform('facebook')}
                                    className={`p-1.5 rounded-md transition-all cursor-pointer ${previewPlatform === 'facebook' ? 'bg-white dark:bg-white/10 shadow-sm text-[#4318FF]' : 'text-[#A3AED0]'}`}
                                >
                                    <Facebook className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setPreviewPlatform('twitter')}
                                    className={`p-1.5 rounded-md transition-all cursor-pointer ${previewPlatform === 'twitter' ? 'bg-white dark:bg-white/10 shadow-sm text-[#4318FF]' : 'text-[#A3AED0]'}`}
                                >
                                    <Twitter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Social Card Mockup */}
                        <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0B1437] shadow-xl">
                            {previewPlatform === 'facebook' ? (
                                <div className="space-y-0">
                                    <div className="aspect-[1.91/1] bg-gray-100 dark:bg-white/5 flex items-center justify-center relative border-b border-gray-100 dark:border-white/5">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Social Card" />
                                        ) : (
                                            <div className="text-[#A3AED0] flex flex-col items-center">
                                                <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">1200 x 630 px</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-[#F0F2F5] dark:bg-[#1B254B]/50">
                                        <p className="text-[10px] text-[#65676B] dark:text-[#A3AED0] uppercase font-bold tracking-tight">ULTRAHEALERS.COM</p>
                                        <h5 className="font-bold text-[#050505] dark:text-white text-base mt-0.5 line-clamp-1 tracking-tight">{title || 'OG Title Preview'}</h5>
                                        <p className="text-sm text-[#65676B] dark:text-[#A3AED0] mt-0.5 line-clamp-2 leading-snug">{description || 'OG Description snippet...'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    <div className="aspect-[1.91/1] bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center relative border border-gray-100 dark:border-white/5 overflow-hidden">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Twitter Card" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-[#A3AED0] opacity-20" />
                                        )}
                                    </div>
                                    <div className="px-1">
                                        <h5 className="font-bold text-[#1b254b] dark:text-white text-sm line-clamp-1 tracking-tight">{title || 'OG Title Preview'}</h5>
                                        <p className="text-xs text-[#707EAE] mt-1 line-clamp-2">{description || 'Description snippet'}</p>
                                        <p className="text-[10px] text-[#A3AED0] mt-2 flex items-center gap-1 font-medium">
                                            <Smartphone className="w-3 h-3" />
                                            ultrahealers.com
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-[#A3AED0] px-1 font-medium italic">
                            <Monitor className="w-3 h-3" />
                            Previsualizing standard metadata injection for bots and sharing scrapers.
                        </div>
                    </div>
                </div>
                
                <div className="pt-8 flex justify-end">
                    <Button onClick={handleUpdate} className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold transition-all px-8 shadow-md">
                        <Upload className="w-4 h-4 mr-2" />
                        Update Social Metadata
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
