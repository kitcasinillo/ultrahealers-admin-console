import { useMemo, useState } from "react"
import { DataTable } from "../../components/DataTable"
import { RefreshCcw, Search, ChevronDown, CircleDollarSign } from "lucide-react"
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
import { getRetreatColumns } from "./components/RetreatColumns"
import { CancelBookingModal } from "./components/CancelBookingModal"

export function RetreatBookings() {
    const { bookings, loading, refetch, cancelBooking } = useBookings(true)
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedSearchQuery = useDebounce(searchQuery, 300)
    const [statusFilter, setStatusFilter] = useState("all")
    
    const [bookingToCancel, setBookingToCancel] = useState<{ id: string, name: string } | null>(null)
    const [isCancelling, setIsCancelling] = useState(false)

    const columns = useMemo(() => getRetreatColumns((id, name) => {
        setBookingToCancel({ id, name })
    }), [])

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return
        
        setIsCancelling(true)
        const success = await cancelBooking(bookingToCancel.id)
        setIsCancelling(false)
        setBookingToCancel(null)
        
        if (!success) {
            console.error("Cancellation failed")
        }
    }

    const filteredData = useMemo(() => {
        if (!bookings) return []
        return bookings.filter(b => {
            const matchesSearch = 
                b.retreatTitle?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                b.healerName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                b.seekerName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            
            const matchesStatus = statusFilter === "all" || b.paymentStatus?.toLowerCase() === statusFilter
            
            return matchesSearch && matchesStatus
        })
    }, [bookings, debouncedSearchQuery, statusFilter])

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[34px] font-bold tracking-tight text-[#1b254b] dark:text-white">Retreat Bookings</h1>
                    <p className="text-[15px] font-medium text-[#A3AED0] mt-1">Manage enrollments and payments for multi-day retreats.</p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={refetch}
                    className="h-[46px] w-[46px] rounded-xl border-none bg-white shadow-sm dark:bg-[#111C44]"
                    disabled={loading}
                >
                    <RefreshCcw className={cn("h-4 w-4 text-[#A3AED0]", loading && "animate-spin")} />
                </Button>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-[#111C44]/50 backdrop-blur-md p-2 rounded-[20px] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
                    <Input 
                        placeholder="Search retreats, healers, seekers..." 
                        className="pl-10 h-10 rounded-xl border-none bg-white dark:bg-[#111C44] text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-[#4318FF] shadow-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10 hidden md:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 px-4 rounded-xl text-[13px] font-bold text-[#1b254b] dark:text-white hover:bg-white dark:hover:bg-white/5 flex items-center gap-2 transition-all">
                            <CircleDollarSign className="h-4 w-4 text-[#4318FF]" />
                            Payment: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                            <ChevronDown className="h-4 w-4 text-[#A3AED0]" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 p-2 rounded-2xl border-none shadow-2xl dark:bg-[#111C44] bg-white">
                        <DropdownMenuItem onClick={() => setStatusFilter("all")} className="rounded-xl cursor-pointer">All Payments</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("succeeded")} className="rounded-xl cursor-pointer text-green-600">Succeeded</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="rounded-xl cursor-pointer text-orange-600">Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("cancelled")} className="rounded-xl cursor-pointer text-red-600">Cancelled</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="ml-auto px-4 text-[12px] font-bold text-[#A3AED0]">
                    {filteredData.length} Enrollments Found
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-6 shadow-sm">
                <DataTable 
                    columns={columns} 
                    data={filteredData} 
                    isLoading={loading}
                />
            </div>

            <CancelBookingModal 
                isOpen={!!bookingToCancel} 
                onClose={() => setBookingToCancel(null)}
                onConfirm={handleConfirmCancel}
                bookingName={bookingToCancel?.name}
                isCancelling={isCancelling}
                type="enrollment"
            />
        </div>
    )
}
