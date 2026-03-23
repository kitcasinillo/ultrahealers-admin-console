import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, ShieldAlert, Activity, Mail, RotateCcw, AlertTriangle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { formatDateTime } from "../../lib/bookings"
import type { Booking } from "../../lib/bookings"
import { cn } from "../../lib/utils"
import { rtdb } from "../../lib/firebase"
import { ref, onValue, off } from "firebase/database"
import { FinancialBreakdown } from "./components/sessions/FinancialBreakdown"
import { ChatTranscript } from "./components/sessions/ChatTranscript"

interface ChatMessage {
    text: string
    senderId: string
    senderName: string
    timestamp: number
    type: string
}

export function SessionDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])

    useEffect(() => {
        if (!id) return

        const fetchBooking = async () => {
            try {
                setLoading(true)
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`)
                const result = await response.json()
                if (result.success) {
                    setBooking(result.data)
                } else {
                    setError(result.message || "Failed to load booking details")
                }
            } catch (err: any) {
                setError(err.message || "Connection error")
            } finally {
                setLoading(false)
            }
        }
        fetchBooking()

        const chatRef = ref(rtdb, `chats/${id}/messages`)
        onValue(chatRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                const messageList = Object.values(data) as ChatMessage[]
                setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp))
            } else {
                setMessages([])
            }
        })

        return () => off(chatRef)
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
                <h2 className="text-2xl font-bold text-[#1b254b] dark:text-white">Booking Not Found</h2>
                <p className="text-[#A3AED0] mt-2 mb-6">{error || "The requested booking does not exist."}</p>
                <Button onClick={() => navigate('/bookings/sessions')} className="bg-[#4318FF] hover:bg-[#3311db] rounded-xl px-8">
                    Return to Bookings
                </Button>
            </div>
        )
    }

    // Financial calculations
    const amount = Number(booking.amount || 0)
    const seekerFee = amount * 0.05
    const healerFee = amount * 0.10
    const platformRevenue = seekerFee + healerFee
    const stripeFee = (amount * 0.029) + 0.30
    const healerPayout = amount - platformRevenue - stripeFee
    const paymentStatus = (booking.paymentStatus || "pending").toLowerCase()

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/bookings/sessions')}
                    className="h-10 w-10 p-0 rounded-full bg-white dark:bg-[#111C44] shadow-sm hover:bg-gray-50 flex items-center justify-center"
                >
                    <ArrowLeft className="h-5 w-5 text-[#1b254b] dark:text-white" />
                </Button>
                <div>
                    <h1 className="text-[28px] font-bold tracking-tight text-[#1b254b] dark:text-white flex items-center gap-3">
                        Session Details
                        <Badge className="bg-[#4318FF]/10 text-[#4318FF] hover:bg-[#4318FF]/20 border-none px-3 font-mono">
                            #{booking.id.slice(-8).toUpperCase()}
                        </Badge>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Main Info Card */}
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Badge
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold capitalize border-none",
                                    paymentStatus === "succeeded" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                                    paymentStatus === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                                    "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                                )}
                            >
                                {paymentStatus}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-1 mb-8">
                            <span className="text-[#A3AED0] font-bold text-xs uppercase tracking-wider">{booking.modality || "Healing Session"}</span>
                            <h2 className="text-[24px] font-bold text-[#1b254b] dark:text-white leading-tight">
                                {booking.listingTitle}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex gap-4 items-start">
                                <div className="h-12 w-12 rounded-full bg-[#4318FF]/10 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-5 w-5 text-[#4318FF]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[#A3AED0]">Scheduled For</span>
                                    <span className="text-base font-bold text-[#1b254b] dark:text-white mt-0.5">{formatDateTime(booking.sessionDate)}</span>
                                    <span className="text-sm font-medium text-[#A3AED0]">{booking.sessionTime || "TBD"}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[#A3AED0]">Booking Created</span>
                                    <span className="text-base font-bold text-[#1b254b] dark:text-white mt-0.5">{formatDateTime(booking.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/10 grid grid-cols-2 gap-8">
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">{booking.healerName.charAt(0)}</div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider mb-1">Healer</span>
                                    <span className="text-sm font-bold text-[#1b254b] dark:text-white">{booking.healerName}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">{booking.seekerName.charAt(0)}</div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider mb-1">Seeker</span>
                                    <span className="text-sm font-bold text-[#1b254b] dark:text-white">{booking.seekerName}</span>
                                    <span className="text-xs font-medium text-[#A3AED0] truncate max-w-[150px]">{booking.seekerEmail}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ChatTranscript messages={messages} healerName={booking.healerName} />
                </div>

                <div className="flex flex-col gap-6">
                    <FinancialBreakdown 
                        amount={amount}
                        currency={booking.currency}
                        platformRevenue={platformRevenue}
                        seekerFee={seekerFee}
                        healerFee={healerFee}
                        stripeFee={stripeFee}
                        healerPayout={healerPayout}
                    />

                    {/* Lifecycle Status Card */}
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Lifecycle Status</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {[
                                { key: 'invite-email-to-seeker', label: 'Seeker Invitation Sent' },
                                { key: 'invite-email-to-healer', label: 'Healer Notification Sent' },
                                { key: 'booking-confirmed-by-healer', label: 'Confirmed by Healer' },
                                { key: 'booking-marked-as-complete-by-healer', label: 'Completed by Healer' }
                            ].map((flag) => {
                                const isActive = booking.status?.[flag.key as keyof typeof booking.status];
                                return (
                                    <div key={flag.key} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                        <span className="text-sm font-medium text-[#1b254b] dark:text-white truncate pr-4">{flag.label}</span>
                                        <button className={cn("h-6 w-10 rounded-full flex items-center p-1 transition-colors", isActive ? "bg-green-500" : "bg-gray-200 dark:bg-zinc-700")}>
                                            <div className={cn("h-4 w-4 bg-white rounded-full shadow-sm transform transition-transform", isActive ? "translate-x-4" : "translate-x-0")} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {(booking.hasDispute || booking.disputeId) && (
                        <div className="bg-red-50 dark:bg-red-500/10 rounded-[24px] p-6 border border-red-100 dark:border-red-500/20 flex flex-col items-center text-center">
                            <AlertTriangle className="h-8 w-8 text-red-500 mb-3" />
                            <h4 className="text-md font-bold text-red-700 dark:text-red-400 mb-1">Active Dispute Found</h4>
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm font-bold" onClick={() => navigate(`/disputes/${booking.disputeId || ''}`)}>View Resolution Center</Button>
                        </div>
                    )}

                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Admin Controls</h3>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11 border-gray-200 text-[#1b254b] dark:text-white hover:bg-gray-50 font-bold"><Mail className="h-4 w-4 text-[#4318FF]" /> Resend Confirmation</Button>
                            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11 border-gray-200 text-[#1b254b] dark:text-white hover:bg-gray-50 font-bold"><RotateCcw className="h-4 w-4 text-orange-500" /> Force Status Sync</Button>
                            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold dark:border-red-500/20 dark:hover:bg-red-500/10"><ShieldAlert className="h-4 w-4" /> Flag for Review</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
