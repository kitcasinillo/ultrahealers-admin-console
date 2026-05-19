import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Calendar, Mail, MapPin, MoreVertical, User } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../contexts/ToastContext"
import { fetchHealerDetail, type AdminHealerDetail, updateHealerSuspension } from "../../lib/users"
import { logAdminAction } from "../../lib/audit"
import { useAdminAuth } from "../../contexts/AdminAuthContext"
import { Pagination } from "../../components/common/Pagination"

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
}).format(amount || 0)

const formatDate = (value: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}


export function HealerDetail() {
    const { user: admin } = useAdminAuth()
    const { id } = useParams()
    const [data, setData] = useState<AdminHealerDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const { showToast } = useToast()
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 5

    useEffect(() => {
        if (!id) return
        let mounted = true

        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                const result = await fetchHealerDetail(id)
                if (!mounted) return
                setData(result)
            } catch (err: any) {
                console.error("Failed to load healer detail:", err)
                if (!mounted) return
                setError(err?.response?.data?.error || err?.message || "Failed to load healer detail")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => { mounted = false }
    }, [id])

    const handleSuspendToggle = async () => {
        if (!id || !data) return

        const currentStatus = data.status
        const shouldSuspend = currentStatus !== "Suspended"
        const reason = shouldSuspend ? window.prompt("Optional suspension reason:", "") || undefined : undefined

        try {
            setSaving(true)
            const result = await updateHealerSuspension(id, shouldSuspend, reason)

            // Update local state first
            setData((prev) => prev ? { ...prev, status: result.status as AdminHealerDetail["status"] } : prev)
            showToast(shouldSuspend ? "Healer suspended." : "Healer reactivated.", "success")

            // Log the action to the audit trail (fire-and-forget, don't block UI)
            if (admin) {
                const auditAction = shouldSuspend ? "SUSPEND_HEALER" : "REACTIVATE_HEALER"
                logAdminAction({
                    adminId: admin.uid,
                    adminEmail: admin.email || "unknown",
                    action: auditAction,
                    module: "Healers",
                    targetId: id || 'unknown',
                    targetName: String(data.name || 'Unknown'),
                    reason,
                    changes: {
                        previousStatus: currentStatus,
                        newStatus: result.status
                    }
                }).catch((logErr) => console.error("Audit log failed:", logErr))
            }
        } catch (err: any) {
            console.error("Failed to update healer suspension:", err)
            showToast(err?.response?.data?.error || err?.message || "Failed to update healer status", "error")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/users/healers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">Healer Details</h2>
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

            {loading && <div className="rounded-2xl bg-white dark:bg-[#111C44] p-6 text-sm text-[#A3AED0]">Loading healer details...</div>}
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</div>}

            {!loading && !error && data && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="col-span-full lg:col-span-1 space-y-6">
                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6 text-center">
                            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                                {data.avatarUrl ? (
                                    <img src={data.avatarUrl} alt={String(data.name || 'avatar')} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-10 w-10 text-muted-foreground" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold">{String(data.name || 'Unknown')}</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                Rating {data.rating ? data.rating.toFixed(1) : "—"} ({data.reviewCount || 0} reviews)
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Badge className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                                    data.status === "Active" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" 
                                    : data.status === "Suspended"
                                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                }`}>
                                    {String(data.status || 'Active')}
                                </Badge>
                                <Badge variant={data.subscription === "Premium" ? "default" : "secondary"}>{String(data.subscription || 'Free')}{data.subscription === "Premium" ? " 🏅" : ""}</Badge>
                            </div>

                            <div className="mt-6 space-y-3 text-sm text-left border-t pt-6">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{String(data.email || "—")}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{String(data.location || "—")}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Joined {formatDate(data.joinedDate)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4">Financial Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Total Earned</span>
                                    <span className="font-medium">{formatCurrency(data.totalEarned)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Pending Payout</span>
                                    <span className="font-medium">{formatCurrency(data.pendingPayout)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Stripe Status</span>
                                    <span className="font-medium capitalize">{String(data.stripeStatus || "not_connected")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full lg:col-span-2 space-y-6">
                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-lg">Bio & Modalities</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                                {String(data.bio || "No healer bio is currently stored in the backend profile.")}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Array.isArray(data.modalities) && data.modalities.length > 0 ? data.modalities.map((modality) => (
                                    <Badge key={String(modality)} variant="secondary">{String(modality)}</Badge>
                                )) : <span className="text-sm text-muted-foreground">No modalities found.</span>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Languages: {Array.isArray(data.languages) && data.languages.length > 0 ? data.languages.join(", ") : "—"}
                            </div>
                        </div>

                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-lg">Recent Booking Activity</h3>
                            <div className="space-y-4">
                                {Array.isArray(data.recentBookings) && data.recentBookings.length > 0 ? (
                                    <>
                                        {data.recentBookings
                                            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                            .map((booking) => (
                                                <div key={booking.id} className="flex justify-between border-b pb-4 border-gray-50 dark:border-white/5 last:border-0 last:pb-0 transition-all hover:bg-gray-50/50 dark:hover:bg-white/[0.02] p-2 rounded-lg">
                                                    <div>
                                                        <p className="text-sm font-bold text-[#1b254b] dark:text-white">{String(booking.title || 'Booking')}</p>
                                                        <p className="text-[10px] font-medium text-[#A3AED0]">Seeker: {String(booking.seekerName || booking.seekerId || "Unknown")}</p>
                                                        <p className="text-[10px] font-medium text-[#A3AED0]">
                                                            Status: {typeof booking.status === 'string' ? booking.status : 'unknown'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-black text-[#4318FF] dark:text-white block">{formatCurrency(booking.amount)}</span>
                                                        <span className="text-[10px] font-medium text-[#A3AED0]">{formatDate(booking.sessionDate || booking.createdAt)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        
                                        <div className="mt-2 pt-2 border-t border-gray-50 dark:border-white/5">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalItems={data.recentBookings.length}
                                                itemsPerPage={ITEMS_PER_PAGE}
                                                onPageChange={setCurrentPage}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 text-center bg-gray-50/30 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-100 dark:border-white/5">
                                        <p className="text-sm font-medium text-[#A3AED0]">No recent bookings found for this healer.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
