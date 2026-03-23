import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, CircleDollarSign, ShieldAlert, Activity, Tag, Mail, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { formatCurrency, formatDateTime } from "../../lib/bookings"
import { cn } from "../../lib/utils"
import { ParticipantCard } from "./components/retreats/ParticipantCard"

export function RetreatDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [booking, setBooking] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRetreatBooking = async () => {
            try {
                setLoading(true)
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/retreat-bookings/${id}`)
                const result = await response.json()
                if (result.success) {
                    setBooking(result.data)
                } else {
                    setError(result.error || "Failed to load retreat booking details")
                }
            } catch (err: any) {
                setError(err.message || "Connection error")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchRetreatBooking()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#4318FF]" />
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-[#1b254b] dark:text-white">Enrollment Not Found</h2>
                <Button onClick={() => navigate('/bookings/retreats')} className="bg-[#4318FF] hover:bg-[#3311db] rounded-xl px-8 mt-6">Return to Enrollments</Button>
            </div>
        )
    }

    const paymentStatus = (booking.paymentStatus || "pending").toLowerCase()
    const amount = Number(booking.amount || 0)
    const platformFee = amount * 0.15
    const netPayout = amount - platformFee

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/bookings/retreats')} className="h-10 w-10 p-0 rounded-full bg-white dark:bg-[#111C44] shadow-sm flex items-center justify-center">
                    <ArrowLeft className="h-5 w-5 text-[#1b254b] dark:text-white" />
                </Button>
                <div>
                    <h1 className="text-[28px] font-bold tracking-tight text-[#1b254b] dark:text-white flex items-center gap-3">
                        Retreat Enrollment
                        <Badge className="bg-[#4318FF]/10 text-[#4318FF] hover:bg-[#4318FF]/20 border-none px-3 font-mono">#{booking.id.slice(-8).toUpperCase()}</Badge>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Badge className={cn("px-4 py-1.5 text-xs font-bold capitalize border-none", 
                                paymentStatus === "succeeded" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                                paymentStatus === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                                "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400")}>
                                {paymentStatus}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-1 mb-8">
                            <div className="flex items-center gap-2 text-[#4318FF] font-bold text-xs uppercase tracking-wider"><Tag className="h-3 w-3" /> Retreat Enrollment</div>
                            <h2 className="text-[24px] font-bold text-[#1b254b] dark:text-white leading-tight mt-1">{booking.retreatTitle}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex gap-4 items-start">
                                <div className="h-12 w-12 rounded-full bg-[#4318FF]/10 flex items-center justify-center flex-shrink-0"><Calendar className="h-5 w-5 text-[#4318FF]" /></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[#A3AED0]">Enrollment Date</span>
                                    <span className="text-base font-bold text-[#1b254b] dark:text-white mt-0.5">{formatDateTime(booking.bookingDate)}</span>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0"><Activity className="h-5 w-5 text-blue-500" /></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[#A3AED0]">Booking Status</span>
                                    <span className="text-base font-bold text-[#1b254b] dark:text-white mt-0.5 capitalize">{booking.status || 'Confirmed'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ParticipantCard name={booking.seekerName} email={booking.seekerEmail} role="Participant" userId={booking.seekerId} colorClass="green" />
                        <ParticipantCard name={booking.healerName} role="Host" colorClass="indigo" />
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center"><CircleDollarSign className="h-5 w-5 text-green-500" /></div>
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Financial Summary</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center text-sm font-bold text-[#1b254b] dark:text-white pb-3 border-b border-gray-100 dark:border-white/10"><span>Total Paid</span><span className="text-lg">{formatCurrency(amount, booking.currency)}</span></div>
                            <div className="flex justify-between items-center text-sm font-medium text-[#A3AED0]"><span>Platform Fee (15%)</span><span>-{formatCurrency(platformFee, booking.currency)}</span></div>
                            <div className="flex justify-between items-center font-bold text-[#1b254b] dark:text-white pt-4 border-t border-gray-100 dark:border-white/10"><span>Host Payout</span><span className="text-xl text-green-500">{formatCurrency(netPayout, booking.currency)}</span></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Enrollment Management</h3>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11 border-gray-200 text-[#1b254b] dark:text-white hover:bg-gray-50 font-bold"><Mail className="h-4 w-4 text-[#4318FF]" /> Resend Tickets</Button>
                            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold dark:border-red-500/20 dark:hover:bg-red-500/10"><AlertCircle className="h-4 w-4" /> Issue Full Refund</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
