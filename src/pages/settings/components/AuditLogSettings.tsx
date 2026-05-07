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
import { Search, Filter, RotateCcw, ShieldCheck, Eye, Terminal, Clock, User as UserIcon, Tag, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../../../lib/firebase";
import { Pagination } from "@/components/common/Pagination";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface AuditLog {
    id: string;
    adminEmail: string;
    action: string;
    module: string;
    changes: any;
    timestamp: Timestamp;
}

export function AuditLogSettings() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [timeFilter, setTimeFilter] = useState("all");
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logsRef = collection(db, "admin_audit_logs");
                const q = query(logsRef, orderBy("timestamp", "desc"), limit(100));
                const snapshot = await getDocs(q);
                const fetchedLogs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as AuditLog[];

                setLogs(fetchedLogs);
                setFilteredLogs(fetchedLogs);
            } catch (error) {
                console.error("Audit Log Fetch Error:", error);
                setLogs([]);
                setFilteredLogs([]);
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
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchQuery, activeFilter, timeFilter, logs]);

    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getActionBadge = (action: string) => {
        const baseClass = "border-none font-bold uppercase text-[10px] px-2 py-0.5 rounded-full";
        switch (action) {
            case 'UPDATE_SETTINGS':
                return <Badge className={`${baseClass} bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400`}>Update Settings</Badge>;
            case 'DELETE_LISTING':
                return <Badge className={`${baseClass} bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400`}>Delete Listing</Badge>;
            case 'USER_SUSPENDED':
            case 'SUSPEND_HEALER':
            case 'SUSPEND_SEEKER':
                return <Badge className={`${baseClass} bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400`}>Suspend User</Badge>;
            case 'REACTIVATE_HEALER':
            case 'REACTIVATE_SEEKER':
                return <Badge className={`${baseClass} bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400`}>Reactivate User</Badge>;
            case 'UPDATE_LISTING_STATUS':
                return <Badge className={`${baseClass} bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400`}>Update Listing</Badge>;
            case 'ESCALATE_DISPUTE':
                return <Badge className={`${baseClass} bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400`}>Escalate Dispute</Badge>;
            case 'RESEND_DISPUTE_EMAIL':
                return <Badge className={`${baseClass} bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400`}>Resend Notification</Badge>;
            case 'CAMPAIGN_SENT':
                return <Badge className={`${baseClass} bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400`}>Campaign Sent</Badge>;
            default:
                return <Badge variant="outline" className={`${baseClass} text-gray-400 border-gray-100`}>{action.replace('_', ' ')}</Badge>;
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
                            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveFilter("all"); setTimeFilter("all"); }} className="h-9 px-3 border-gray-100 text-[#A3AED0]">
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
                                {["All", "Settings", "Listings", "Healers", "Seekers", "Users", "Disputes", "Campaigns"].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter.toLowerCase())}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${(filter === "All" ? activeFilter === "all" : activeFilter === filter.toLowerCase())
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
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${timeFilter === t.id
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
                                ) : paginatedLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-20 text-[#A3AED0] text-sm font-medium">
                                            No activity logs matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedLogs.map((log) => (
                                        <TableRow 
                                            key={log.id} 
                                            onClick={() => setSelectedLog(log)}
                                            className="border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                        >
                                            <TableCell className="text-xs font-medium text-[#1b254b] dark:text-white py-4">
                                                {log.timestamp ? format(log.timestamp.toDate(), "MMM dd, HH:mm:ss") : 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-[#1b254b] dark:text-white">{log.adminEmail.split('@')[0]}</span>
                                                    <span className="text-[10px] text-[#A3AED0]">{log.adminEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    {getActionBadge(log.action)}
                                                    <Eye className="w-3.5 h-3.5 text-[#A3AED0] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-[#1b254b] dark:text-gray-300 py-4 text-right">
                                                <Badge variant="outline" className="font-bold border-gray-100 dark:border-white/10 text-[10px] text-[#A3AED0]">
                                                    {log.module}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={filteredLogs.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </CardContent>
            </Card>

            {/* Audit Log Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl bg-white dark:bg-[#111C44] border-none rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <div className="h-1.5 w-full bg-[#4318FF]" />
                    <DialogHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                <Terminal className="w-5 h-5" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-[#1b254b] dark:text-white tracking-tight">Operation Details</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm font-medium text-[#A3AED0]">
                            Full execution context and state changes for this administrative event.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="max-h-[60vh] overflow-y-auto p-8 pt-0 custom-scrollbar">
                            <div className="space-y-6">
                                {/* Context Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 mb-1 text-[#A3AED0]">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Timestamp</span>
                                        </div>
                                        <div className="text-sm font-bold text-[#1b254b] dark:text-white">
                                            {selectedLog.timestamp ? format(selectedLog.timestamp.toDate(), "PPPP 'at' p") : 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 mb-1 text-[#A3AED0]">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Administrator</span>
                                        </div>
                                        <div className="text-sm font-bold text-[#1b254b] dark:text-white">
                                            {selectedLog.adminEmail}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 mb-1 text-[#A3AED0]">
                                            <Tag className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Module</span>
                                        </div>
                                        <div className="text-sm font-bold text-[#1b254b] dark:text-white">
                                            {selectedLog.module}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 mb-1 text-[#A3AED0]">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
                                        </div>
                                        <div>{getActionBadge(selectedLog.action)}</div>
                                    </div>
                                </div>

                                {/* Changes Diff View */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase text-[#1b254b] dark:text-white tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[#4318FF] rounded-full" />
                                            Data Changes
                                        </h4>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 ? (
                                            Object.entries(selectedLog.changes).map(([key, value]: [string, any]) => {
                                                // Handle the common "previousStatus/newStatus" or similar naming patterns
                                                if (key.toLowerCase().includes('previous') || key.toLowerCase().includes('old')) {
                                                    const baseKey = key.replace(/previous|old/i, '');
                                                    const newValueKey = Object.keys(selectedLog.changes).find(k => 
                                                        k.toLowerCase().includes('new') && k.toLowerCase().includes(baseKey.toLowerCase())
                                                    );
                                                    
                                                    if (newValueKey) {
                                                        const newValue = selectedLog.changes[newValueKey];
                                                        return (
                                                            <div key={key} className="group p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:border-[#4318FF]/30">
                                                                <div className="text-[10px] font-black uppercase text-[#A3AED0] tracking-tighter mb-2">{baseKey || "Value"}</div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex-1 p-2 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100/50 dark:border-red-900/20">
                                                                        <span className="text-xs font-bold text-red-600 dark:text-red-400 line-through opacity-70">{String(value)}</span>
                                                                    </div>
                                                                    <ArrowRight className="w-4 h-4 text-[#4318FF]" />
                                                                    <div className="flex-1 p-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20">
                                                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{String(newValue)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                }
                                                
                                                // Skip if it's the "new" part of a pair we already handled
                                                if (key.toLowerCase().includes('new')) {
                                                    const oldKey = Object.keys(selectedLog.changes).find(k => 
                                                        (k.toLowerCase().includes('previous') || k.toLowerCase().includes('old')) && 
                                                        key.toLowerCase().includes(k.replace(/previous|old/i, '').toLowerCase())
                                                    );
                                                    if (oldKey) return null;
                                                }

                                                // Fallback for single values or un-paired changes
                                                return (
                                                    <div key={key} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                                        <div className="text-[10px] font-black uppercase text-[#A3AED0] tracking-tighter mb-1">{key}</div>
                                                        <div className="text-xs font-bold text-[#1b254b] dark:text-white">
                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-8 text-center bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                                <p className="text-xs font-medium text-[#A3AED0]">No data changes recorded for this action.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="p-6 bg-gray-50 dark:bg-white/5 flex justify-end">
                        <Button 
                            onClick={() => setSelectedLog(null)}
                            className="bg-[#4318FF] hover:bg-[#3311CC] text-white font-bold rounded-xl px-8"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
