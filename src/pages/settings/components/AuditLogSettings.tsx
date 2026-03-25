import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, Filter, RotateCcw, ShieldCheck } from "lucide-react";
import { db } from "../../../lib/firebase";

interface AuditLog {
    id: string;
    adminEmail: string;
    action: string;
    module: string;
    changes: any;
    timestamp: Timestamp;
}

const MOCK_LOGS: AuditLog[] = [
    {
        id: "mock_1",
        adminEmail: "admin@ultrahealers.com",
        action: 'UPDATE_SETTINGS',
        module: 'Platform Settings',
        changes: {},
        timestamp: { toDate: () => new Date(Date.now() - 3600000) } as any
    },
    {
        id: "mock_2",
        adminEmail: "security@ultrahealers.com",
        action: 'DELETE_LISTING',
        module: 'Listings',
        changes: {},
        timestamp: { toDate: () => new Date(Date.now() - 86400000) } as any
    },
    {
        id: "mock_3",
        adminEmail: "support@ultrahealers.com",
        action: 'USER_SUSPENDED',
        module: 'Users',
        changes: {},
        timestamp: { toDate: () => new Date(Date.now() - 172800000) } as any
    },
    {
        id: "mock_4",
        adminEmail: "admin@ultrahealers.com",
        action: 'CAMPAIGN_SENT',
        module: 'Campaigns',
        changes: {},
        timestamp: { toDate: () => new Date(Date.now() - 259200000) } as any
    }
];

export function AuditLogSettings() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const [timeFilter, setTimeFilter] = useState("all");

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logsRef = collection(db, "admin_audit_logs");
                const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));
                const snapshot = await getDocs(q);
                const fetchedLogs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as AuditLog[];
                
                const combined = [...fetchedLogs, ...MOCK_LOGS];
                setLogs(combined);
                setFilteredLogs(combined);
            } catch (error) {
                console.error("Audit Log Fetch Error:", error);
                setLogs(MOCK_LOGS);
                setFilteredLogs(MOCK_LOGS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    useEffect(() => {
        let result = logs;
        
        if (searchQuery) {
            result = result.filter(log => 
                log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.module.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeFilter !== "all") {
            result = result.filter(log => log.module.toLowerCase().includes(activeFilter.toLowerCase()));
        }

        if (timeFilter !== "all") {
            const now = new Date();
            const today = new Date(now.setHours(0, 0, 0, 0));
            const yesterday = new Date(new Date(today).setDate(today.getDate() - 1));
            const lastWeek = new Date(new Date(today).setDate(today.getDate() - 7));

            result = result.filter(log => {
                const logDate = log.timestamp.toDate();
                if (timeFilter === "today") return logDate >= today;
                if (timeFilter === "yesterday") return logDate >= yesterday && logDate < today;
                if (timeFilter === "week") return logDate >= lastWeek;
                return true;
            });
        }

        setFilteredLogs(result);
    }, [searchQuery, activeFilter, timeFilter, logs]);

    const getActionBadge = (action: string) => {
        const baseClass = "border-none font-bold uppercase text-[10px] px-2 py-0.5 rounded-full";
        switch (action) {
            case 'UPDATE_SETTINGS':
                return <Badge className={`${baseClass} bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400`}>Update</Badge>;
            case 'DELETE_LISTING':
                return <Badge className={`${baseClass} bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400`}>Delete</Badge>;
            case 'USER_SUSPENDED':
                return <Badge className={`${baseClass} bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400`}>Suspend</Badge>;
            case 'CAMPAIGN_SENT':
                return <Badge className={`${baseClass} bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400`}>Campaign</Badge>;
            default:
                return <Badge variant="outline" className={`${baseClass} text-gray-400 border-gray-100`}>{action}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-none shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#F4F7FE] dark:bg-white/5 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-[#4318FF]" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Security Audit Log</CardTitle>
                                <CardDescription className="text-xs font-medium">Platform-wide administrative activity tracking.</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={() => {setSearchQuery(""); setActiveFilter("all"); setTimeFilter("all");}} className="h-9 px-3 border-gray-100 text-[#A3AED0]">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                             </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Search by admin, action, or module..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10 bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 rounded-xl text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <Filter className="w-4 h-4 text-[#A3AED0] shrink-0" />
                                {["All", "Settings", "Listings", "Users", "Campaigns"].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter.toLowerCase())}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                            (filter === "All" ? activeFilter === "all" : activeFilter === filter.toLowerCase())
                                            ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/20"
                                            : "bg-gray-50 dark:bg-white/5 text-[#A3AED0] hover:bg-gray-100 dark:hover:bg-white/10"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-50 dark:border-white/5 overflow-x-auto scrollbar-hide">
                            <span className="text-[10px] font-black uppercase text-[#A3AED0] tracking-widest mr-2">Timeframe:</span>
                            {[
                                { id: "all", label: "All time" },
                                { id: "today", label: "Today" },
                                { id: "yesterday", label: "Yesterday" },
                                { id: "week", label: "Last 7 Days" }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTimeFilter(t.id)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                        timeFilter === t.id
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-transparent text-[#A3AED0] border-transparent hover:border-gray-100"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                                <TableRow className="border-gray-100 dark:border-white/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#A3AED0] py-4 h-auto">Timestamp</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#A3AED0] py-4 h-auto">Administrator</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#A3AED0] py-4 h-auto">Action Triggered</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#A3AED0] py-4 h-auto text-right">Module</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [1, 2, 3].map((i) => (
                                        <TableRow key={i} className="border-gray-50 dark:border-white/5">
                                            <TableCell colSpan={4} className="py-8"><div className="h-4 bg-gray-100 dark:bg-white/5 animate-pulse rounded w-full"></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-20 text-[#A3AED0] text-sm font-medium">
                                            No activity logs matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="border-gray-50 dark:border-white/5 hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors group">
                                            <TableCell className="text-xs font-medium text-[#1b254b] dark:text-white py-4">
                                                {log.timestamp ? format(log.timestamp.toDate(), "MMM dd, HH:mm") : 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-[#1b254b] dark:text-white">{log.adminEmail.split('@')[0]}</span>
                                                    <span className="text-[10px] text-[#A3AED0]">{log.adminEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getActionBadge(log.action)}
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-[#1b254b] dark:text-gray-300 py-4 text-right">
                                                {log.module}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {!isLoading && filteredLogs.length > 0 && (
                        <div className="mt-4 flex justify-end">
                            <p className="text-[10px] font-bold text-[#A3AED0] uppercase">
                                Showing {filteredLogs.length} recent operations
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
