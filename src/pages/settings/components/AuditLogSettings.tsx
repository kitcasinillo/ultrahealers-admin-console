import { useState, useEffect, useMemo } from "react";
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
import { Search, Filter, RotateCcw, ShieldCheck, Eye, Terminal, Clock, User as UserIcon, Tag, ArrowRight } from "lucide-react";
import { db } from "../../../lib/firebase";
import { Pagination } from "@/components/common/Pagination";
import { defaultValues } from "../schema";
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

    const normalizeLabel = (key: string) =>
        key
            .replace(/_/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    const formatAuditValue = (value: any): string => {
        if (value === null || value === undefined) return "Not set";

        // Handle diff objects { from, to }
        if (value && typeof value === "object" && "from" in value && "to" in value) {
            return `${formatAuditValue(value.from)} → ${formatAuditValue(value.to)}`;
        }

        if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
        if (Array.isArray(value)) {
            if (value.every((item) => item && typeof item === "object" && "label" in item && "enabled" in item)) {
                return value.map((item) => `${item.label}: ${formatAuditValue(item.enabled)}`).join("\n");
            }
            return value.map((item) => formatAuditValue(item)).join(", ");
        }
        if (typeof value === "object") {
            return Object.entries(value)
                .map(([subKey, subValue]) => `${normalizeLabel(subKey)}: ${formatAuditValue(subValue)}`)
                .join(", ");
        }
        return String(value);
    };

    const flattenChanges = (changes: any, parentLabel = ""): Array<{ label: string; value: string; isDiff?: boolean }> => {
        // Handle diff objects { from, to } as terminal nodes
        if (changes && typeof changes === "object" && "from" in changes && "to" in changes) {
            return [{ label: parentLabel, value: formatAuditValue(changes), isDiff: true }];
        }

        if (changes === null || changes === undefined) {
            return [{ label: parentLabel, value: "Not set" }];
        }

        if (typeof changes !== "object" || changes instanceof Date) {
            return [{ label: parentLabel || "Value", value: formatAuditValue(changes) }];
        }

        if (Array.isArray(changes)) {
            const flattened = changes.flatMap((item, index) => {
                if (item && typeof item === "object" && !Array.isArray(item)) {
                    const itemLabel = item.label ?? item.id ?? `${parentLabel || "Item"} ${index + 1}`;
                    const isFlagOnly = Object.keys(item).every((key) => ["id", "label", "enabled"].includes(key));

                    if (isFlagOnly && "enabled" in item) {
                        return [{
                            label: parentLabel ? `${parentLabel} / ${itemLabel}` : itemLabel,
                            value: item.enabled ? "Enabled" : "Disabled",
                        }];
                    }

                    if (itemLabel && ("label" in item || "id" in item)) {
                        return flattenChanges(item, parentLabel ? `${parentLabel} / ${itemLabel}` : itemLabel);
                    }
                }

                return [{ label: parentLabel || `Item ${index + 1}`, value: formatAuditValue(item) }];
            });

            return flattened.length ? flattened : [{ label: parentLabel || "Value", value: formatAuditValue(changes) }];
        }

        return Object.entries(changes).flatMap(([key, value]) =>
            flattenChanges(value, parentLabel ? `${parentLabel} / ${normalizeLabel(key)}` : normalizeLabel(key))
        );
    };

    const featureMetadata = useMemo(() => {
        return defaultValues.featureFlags.reduce((acc, flag) => {
            acc[flag.id] = flag;
            return acc;
        }, {} as Record<string, any>);
    }, []);

    const { groupedFeatureFlags, statusChanges, groupedOtherChanges } = useMemo(() => {
        if (!selectedLog) return { groupedFeatureFlags: {}, statusChanges: [], groupedOtherChanges: {} };

        const changes = { ...selectedLog.changes };
        
        // 1. Handle Feature Flags
        const featureFlags = changes.featureFlags;
        delete changes.featureFlags;

        // 2. Handle Status Changes (Healers/Seekers/Listings)
        const statusChanges: any[] = [];
        if (changes.previousStatus !== undefined || changes.newStatus !== undefined) {
            statusChanges.push({
                id: 'status-change',
                label: 'Status Update',
                description: `Modification of ${selectedLog.module.replace('s', '')} operational state.`,
                enabled: {
                    from: changes.previousStatus,
                    to: changes.newStatus
                },
                isStatus: true
            });
            delete changes.previousStatus;
            delete changes.newStatus;
        }

        const featureFlagsGrouped = (Array.isArray(featureFlags) ? featureFlags : []).reduce((acc: any, flag: any) => {
            const meta = featureMetadata[flag.id] || flag;
            const tier = meta.tier || 'Other';
            if (!acc[tier]) acc[tier] = [];
            acc[tier].push({ ...meta, ...flag });
            return acc;
        }, {});

        // 3. Handle Other Changes with grouping
        const otherChangesFlat = flattenChanges(changes);
        const groupedOther = otherChangesFlat.reduce((acc: any, item: any) => {
            const parts = item.label.split(' / ');
            const category = parts.length > 1 ? parts[0] : 'Configuration';
            const displayLabel = parts.length > 1 ? parts.slice(1).join(' / ') : item.label;
            
            if (!acc[category]) acc[category] = [];
            acc[category].push({ ...item, displayLabel });
            return acc;
        }, {});

        return {
            groupedFeatureFlags: featureFlagsGrouped,
            statusChanges,
            groupedOtherChanges: groupedOther
        };
    }, [selectedLog, featureMetadata]);


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
                                {["All", "Settings", "Listings", "Healers", "Seekers", "Disputes", "Campaigns"].map((filter) => (
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
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase text-[#1b254b] dark:text-white tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[#4318FF] rounded-full" />
                                            Data Changes
                                        </h4>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Status Changes (Consolidated Card) */}
                                        {statusChanges.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0]">Status Update</span>
                                                    <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                                                </div>
                                                <div className="space-y-3">
                                                    {statusChanges.map((change: any) => (
                                                        <div key={change.id} className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                                                            <div className="mb-2">
                                                                <h5 className="text-sm font-bold text-[#1b254b] dark:text-white">{change.label}</h5>
                                                                <p className="text-xs text-[#A3AED0] mt-0.5">{change.description}</p>
                                                            </div>

                                                            <div className="flex items-center gap-4 mt-4 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                                                                <div className="flex-1 flex flex-col gap-1">
                                                                    <span className="text-[9px] font-bold uppercase text-[#A3AED0] tracking-tight">Previous</span>
                                                                    <span className="text-xs font-bold text-[#1b254b] dark:text-white">
                                                                        {change.enabled.from || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-[#A3AED0] shrink-0" />
                                                                <div className="flex-1 flex flex-col gap-1">
                                                                    <span className="text-[9px] font-bold uppercase text-[#A3AED0] tracking-tight">New</span>
                                                                    <span className="text-xs font-bold text-[#4318FF] dark:text-blue-400">
                                                                        {change.enabled.to || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Feature Flags Grouped by Tier */}
                                        {Object.entries(groupedFeatureFlags).map(([tier, flags]: [string, any]) => (
                                            <div key={tier} className="space-y-3">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0]">{tier} Plan Features</span>
                                                    <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                                                </div>
                                                <div className="space-y-3">
                                                    {flags.map((flag: any, idx: number) => {
                                                        const isNewFormat = flag.enabled && typeof flag.enabled === "object" && "from" in flag.enabled;
                                                        const beforeVal = isNewFormat ? flag.enabled.from : !flag.enabled; // Fallback for old format
                                                        const afterVal = isNewFormat ? flag.enabled.to : flag.enabled;

                                                        return (
                                                            <div key={flag.id || idx} className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                                                                <div className="flex items-start justify-between mb-2 gap-4">
                                                                    <div className="flex-1">
                                                                        <h5 className="text-sm font-bold text-[#1b254b] dark:text-white">{flag.label || flag.id}</h5>
                                                                        {flag.description && (
                                                                            <p className="text-xs text-[#A3AED0] mt-0.5">{flag.description}</p>
                                                                        )}
                                                                    </div>
                                                                    <Badge variant="outline" className={`text-[9px] font-black uppercase px-1.5 py-0 h-4 border-none shrink-0 ${tier === 'free' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                                                                        }`}>
                                                                        {tier}
                                                                    </Badge>
                                                                </div>

                                                                <div className="flex items-center gap-4 mt-4 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                                                                    <div className="flex-1 flex flex-col gap-1">
                                                                        <span className="text-[9px] font-bold uppercase text-[#A3AED0] tracking-tight">Before</span>
                                                                        <span className={`text-xs font-bold ${!beforeVal ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                            {beforeVal ? 'Enabled' : 'Disabled'}
                                                                        </span>
                                                                    </div>
                                                                    <ArrowRight className="w-4 h-4 text-[#A3AED0] shrink-0" />
                                                                    <div className="flex-1 flex flex-col gap-1">
                                                                        <span className="text-[9px] font-bold uppercase text-[#A3AED0] tracking-tight">After</span>
                                                                        <span className={`text-xs font-bold ${!afterVal ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                            {afterVal ? 'Enabled' : 'Disabled'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Other Grouped Changes */}
                                        {Object.entries(groupedOtherChanges).map(([category, items]: [string, any]) => (
                                            <div key={category} className="space-y-3">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0]">{category} Details</span>
                                                    <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                                                </div>
                                                <div className="space-y-3">
                                                    {items.length === 1 && items[0].displayLabel === items[0].label ? (
                                                        // Simple single item card
                                                        <div className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                                                            <div className="text-[10px] font-black uppercase text-[#A3AED0] tracking-widest mb-2">{items[0].label}</div>
                                                            {items[0].value.includes(' → ') ? (
                                                                <div className="flex items-center gap-4 mt-4 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                                                                    <div className="flex-1 flex flex-col gap-1">
                                                                        <span className="text-[9px] font-bold uppercase text-[#A3AED0] tracking-tight">Previous</span>
                                                                        <span className="text-xs font-bold text-[#1b254b] dark:text-white capitalize">
                                                                            {items[0].value.split(' → ')[0]}
                                                                        </span>
                                                                    </div>
                                                                    <ArrowRight className="w-4 h-4 text-[#A3AED0] shrink-0" />
                                                                    <div className="flex-1 flex flex-col gap-1">
                                                                        <span className="text-[9px] font-bold uppercase text-[#A3AED0] tracking-tight">New</span>
                                                                        <span className="text-xs font-bold text-[#4318FF] dark:text-blue-400 capitalize">
                                                                            {items[0].value.split(' → ')[1]}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="whitespace-pre-wrap text-sm font-bold text-[#1b254b] dark:text-white capitalize">
                                                                    {items[0].value}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Grouped multi-item card
                                                        <div className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                                                            <div className="space-y-4">
                                                                {items.map((item: any, idx: number) => (
                                                                    <div key={idx} className={`flex flex-col gap-1 ${idx !== 0 ? 'pt-4 border-t border-gray-50 dark:border-white/5' : ''}`}>
                                                                        <div className="text-[10px] font-bold uppercase text-[#A3AED0] tracking-tight">{item.displayLabel}</div>
                                                                        {item.value.includes(' → ') ? (
                                                                            <div className="flex items-center gap-4 mt-3 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                                                                                <div className="flex-1 flex flex-col gap-1">
                                                                                    <span className="text-[9px] font-bold uppercase text-[#A3AED0] tracking-tight">Previous</span>
                                                                                    <span className="text-xs font-bold text-[#1b254b] dark:text-white capitalize">
                                                                                        {item.value.split(' → ')[0]}
                                                                                    </span>
                                                                                </div>
                                                                                <ArrowRight className="w-4 h-4 text-[#A3AED0] shrink-0" />
                                                                                <div className="flex-1 flex flex-col gap-1">
                                                                                    <span className="text-[9px] font-bold uppercase text-[#A3AED0] tracking-tight">New</span>
                                                                                    <span className="text-xs font-bold text-[#4318FF] dark:text-blue-400 capitalize">
                                                                                        {item.value.split(' → ')[1]}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="whitespace-pre-wrap text-sm font-bold text-[#1b254b] dark:text-white capitalize">
                                                                                {item.value}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {Object.keys(groupedFeatureFlags).length === 0 && Object.keys(groupedOtherChanges).length === 0 && statusChanges.length === 0 && (
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
