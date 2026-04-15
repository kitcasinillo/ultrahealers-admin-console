import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Calendar as CalendarIcon, ChevronDown, Filter } from "lucide-react"
import { useState, useMemo, useEffect } from "react"

export type PremiumSubscription = {
    id: string
    healerName: string
    email: string
    activatedAt: string
    amountPaid: number
    stripeId: string
    status: "Active" | "Revoked"
}

export function PremiumSubscriptionsTable() {
    const [dateRange, setDateRange] = useState("all-time")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false)
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
    const [customDates, setCustomDates] = useState({ start: "", end: "" });
    const [data, setData] = useState<PremiumSubscription[]>([])
    const [loading, setLoading] = useState(true)

    const columns: ColumnDef<PremiumSubscription>[] = useMemo(() => [
        {
            accessorKey: "healerName",
            header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Healer</span>,
            cell: ({ row }) => <span className="font-bold text-[#1b254b] dark:text-white">{row.getValue("healerName")}</span>,
        },
        {
            accessorKey: "email",
            header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Email</span>,
        },
        {
            accessorKey: "activatedAt",
            header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Activated At</span>,
        },
        {
            accessorKey: "amountPaid",
            header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Amount Paid</span>,
            cell: ({ row }) => <div className="font-bold text-[#1b254b] dark:text-white">${Number(row.getValue("amountPaid")).toFixed(2)}</div>
        },
        {
            accessorKey: "stripeId",
            header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Stripe PI/Session ID</span>,
            cell: ({ row }) => <div className="text-[10px] font-mono text-[#A3AED0] opacity-50">{row.getValue<string>("stripeId")}</div>
        },
        {
            accessorKey: "status",
            header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Status</span>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge className={
                        status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 rounded-full' : 
                        'bg-red-500/10 text-red-500 border-none px-3 py-1 rounded-full'
                    }>
                        {status}
                    </Badge>
                )
            }
        },
    ], []);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const response = await fetch(`${apiUrl}/api/admin/finance/premium-subscriptions`);
                const result = await response.json();
                if (response.ok && result.success) {
                    setData(result.subscriptions || []);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error('Error fetching premium subscriptions:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const dateRanges = [
        { id: 'all-time', label: 'All Time' },
        { id: 'month', label: 'This Month' },
        { id: 'week', label: 'This Week' },
        { id: 'custom', label: 'Custom Range' },
    ];

    const currentRangeLabel = dateRanges.find(r => r.id === dateRange)?.label || 'Select Range';

    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (dateRange === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (dateRange === 'week') {
            const tempDate = new Date(now);
            const dayOfWeek = tempDate.getDay();
            const diff = tempDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            startDate = new Date(tempDate.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
        } else if (dateRange === 'custom' && customDates.start) {
            startDate = new Date(customDates.start);
            startDate.setHours(0, 0, 0, 0);
        }

        if (dateRange === 'custom' && customDates.end) {
            endDate = new Date(customDates.end);
            endDate.setHours(23, 59, 59, 999);
        }

        return data.filter(record => {
            const recordDate = new Date(record.activatedAt);
            const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter.toLowerCase();
            const matchesStart = startDate ? recordDate >= startDate : true;
            const matchesEnd = endDate ? recordDate <= endDate : true;
            
            return matchesStatus && matchesStart && matchesEnd;
        });
    }, [statusFilter, dateRange, customDates, data]);

    const totalRevenue = useMemo(() => {
        return filteredData.reduce((acc, curr) => acc + curr.amountPaid, 0);
    }, [filteredData]);

    return (
        <div className="space-y-6" onClick={() => {
            setIsDateDropdownOpen(false);
            setIsStatusDropdownOpen(false);
        }}>
            {/* Header / Actions - Exactly as per description with balanced revenue stat */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 py-4 border-b border-[#E9EDF7] dark:border-white/5">
                <div>
                   <h2 className="text-2xl font-black text-[#1b254b] dark:text-white uppercase tracking-tight">PREMIUM SUBSCRIPTIONS TABLE</h2>
                   
                   {/* Balanced Revenue Display: Not too small, not too big */}
                   <div className="flex items-center gap-3 mt-2 bg-white dark:bg-[#111C44] px-4 py-2 rounded-xl border border-[#E9EDF7] dark:border-white/5 shadow-sm w-fit transition-all">
                       <span className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider">Revenue from premium upgrades:</span>
                       <span className="text-base font-black text-[#4318FF] dark:text-white">${totalRevenue.toFixed(2)}</span>
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {/* Date Range Selector */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDateDropdownOpen(!isDateDropdownOpen);
                                setIsStatusDropdownOpen(false);
                            }}
                            className="flex items-center gap-3 bg-white dark:bg-[#111C44] px-5 py-3 rounded-2xl border border-[#E9EDF7] dark:border-white/5 shadow-sm transition-all hover:border-[#4318FF] h-12"
                        >
                            <CalendarIcon className="h-4 w-4 text-[#A3AED0]" />
                            <span className="text-sm font-bold text-[#1b254b] dark:text-white uppercase tracking-tight">{currentRangeLabel}</span>
                            <ChevronDown className={`h-4 w-4 text-[#A3AED0] transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDateDropdownOpen && (
                            <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1b254b] rounded-2xl shadow-xl border border-[#E9EDF7] dark:border-white/5 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                            >
                                <div className="px-2 space-y-1">
                                    {dateRanges.map((range) => (
                                        <button
                                            key={range.id}
                                            onClick={() => {
                                                setDateRange(range.id);
                                                if (range.id !== 'custom') setIsDateDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm font-bold text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] dark:hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                                {dateRange === 'custom' && (
                                    <div className="mt-3 px-4 py-3 border-t border-[#E9EDF7] dark:border-white/5 space-y-3">
                                        <input 
                                            type="date" 
                                            className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-lg p-2 text-xs font-bold text-[#1b254b] dark:text-white"
                                            value={customDates.start}
                                            onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                                        />
                                        <input 
                                            type="date" 
                                            className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-lg p-2 text-xs font-bold text-[#1b254b] dark:text-white"
                                            value={customDates.end}
                                            onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                                        />
                                        <Button 
                                            size="sm" 
                                            className="w-full bg-[#4318FF] text-white rounded-xl h-10 mt-2"
                                            onClick={() => setIsDateDropdownOpen(false)}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                                setIsDateDropdownOpen(false);
                            }}
                            className="flex items-center gap-3 bg-white dark:bg-[#111C44] px-5 py-3 rounded-2xl border border-[#E9EDF7] dark:border-white/5 shadow-sm transition-all hover:border-[#4318FF] h-12"
                        >
                            <Filter className="h-4 w-4 text-[#A3AED0]" />
                            <span className="text-sm font-bold text-[#1b254b] dark:text-white uppercase tracking-tight">STATUS: {statusFilter}</span>
                            <ChevronDown className={`h-4 w-4 text-[#A3AED0] transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1b254b] rounded-2xl shadow-xl border border-[#E9EDF7] dark:border-white/5 py-2 z-50">
                                {['all', 'Active', 'Revoked'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setStatusFilter(status);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-5 py-2.5 text-sm font-bold text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] dark:hover:bg-white/5 transition-colors"
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-[#111C44] rounded-[32px] p-2 shadow-sm border border-[#E9EDF7] dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[#A3AED0] font-bold text-[10px] uppercase tracking-widest">Loading Report...</p>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={filteredData} />
                    )}
                </div>
            </div>
        </div>
    )
}
