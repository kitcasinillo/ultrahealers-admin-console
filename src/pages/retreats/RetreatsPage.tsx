import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/contexts/ToastContext"
import { DataTable } from "../../components/DataTable"
import { RetreatsFilters } from "./RetreatsFilters"
import { getColumns, type Retreat } from "./columns"
import {
    getRetreats,
    approveRetreat,
    deleteRetreat,
    updateRetreatStatus,
    exportRetreats,
    updateRetreatFields
} from "../../lib/retreats"
import { ConfirmModal } from "../../components/ConfirmModal"
import { Info } from "lucide-react"
import { Skeleton } from "../../components/ui/skeleton"

const DEFAULT_FILTERS = {
    status: [],
    search: "",
    location: "",
    priceMin: undefined,
    priceMax: undefined,
    startDateFrom: "",
    startDateTo: "",
    page: 1,
    limit: 25
}

const emptyEditState = {
    title: "",
    location: "",
    price: "",
    capacity: "",
    startDate: "",
    endDate: "",
    shortDescription: "",
    longDescription: "",
}

const isoDateForInput = (value?: string | null) => value ? String(value).slice(0, 10) : ""

export default function RetreatsPage() {
    const { showToast } = useToast()
    const [data, setData] = useState<Retreat[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState<any>(DEFAULT_FILTERS)
    const [summary, setSummary] = useState<any>({ total: 0, pending: 0, active: 0, finished: 0 })
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedRetreatId, setSelectedRetreatId] = useState<string | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingRetreat, setEditingRetreat] = useState<Retreat | null>(null)
    const [editForm, setEditForm] = useState(emptyEditState)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const { retreats, summary } = await getRetreats(filters)
            setData(retreats)
            setSummary(summary)
        } catch (error) {
            console.error("Failed to fetch retreats:", error)
            showToast("Failed to fetch retreats", "error")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [filters])

    const handleApprove = async (id: string) => {
        try {
            setIsActionLoading(true)
            await approveRetreat(id)
            showToast("Retreat approved successfully")
            fetchData()
        } catch (error) {
            console.error("Failed to approve retreat:", error)
            showToast("Failed to approve retreat", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleDeleteClick = (id: string) => {
        setSelectedRetreatId(id)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedRetreatId) return
        try {
            setIsActionLoading(true)
            await deleteRetreat(selectedRetreatId)
            setIsDeleteModalOpen(false)
            showToast("Retreat deleted successfully")
            fetchData()
        } catch (error) {
            console.error("Failed to delete retreat:", error)
            showToast("Failed to delete retreat", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active"
        try {
            setIsActionLoading(true)
            await updateRetreatStatus(id, newStatus)
            showToast(`Retreat status updated to ${newStatus}`)
            fetchData()
        } catch (error) {
            console.error("Failed to update status:", error)
            showToast("Failed to update status", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleMarkFinished = async (id: string) => {
        try {
            setIsActionLoading(true)
            await updateRetreatStatus(id, "finished")
            showToast("Retreat marked as finished")
            fetchData()
        } catch (error) {
            console.error("Failed to mark retreat as finished:", error)
            showToast("Failed to mark retreat as finished", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleEditOpen = (id: string) => {
        const retreat = data.find((item) => item.id === id)
        if (!retreat) {
            showToast("Retreat not found in current list", "error")
            return
        }
        setEditingRetreat(retreat)
        setEditForm({
            title: retreat.title || "",
            location: retreat.location || "",
            price: String(retreat.price ?? ""),
            capacity: String(retreat.capacity ?? ""),
            startDate: isoDateForInput(retreat.startDate),
            endDate: isoDateForInput(retreat.endDate),
            shortDescription: retreat.shortDescription || "",
            longDescription: retreat.longDescription || "",
        })
        setIsEditModalOpen(true)
    }

    const handleEditSave = async () => {
        if (!editingRetreat) return
        try {
            setIsActionLoading(true)
            await updateRetreatFields(editingRetreat.id, {
                title: editForm.title.trim(),
                location: editForm.location.trim(),
                price: Number(editForm.price || 0),
                capacity: Number(editForm.capacity || 0),
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                shortDescription: editForm.shortDescription,
                longDescription: editForm.longDescription,
            })
            showToast("Retreat fields updated")
            setIsEditModalOpen(false)
            setEditingRetreat(null)
            fetchData()
        } catch (error) {
            console.error("Failed to update retreat:", error)
            showToast("Failed to update retreat", "error")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            const blob = await exportRetreats(filters)
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `retreats_export_${new Date().toISOString()}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error("Export failed:", error)
            showToast("Failed to export retreats", "error")
        }
    }

    const columns = useMemo(() => getColumns({
        onApprove: handleApprove,
        onDelete: handleDeleteClick,
        onToggleStatus: handleToggleStatus,
        onEdit: handleEditOpen,
        onMarkFinished: handleMarkFinished,
    }), [data])

    const pendingCount = summary.pending

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Retreats Management</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium italic">
                        Review, approve and manage platform retreat listings.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center bg-[#F4F7FE] dark:bg-white/5 hover:bg-[#E2E8F0] dark:hover:bg-white/10 text-[#4318FF] dark:text-white font-semibold py-2.5 px-5 rounded-full transition-all text-sm"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <RetreatsFilters
                filters={filters}
                setFilters={setFilters}
                pendingCount={pendingCount}
                onClear={() => setFilters(DEFAULT_FILTERS)}
            />

            <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                ) : data.length > 0 ? (
                    <DataTable columns={columns} data={data} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-[#F4F7FE] dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Info className="h-10 w-10 text-[#A3AED0]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">No retreats found</h3>
                        <p className="text-[#A3AED0] max-w-xs mt-2">
                            Adjust your filters or try a different search term.
                        </p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Retreat?"
                description="This action cannot be undone. This listing will be permanently removed from the platform."
                isLoading={isActionLoading}
            />

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-3xl rounded-[24px] bg-white dark:bg-[#111C44] p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Edit Retreat Fields</h3>
                            <button className="text-sm text-[#A3AED0]" onClick={() => setIsEditModalOpen(false)}>Close</button>
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
                            <button className="rounded-xl px-4 py-2 text-sm" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="rounded-xl bg-[#4318FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={isActionLoading} onClick={handleEditSave}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
