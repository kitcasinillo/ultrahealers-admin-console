import { useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { CheckCircle2, XCircle, MoreHorizontal, Filter, Eye, Trash2, Mail, ChevronDown, Activity, RefreshCcw } from "lucide-react"
import { Button } from "../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { cn } from "../../lib/utils"
import { formatDateTime, formatCurrency } from "../../lib/bookings"
import type { Booking, BookingStatus } from "../../lib/bookings"
import { useBookings } from "../../hooks/useBookings"

export const columns: ColumnDef<Booking>[] = [
    {
        accessorKey: "id",
        header: "Booking ID",
        cell: ({ row }) => <span className="text-[12px] font-medium text-[#A3AED0] font-mono">{row.original.id.substring(0, 10)}...</span>
    },
    {
        accessorKey: "listingTitle",
        header: "Listing",
        cell: ({ row }) => (
            <div className="flex flex-col max-w-[180px]">
                <span className="text-[14px] font-bold text-[#1b254b] dark:text-white truncate" title={row.original.listingTitle}>
                    {row.original.listingTitle}
                </span>
            </div>
        )
    },
    {
        accessorKey: "healerName",
        header: "Healer",
        cell: ({ row }) => <span className="text-[14px] font-medium text-[#1b254b] dark:text-white">{row.original.healerName}</span>
    },
    {
        accessorKey: "seekerName",
        header: "Seeker",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-[14px] font-medium text-[#1b254b] dark:text-white">{row.original.seekerName}</span>
                <span className="text-[11px] font-normal text-[#A3AED0]">{row.original.seekerEmail || ""}</span>
            </div>
        )
    },
    {
        accessorKey: "sessionDate",
        header: "Session Date",
        cell: ({ row }) => {
            const date = formatDateTime(row.original.sessionDate)
            const time = formatDateTime(row.original.sessionTime)
            return (
                <div className="flex flex-col min-w-[100px]">
                    <span className="text-[13px] font-semibold text-[#1b254b] dark:text-white">{date}</span>
                    <span className="text-[11px] font-medium text-[#A3AED0]">{time}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = Number(row.original.amount || 0)
            const currency = row.original.currency || "USD"
            return (
                <span className="text-[14px] font-bold text-[#1b254b] dark:text-white">
                    {formatCurrency(amount, currency)}
                </span>
            )
        }
    },
    {
        accessorKey: "currency",
        header: "CUR",
        cell: ({ row }) => <span className="text-[12px] font-bold text-[#A3AED0]">{row.original.currency || "USD"}</span>
    },
    {
        accessorKey: "commission",
        header: "Commission",
        cell: ({ row }) => {
            const amount = Number(row.original.amount || 0)
            const currency = row.original.currency || "USD"
            // Platform Fee (5% seeker + 10% healer = 15% total)
            const commission = amount * 0.15
            return (
                <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(commission, currency)}
                    </span>
                    <span className="text-[10px] text-[#A3AED0] font-medium">15% FEE</span>
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status Flags",
        cell: ({ row }) => {
            const status = row.original.status || {}
            return (
                <div className="flex items-center gap-1.5">
                    <StatusIcon active={status['invite-email-to-seeker']} title="Seeker Email" />
                    <StatusIcon active={status['invite-email-to-healer']} title="Healer Email" />
                    <StatusIcon active={status['booking-confirmed-by-healer']} title="Confirmed" />
                    <StatusIcon active={status['booking-marked-as-complete-by-healer']} title="Healer Done" />
                    <StatusIcon active={status['booking-marked-as-complete-by-seeker']} title="Seeker Done" />
                </div>
            )
        }
    },
    {
        accessorKey: "paymentStatus",
        header: "Payment",
        cell: ({ row }) => {
            const status = (row.original.paymentStatus || "pending").toLowerCase()
            return (
                <Badge 
                    className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize",
                        status === "succeeded" 
                        ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400" 
                        : "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400"
                    )}
                >
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
            <span className="text-[12px] font-medium text-[#A3AED0]">
                {formatDateTime(row.original.createdAt)}
            </span>
        )
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-[#A3AED0]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-xl dark:bg-[#111C44]">
                    <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider">Booking Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 text-[13px] font-medium text-[#1b254b] dark:text-white rounded-lg cursor-pointer focus:bg-gray-50 dark:focus:bg-white/5">
                        <Eye className="h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 text-[13px] font-medium text-[#1b254b] dark:text-white rounded-lg cursor-pointer focus:bg-gray-50 dark:focus:bg-white/5">
                        <Mail className="h-4 w-4" /> Resend Emails
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-white/5" />
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 text-[13px] font-medium text-red-500 rounded-lg cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10">
                        <Trash2 className="h-4 w-4" /> Cancel Booking
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
]

const StatusIcon = ({ active, title }: { active: boolean, title: string }) => (
    <div 
        className={cn(
            "p-1 rounded-full transition-all flex items-center justify-center",
            active ? "bg-green-50 dark:bg-green-500/10" : "bg-gray-50 dark:bg-white/5 opacity-40"
        )}
        title={title}
    >
        {active ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
            <XCircle className="h-3.5 w-3.5 text-[#A3AED0]" />
        )}
    </div>
)

export function Sessions() {
    const { bookings, loading, refetch } = useBookings()
    const [filters, setFilters] = useState({
        payment: "all",
        flag: "all"
    })

    const filteredData = bookings.filter(booking => {
        if (filters.payment !== "all" && (booking.paymentStatus || "").toLowerCase() !== filters.payment) return false
        if (filters.flag !== "all") {
            const hasFlag = booking.status?.[filters.flag as keyof BookingStatus]
            if (!hasFlag) return false
        }
        return true
    })

    const activeFlagLabel = filters.flag === "all" ? "Any Workflow" : filters.flag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[34px] font-bold tracking-tight text-[#1b254b] dark:text-white">Session Bookings</h2>
                    <p className="text-[#A3AED0] text-[15px] font-medium mt-1">
                        Monitor and manage the lifecycle of all platform session bookings.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Refetch Button */}
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={refetch}
                        className="h-[46px] w-[46px] rounded-xl border-gray-100 dark:border-white/5 dark:bg-[#111C44]"
                        title="Refresh Data"
                    >
                        <RefreshCcw className={cn("h-4 w-4 text-[#A3AED0]", loading && "animate-spin")} />
                    </Button>

                    {/* Payment Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-[46px] min-w-[160px] flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#111C44] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm text-[14px] font-bold text-[#1b254b] dark:text-white hover:bg-gray-50 focus:ring-0">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-[#4318FF]" />
                                    <span>Payment: {filters.payment.charAt(0).toUpperCase() + filters.payment.slice(1)}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-[#A3AED0]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-xl dark:bg-[#111C44]">
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, payment: "all" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2">All Status</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, payment: "succeeded" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2 text-green-600">Succeeded</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, payment: "pending" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2 text-orange-600">Pending</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Flag Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-[46px] min-w-[160px] flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#111C44] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm text-[14px] font-bold text-[#1b254b] dark:text-white hover:bg-gray-50 focus:ring-0">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-[#4318FF]" />
                                    <span className="max-w-[180px] truncate">{activeFlagLabel}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-[#A3AED0]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[240px] p-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-xl dark:bg-[#111C44]">
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, flag: "all" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2">Any Workflow Status</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5 my-1" />
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, flag: "invite-email-to-seeker" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2">Seeker Emailed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, flag: "invite-email-to-healer" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2">Healer Emailed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, flag: "booking-confirmed-by-healer" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2">Healer Confirmed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, flag: "booking-marked-as-complete-by-healer" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2">Completed by Healer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, flag: "booking-marked-as-complete-by-seeker" }))} className="cursor-pointer text-sm font-medium rounded-lg px-3 py-2">Completed by Seeker</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111C44] rounded-xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                {loading && bookings.length === 0 ? (
                    <div className="h-80 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4318FF]"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <DataTable columns={columns} data={filteredData} />
                    </div>
                )}
            </div>
        </div>
    )
}
