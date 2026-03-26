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
    exportRetreats
} from "../../lib/retreats"
import { ConfirmModal } from "../../components/ConfirmModal"
import { Info } from "lucide-react"
import { Skeleton } from "../../components/ui/skeleton"


export default function RetreatsPage() {
    const { showToast } = useToast()
    const [data, setData] = useState<Retreat[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState<any>({
        status: [],
        search: "",
        location: "",
        priceMin: undefined,
        priceMax: undefined,
        startDateFrom: "",
        startDateTo: "",
        page: 1,
        limit: 25
    })

    const [summary, setSummary] = useState<any>({ total: 0, pending: 0, active: 0 })
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedRetreatId, setSelectedRetreatId] = useState<string | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const { retreats, summary } = await getRetreats(filters)
            setData(retreats)
            setSummary(summary)
        } catch (error) {
            console.error("Failed to fetch retreats:", error)
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
            showToast("Exported CSV successfully")
        } catch (error) {
            console.error("Export failed:", error)
            showToast("Export failed", "error")
        }
    }

    const columns = useMemo(() => getColumns({
        onApprove: handleApprove,
        onDelete: handleDeleteClick,
        onToggleStatus: handleToggleStatus
    }), [])

    const pendingCount = summary.pending;

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
                onClear={() => setFilters({
                    status: [],
                    search: "",
                    location: "",
                    priceMin: undefined,
                    priceMax: undefined,
                    startDateFrom: "",
                    startDateTo: "",
                    page: 1,
                    limit: 25
                })}
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
        </div>
    )
}
