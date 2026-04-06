import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { 
    Globe, 
    Share2, 
    Code, 
    Link, 
    Activity, 
    RefreshCcw,
    Save
} from "lucide-react";

// Subcomponents for each tab section
import { MetaManager } from "./components/MetaManager";
import { SocialPreviews } from "./components/SocialPreviews";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { CanonicalUrls } from "./components/CanonicalUrls";
import { SEOHealthChecks } from "./components/SEOHealthChecks";

/**
 * SEOPage Component
 * Manages SEO settings across all applications (App Page SEO Controls and SEO Health Checks).
 */
export default function SEOPage() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate API call to save SEO configurations
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("SEO configurations updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update SEO settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefresh = () => {
        toast("Refreshing SEO diagnostics...", { icon: '🔄' });
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">
                        SEO & Discoverability
                    </h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Manage metadata, open graph previews, schema configurations, and monitor app health.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleRefresh}
                        className="font-bold text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white rounded-xl border-gray-100 dark:border-white/5 shrink-0"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh Data
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl px-6 font-bold shadow-[0_10px_20px_0_rgba(67,24,255,0.15)] transition-all shrink-0"
                    >
                        {isSaving ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </header>

            <Tabs defaultValue="meta" className="w-full">
                <div className="bg-white dark:bg-[#111C44] rounded-lg p-1.5 mb-6 shadow-sm border border-gray-100 dark:border-white/5 w-fit hidden lg:block">
                    <TabsList className="bg-transparent space-x-1">
                        <TabsTrigger value="meta" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                            <Globe className="w-4 h-4 mr-2" />
                            Meta Manager
                        </TabsTrigger>
                        <TabsTrigger value="social" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                            <Share2 className="w-4 h-4 mr-2" />
                            Social
                        </TabsTrigger>
                        <TabsTrigger value="schema" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                            <Code className="w-4 h-4 mr-2" />
                            Schema
                        </TabsTrigger>
                        <TabsTrigger value="canonical" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                            <Link className="w-4 h-4 mr-2" />
                            Canonical
                        </TabsTrigger>
                        <TabsTrigger value="health" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                            <Activity className="w-4 h-4 mr-2" />
                            Health
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Mobile and Tablet tabs fallback */}
                <div className="mb-6 lg:hidden overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="flex bg-white dark:bg-[#111C44] p-1 h-auto rounded-xl w-max min-w-full">
                        <TabsTrigger value="meta" className="text-xs px-4">Meta</TabsTrigger>
                        <TabsTrigger value="social" className="text-xs px-4">Social</TabsTrigger>
                        <TabsTrigger value="schema" className="text-xs px-4">Schema</TabsTrigger>
                        <TabsTrigger value="canonical" className="text-xs px-4">Canonical</TabsTrigger>
                        <TabsTrigger value="health" className="text-xs px-4">Health</TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-0 outline-none">
                    <TabsContent value="meta" className="focus-visible:outline-none">
                        <MetaManager />
                    </TabsContent>
                    
                    <TabsContent value="social" className="focus-visible:outline-none">
                        <SocialPreviews />
                    </TabsContent>
                    
                    <TabsContent value="schema" className="focus-visible:outline-none">
                        <SchemaMarkup />
                    </TabsContent>
                    
                    <TabsContent value="canonical" className="focus-visible:outline-none">
                        <CanonicalUrls />
                    </TabsContent>
                    
                    <TabsContent value="health" className="focus-visible:outline-none">
                        <SEOHealthChecks />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
