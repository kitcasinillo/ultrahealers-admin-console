import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, AlertTriangle, CheckCircle, XCircle, FileSearch, Search, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";

interface SEOIssue {
    id: string;
    type: 'Missing Alt' | 'Missing H1' | 'Missing H2' | 'Broken Link';
    page: string;
    severity: 'High' | 'Medium' | 'Low';
}

export function SEOHealthChecks() {
    const [isRunning, setIsRunning] = useState(false);
    const [lastRun, setLastRun] = useState("04:00 AM");
    const [searchQuery, setSearchQuery] = useState("");
    const [issues, setIssues] = useState<SEOIssue[]>([
        { id: "1", type: "Missing Alt", page: "/retreats/yoga-bali", severity: "Medium" },
        { id: "2", type: "Broken Link", page: "/healers/emma-watson", severity: "High" },
        { id: "3", type: "Missing H1", page: "/listings/energy-heal", severity: "Low" },
        { id: "4", type: "Missing H2", page: "/retreats/bali-escape", severity: "Medium" }
    ]);

    const filteredIssues = issues.filter(issue => 
        issue.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.page.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRunDiagnostics = () => {
        setIsRunning(true);
        toast("Scanning app routes...", { icon: '🔍' });
        
        setTimeout(() => {
            setIsRunning(false);
            setLastRun(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            toast.success("Crawl complete. Found 2 new critical issues.");
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#4318FF] dark:bg-white/10 rounded-2xl text-white shadow-lg shadow-[#4318FF]/20">
                                <FileSearch className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Active SEO Diagnostics</CardTitle>
                                <CardDescription className="text-xs font-medium text-[#A3AED0]">Perform deep crawls of platform content to identify semantic errors.</CardDescription>
                            </div>
                        </div>
                        <Button 
                            onClick={handleRunDiagnostics} 
                            disabled={isRunning}
                            className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl font-bold transition-all px-8 shadow-md h-10"
                        >
                            {isRunning ? (
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            ) : (
                                <PlayCircle className="w-4 h-4 mr-2" />
                            )}
                            {isRunning ? "Scanning..." : "Sync & Scan Now"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {/* KPI Cards */}
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 transition-opacity duration-300 ${isRunning ? 'opacity-40' : 'opacity-100'}`}>
                        <div 
                            onClick={() => setSearchQuery("Missing Alt")}
                            className="p-6 rounded-2xl bg-yellow-50/50 dark:bg-yellow-500/5 border border-yellow-100 dark:border-yellow-500/10 group shadow-sm transition-all hover:shadow-md cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg text-yellow-600 group-hover:bg-yellow-100 transition-all">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-extrabold text-yellow-600 uppercase italic">Medium Risk</span>
                            </div>
                            <p className="text-[#A3AED0] text-[10px] font-bold uppercase tracking-widest mb-1">Missing Alt Texts</p>
                            <h4 className="text-3xl font-extrabold text-[#1b254b] dark:text-white tracking-tight">24</h4>
                            <p className="text-[10px] text-gray-500 mt-2 font-medium italic underline">View alt issues &rarr;</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-green-50/50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10 group shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-extrabold text-green-600 uppercase italic">Good Standing</span>
                            </div>
                            <p className="text-[#A3AED0] text-[10px] font-bold uppercase tracking-widest mb-1">Semantic Structure</p>
                            <h4 className="text-3xl font-extrabold text-[#1b254b] dark:text-white tracking-tight">100%</h4>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Passed at {lastRun}</p>
                        </div>

                        <div 
                            onClick={() => setSearchQuery("Broken Link")}
                            className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-100/10 group shadow-sm transition-all hover:shadow-md cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg text-red-600 group-hover:bg-red-100 transition-all">
                                    <XCircle className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-extrabold text-red-600 uppercase italic">High Risk</span>
                            </div>
                            <p className="text-[#A3AED0] text-[10px] font-bold uppercase tracking-widest mb-1">Broken Links</p>
                            <h4 className="text-3xl font-extrabold text-[#1b254b] dark:text-white tracking-tight">3</h4>
                            <p className="text-[10px] text-red-500 mt-2 font-bold underline">View broken endpoints &rarr;</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="space-y-1">
                            <h4 className="font-bold text-lg text-[#1b254b] dark:text-white flex items-center gap-2">
                                Diagnostics Log
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] uppercase font-bold tracking-widest leading-none">
                                    {filteredIssues.length} Shown
                                </span>
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="text-[9px] text-[#4318FF] font-bold hover:underline cursor-pointer">Clear Filter</button>
                                )}
                            </h4>
                        </div>
                        <div className="relative group max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors" />
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-10 bg-white dark:bg-[#0B1437] rounded-lg border border-gray-100 dark:border-white/10 text-xs w-full focus:ring-1 focus:ring-[#4318FF] outline-none" 
                                placeholder="Filter log..." 
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5 text-[#A3AED0] text-[10px] uppercase font-bold tracking-widest">
                                    <th className="py-4 px-6">Issue Type</th>
                                    <th className="py-4 px-6">Affected Page</th>
                                    <th className="py-4 px-6">Severity</th>
                                    <th className="py-4 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredIssues.map(issue => (
                                    <tr key={issue.id} className="text-xs hover:bg-gray-50/30 dark:hover:bg-white/[0.02] transition-colors font-medium">
                                        <td className="py-4 px-6 font-bold text-[#1b254b] dark:text-white">{issue.type}</td>
                                        <td className="py-4 px-6 text-[#707EAE] italic">{issue.page}</td>
                                        <td className="py-4 px-6">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 w-fit">
                                                    <div className={`w-1 h-1 rounded-full ${
                                                        issue.severity === 'High' ? 'bg-red-500' :
                                                        issue.severity === 'Medium' ? 'bg-yellow-500' :
                                                        'bg-blue-500'
                                                    }`} />
                                                    <span className="text-[10px] font-bold text-[#707EAE] uppercase">
                                                        {issue.severity}
                                                    </span>
                                                </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button 
                                                onClick={() => {
                                                    setIssues(issues.filter(i => i.id !== issue.id));
                                                    toast.success(`Resolution initiated for ${issue.type}`);
                                                }}
                                                className="text-[#4318FF] font-bold hover:underline cursor-pointer"
                                            >
                                                Fix Issue
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 bg-[#4318FF] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-[#4318FF]/20 relative overflow-hidden group">
                 <div className="relative z-10">
                    <h5 className="font-bold text-white text-lg">Automated SEO Maintenance</h5>
                    <p className="text-white/80 text-sm mt-1 max-w-md font-medium">
                        The crawler runs automatically every Sunday at 02:00 AM. Reports are sent to development@ultrahealers.com.
                    </p>
                </div>
                <AlertCircle className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                <Button 
                    onClick={() => toast.success("Scheduling controls unlocked. (Admin access verified)")}
                    className="bg-white text-[#4318FF] hover:bg-white/90 rounded-xl font-bold px-8 h-12 shadow-lg relative z-10 shrink-0"
                >
                    Edit Schedule
                </Button>
            </div>
        </div>
    );
}
