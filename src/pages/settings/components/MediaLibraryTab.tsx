import { useState } from "react";
import { 
  Folder, 
  Image as ImageIcon, 
  FileImage, 
  Search, 
  Layers, 
  Upload, 
  Check, 
  RefreshCw,
  Loader2,
  Trash2
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "../../../components/ui/dropdown-menu";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../components/ui/toaster";
import { ConfirmModal } from "../../../components/modals/ConfirmModal";

export function MediaLibraryTab() {
  const { toast, removeToast } = useToast();
  const [activeFolder, setActiveFolder] = useState("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<{ id: number, name: string } | null>(null);

  const [assets, setAssets] = useState<{
    id: number;
    name: string;
    size: string;
    dims: string;
    folder: "icons" | "brand" | "all";
    tags: string[];
    url?: string;
  }[]>([
    { id: 1, name: "retreat_hero_01.webp", size: "842 KB", dims: "1920x1080", folder: "all", tags: ["Hero", "App"] },
    { id: 2, name: "spa_treatment_interior.webp", size: "1.2 MB", dims: "2400x1600", folder: "brand", tags: ["Brand", "Hero"] },
    { id: 3, name: "yoga_mat_closeup.webp", size: "450 KB", dims: "1080x1080", folder: "all", tags: ["App", "Icons"] },
    { id: 4, name: "forest_landscape.webp", size: "2.1 MB", dims: "3840x2160", folder: "all", tags: ["Hero"] },
    { id: 5, name: "crystal_healing_set.webp", size: "670 KB", dims: "1200x1200", folder: "all", tags: ["Icons", "Brand"] },
    { id: 6, name: "arrow-right.svg", size: "2 KB", dims: "24x24", folder: "icons", tags: ["SVG", "Icons"] },
    { id: 7, name: "logo-transparent.png", size: "45 KB", dims: "512x512", folder: "brand", tags: ["Brand", "PNG"] },
    { id: 8, name: "user-profile-default.png", size: "12 KB", dims: "128x128", folder: "icons", tags: ["Icons", "PNG"] },
  ]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === "all" || asset.folder === activeFolder;
    const matchesTag = !activeTag || asset.tags.includes(activeTag);
    return matchesSearch && matchesFolder && matchesTag;
  });

  const handleDeleteConfirm = (id: number, name: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    toast({
      title: "Asset Deleted",
      description: `"${name}" has been removed from the library.`,
      variant: "success",
      duration: 3000
    });
    setAssetToDelete(null);
  };

  const handleUploadClick = () => {
    document.getElementById("library-upload-input")?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const toastId = toast({
      title: "Uploading Assets",
      description: `Uploading ${files.length} ${files.length === 1 ? 'file' : 'files'} to the library...`,
      duration: Infinity
    });

    try {
      // Mock validation: error if any file > 10MB
      const oversizedFiles = Array.from(files).filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        throw new Error(`${oversizedFiles.length} file(s) exceed the 10MB size limit.`);
      }

      // Simulate upload delay
      setTimeout(() => {
        const newAssets = Array.from(files).map((file, index) => ({
          id: Date.now() + index,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          dims: "Original",
          folder: activeFolder as any,
          tags: activeTag ? [activeTag] : ["App"],
          url: URL.createObjectURL(file)
        }));

        setAssets(prev => [...newAssets, ...prev]);
        setIsUploading(false);
        removeToast(toastId);
        
        if (document.getElementById("library-upload-input")) {
          (document.getElementById("library-upload-input") as HTMLInputElement).value = "";
        }

        toast({
          title: "Upload Successful",
          description: "Your files have been added to the media library.",
          variant: "success",
          duration: 3000
        });
      }, 1500);
    } catch (err: any) {
      // Handle error
      setTimeout(() => {
        removeToast(toastId);
        toast({
          title: "Upload Error",
          description: err.message || "There was a problem uploading your files. Please try again.",
          variant: "destructive",
          duration: 5000
        });
        setIsUploading(false);
        if (document.getElementById("library-upload-input")) {
          (document.getElementById("library-upload-input") as HTMLInputElement).value = "";
        }
      }, 800);
    }
  };

  const handleToolAction = (action: string) => {
    const toastId = toast({
      title: "Running Tool",
      description: `${action} is currently in progress...`,
      duration: Infinity
    });

    try {
      // Mock random failure (1 in 5 chance)
      const shouldFail = Math.random() < 0.2;
      
      setTimeout(() => {
        removeToast(toastId);
        if (shouldFail) {
          toast({
            title: "Process Failed",
            description: `${action} could not be completed at this time.`,
            variant: "destructive",
            duration: 4000
          });
        } else {
          toast({
            title: "Process Complete",
            description: `${action} task has finished successfully.`,
            variant: "success",
            duration: 3000
          });
        }
      }, 1200);
    } catch (err) {
       removeToast(toastId);
       toast({
        title: "System Error",
        description: "An unexpected error occurred during processing.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar / Folders */}
      <div className="md:col-span-1 pr-6 border-r border-gray-100 dark:border-white/5 h-fit">
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#A3AED0] mb-5">Folders</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveFolder("all")}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm transition-all",
                  activeFolder === "all" 
                    ? "bg-[#4318FF] text-white shadow-[0_4px_14px_0_rgba(67,24,255,0.3)]" 
                    : "text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                )}
              >
                <Folder className={cn("h-4 w-4", activeFolder === "all" ? "text-white" : "text-[#4318FF]")} />
                All Assets
              </button>
              <button 
                onClick={() => setActiveFolder("icons")}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm transition-all",
                  activeFolder === "icons" 
                    ? "bg-[#4318FF] text-white shadow-[0_4px_14px_0_rgba(67,24,255,0.3)]" 
                    : "text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                )}
              >
                <ImageIcon className={cn("h-4 w-4", activeFolder === "icons" ? "text-white" : "text-[#A3AED0]")} />
                Icons
              </button>
              <button 
                onClick={() => setActiveFolder("brand")}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm transition-all",
                  activeFolder === "brand" 
                    ? "bg-[#4318FF] text-white shadow-[0_4px_14px_0_rgba(67,24,255,0.3)]" 
                    : "text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                )}
              >
                <FileImage className={cn("h-4 w-4", activeFolder === "brand" ? "text-white" : "text-[#A3AED0]")} />
                Brand Assets
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#A3AED0] mb-5">Common Tags</h3>
            <div className="flex flex-wrap gap-2 px-1">
              {["SVG", "PNG", "App", "Brand", "Hero", "Icons"].map(tag => (
                <Badge 
                   key={tag} 
                  variant="secondary" 
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    "rounded-lg border-none text-[11px] font-bold px-3 py-1 cursor-pointer transition-all hover:scale-105 active:scale-95",
                    activeTag === tag 
                      ? "bg-[#4318FF] text-white" 
                      : "bg-[#F4F7FE] dark:bg-white/5 text-[#A3AED0] hover:bg-[#4318FF] hover:text-white"
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="md:col-span-3 space-y-10">
        <div className="bg-white dark:bg-[#111C44] rounded-[22px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A3AED0]" />
              <Input 
                placeholder="Search assets..." 
                className="pl-12 h-12 rounded-[14px] bg-[#F4F7FE] dark:bg-white/5 border-none dark:text-white font-medium placeholder:text-[#A3AED0]" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <input 
                type="file" 
                id="library-upload-input" 
                className="hidden" 
                onChange={handleFileChange}
                multiple
                accept="image/*"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="rounded-xl bg-[#F4F7FE] dark:bg-white/5 border-none h-12 px-5 font-bold text-[#A3AED0] hover:text-[#4318FF] cursor-pointer"
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    Tools
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl border border-gray-100 dark:border-white/5 shadow-xl p-2 bg-white dark:bg-[#111C44]">
                  <DropdownMenuLabel className="text-xs font-bold text-[#A3AED0] px-2 py-2">Image Optimization</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-50 dark:bg-white/5" />
                  <DropdownMenuItem 
                    onClick={() => handleToolAction("Batch Optimization")}
                    className="rounded-lg cursor-pointer font-semibold text-sm py-2.5 text-[#1b254b] dark:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                  >
                    Batch Optimize All
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleToolAction("Cache Clearance")}
                    className="rounded-lg cursor-pointer font-semibold text-sm py-2.5 text-[#1b254b] dark:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                  >
                    Clear Asset Cache
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-50 dark:bg-white/5" />
                  <DropdownMenuItem 
                    onClick={() => handleToolAction("Performance Audit")}
                    className="rounded-lg cursor-pointer font-semibold text-sm py-2.5 text-[#4318FF] hover:bg-[#4318FF]/10"
                  >
                    Performance Audit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                onClick={handleUploadClick}
                disabled={isUploading}
                className="bg-[#4318FF] hover:bg-[#3311db] text-white font-bold h-12 rounded-xl px-6 shadow-[0_4px_14px_0_rgba(67,24,255,0.39)] cursor-pointer disabled:opacity-70"
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="group cursor-pointer">
                <div className="aspect-square bg-[#F4F7FE] dark:bg-white/5 rounded-2xl flex items-center justify-center border-2 border-transparent group-hover:border-[#4318FF]/20 group-hover:bg-[#4318FF]/5 transition-all overflow-hidden relative shadow-sm">
                  {asset.url ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-[#A3AED0] group-hover:scale-110 transition-transform opacity-40" />
                  )}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssetToDelete({ id: asset.id, name: asset.name });
                      }}
                      className="bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm backdrop-blur-sm transition-all cursor-pointer hover:scale-110"
                      title="Delete asset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Badge className="bg-white/90 text-[10px] font-bold text-[#4318FF] shadow-sm uppercase">{asset.name.split('.').pop() || 'WEBP'}</Badge>
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <p className="text-xs font-bold text-[#1b254b] dark:text-white truncate">{asset.name}</p>
                  <p className="text-[10px] font-bold text-[#A3AED0] mt-0.5">{asset.size} • {asset.dims}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Suite - Status Dashboard */}
        <div className="pt-6 border-t border-gray-100 dark:border-white/5 mt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#A3AED0]">Optimization Suite</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              Engine Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111C44] border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg text-green-500">
                  <Check className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-[#1b254b] dark:text-white">WebP Engine</h4>
              </div>
              <p className="text-xs text-[#A3AED0] leading-relaxed">Automatic conversion enabled for all assets.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#111C44] border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg text-green-500">
                  <Check className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-[#1b254b] dark:text-white">Compression</h4>
              </div>
              <p className="text-xs text-[#A3AED0] leading-relaxed">Lossless size reduction up to 82%.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#4318FF]/5 dark:bg-[#4318FF]/10 border border-[#4318FF]/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#4318FF] rounded-lg text-white">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-[#1b254b] dark:text-white">AI Alt-Text</h4>
                <span className="ml-auto text-[9px] font-black uppercase text-[#4318FF]/60 tracking-tighter">Processing...</span>
              </div>
              <p className="text-xs text-[#A3AED0] leading-relaxed">Generating pattern-based image descriptors.</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onConfirm={() => {
          if (assetToDelete) handleDeleteConfirm(assetToDelete.id, assetToDelete.name);
        }}
        title="Delete Asset"
        description={`Are you sure you want to delete "${assetToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
