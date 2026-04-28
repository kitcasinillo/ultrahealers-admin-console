import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Calendar, Mail, MapPin, MoreVertical, User } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../contexts/ToastContext"
import { fetchSeekerDetail, type AdminSeekerDetail, updateSeekerSuspension } from "../../lib/users"

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
}).format(amount || 0)

const formatDate = (value: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

export function SeekerDetail() {
    const { id } = useParams()
    const [data, setData] = useState<AdminSeekerDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const { showToast } = useToast()

    useEffect(() => {
        if (!id) return
        let mounted = true

        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                const result = await fetchSeekerDetail(id)
                if (!mounted) return
                setData(result)
            } catch (err: any) {
                console.error("Failed to load seeker detail:", err)
                if (!mounted) return
                setError(err?.response?.data?.error || err?.message || "Failed to load seeker detail")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => { mounted = false }
    }, [id])

    const handleSuspendToggle = async () => {
        if (!id || !data) return

        const shouldSuspend = data.status !== "Suspended"
        const reason = shouldSuspend ? window.prompt("Optional suspension reason:", "") || undefined : undefined

        try {
            setSaving(true)
            const result = await updateSeekerSuspension(id, shouldSuspend, reason)
            setData((prev) => prev ? { ...prev, status: result.status as AdminSeekerDetail["status"] } : prev)
            showToast(shouldSuspend ? "Seeker suspended." : "Seeker reactivated.", "success")
        } catch (err: any) {
            console.error("Failed to update seeker suspension:", err)
            showToast(err?.response?.data?.error || err?.message || "Failed to update seeker status", "error")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/users/seekers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">Seeker Details</h2>
                    <p className="text-muted-foreground text-sm">ID: {id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => data?.email && (window.location.href = `mailto:${data.email}`)}
                        disabled={!data?.email}
                    >
                        Message
                    </Button>
                    <Button
                        variant={data?.status === "Suspended" ? "outline" : "destructive"}
                        type="button"
                        onClick={handleSuspendToggle}
                        disabled={loading || saving || !data}
                    >
                        {saving ? "Saving..." : data?.status === "Suspended" ? "Reactivate" : "Suspend"}
                    </Button>
                    <Button variant="ghost" size="icon" disabled>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading && <div className="rounded-2xl bg-white dark:bg-[#111C44] p-6 text-sm text-[#A3AED0]">Loading seeker details...</div>}
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</div>}

            {!loading && !error && data && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="col-span-full lg:col-span-1 space-y-6">
                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6 text-center">
                            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                                {data.avatarUrl ? (
                                    <img src={data.avatarUrl} alt={data.name} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-10 w-10 text-muted-foreground" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold">{data.name}</h3>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Badge variant={data.status === "Active" ? "outline" : data.status === "Pending" ? "secondary" : "destructive"}>{data.status}</Badge>
                            </div>

                            <div className="mt-6 space-y-3 text-sm text-left border-t pt-6">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{data.email || "—"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{data.location || "—"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Joined {formatDate(data.joinedDate)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4">Account Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Total Spent</span>
                                    <span className="font-medium">{formatCurrency(data.totalSpent)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Sessions Booked</span>
                                    <span className="font-medium">{data.sessionsBooked}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Retreats Attended</span>
                                    <span className="font-medium">{data.retreatsAttended}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full lg:col-span-2 space-y-6">
                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-lg">Profile Notes</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                {data.bio || "No seeker bio is currently stored in the backend profile."}
                            </p>
                        </div>

                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-lg">Booking History</h3>
                            <div className="space-y-4">
                                {data.recentBookings.length > 0 ? data.recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex justify-between border-b pb-4 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{booking.title}</p>
                                            <p className="text-xs text-muted-foreground">Healer: {booking.healerName || booking.healerId || "Unknown"}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium block">{formatCurrency(booking.amount)}</span>
                                            <span className="text-xs text-muted-foreground">{formatDate(booking.sessionDate || booking.createdAt)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground">No booking history found for this seeker.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
