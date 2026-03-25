import { useState } from "react";
import { 
  Folder, 
  Image as ImageIcon, 
  FileImage, 
  Search, 
  Layers, 
  Upload, 
  Check, 
  RefreshCw 
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

export function MediaLibraryTab() {
  const [activeFolder, setActiveFolder] = useState("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mockAssets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => ({
    id: i,
    name: `asset_image_${i}.webp`,
    size: "124 KB",
    dims: "512x512"
  }));

  const filteredAssets = mockAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadClick = () => {
    document.getElementById("library-upload-input")?.click();
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
                onChange={(e) => console.log("Files uploaded:", e.target.files)}
                multiple
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
                  <DropdownMenuItem className="rounded-lg cursor-pointer font-semibold text-sm py-2.5 text-[#1b254b] dark:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5">
                    Batch Optimize All
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg cursor-pointer font-semibold text-sm py-2.5 text-[#1b254b] dark:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5">
                    Clear Asset Cache
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-50 dark:bg-white/5" />
                  <DropdownMenuItem className="rounded-lg cursor-pointer font-semibold text-sm py-2.5 text-[#4318FF] hover:bg-[#4318FF]/10">
                    Performance Audit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                onClick={handleUploadClick}
                className="bg-[#4318FF] hover:bg-[#3311db] text-white font-bold h-12 rounded-xl px-6 shadow-[0_4px_14px_0_rgba(67,24,255,0.39)] cursor-pointer"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="group cursor-pointer">
                <div className="aspect-square bg-[#F4F7FE] dark:bg-white/5 rounded-2xl flex items-center justify-center border-2 border-transparent group-hover:border-[#4318FF]/20 group-hover:bg-[#4318FF]/5 transition-all overflow-hidden relative shadow-sm">
                  <ImageIcon className="h-10 w-10 text-[#A3AED0] group-hover:scale-110 transition-transform opacity-40" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-white/90 text-[10px] font-bold text-[#4318FF] shadow-sm">WEBP</Badge>
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
    </div>
  );
}
