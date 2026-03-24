import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../components/DataTable"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { FileSpreadsheet, Search, Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import * as XLSX from "xlsx"
import { useState, useMemo, useEffect } from "react"

export type CommissionRecord = {
    id: string
    bookingId: string
    date: string
    healerName: string
    seekerName: string
    baseAmount: number
    healerCommission: number // 10%
    seekerFee: number // 5%
    processingFee: number // Stripe fee (~2.9% + 0.3)
    healerPayout: number // base - healerCommission
    platformNet: number // healerComm + seekerFee - processingFee
    stripePiId: string
    status: "Processed" | "Pending" | "Refunded"
}

export const columns: ColumnDef<CommissionRecord>[] = [
    {
        accessorKey: "bookingId",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Booking ID</span>,
        cell: ({ row }) => <span className="font-bold text-[#1b254b] dark:text-white">{row.getValue("bookingId")}</span>,
    },
    {
        accessorKey: "date",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Date</span>,
    },
    {
        accessorKey: "healerName",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Healer</span>,
    },
    {
        accessorKey: "seekerName",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Seeker</span>,
    },
    {
        accessorKey: "baseAmount",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Base Amount</span>,
        cell: ({ row }) => <div className="font-medium text-[#A3AED0]">${Number(row.getValue("baseAmount")).toFixed(2)}</div>
    },
    {
        accessorKey: "healerCommission",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Healer Commission</span>,
        cell: ({ row }) => <div className="font-bold text-[#4318FF]">${Number(row.getValue("healerCommission")).toFixed(2)}</div>
    },
    {
        accessorKey: "seekerFee",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Seeker Fee</span>,
        cell: ({ row }) => <div className="font-medium text-emerald-500">${Number(row.getValue("seekerFee")).toFixed(2)}</div>
    },
    {
        accessorKey: "processingFee",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Processing Fee</span>,
        cell: ({ row }) => <div className="font-medium text-red-400">${Number(row.getValue("processingFee")).toFixed(2)}</div>
    },
    {
        accessorKey: "healerPayout",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Healer Payout</span>,
        cell: ({ row }) => <div className="font-bold text-[#1b254b] dark:text-white">${Number(row.getValue("healerPayout")).toFixed(2)}</div>
    },
    {
        accessorKey: "platformNet",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Platform Net</span>,
        cell: ({ row }) => <div className="font-black text-[#4318FF] dark:text-white">${Number(row.getValue("platformNet")).toFixed(2)}</div>
    },
    {
        accessorKey: "stripePiId",
        header: () => <span className="text-[10px] font-black uppercase tracking-wider text-[#A3AED0]">Stripe PI ID</span>,
        cell: ({ row }) => <div className="text-[10px] font-mono text-[#A3AED0] opacity-50">{row.getValue<string>("stripePiId")}</div>
    },
]

export function CommissionTable() {
    const [searchTerm, setSearchTerm] = useState("")
    const [dateRange, setDateRange] = useState("all-time")
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false)
    const [data, setData] = useState<CommissionRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const response = await fetch(`${apiUrl}/api/admin/finance/commission-report`);
                const result = await response.json();
                if (result.success) {
                    setData(result.records);
                }
            } catch (error) {
                console.error('Error fetching commission records:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const dateRanges = [
        { id: 'all-time', label: 'All' },
        { id: 'month', label: 'This Month' },
        { id: 'week', label: 'This Week' },
        { id: 'custom', label: 'Custom Range' },
    ];

    const [customDates, setCustomDates] = useState({ start: "", end: "" });
    const currentRangeLabel = dateRanges.find(r => r.id === dateRange)?.label || 'Select Range';

    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate: Date | null = null;

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

        let endDate: Date | null = null;
        if (dateRange === 'custom' && customDates.end) {
            endDate = new Date(customDates.end);
            endDate.setHours(23, 59, 59, 999);
        }

        return data.filter(record => {
            const recordDate = new Date(record.date);
            const matchesSearch = record.healerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStart = startDate ? recordDate >= startDate : true;
            const matchesEnd = endDate ? recordDate <= endDate : true;
            return matchesSearch && matchesStart && matchesEnd;
        });
    }, [searchTerm, dateRange, customDates, data]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, curr) => ({
            base: acc.base + curr.baseAmount,
            healerComm: acc.healerComm + curr.healerCommission,
            seekerFee: acc.seekerFee + curr.seekerFee,
            procFee: acc.procFee + curr.processingFee,
            payout: acc.payout + curr.healerPayout,
            net: acc.net + curr.platformNet
        }), { base: 0, healerComm: 0, seekerFee: 0, procFee: 0, payout: 0, net: 0 })
    }, [filteredData])

    const exportToExcel = () => {
        const exportData = filteredData.map(record => ({
            "Booking ID": record.bookingId,
            "Date": record.date,
            "Healer": record.healerName,
            "Seeker": record.seekerName,
            "Base Amount ($)": record.baseAmount,
            "Healer Commission (10%)": record.healerCommission,
            "Seeker Fee (5%)": record.seekerFee,
            "Processing Fee ($)": record.processingFee,
            "Healer Payout ($)": record.healerPayout,
            "Platform Net ($)": record.platformNet,
            "Stripe PI ID": record.stripePiId
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Commission Report")
        
        const max_width = [15, 12, 20, 20, 15, 15, 15, 15, 15, 15, 20]
        worksheet["!cols"] = max_width.map(w => ({ wch: w }))
        XLSX.writeFile(workbook, `UltraHealers_Commissions_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" onClick={() => setIsDateDropdownOpen(false)}>
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0] group-hover:text-[#4318FF] transition-colors" />
                        <Input 
                            placeholder="Search healer name..." 
                            className="pl-11 h-12 w-full sm:w-80 rounded-2xl border-[#E9EDF7] dark:border-white/10 focus:ring-[#4318FF] bg-white dark:bg-[#111C44]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDateDropdownOpen(!isDateDropdownOpen);
                            }}
                            className="flex items-center gap-3 bg-white dark:bg-[#111C44] px-5 py-3 rounded-2xl border border-[#E9EDF7] dark:border-white/5 shadow-sm transition-all hover:border-[#4318FF] dark:hover:border-[#01A3B4] group h-12"
                        >
                            <CalendarIcon className="h-4 w-4 text-[#A3AED0] group-hover:text-[#4318FF] transition-colors" />
                            <span className="text-sm font-bold text-[#1b254b] dark:text-white">{currentRangeLabel}</span>
                            <ChevronDown className={`h-4 w-4 text-[#A3AED0] transition-transform duration-200 ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDateDropdownOpen && (
                            <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#1b254b] rounded-2xl shadow-[0_20px_40px_0_rgba(11,20,55,0.15)] border border-[#E9EDF7] dark:border-white/5 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                            >
                                <div className="px-2 space-y-1">
                                    {dateRanges.map((range) => (
                                        <button
                                            key={range.id}
                                            onClick={() => {
                                                setDateRange(range.id);
                                                if (range.id !== 'custom') setIsDateDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm font-bold rounded-xl transition-colors ${dateRange === range.id
                                                    ? "text-[#4318FF] dark:text-[#01A3B4] bg-[#F4F7FE] dark:bg-white/5"
                                                    : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                                {dateRange === 'custom' && (
                                    <div className="mt-3 px-4 py-3 border-t border-[#E9EDF7] dark:border-white/5 space-y-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[#A3AED0] uppercase">From</p>
                                            <input 
                                                type="date" 
                                                className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-lg p-2 text-xs font-bold text-[#1b254b] dark:text-white"
                                                value={customDates.start}
                                                onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[#A3AED0] uppercase">To</p>
                                            <input 
                                                type="date" 
                                                className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-lg p-2 text-xs font-bold text-[#1b254b] dark:text-white"
                                                value={customDates.end}
                                                onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                                            />
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="w-full h-9 rounded-xl bg-[#4318FF] text-white"
                                            onClick={() => setIsDateDropdownOpen(false)}
                                        >
                                            Apply Range
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <Button 
                    onClick={exportToExcel}
                    className="bg-[#39B2AB] hover:bg-[#2D8D87] text-white font-black rounded-2xl px-8 h-12 transition-all shadow-lg shadow-[#39B2AB]/20 active:scale-95"
                >
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Export Report
                </Button>
            </div>

            <div className="bg-white dark:bg-[#111C44] rounded-[32px] p-2 shadow-[0_20px_50px_rgba(11,20,55,0.05)] border border-[#E9EDF7] dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[#A3AED0] font-bold">Loading records...</p>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={filteredData} />
                    )}
                </div>
                
                {/* Official Totals Row at Bottom */}
                <div className="bg-[#F4F7FE]/50 dark:bg-white/5 mt-2 p-5 rounded-2xl border border-[#E9EDF7] dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#4318FF] rounded-full" />
                        <span className="text-xs font-black text-[#1b254b] dark:text-white uppercase tracking-tight">Totals ({filteredData.length} Records)</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-[#A3AED0] uppercase">Aggregated Base</span>
                            <span className="text-sm font-black text-[#1b254b] dark:text-white">${totals.base.toFixed(2)}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-[#E9EDF7] dark:bg-white/10 hidden sm:block" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-[#A3AED0] uppercase">Total Commission</span>
                            <span className="text-sm font-black text-[#4318FF] dark:text-white">${totals.healerComm.toFixed(2)}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-[#E9EDF7] dark:bg-white/10 hidden sm:block" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-[#A3AED0] uppercase">Platform Net</span>
                            <span className="text-base font-black text-[#4318FF] dark:text-white">${totals.net.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
