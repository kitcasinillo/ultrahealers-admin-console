import { useState, useMemo } from "react"
import { DataTable } from "../../components/DataTable"
import { ChevronDown, RefreshCcw, CircleDollarSign, Filter, Search } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { useBookings } from "../../hooks/useBookings"
import { useDebounce } from "../../hooks/useDebounce"
import { cn } from "../../lib/utils"
import { getSessionColumns } from "./components/sessions/SessionColumns"
import { CancelBookingModal } from "./components/shared/CancelBookingModal"

export function Sessions() {
    const { bookings, loading, error, refetch, cancelBooking: initialCancelBooking } = useBookings()
    
    const [bookingToCancel, setBookingToCancel] = useState<{ id: string, name: string } | null>(null)
    const [isCancelling, setIsCancelling] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedSearchQuery = useDebounce(searchQuery, 300)
    const [paymentFilter, setPaymentFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const columns = useMemo(() => getSessionColumns((id, name) => {
        setBookingToCancel({ id, name })
    }), [])

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return

        setIsCancelling(true)
        const success = await initialCancelBooking(bookingToCancel.id)
        setIsCancelling(false)
        setBookingToCancel(null)

        if (!success) {
            console.error("Cancellation failed")
        }
    }

    const filteredData = useMemo(() => {
        if (!bookings) return []
        return bookings.filter(booking => {
            const matchesSearch = 
                booking.listingTitle?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                booking.healerName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                booking.seekerName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                booking.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase())

            const matchesPayment = paymentFilter === "all" || (booking.paymentStatus || "").toLowerCase() === paymentFilter
            const matchesStatus = statusFilter === "all" || (booking.status && (booking.status as any)[statusFilter])
            
            return matchesSearch && matchesPayment && matchesStatus
        })
    }, [bookings, debouncedSearchQuery, paymentFilter, statusFilter])

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
                <div className="relative w-full md:w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
                    <Input
                        placeholder="Search by ID, Healer, Seeker..."
                        className="pl-10 h-10 rounded-xl border-none bg-white dark:bg-[#111C44] text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-[#4318FF] shadow-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 px-4 rounded-xl text-[13px] font-bold text-[#1b254b] dark:text-white hover:bg-white dark:hover:bg-white/5 flex items-center gap-2 transition-all">
                            <CircleDollarSign className="h-4 w-4 text-[#4318FF]" />
                            Payment: {paymentFilter.charAt(0).toUpperCase() + paymentFilter.slice(1)}
                            <ChevronDown className="h-4 w-4 text-[#A3AED0]" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 p-2 rounded-2xl border-none shadow-2xl dark:bg-[#111C44] bg-white">
                        <DropdownMenuItem onClick={() => setPaymentFilter("all")} className="rounded-xl cursor-pointer">All Payments</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentFilter("succeeded")} className="rounded-xl cursor-pointer text-green-600">Succeeded</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentFilter("pending")} className="rounded-xl cursor-pointer text-orange-600">Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentFilter("cancelled")} className="rounded-xl cursor-pointer text-red-600">Cancelled</DropdownMenuItem>
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
                    <DropdownMenuContent className="w-64 p-2 rounded-2xl border-none shadow-2xl dark:bg-[#111C44] bg-white">
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
                            <RefreshCcw className="h-10 w-10 text-red-500" />
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

            <CancelBookingModal 
                isOpen={!!bookingToCancel} 
                onClose={() => setBookingToCancel(null)}
                onConfirm={handleConfirmCancel}
                bookingName={bookingToCancel?.name}
                isCancelling={isCancelling}
                type="session"
            />
        </div>
    )
}
