import React, { useState, useMemo } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    ChevronDown,
    Filter,
    AlertCircle,
    Check,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface Payout {
    id: string;
    healer: {
        name: string;
        email: string;
        avatar?: string;
        stripeStatus: 'active' | 'pending' | 'restricted';
    };
    stripeAccountId: string;
    amount: number;
    currency: string;
    dateInitiated: string;
    status: 'succeeded' | 'pending' | 'failed' | 'in_transit';
    stripePayoutId: string;
}

const STATIC_PAYOUTS: Payout[] = [
    {
        id: "1",
        healer: {
            name: "Dr. Sarah Chen",
            email: "sarah.chen@example.com",
            stripeStatus: 'active'
        },
        stripeAccountId: "acct_1N2b3c4d5e6f7g8h",
        amount: 1250.00,
        currency: "USD",
        dateInitiated: "2024-03-24T10:00:00Z",
        status: "succeeded",
        stripePayoutId: "po_1P3k4l5m6n7o8p9q"
    },
    {
        id: "2",
        healer: {
            name: "Master Julian Vane",
            email: "j.vane@example.com",
            stripeStatus: 'active'
        },
        stripeAccountId: "acct_2H3j4k5l6m7n8o9p",
        amount: 850.50,
        currency: "USD",
        dateInitiated: "2024-03-23T14:30:00Z",
        status: "pending",
        stripePayoutId: "po_2Q3r4s5t6u7v8w9x"
    },
    {
        id: "3",
        healer: {
            name: "Elena Rodriguez",
            email: "elena.r@example.com",
            stripeStatus: 'pending'
        },
        stripeAccountId: "acct_3K4l5m6n7o8p9q0r",
        amount: 2100.25,
        currency: "USD",
        dateInitiated: "2024-03-22T09:15:00Z",
        status: "in_transit",
        stripePayoutId: "po_3A4b5c6d7e8f9g0h"
    },
    {
        id: "4",
        healer: {
            name: "Marcus Thorne",
            email: "m.thorne@example.com",
            stripeStatus: 'restricted'
        },
        stripeAccountId: "acct_4M5n6o7p8q9r0s1t",
        amount: 450.00,
        currency: "USD",
        dateInitiated: "2024-03-21T16:45:00Z",
        status: "failed",
        stripePayoutId: "po_4I5j6k7l8m9n0o1p"
    }
];

export function PayoutsTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState("all-time");
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [customDates, setCustomDates] = useState({ start: "", end: "" });
    const [isManualPayoutModalOpen, setIsManualPayoutModalOpen] = useState(false);

    // Modal State
    const [healerSearch, setHealerSearch] = useState("");
    const [selectedHealer, setSelectedHealer] = useState<Payout['healer'] | null>(null);
    const [payoutAmount, setPayoutAmount] = useState<string>("");
    const [isHealerListOpen, setIsHealerListOpen] = useState(false);

    const dateRanges = [
        { id: 'all-time', label: 'All Time' },
        { id: 'month', label: 'This Month' },
        { id: 'week', label: 'This Week' },
        { id: 'custom', label: 'Custom Range' },
    ];

    const currentRangeLabel = dateRanges.find(r => r.id === dateRange)?.label || 'Select Range';

    const columns: ColumnDef<Payout>[] = [
        {
            accessorKey: "healer",
            header: () => <div className="text-left py-2 min-w-[200px]">Healer</div>,
            cell: ({ row }) => {
                const healer = row.original.healer;
                return (
                        <div className="flex flex-col min-w-0">
                            <h4 className="text-sm font-bold text-[#1b254b] dark:text-white truncate leading-none mb-1.5">{healer.name}</h4>
                            <span className="text-[11px] font-medium text-[#A3AED0] truncate mb-2">{healer.email}</span>
                            <div className="flex">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                    healer.stripeStatus === 'active' ? 'text-emerald-600 bg-emerald-50' : 
                                    healer.stripeStatus === 'pending' ? 'text-amber-600 bg-amber-50' : 
                                    'text-rose-600 bg-rose-50'
                                }`}>
                                    CONNECT: {healer.stripeStatus}
                                </span>
                            </div>
                        </div>
                );
            }
        },
        {
            accessorKey: "stripeAccountId",
            header: () => <div className="text-left py-2 min-w-[150px]">Stripe Account ID</div>,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <code className="text-[11px] font-medium text-[#A3AED0]">{row.getValue<string>("stripeAccountId")}</code>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: () => <div className="text-right py-2 min-w-[80px]">Amount</div>,
            cell: ({ row }) => (
                <div className="text-right text-sm font-bold text-[#1b254b] dark:text-white">
                    {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(row.original.amount)}
                </div>
            )
        },
        {
            accessorKey: "currency",
            header: () => <div className="text-center py-2 min-w-[70px]">Currency</div>,
            cell: ({ row }) => (
                <div className="text-center text-[10px] font-bold text-[#A3AED0] uppercase">
                    {row.getValue<string>("currency")}
                </div>
            )
        },
        {
            accessorKey: "dateInitiated",
            header: () => <div className="text-left py-2 min-w-[180px]">Date Initiated</div>,
            cell: ({ row }) => {
                const date = new Date(row.getValue<string>("dateInitiated"));
                return (
                    <div className="text-left text-[11px] font-bold text-[#1b254b] dark:text-white">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: () => <div className="text-center py-2 min-w-[110px]">Status</div>,
            cell: ({ row }) => {
                const status = row.getValue<string>("status");
                const getStatusStyles = (s: string) => {
                    switch (s) {
                        case 'succeeded': return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-none";
                        case 'pending': return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-none";
                        case 'in_transit': return "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-none";
                        case 'failed': return "bg-red-500/10 text-red-600 dark:text-red-500 border-none";
                        default: return "bg-slate-500/10 text-slate-600 dark:text-slate-500 border-none";
                    }
                };
                return (
                    <div className="flex justify-center">
                        <div className={`${getStatusStyles(status)} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                            {status.replace('_', ' ')}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "stripePayoutId",
            header: () => <div className="text-left py-2 min-w-[150px]">Stripe Payout ID</div>,
            cell: ({ row }) => <span className="text-[10px] font-medium text-[#A3AED0] uppercase truncate block max-w-[140px]">{row.getValue<string>("stripePayoutId")}</span>
        }
    ];

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

        return STATIC_PAYOUTS.filter(payout => {
            const payoutDate = new Date(payout.dateInitiated);
            const matchesSearch = payout.healer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payout.stripePayoutId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
            const matchesStart = startDate ? payoutDate >= startDate : true;
            const matchesEnd = endDate ? payoutDate <= endDate : true;

            return matchesSearch && matchesStatus && matchesStart && matchesEnd;
        });
    }, [searchTerm, statusFilter, dateRange, customDates]);

    const handleCloseModal = () => {
        setIsManualPayoutModalOpen(false);
        setHealerSearch("");
        setSelectedHealer(null);
        setPayoutAmount("");
        setIsHealerListOpen(false);
    };

    const handleTriggerPayout = () => {
        console.log("Triggering payout for:", selectedHealer?.name, "Amount:", payoutAmount);
        handleCloseModal();
    };

    const suggestedHealers = useMemo(() => {
        if (!healerSearch) return STATIC_PAYOUTS.map(p => p.healer).filter((val, idx, self) => self.findIndex(t => t.name === val.name) === idx);
        return STATIC_PAYOUTS
            .map(p => p.healer)
            .filter((val, idx, self) => self.findIndex(t => t.name === val.name) === idx)
            .filter(h => h.name.toLowerCase().includes(healerSearch.toLowerCase()) || h.email.toLowerCase().includes(healerSearch.toLowerCase()));
    }, [healerSearch]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500" onClick={() => {
            setIsDateDropdownOpen(false);
            setIsStatusDropdownOpen(false);
            setIsHealerListOpen(false);
        }}>
            {/* Header / Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E9EDF7] dark:border-white/5">
                <div className="flex flex-col gap-4 flex-1">
                    <h2 className="text-xl font-bold text-[#1b254b] dark:text-white uppercase tracking-tight">Payout Management</h2>
                    <div className="relative group w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0] group-hover:text-[#4318FF] transition-colors" />
                        <Input
                            placeholder="Search by healer or ID..."
                            className="pl-11 h-11 rounded-xl border-[#E9EDF7] dark:border-white/10 focus:ring-1 focus:ring-[#4318FF] bg-white dark:bg-[#111C44]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {/* Date Range Selector */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDateDropdownOpen(!isDateDropdownOpen);
                                setIsStatusDropdownOpen(false);
                            }}
                            className="flex items-center gap-2.5 bg-white dark:bg-[#111C44] px-4 py-2.5 rounded-xl border border-[#E9EDF7] dark:border-white/5 shadow-sm transition-all hover:border-[#4318FF] h-11"
                        >
                            <CalendarIcon className="h-4 w-4 text-[#A3AED0]" />
                            <span className="text-sm font-semibold text-[#1b254b] dark:text-white">{currentRangeLabel}</span>
                            <ChevronDown className={`h-4 w-4 text-[#A3AED0] transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDateDropdownOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1b254b] rounded-xl shadow-xl border border-[#E9EDF7] dark:border-white/5 py-2 z-50 overflow-hidden"
                            >
                                <div className="px-2 space-y-0.5">
                                    {dateRanges.map((range) => (
                                        <button
                                            key={range.id}
                                            onClick={() => {
                                                setDateRange(range.id);
                                                if (range.id !== 'custom') setIsDateDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm font-semibold text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] dark:hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                                {dateRange === 'custom' && (
                                    <div className="mt-2 px-4 py-3 border-t border-[#E9EDF7] dark:border-white/5 space-y-2.5">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-[#A3AED0] uppercase">From</span>
                                            <input type="date" className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-lg p-2 text-xs font-semibold text-[#1b254b] dark:text-white" value={customDates.start} onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-[#A3AED0] uppercase">To</span>
                                            <input type="date" className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-lg p-2 text-xs font-semibold text-[#1b254b] dark:text-white" value={customDates.end} onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))} />
                                        </div>
                                        <Button size="sm" className="w-full bg-[#4318FF] text-white rounded-lg h-9" onClick={() => setIsDateDropdownOpen(false)}>Apply</Button>
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
                            className="flex items-center gap-2.5 bg-white dark:bg-[#111C44] px-4 py-2.5 rounded-xl border border-[#E9EDF7] dark:border-white/5 shadow-sm transition-all hover:border-[#4318FF] h-11"
                        >
                            <Filter className="h-4 w-4 text-[#A3AED0]" />
                            <span className="text-sm font-semibold text-[#1b254b] dark:text-white uppercase tracking-tight">{statusFilter === 'all' ? 'All Status' : statusFilter.replace('_', ' ')}</span>
                            <ChevronDown className={`h-4 w-4 text-[#A3AED0] transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1b254b] rounded-xl shadow-xl border border-[#E9EDF7] dark:border-white/5 py-2 z-50">
                                {['all', 'succeeded', 'pending', 'in_transit', 'failed'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setStatusFilter(status);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm font-semibold text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] dark:hover:bg-white/5 transition-colors rounded-lg"
                                    >
                                        {status === 'all' ? 'All Status' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={() => setIsManualPayoutModalOpen(true)}
                        className="bg-[#4318FF] hover:bg-[#3311CC] text-white px-6 h-11 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all"
                    >
                        Trigger Payout
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-[#111C44] rounded-2xl p-2 shadow-sm border border-[#E9EDF7] dark:border-white/5 overflow-x-auto scrollbar-hide">
                <DataTable columns={columns} data={filteredData} />
            </div>

            {/* Manual Payout Modal */}
            <Modal
                isOpen={isManualPayoutModalOpen}
                onClose={handleCloseModal}
                title="Trigger Manual Payout"
                maxWidth="md"
                footer={
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="ghost"
                            onClick={handleCloseModal}
                            className="flex-1 rounded-xl h-12 font-bold text-sm text-[#A3AED0] hover:bg-[#F4F7FE] dark:hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!selectedHealer || !payoutAmount}
                            onClick={handleTriggerPayout}
                            className="flex-1 bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl h-12 font-bold text-sm disabled:opacity-50 shadow-lg shadow-[#4318FF]/20 transition-all"
                        >
                            Confirm Trigger
                        </Button>
                    </div>
                }
            >
                <div className="space-y-8 py-2">
                    {/* Healer Search Dropdown */}
                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-[#A3AED0] uppercase ml-1 tracking-wider">Target Healer</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors" />
                            <input
                                type="text"
                                placeholder={selectedHealer ? selectedHealer.name : "Search for a healer..."}
                                className="w-full bg-[#f4f7fe] dark:bg-white/5 border border-[#e9edf7] dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-base font-semibold text-[#1b254b] dark:text-white outline-none focus:border-[#4318FF] focus:ring-4 focus:ring-[#4318FF]/5 transition-all placeholder:text-[#A3AED0]"
                                value={healerSearch}
                                onChange={(e) => {
                                    setHealerSearch(e.target.value);
                                    setIsHealerListOpen(true);
                                }}
                                onFocus={() => setIsHealerListOpen(true)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {selectedHealer && !healerSearch && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500/10 p-1.5 rounded-full">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                </div>
                            )}
                        </div>

                        {isHealerListOpen && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1b254b] border border-[#e9edf7] dark:border-white/10 rounded-2xl shadow-2xl z-[60] py-2 max-h-64 overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {suggestedHealers.length > 0 ? (
                                    suggestedHealers.map(h => (
                                        <button
                                            key={h.email}
                                            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#f4f7fe] dark:hover:bg-white/5 transition-colors text-left"
                                            onClick={() => {
                                                setSelectedHealer(h);
                                                setHealerSearch("");
                                                setIsHealerListOpen(false);
                                            }}
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-[#4318FF]/5 flex items-center justify-center text-[#4318FF] font-bold text-sm">
                                                {h.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-[#1b254b] dark:text-white leading-none truncate">{h.name}</div>
                                                <div className="text-xs text-[#A3AED0] mt-1.5 truncate">{h.email}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-5 py-6 text-sm text-[#A3AED0] text-center font-medium">No healers matched your search</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-[#A3AED0] uppercase ml-1 tracking-wider block text-center">Amount to Pay (USD)</label>
                        <div className="relative flex items-center justify-center bg-[#f4f7fe]/50 dark:bg-white/5 rounded-3xl py-8 px-6 border-2 border-dashed border-[#e9edf7] dark:border-white/10 group focus-within:border-[#4318FF] focus-within:border-solid transition-all">
                            <div className="flex items-center gap-1 group-focus-within:scale-105 transition-transform duration-300">
                                <span className="text-3xl font-bold text-[#4318FF] opacity-50">$</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    className="bg-transparent border-none p-0 text-5xl font-black text-[#1b254b] dark:text-white w-[220px] text-center focus:ring-0 placeholder:text-[#A3AED0]/20 scrollbar-hide"
                                    value={payoutAmount}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                        if (val.split('.').length <= 2) setPayoutAmount(val);
                                    }}
                                />
                            </div>
                            <div className="absolute top-2 right-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest opacity-50">Manual Override</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-[#707EAE] dark:text-amber-400/90 text-xs font-medium leading-relaxed bg-amber-500/[0.03] p-5 rounded-2xl border border-amber-500/10">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>Warning: This funds transfer is instantaneous and cannot be reversed once triggered.</span>
                    </div>
                </div>
            </Modal>

            <style>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
