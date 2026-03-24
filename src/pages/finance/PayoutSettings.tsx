import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import {
    Settings,
    Save,
    AlertCircle,
    Ban,
    CheckCircle2,
    Search,
    ArrowUpRight,
    Users,
    DollarSign,
    Info,
    ChevronRight,
    Filter
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";

type PayoutSetting = {
    id: string;
    healerName: string;
    email: string;
    connectStatus: "active" | "pending" | "restricted";
    schedule: "automatic" | "manual";
    minThreshold: number;
    lastPayoutAmount: number;
    currency: string;
};

// Expanded Mock data for a better "Data-Driven" vibe
const initialData: PayoutSetting[] = [
    {
        id: "usr_101",
        healerName: "Dr. Elena Vance",
        email: "elena@vancehealing.com",
        connectStatus: "active",
        schedule: "automatic",
        minThreshold: 100,
        lastPayoutAmount: 450.00,
        currency: "USD"
    },
    {
        id: "usr_102",
        healerName: "Maximus Flow",
        email: "max@flowstate.co",
        connectStatus: "active",
        schedule: "manual",
        minThreshold: 0,
        lastPayoutAmount: 1200.50,
        currency: "USD"
    },
    {
        id: "usr_103",
        healerName: "Sarah Light",
        email: "sarah.light@wellness.io",
        connectStatus: "restricted",
        schedule: "automatic",
        minThreshold: 500,
        lastPayoutAmount: 0,
        currency: "USD"
    },
    {
        id: "usr_104",
        healerName: "Julian Thorne",
        email: "j.thorne@zenith.com",
        connectStatus: "active",
        schedule: "automatic",
        minThreshold: 250,
        lastPayoutAmount: 890.00,
        currency: "USD"
    },
    {
        id: "usr_105",
        healerName: "Aetheria Moon",
        email: "moon@aetheria.love",
        connectStatus: "pending",
        schedule: "manual",
        minThreshold: 50,
        lastPayoutAmount: 0,
        currency: "USD"
    }
];

export function PayoutSettings() {
    const [data, setData] = useState<PayoutSetting[]>(initialData);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredData = useMemo(() => {
        return data.filter(item =>
            item.healerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    const updateSchedule = (id: string, newSchedule: "automatic" | "manual") => {
        setData(prev => prev.map(item => item.id === id ? { ...item, schedule: newSchedule } : item));
    };

    const updateThreshold = (id: string, newThreshold: number) => {
        setData(prev => prev.map(item => item.id === id ? { ...item, minThreshold: newThreshold } : item));
    };

    const handleSave = (id: string) => {
        console.log("Saving settings for:", id);
    };

    const columns: ColumnDef<PayoutSetting>[] = [
        {
            accessorKey: "healerName",
            header: () => <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Healer Profile</span>,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-4 py-1">
                        <div className="relative group">
                            <div className="w-11 h-11 rounded-2xl bg-[#4318FF]/10 dark:bg-white/5 flex items-center justify-center font-bold text-[#4318FF] dark:text-white shadow-sm transition-transform group-hover:scale-105">
                                {item.healerName.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#111C44] bg-green-500"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[#1b254b] dark:text-white group-hover:text-[#4318FF] transition-colors cursor-pointer">
                                {item.healerName}
                            </span>
                            <span className="text-xs font-medium text-[#A3AED0]">{item.email}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "connectStatus",
            header: () => <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Stripe Onboarding</span>,
            cell: ({ row }) => {
                const status = row.original.connectStatus;
                return (
                    <div className="flex items-center">
                        {status === "active" ? (
                            <div className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#E6FAF5] text-[#05CD99] dark:bg-[#05CD99]/10 flex items-center gap-1.5 border border-[#05CD99]/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </div>
                        ) : status === "restricted" ? (
                            <div className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#FFEEF2] text-[#EE5D50] dark:bg-[#EE5D50]/10 flex items-center gap-1.5 border border-[#EE5D50]/20">
                                <Ban className="w-3.5 h-3.5" /> Restricted
                            </div>
                        ) : (
                            <div className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#FFF9E6] text-[#FFA800] dark:bg-[#FFA800]/10 flex items-center gap-1.5 border border-[#FFA800]/20">
                                <AlertCircle className="w-3.5 h-3.5" /> Action Required
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "schedule",
            header: () => <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Strategy</span>,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="relative inline-block w-full max-w-[140px]">
                        <select
                            value={item.schedule}
                            onChange={(e) => updateSchedule(item.id, e.target.value as "automatic" | "manual")}
                            className="w-full appearance-none px-4 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border border-transparent hover:border-indigo-200 dark:hover:border-white/10 rounded-2xl text-[13px] font-bold text-[#1b254b] dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-[#111C44] outline-none transition-all cursor-pointer"
                        >
                            <option value="automatic">Auto-Disburse</option>
                            <option value="manual">Manual Push</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#A3AED0]">
                            <Filter className="w-3.5 h-3.5" />
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "minThreshold",
            header: () => (
                <div className="flex items-center gap-2 group cursor-help">
                    <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Disbursement Min</span>
                    <Info className="w-3.5 h-3.5 text-[#A3AED0] group-hover:text-indigo-500 transition-colors" />
                </div>
            ),
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="relative w-full max-w-[140px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#A3AED0]">$</span>
                        <input
                            type="number"
                            min="0"
                            step="10"
                            value={item.minThreshold}
                            onChange={(e) => updateThreshold(item.id, Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border border-transparent hover:border-indigo-200 dark:hover:border-white/10 rounded-2xl text-[13px] font-bold text-[#1b254b] dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-[#111C44] outline-none transition-all"
                        />
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: () => <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider text-right block pr-4">Execution</span>,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center justify-end pr-2 gap-2">
                        <button
                            onClick={() => handleSave(item.id)}
                            className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold text-white bg-[#4318FF] hover:bg-[#3311db] rounded-2xl transition-all shadow-md active:scale-95 group"
                        >
                            <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            Update
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- TOP HEADER SECTION --- */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-[#1b254b] dark:text-white">
                        Disbursement Architecture
                    </h1>
                </div>
            </div>

            {/* --- KPI OVERVIEW CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatsCard
                    title="Active Healers"
                    value={data.length.toString()}
                    icon={<Users className="w-6 h-6 text-[#4318FF]" />}
                    className="shadow-sm"
                />
                <StatsCard
                    title="Avg. Threshold"
                    value={`$${(data.reduce((acc, curr) => acc + curr.minThreshold, 0) / data.length).toFixed(0)}`}
                    icon={<DollarSign className="w-6 h-6 text-[#05CD99]" />}
                    className="shadow-sm"
                />
                <StatsCard
                    title="Verified Onboarding"
                    value="86%"
                    icon={<CheckCircle2 className="w-6 h-6 text-[#01A3B4]" />}
                    className="shadow-sm"
                />
                <div className="bg-white dark:bg-[#111C44] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <span className="text-[#A3AED0] text-sm font-bold flex items-center gap-2">
                            System Health <ArrowUpRight className="w-4 h-4" />
                        </span>
                        <div className="mt-2">
                            <div className="text-3xl font-black text-[#1b254b] dark:text-white">99.9<span className="text-[#A3AED0]">%</span></div>
                            <div className="text-[10px] uppercase tracking-widest text-[#A3AED0] font-black mt-1">Uptime SLA</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- INTEGRATED INFO BANNER --- */}
            <div className="bg-[#111C44] dark:bg-white/5 rounded-[32px] p-6 text-white overflow-hidden relative border border-white/5">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-5">
                        <div className="w-14 h-14 bg-white/10 flex items-center justify-center rounded-2xl shrink-0 backdrop-blur-md">
                            <Info className="w-7 h-7 text-indigo-300" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black tracking-tight mb-1 text-white">Stripe Minimum Threshold Policy</h4>
                            <p className="text-sm font-medium text-indigo-100/70 max-w-3xl leading-relaxed">
                                Setting a threshold below <b className="text-[#01A3B4] font-black underline decoration-2 underline-offset-4 font-mono">$50.00 USD</b> may trigger anti-fraud failures across EU and SEPA regions. Manual disbursements bypass active schedules but must adhere to internal compliance limits.
                            </p>
                        </div>
                    </div>
                    <button className="whitespace-nowrap px-6 py-3 bg-[#4318FF] hover:bg-[#3311db] text-[13px] font-black rounded-2xl transition-all shadow-xl shadow-[#4318FF]/30">
                        Review Compliance Docs
                    </button>
                </div>
                {/* Visual accent */}
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
            </div>

            {/* --- MAIN DATA TABLE SECTION --- */}
            <div className="bg-white dark:bg-[#111C44] rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-black text-[#1b254b] dark:text-white tracking-tight">Management Ledger</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[11px] font-black text-green-500 uppercase tracking-widest">Live Sync Enabled</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-80 h-12">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search healers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-full pl-11 pr-5 bg-[#F4F7FE] dark:bg-white/5 rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-[#4318FF]/10 text-sm font-bold text-[#1b254b] dark:text-white placeholder:text-[#A3AED0] transition-all"
                            />
                        </div>
                        <button className="h-12 w-12 bg-[#F4F7FE] dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#A3AED0] hover:text-[#4318FF] transition-all shadow-sm border border-transparent hover:border-[#4318FF]/20">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <DataTable columns={columns} data={filteredData} />
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[12px] font-bold text-[#A3AED0]">
                        Showing <span className="text-[#1b254b] dark:text-white">{filteredData.length}</span> entries of <span className="text-[#1b254b] dark:text-white uppercase">{data.length} total</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
