import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { AlertTriangle, ArrowLeft, Calendar, Mail, MapPin, MoreVertical, RotateCcw, Trash2, User } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { useToast } from "../../contexts/ToastContext"
import {
    fetchSeekerDetail,
    permanentDeleteSeeker,
    type AdminSeekerDetail,
    updateSeekerSoftDelete,
    updateSeekerSuspension,
} from "../../lib/users"
import { logAdminAction } from "../../lib/audit"
import { useAdminAuth } from "../../contexts/AdminAuthContext"

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
    const { user: admin } = useAdminAuth()
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState<AdminSeekerDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [suspendModalOpen, setSuspendModalOpen] = useState(false)
    const [suspendReason, setSuspendReason] = useState("")
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteReason, setDeleteReason] = useState("")
    const [permanentDeleteModalOpen, setPermanentDeleteModalOpen] = useState(false)
    const [permanentConfirmText, setPermanentConfirmText] = useState("")
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

    const handleSuspendConfirm = async () => {
        if (!id || !data) return

        const currentStatus = data.status
        const shouldSuspend = currentStatus !== "Suspended"
        const reason = shouldSuspend ? suspendReason.trim() || undefined : undefined

        try {
            setSaving(true)
            const result = await updateSeekerSuspension(id, shouldSuspend, reason)

            setData((prev) => prev ? { ...prev, status: result.status as AdminSeekerDetail["status"] } : prev)
            showToast(shouldSuspend ? "Seeker suspended." : "Seeker reactivated.", "success")
            setSuspendModalOpen(false)
            setSuspendReason("")

            // Log the action to the audit trail
            const auditAction = shouldSuspend ? "SUSPEND_SEEKER" : "REACTIVATE_SEEKER"
            if (admin) {
                try {
                    await logAdminAction({
                        adminId: admin.uid,
                        adminEmail: admin.email || "unknown",
                        action: auditAction,
                        module: "Seekers",
                        targetId: id,
                        targetName: data.name || "Unknown Seeker",
                        changes: {
                            previousStatus: currentStatus,
                            newStatus: result.status
                        }
                    })
                } catch (logErr) {
                    console.error("Seeker audit log failed:", logErr)
                }
            }
        } catch (err: any) {
            console.error("Failed to update seeker suspension:", err)
            showToast(err?.response?.data?.error || err?.message || "Failed to update seeker status", "error")
        } finally {
            setSaving(false)
        }
    }

    const handleSoftDeleteConfirm = async () => {
        if (!id || !data) return

        const currentStatus = data.status
        const shouldDelete = currentStatus !== "Deleted"
        const reason = shouldDelete ? deleteReason.trim() || undefined : undefined

        try {
            setSaving(true)
            const result = await updateSeekerSoftDelete(id, shouldDelete, reason)

            setData((prev) => prev ? { ...prev, status: result.status as AdminSeekerDetail["status"] } : prev)
            showToast(shouldDelete ? "Seeker account soft-deleted." : "Seeker account restored.", "success")
            setDeleteModalOpen(false)
            setDeleteReason("")

            if (admin) {
                const auditAction = shouldDelete ? "SOFT_DELETE_SEEKER" : "RESTORE_SEEKER"
                logAdminAction({
                    adminId: admin.uid,
                    adminEmail: admin.email || "unknown",
                    action: auditAction,
                    module: "Seekers",
                    targetId: id,
                    targetName: data.name || "Unknown Seeker",
                    reason,
                    changes: {
                        previousStatus: currentStatus,
                        newStatus: result.status
                    }
                }).catch((logErr) => console.error("Seeker audit log failed:", logErr))
            }
        } catch (err: any) {
            console.error("Failed to update seeker soft delete:", err)
            showToast(err?.response?.data?.error || err?.message || "Failed to update seeker deletion status", "error")
        } finally {
            setSaving(false)
        }
    }

    const handlePermanentDeleteConfirm = async () => {
        if (!id || !data || permanentConfirmText.trim() !== "DELETE") return

        try {
            setSaving(true)
            const result = await permanentDeleteSeeker(id)

            if (admin) {
                logAdminAction({
                    adminId: admin.uid,
                    adminEmail: admin.email || "unknown",
                    action: "PERMANENT_DELETE_SEEKER",
                    module: "Seekers",
                    targetId: id,
                    targetName: data.name || "Unknown Seeker",
                    metadata: {
                        deletedListings: result.deletedListings,
                        deletedRetreats: result.deletedRetreats,
                        authDeleted: result.authDeleted,
                    },
                }).catch((logErr) => console.error("Seeker audit log failed:", logErr))
            }

            setPermanentDeleteModalOpen(false)
            setPermanentConfirmText("")
            showToast(
                result.accountDeleted === false
                    ? "Seeker role permanently removed. Remaining healer role and listings were preserved."
                    : "Seeker account permanently deleted.",
                "success"
            )
            navigate("/users/seekers")
        } catch (err: any) {
            console.error("Failed to permanently delete seeker:", err)
            showToast(err?.response?.data?.error || err?.message || "Failed to permanently delete seeker", "error")
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
                        onClick={() => {
                            setSuspendReason("")
                            setSuspendModalOpen(true)
                        }}
                        disabled={loading || saving || !data || data?.status === "Deleted"}
                    >
                        {saving ? "Saving..." : data?.status === "Suspended" ? "Reactivate" : "Suspend"}
                    </Button>
                    <Button
                        variant={data?.status === "Deleted" ? "outline" : "destructive"}
                        type="button"
                        onClick={() => {
                            setDeleteReason("")
                            setDeleteModalOpen(true)
                        }}
                        disabled={loading || saving || !data}
                    >
                        {data?.status === "Deleted" ? (
                            <>
                                <RotateCcw className="h-4 w-4 mr-1.5" />
                                Restore
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                Delete
                            </>
                        )}
                    </Button>
                    {data?.status === "Deleted" && (
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={() => {
                                setPermanentConfirmText("")
                                setPermanentDeleteModalOpen(true)
                            }}
                            disabled={loading || saving}
                        >
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Delete Permanent
                        </Button>
                    )}
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
                                <Badge className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                                    data.status === "Active" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" 
                                    : data.status === "Suspended"
                                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                    : data.status === "Deleted"
                                    ? "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                }`}>
                                    {data.status}
                                </Badge>
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

            <Dialog open={suspendModalOpen} onOpenChange={(open) => !saving && setSuspendModalOpen(open)}>
                <DialogContent className="sm:max-w-[440px] rounded-[24px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {data?.status === "Suspended" ? "Reactivate Seeker Account" : "Suspend Seeker Account"}
                        </DialogTitle>
                        <DialogDescription className="text-[#A3AED0]">
                            {data?.status === "Suspended"
                                ? `Are you sure you want to reactivate ${data?.name}'s account? They will be able to sign in again.`
                                : `Suspending ${data?.name}'s account will block them from signing in and display an account suspended notice until reactivated.`}
                        </DialogDescription>
                    </DialogHeader>
                    {data?.status !== "Suspended" && (
                        <div className="space-y-2 py-2">
                            <label htmlFor="seeker-suspend-reason" className="text-sm font-medium">
                                Reason (optional)
                            </label>
                            <textarea
                                id="seeker-suspend-reason"
                                value={suspendReason}
                                onChange={(e) => setSuspendReason(e.target.value)}
                                placeholder="Enter a reason for suspending this account..."
                                rows={3}
                                disabled={saving}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setSuspendModalOpen(false)}
                            disabled={saving}
                            className="rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={data?.status === "Suspended" ? "default" : "destructive"}
                            onClick={handleSuspendConfirm}
                            disabled={saving}
                            className="rounded-xl font-bold"
                        >
                            {saving
                                ? "Processing..."
                                : data?.status === "Suspended"
                                ? "Reactivate Account"
                                : "Suspend Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteModalOpen} onOpenChange={(open) => !saving && setDeleteModalOpen(open)}>
                <DialogContent className="sm:max-w-[440px] rounded-[24px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {data?.status === "Deleted" ? "Restore Seeker Account" : "Soft Delete Seeker Account"}
                        </DialogTitle>
                        <DialogDescription className="text-[#A3AED0]">
                            {data?.status === "Deleted"
                                ? `Are you sure you want to restore ${data?.name}'s account? They will be able to sign in again.`
                                : `Soft-deleting ${data?.name}'s account will block them from signing in and display an account deleted notice, while preserving their historical records.`}
                        </DialogDescription>
                    </DialogHeader>
                    {data?.status !== "Deleted" && (
                        <div className="space-y-2 py-2">
                            <label htmlFor="seeker-delete-reason" className="text-sm font-medium">
                                Reason (optional)
                            </label>
                            <textarea
                                id="seeker-delete-reason"
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Enter a reason for deleting this account..."
                                rows={3}
                                disabled={saving}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={saving}
                            className="rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={data?.status === "Deleted" ? "default" : "destructive"}
                            onClick={handleSoftDeleteConfirm}
                            disabled={saving}
                            className="rounded-xl font-bold"
                        >
                            {saving
                                ? "Processing..."
                                : data?.status === "Deleted"
                                ? "Restore Account"
                                : "Delete Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={permanentDeleteModalOpen} onOpenChange={(open) => !saving && setPermanentDeleteModalOpen(open)}>
                <DialogContent className="sm:max-w-[460px] rounded-[24px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Permanently Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-[#A3AED0]">
                            This action cannot be undone. All data for <strong className="text-foreground">{data?.name}</strong> will be deleted permanently.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                            <p className="font-semibold mb-1">Warning: Permanent Data Loss</p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li>The user account, profile, and login credentials will be permanently removed.</li>
                                <li>Any associated listings and retreats will also be permanently deleted.</li>
                                <li>This account cannot be restored once permanently deleted.</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="seeker-permanent-confirm" className="text-sm font-medium block">
                                Type <span className="font-mono font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm permanent deletion:
                            </label>
                            <input
                                id="seeker-permanent-confirm"
                                type="text"
                                value={permanentConfirmText}
                                onChange={(e) => setPermanentConfirmText(e.target.value)}
                                placeholder="DELETE"
                                disabled={saving}
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-red-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setPermanentDeleteModalOpen(false)}
                            disabled={saving}
                            className="rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handlePermanentDeleteConfirm}
                            disabled={saving || permanentConfirmText.trim() !== "DELETE"}
                            className="rounded-xl font-bold"
                        >
                            {saving ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
