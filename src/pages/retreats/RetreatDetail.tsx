import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
    ChevronLeft,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    ExternalLink,
    Clock,
    UserCircle,
    Image as ImageIcon,
    Mail
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { StatusBadge, type StatusType } from "../../components/StatusBadge"
import { buildRetreatMessageAll, getRetreatById, updateRetreatFields, updateRetreatStatus, approveRetreat } from "../../lib/retreats"
import { Skeleton } from "../../components/ui/skeleton"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { useToast } from "../../contexts/ToastContext"

const formatDate = (value?: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

const toSafeNumber = (value: unknown) => {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

export default function RetreatDetail() {
    const { id } = useParams<{ id: string }>()
    const { showToast } = useToast()
    const [retreat, setRetreat] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [messageDraft, setMessageDraft] = useState({ subject: "", message: "" })
    const [editForm, setEditForm] = useState({
        title: "",
        location: "",
        price: "",
        capacity: "",
        startDate: "",
        endDate: "",
        shortDescription: "",
        longDescription: "",
    })

    useEffect(() => {
        if (id) fetchData(id)
    }, [id])

    const fetchData = async (retreatId: string) => {
        setIsLoading(true)
        try {
            const data = await getRetreatById(retreatId)
            setRetreat(data)
            setEditForm({
                title: data.title || "",
                location: data.location || "",
                price: String(toSafeNumber(data.price)),
                capacity: String(toSafeNumber(data.capacity)),
                startDate: data.startDate ? String(data.startDate).slice(0, 10) : "",
                endDate: data.endDate ? String(data.endDate).slice(0, 10) : "",
                shortDescription: data.shortDescription || "",
                longDescription: data.longDescription || "",
            })
        } catch (error) {
            console.error("Failed to fetch retreat:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!id) return
        try {
            setIsActionLoading(true)
            await approveRetreat(id)
            showToast("Retreat approved successfully")
            fetchData(id)
        } catch (error) {
            console.error("Approve failed:", error)
            showToast("Failed to approve retreat", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        if (!id || !retreat) return
        const newStatus = retreat.status === "active" ? "inactive" : "active"
        try {
            setIsActionLoading(true)
            await updateRetreatStatus(id, newStatus)
            showToast(`Retreat status updated to ${newStatus}`)
            fetchData(id)
        } catch (error) {
            console.error("Status toggle failed:", error)
            showToast("Failed to update retreat status", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleMarkFinished = async () => {
        if (!id) return
        try {
            setIsActionLoading(true)
            await updateRetreatStatus(id, "finished")
            showToast("Retreat marked as finished")
            fetchData(id)
        } catch (error) {
            console.error("Mark finished failed:", error)
            showToast("Failed to mark retreat as finished", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleSaveEdit = async () => {
        if (!id) return
        try {
            setIsActionLoading(true)
            await updateRetreatFields(id, {
                title: editForm.title,
                location: editForm.location,
                price: Number(editForm.price || 0),
                capacity: Number(editForm.capacity || 0),
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                shortDescription: editForm.shortDescription,
                longDescription: editForm.longDescription,
            })
            showToast("Retreat updated")
            setIsEditOpen(false)
            fetchData(id)
        } catch (error) {
            console.error("Edit save failed:", error)
            showToast("Failed to update retreat", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleMessageAll = async () => {
        if (!id) return
        try {
            setIsActionLoading(true)
            const result = await buildRetreatMessageAll(id, messageDraft)
            const emails = (result?.recipients || []).map((recipient: any) => recipient.email).filter(Boolean)
            if (emails.length === 0) {
                showToast("No seeker emails found for this retreat", "error")
                return
            }
            const subject = encodeURIComponent(messageDraft.subject)
            const body = encodeURIComponent(messageDraft.message)
            window.location.href = `mailto:${emails.join(',')}?subject=${subject}&body=${body}`
            showToast(`Prepared message for ${emails.length} seekers`)
        } catch (error) {
            console.error("Message all failed:", error)
            showToast("Failed to prepare seeker message", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
                    <Skeleton className="h-[400px] rounded-3xl" />
                </div>
            </div>
        )
    }

    if (!retreat) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h3 className="text-xl font-bold">Retreat not found</h3>
                <Button asChild className="mt-4"><Link to="/retreats">Back to Retreats</Link></Button>
            </div>
        )
    }

    const safeBookedSpots = toSafeNumber(retreat.bookedSpots)
    const safeCapacity = toSafeNumber(retreat.capacity)
    const safePrice = toSafeNumber(retreat.price)
    const safeRevenue = toSafeNumber(retreat.revenue) || (safeBookedSpots * safePrice)
    const fillRate = safeCapacity > 0 ? (safeBookedSpots / safeCapacity) * 100 : 0

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="rounded-full -ml-3 text-[#A3AED0]">
                    <Link to="/retreats" className="flex items-center gap-2">
                        <ChevronLeft className="h-5 w-5" />
                        Back to Management
                    </Link>
                </Button>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                    <Button variant="outline" asChild className="rounded-full border-[#E2E8F0]">
                        <a href={`https://ultrahealers.com/retreats/${id}`} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            View Public Listing
                        </a>
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditOpen(true)} className="rounded-full border-[#E2E8F0]">
                        Edit Fields
                    </Button>
                    {retreat.status === "pending_review" && (
                        <Button onClick={handleApprove} disabled={isActionLoading} className="rounded-full bg-green-600 hover:bg-green-700 text-white font-bold px-6">
                            Approve Retreat
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleMarkFinished} disabled={isActionLoading} className="rounded-full font-bold px-6">
                        Mark as Finished
                    </Button>
                    <Button
                        variant={retreat.status === "active" ? "destructive" : "default"}
                        onClick={handleToggleStatus}
                        disabled={isActionLoading}
                        className="rounded-full font-bold px-6"
                    >
                        {retreat.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-[30px] border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] overflow-hidden">
                        <div className="h-64 relative">
                            <img
                                src={retreat.imageUrl || "https://images.unsplash.com/photo-1519681393784-3cef4a71b1b4?auto=format&fit=crop&q=80&w=1200"}
                                alt={retreat.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                                <StatusBadge status={retreat.status as StatusType} className="shadow-lg scale-110" />
                            </div>
                        </div>
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-extrabold text-[#1b254b] dark:text-white capitalize leading-tight">
                                    {retreat.title}
                                </h1>
                            </div>

                            <div className="flex flex-wrap gap-4 text-[#A3AED0] mb-8">
                                <div className="flex items-center gap-2 font-medium">
                                    <MapPin className="h-4 w-4" /> {retreat.location}
                                </div>
                                <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="h-4 w-4" /> {formatDate(retreat.startDate)} – {formatDate(retreat.endDate)}
                                </div>
                                <div className="flex items-center gap-2 font-medium text-primary">
                                    <UserCircle className="h-4 w-4" /> Hosted by {retreat.hostName}
                                </div>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-2 underline decoration-primary/30 decoration-4 underline-offset-4">Description</h3>
                                <p className="text-[#A3AED0] leading-relaxed">
                                    {retreat.longDescription || retreat.shortDescription || "No description provided for this retreat."}
                                </p>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-4">Gallery</h3>
                                {retreat.imageUrl ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 bg-[#F4F7FE] dark:bg-white/5">
                                            <img src={retreat.imageUrl} alt={retreat.title} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-2xl bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center border border-dashed border-gray-200">
                                        <ImageIcon className="h-8 w-8 text-[#A3AED0]" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[30px] border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] p-6">
                        <CardHeader className="px-2 pb-6">
                            <CardTitle className="text-xl font-bold text-[#1b254b] dark:text-white">Enrolled Seekers</CardTitle>
                            <CardDescription>Track payments and participation for this retreat.</CardDescription>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-50 hover:bg-transparent">
                                    <TableHead className="font-bold text-[#A3AED0] uppercase text-[11px]">Seeker</TableHead>
                                    <TableHead className="font-bold text-[#A3AED0] uppercase text-[11px]">Paid Amount</TableHead>
                                    <TableHead className="font-bold text-[#A3AED0] uppercase text-[11px]">Booking Date</TableHead>
                                    <TableHead className="font-bold text-[#A3AED0] uppercase text-[11px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(retreat.enrollments || []).map((seeker: any) => (
                                    <TableRow key={seeker.id} className="border-gray-50 hover:bg-[#F4F7FE]/50 dark:hover:bg-white/5 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{seeker.name?.[0] || "?"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-[#1b254b] dark:text-white">{seeker.name}</div>
                                                    <div className="text-xs text-[#A3AED0]">{seeker.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-[#1b254b] dark:text-white">
                                            ${toSafeNumber(seeker.amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-[#A3AED0] font-medium">{formatDate(seeker.date)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "rounded-full px-3",
                                                    seeker.status === 'succeeded' || seeker.status === 'paid' ? "bg-green-50 text-green-700 border-green-200" :
                                                    seeker.status === 'partial' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                    "bg-gray-100 text-gray-700 border-gray-200"
                                                )}
                                            >
                                                {String(seeker.status || 'pending').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!retreat.enrollments || retreat.enrollments.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-10 text-center text-sm text-[#A3AED0]">
                                            No enrolled seekers found for this retreat yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-[30px] border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] p-8 bg-gradient-to-br from-[#4318FF] to-[#7C3AED] text-white">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">Total Revenue</h4>
                                <div className="text-4xl font-extrabold flex items-center gap-1">
                                    <DollarSign className="h-7 w-7" />
                                    {safeRevenue.toLocaleString()}
                                </div>
                            </div>
                            <div className="h-px bg-white/20 w-full" />
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">Capacity Fill Rate</h4>
                                        <div className="text-2xl font-bold">{safeBookedSpots} / {safeCapacity}</div>
                                    </div>
                                    <div className="text-xl font-black">{Math.round(fillRate)}%</div>
                                </div>
                                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-700 ease-out" style={{ width: `${Math.min(Math.max(fillRate, 0), 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[30px] border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] p-6">
                        <CardHeader className="px-2 pt-0">
                            <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Pricing Details</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2 space-y-4">
                            <div className="flex justify-between items-center bg-[#F4F7FE] dark:bg-white/5 p-4 rounded-2xl">
                                <span className="text-[#A3AED0] font-bold">Standard Price</span>
                                <span className="text-xl font-extrabold text-primary">${safePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 border border-gray-100 dark:border-white/5 rounded-2xl">
                                <span className="text-[#A3AED0] font-bold">Healer Payout</span>
                                <span className="text-lg font-bold text-green-600">${(safeRevenue * 0.85).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 border border-gray-100 dark:border-white/5 rounded-2xl">
                                <span className="text-[#A3AED0] font-bold">Admin Fee (15%)</span>
                                <span className="text-lg font-bold text-[#4318FF]">${(safeRevenue * 0.15).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[30px] border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] p-6">
                        <CardHeader className="px-2 pt-0">
                            <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2 space-y-4">
                            <Button variant="outline" className="w-full rounded-2xl h-12 border-[#E2E8F0] justify-start gap-3" onClick={handleMarkFinished} disabled={isActionLoading}>
                                <Clock className="h-5 w-5 text-[#A3AED0]" /> Mark as Finished
                            </Button>
                            <div className="space-y-2 border rounded-2xl p-3 border-[#E2E8F0] dark:border-white/5">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Mail className="h-4 w-4 text-[#A3AED0]" /> Message All Seekers
                                </div>
                                <input className="w-full rounded-xl border px-3 py-2 bg-transparent text-sm" placeholder="Subject" value={messageDraft.subject} onChange={(e) => setMessageDraft((prev) => ({ ...prev, subject: e.target.value }))} />
                                <textarea className="w-full rounded-xl border px-3 py-2 bg-transparent text-sm min-h-[110px]" placeholder="Write your message to all seekers..." value={messageDraft.message} onChange={(e) => setMessageDraft((prev) => ({ ...prev, message: e.target.value }))} />
                                <Button variant="outline" className="w-full rounded-2xl h-11 justify-start gap-3" onClick={handleMessageAll} disabled={isActionLoading || !messageDraft.subject.trim() || !messageDraft.message.trim()}>
                                    <Users className="h-5 w-5 text-[#A3AED0]" /> Prepare Email to All Seekers
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-3xl rounded-[24px] bg-white dark:bg-[#111C44] p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Edit Retreat Fields</h3>
                            <button className="text-sm text-[#A3AED0]" onClick={() => setIsEditOpen(false)}>Close</button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <input className="rounded-xl border px-3 py-2 bg-transparent" placeholder="Title" value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} />
                            <input className="rounded-xl border px-3 py-2 bg-transparent" placeholder="Location" value={editForm.location} onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))} />
                            <input className="rounded-xl border px-3 py-2 bg-transparent" type="number" placeholder="Price" value={editForm.price} onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))} />
                            <input className="rounded-xl border px-3 py-2 bg-transparent" type="number" placeholder="Capacity" value={editForm.capacity} onChange={(e) => setEditForm((prev) => ({ ...prev, capacity: e.target.value }))} />
                            <input className="rounded-xl border px-3 py-2 bg-transparent" type="date" value={editForm.startDate} onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))} />
                            <input className="rounded-xl border px-3 py-2 bg-transparent" type="date" value={editForm.endDate} onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))} />
                            <textarea className="rounded-xl border px-3 py-2 bg-transparent md:col-span-2 min-h-[90px]" placeholder="Short description" value={editForm.shortDescription} onChange={(e) => setEditForm((prev) => ({ ...prev, shortDescription: e.target.value }))} />
                            <textarea className="rounded-xl border px-3 py-2 bg-transparent md:col-span-2 min-h-[140px]" placeholder="Long description" value={editForm.longDescription} onChange={(e) => setEditForm((prev) => ({ ...prev, longDescription: e.target.value }))} />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button className="rounded-xl px-4 py-2 text-sm" onClick={() => setIsEditOpen(false)}>Cancel</button>
                            <button className="rounded-xl bg-[#4318FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={isActionLoading} onClick={handleSaveEdit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
