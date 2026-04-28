import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, Clock, DollarSign, MapPin, Settings, Tag, User } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../contexts/ToastContext"
import { fetchListingDetail, type AdminListingDetail, updateListingStatus } from "../../lib/listings"

const formatCurrency = (amount: number, currency = "USD") => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
}).format(amount || 0)

const formatDate = (value: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

export function ListingDetail() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const source = searchParams.get("source") === "retreat" ? "retreat" : "session"
    const [data, setData] = useState<AdminListingDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { showToast } = useToast()

    useEffect(() => {
        if (!id) return
        let mounted = true

        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                const result = await fetchListingDetail(id, source)
                if (!mounted) return
                setData(result)
            } catch (err: any) {
                console.error("Failed to load listing detail:", err)
                if (!mounted) return
                setError(err?.response?.data?.error || err?.message || "Failed to load listing detail")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => { mounted = false }
    }, [id, source])

    const handleStatusChange = async (nextStatus: AdminListingDetail["status"]) => {
        if (!id || !data) return
        try {
            setSaving(true)
            await updateListingStatus(id, source, nextStatus)
            setData((prev) => prev ? { ...prev, status: nextStatus } : prev)
            showToast(`Listing status updated to ${nextStatus}.`, "success")
        } catch (err: any) {
            console.error("Failed to update listing status:", err)
            showToast(err?.response?.data?.error || err?.message || "Failed to update listing status", "error")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/listings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-tight">{data?.title || "Listing Details"}</h2>
                        {data && <Badge variant={data.status === "Active" ? "outline" : data.status === "Pending" ? "secondary" : "destructive"}>{data.status}</Badge>}
                        {data && <Badge variant="secondary">{data.source === "retreat" ? "Retreat" : "Session"}</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm">Listing ID: {id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={() => data && window.open(`/listings/${data.id}?source=${data.source}`, "_blank")}>Preview Route</Button>
                    <Button
                        variant={data?.status === "Hidden" ? "outline" : "destructive"}
                        type="button"
                        disabled={!data || saving}
                        onClick={() => handleStatusChange(data?.status === "Hidden" ? "Active" : "Hidden")}
                    >
                        {saving ? "Saving..." : data?.status === "Hidden" ? "Unhide Listing" : "Hide Listing"}
                    </Button>
                </div>
            </div>

            {loading && <div className="rounded-2xl bg-white dark:bg-[#111C44] p-6 text-sm text-[#A3AED0]">Loading listing details...</div>}
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</div>}

            {!loading && !error && data && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="col-span-full lg:col-span-2 space-y-6">
                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-lg">Listing Details</h3>

                            <div className="grid grid-cols-2 gap-y-4 mb-6">
                                <div>
                                    <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                        <User className="h-4 w-4" /> Healer
                                    </span>
                                    <span className="font-medium text-primary">{data.healerName}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                        <Tag className="h-4 w-4" /> Category
                                    </span>
                                    <span className="font-medium">{data.category}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                        <DollarSign className="h-4 w-4" /> Price
                                    </span>
                                    <span className="font-medium">{formatCurrency(data.price, data.currency)}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                        <Clock className="h-4 w-4" /> Duration
                                    </span>
                                    <span className="font-medium">{data.durationMinutes ? `${data.durationMinutes} minutes` : "—"}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                        <MapPin className="h-4 w-4" /> Location
                                    </span>
                                    <span className="font-medium">{data.location || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">Created</span>
                                    <span className="font-medium">{formatDate(data.createdAt)}</span>
                                </div>
                            </div>

                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                            <p className="text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                                {data.description || "No description found in the backend listing record."}
                            </p>

                            <h4 className="font-medium text-sm text-muted-foreground mb-2 mt-4">Required Information from Seeker</h4>
                            {data.requiredInformation.length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {data.requiredInformation.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No required information is stored for this listing.</p>
                            )}
                        </div>

                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">Recent Booking Activity</h3>
                            </div>
                            <div className="space-y-4">
                                {data.recentBookings.length > 0 ? data.recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex justify-between border-b pb-4 last:border-0 border-border">
                                        <div>
                                            <p className="text-sm font-medium">{booking.seekerName || "Unknown seeker"}</p>
                                            <p className="text-xs text-muted-foreground">Status: {booking.status}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium block">{formatCurrency(booking.amount)}</span>
                                            <span className="text-xs text-muted-foreground">{formatDate(booking.sessionDate || booking.createdAt)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground">No bookings found for this listing yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full lg:col-span-1 space-y-6">
                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                                <Settings className="h-5 w-5" /> Admin Controls
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Override Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => handleStatusChange(e.target.value as AdminListingDetail["status"])}
                                        className="w-full border rounded-md p-2 bg-background text-sm"
                                        disabled={saving}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending Review</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Hidden">Hidden</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">Changes are saved immediately to the backend listing record.</p>
                                </div>

                                <div className="pt-4 border-t text-sm text-muted-foreground space-y-2">
                                    <p>Featured: <span className="font-medium text-foreground">{data.featured ? "Yes" : "No"}</span></p>
                                    <p>Healer Email: <span className="font-medium text-foreground break-all">{data.healerEmail || "—"}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                            <h3 className="font-semibold mb-4">Performance Metrics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Bookings</span>
                                    <span className="font-medium bg-muted px-2 py-1 rounded">{data.performance.totalBookings}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Completion Rate</span>
                                    <span className="font-medium bg-muted px-2 py-1 rounded">{data.performance.completionRate}%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t pt-3">
                                    <span className="text-muted-foreground">Earned (All Time)</span>
                                    <span className="font-medium">{formatCurrency(data.performance.totalRevenue, data.currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
