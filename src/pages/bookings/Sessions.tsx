import { useState, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { MoreHorizontal, Eye, Mail, ChevronDown, Activity, RefreshCcw, Trash2, Calendar, Tag, CircleDollarSign, Filter } from "lucide-react"
import { Button } from "../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { useBookings } from "../../hooks/useBookings"
import type { Booking } from "../../lib/bookings"
import { formatDateTime, formatCurrency } from "../../lib/bookings"
import { cn } from "../../lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog"

const StatusIcon = ({ active, title }: { active: boolean, title: string }) => (
    <div
        className={cn(
            "p-1.5 rounded-full transition-all flex items-center justify-center",
            active ? "bg-green-50 dark:bg-green-500/10 text-green-500" : "bg-gray-50 dark:bg-white/5 text-gray-300 opacity-40"
        )}
        title={title}
    >
        <Activity className="h-3.5 w-3.5" />
    </div>
)

// Define Columns Generator to pass onCancel handler
const getColumns = (onCancel: (id: string, name: string) => void): ColumnDef<Booking>[] => [
    {
        accessorKey: "id",
        header: "Booking ID",
        cell: ({ row }) => (
            <span className="font-bold text-[#1b254b] dark:text-white text-[13px] font-mono">
                #{row.original.id.slice(-6).toUpperCase()}
            </span>
        ),
    },
    {
        accessorKey: "listingTitle",
        header: "Listing",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-[#1b254b] dark:text-white text-[14px] leading-tight mb-1">
                    {row.original.listingTitle}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A3AED0]">
                    <Tag className="h-3 w-3" />
                    {row.original.modality || "Healing"}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "healerName",
        header: "Healer",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-[11px]">
                    {row.original.healerName.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-medium text-[#1b254b] dark:text-white text-[13px]">
                    {row.original.healerName}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "seekerName",
        header: "Seeker",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-[#1b254b] dark:text-white text-[13px]">
                    {row.original.seekerName}
                </span>
                <span className="text-[11px] text-[#A3AED0]">{row.original.seekerEmail}</span>
            </div>
        ),
    },
    {
        accessorKey: "sessionDate",
        header: "Session Date",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[13px] text-[#1b254b] dark:text-white font-medium">
                <Calendar className="h-3.5 w-3.5 text-[#A3AED0]" />
                <div className="flex flex-col">
                    <span>{row.original.sessionDate}</span>
                    <span className="text-[11px] text-[#A3AED0] font-normal">{row.original.sessionTime}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
            <span className="font-bold text-[#1b254b] dark:text-white text-[14px]">
                {formatCurrency(row.original.amount, row.original.currency)}
            </span>
        ),
    },
    {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-[10px] font-bold border-gray-200 text-[#A3AED0]">
                {row.original.currency}
            </Badge>
        ),
    },
    {
        id: "commission",
        header: "Commission",
        cell: ({ row }) => {
            const platformFee = row.original.amount * 0.15
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-green-600 dark:text-green-400 text-[13px]">
                        +{formatCurrency(platformFee, row.original.currency)}
                    </span>
                    <span className="text-[10px] text-[#A3AED0] font-medium">15% Fee</span>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status Flags",
        cell: ({ row }) => {
            const status = row.original.status || {}
            return (
                <div className="flex items-center gap-1.5">
                    <StatusIcon active={!!status['invite-email-to-seeker']} title="Seeker Email Sent" />
                    <StatusIcon active={!!status['invite-email-to-healer']} title="Healer Email Sent" />
                    <StatusIcon active={!!status['booking-confirmed-by-healer']} title="Confirmed" />
                    <StatusIcon active={!!status['booking-marked-as-complete-by-healer']} title="Completed" />
                </div>
            )
        },
    },
    {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
            const status = (row.original.paymentStatus || "pending").toLowerCase()
            return (
                <Badge
                    className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold capitalize shadow-sm border-none transition-colors",
                        status === "succeeded"
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-400"
                    )}
                >
                    <div className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", status === "succeeded" ? "bg-green-600" : "bg-orange-600")} />
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
            <span className="text-[12px] text-[#A3AED0] font-medium">
                {formatDateTime(row.original.createdAt).split(',')[0]}
            </span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-[#A3AED0]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-2xl border-none shadow-2xl dark:bg-[#111C44] backdrop-blur-md bg-white/90">
                    <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">Management</DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium text-[#1b254b] dark:text-white rounded-xl cursor-pointer focus:bg-gray-50 dark:focus:bg-white/5">
                        <Eye className="h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium text-[#1b254b] dark:text-white rounded-xl cursor-pointer focus:bg-gray-50 dark:focus:bg-white/5">
                        <Mail className="h-4 w-4" /> Resend Emails
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-gray-100/50 dark:bg-white/5" />
                    <DropdownMenuItem 
                        onClick={() => onCancel(row.original.id, row.original.listingTitle)}
                        className="flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium text-red-500 rounded-xl cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10"
                    >
                        <Trash2 className="h-4 w-4" /> Cancel Booking
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
]

export function Sessions() {
    // 1. Senior Approach: Destructure with alias to prevent naming collisions
    const { bookings, loading, error, refetch, cancelBooking: initialCancelBooking } = useBookings()
    
    // 2. Local state for filters and modal
    const [bookingToCancel, setBookingToCancel] = useState<{ id: string, name: string } | null>(null)
    const [isCancelling, setIsCancelling] = useState(false)
    const [paymentFilter, setPaymentFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    // 3. Memoize columns to prevent re-building on every render
    const columns = useMemo(() => getColumns((id, name) => {
        setBookingToCancel({ id, name })
    }), [])

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return
        
        setIsCancelling(true)
        const success = await initialCancelBooking(bookingToCancel.id)
        setIsCancelling(false)
        setBookingToCancel(null)
        
        if (!success) {
            // Error handling (simple console for now)
            console.error("Cancellation failed")
        }
    }

    const filteredData = useMemo(() => {
        if (!bookings) return []
        return bookings.filter(booking => {
            const matchesPayment = paymentFilter === "all" || (booking.paymentStatus || "").toLowerCase() === paymentFilter
            const matchesStatus = statusFilter === "all" || (booking.status && (booking.status as any)[statusFilter])
            return matchesPayment && matchesStatus
        })
    }, [bookings, paymentFilter, statusFilter])

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[34px] font-bold tracking-tight text-[#1b254b] dark:text-white">Session Bookings</h1>
                    <p className="text-[15px] font-medium text-[#A3AED0] mt-1">
                        Monitor and manage the lifecycle of all platform session bookings.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={refetch}
                        className="h-[46px] w-[46px] rounded-xl border-none bg-white shadow-sm dark:bg-[#111C44] transition-all hover:scale-105 active:scale-95"
                        title="Refresh Data"
                        disabled={loading}
                    >
                        <RefreshCcw className={cn("h-4 w-4 text-[#A3AED0]", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-[#111C44]/50 backdrop-blur-md p-2 rounded-[20px] border border-gray-100 dark:border-white/5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 px-4 rounded-xl text-[13px] font-bold text-[#1b254b] dark:text-white hover:bg-white dark:hover:bg-white/5 flex items-center gap-2 transition-all">
                            <CircleDollarSign className="h-4 w-4 text-[#4318FF]" />
                            Payment: {paymentFilter.charAt(0).toUpperCase() + paymentFilter.slice(1)}
                            <ChevronDown className="h-4 w-4 text-[#A3AED0]" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 p-2 rounded-2xl border-none shadow-2xl dark:bg-[#111C44]">
                        <DropdownMenuItem onClick={() => setPaymentFilter("all")} className="rounded-xl cursor-pointer">All Payments</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentFilter("succeeded")} className="rounded-xl cursor-pointer text-green-600">Succeeded</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentFilter("pending")} className="rounded-xl cursor-pointer text-orange-600">Pending</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 px-4 rounded-xl text-[13px] font-bold text-[#1b254b] dark:text-white hover:bg-white dark:hover:bg-white/5 flex items-center gap-2 transition-all">
                            <Filter className="h-4 w-4 text-[#4318FF]" />
                            Status: {statusFilter === "all" ? "All Workflow" : statusFilter.split('-').pop()}
                            <ChevronDown className="h-4 w-4 text-[#A3AED0]" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2 rounded-2xl border-none shadow-2xl dark:bg-[#111C44]">
                        <DropdownMenuItem onClick={() => setStatusFilter("all")} className="rounded-xl cursor-pointer">All Statuses</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("invite-email-to-seeker")} className="rounded-xl cursor-pointer">Seeker Emailed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("invite-email-to-healer")} className="rounded-xl cursor-pointer">Healer Emailed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("booking-confirmed-by-healer")} className="rounded-xl cursor-pointer font-bold">Healer Confirmed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("booking-marked-as-complete-by-healer")} className="rounded-xl cursor-pointer">Marked Complete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="ml-auto px-4 text-[12px] font-bold text-[#A3AED0] hidden lg:block">
                    Total: {filteredData.length} records found
                </div>
            </div>

            {/* Data Table Container */}
            <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-6 shadow-[0px_18px_40px_0px_rgba(112,144,176,0.08)] dark:shadow-none border-none transition-all">
                {error ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <Activity className="h-10 w-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">Connection Error</h3>
                        <p className="text-sm text-[#A3AED0] mt-2 max-w-sm">
                            We couldn't connect to the backend server. Please make sure it is running on port 5001.
                        </p>
                        <Button onClick={refetch} className="mt-8 rounded-2xl bg-[#4318FF] hover:bg-[#3311db] px-8 h-12 font-bold shadow-lg shadow-blue-200">
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-700">
                        <DataTable 
                            columns={columns} 
                            data={filteredData} 
                            isLoading={loading}
                        />
                    </div>
                )}
            </div>

            {/* Senior Approach: Confirmation Modal */}
            <AlertDialog open={!!bookingToCancel} onOpenChange={(open: boolean) => !open && setBookingToCancel(null)}>
                <AlertDialogContent className="rounded-[30px] p-8 border-none shadow-3xl bg-white dark:bg-[#111C44]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold text-[#1b254b] dark:text-white">
                            Cancel this session?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[15px] font-medium text-[#A3AED0] pt-2 leading-relaxed">
                            You are about to cancel the booking for <span className="text-[#1b254b] dark:text-white font-bold">"{bookingToCancel?.name}"</span>. 
                            This will permanently remove the record from your staging environment.
                            <br /><br />
                            <span className="text-red-500 font-bold">Warning: This action cannot be reversed.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
                        <AlertDialogCancel className="rounded-2xl border-none bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 h-12 px-6 font-bold text-[#1b254b] dark:text-white transition-all">
                            No, keep it
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleConfirmCancel}
                            disabled={isCancelling}
                            className="rounded-2xl bg-red-500 hover:bg-red-600 h-12 px-8 font-bold text-white shadow-xl shadow-red-100 dark:shadow-none transition-all"
                        >
                            {isCancelling ? "Processing..." : "Yes, Cancel Booking"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
