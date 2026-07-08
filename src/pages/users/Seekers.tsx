import { useEffect, useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Download, MoreHorizontal, Search, X, TrendingUp, UserCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { useToast } from "../../contexts/ToastContext"
import { exportSeekersCsv } from "../../lib/userExports"
import { fetchSeekers, type AdminSeeker } from "../../lib/users"
import { StatsCard } from "../../components/StatsCard"
import { DateRangePicker } from "../../components/common"

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
}).format(amount || 0)

const formatDate = (value: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

export function Seekers() {
    const [data, setData] = useState<AdminSeeker[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Suspended" | "Pending">("")
    
    // Date Range Filters
    const [dateRange, setDateRange] = useState("Custom Range")
    const [customStartDate, setCustomStartDate] = useState(`${new Date().getFullYear()}-03-01`)
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0])
    
    // Summary Metrics
    const [totalCount, setTotalCount] = useState(0)
    const [newSignups, setNewSignups] = useState(0)
    
    const { showToast } = useToast()

    useEffect(() => {
        let mounted = true

        const timeout = setTimeout(() => {
            const load = async () => {
                try {
                    setLoading(true)
                    setError(null)
                    const response = await fetchSeekers({
                        q: search,
                        status: statusFilter,
                        startDate: customStartDate,
                        endDate: customEndDate,
                    })
                    if (!mounted) return
                    setData(response.results)
                    setTotalCount(response.totalCountInRange)
                    setNewSignups(response.newSignupsInRange)
                } catch (err: any) {
                    console.error("Failed to load seekers:", err)
                    if (!mounted) return
                    setError(err?.response?.data?.error || err?.message || "Failed to load seekers")
                } finally {
                    if (mounted) setLoading(false)
                }
            }

            load()
        }, 250)

        return () => {
            mounted = false
            clearTimeout(timeout)
        }
    }, [search, statusFilter, customStartDate, customEndDate])

    const columns = useMemo<ColumnDef<AdminSeeker>[]>(() => [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const seeker = row.original
                return (
                    <Link to={`/users/seekers/${seeker.id}`} className="font-medium text-primary hover:underline">
                        {seeker.name}
                    </Link>
                )
            },
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.original.email || "—",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                const baseClass = "font-bold uppercase text-[10px] px-2 py-0.5 rounded-full"
                
                if (status === "Active") {
                    return <Badge className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800`}>Active</Badge>
                }
                if (status === "Suspended") {
                    return <Badge className={`${baseClass} bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800`}>Suspended</Badge>
                }
                if (status === "Pending") {
                    return <Badge className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800`}>Pending</Badge>
                }
                
                return <Badge variant="outline" className={baseClass}>{status}</Badge>
            },
        },
        {
            accessorKey: "totalSpent",
            header: () => <div className="text-right">Total Spent</div>,
            cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.totalSpent)}</div>,
        },
        {
            accessorKey: "joinedDate",
            header: "Joined Date",
            cell: ({ row }) => formatDate(row.original.joinedDate),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button variant="ghost" className="h-8 w-8 p-0" asChild>
                    <Link to={`/users/seekers/${row.original.id}`}>
                        <span className="sr-only">Open seeker details</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Link>
                </Button>
            ),
        },
    ], [])

    const clearFilters = () => {
        setSearch("")
        setStatusFilter("")
        setDateRange("Custom Range")
        setCustomStartDate(`${new Date().getFullYear()}-03-01`)
        setCustomEndDate(new Date().toISOString().split('T')[0])
    }

    const canClear = search || statusFilter || customStartDate !== `${new Date().getFullYear()}-03-01` || customEndDate !== new Date().toISOString().split('T')[0]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Seekers Management</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        View and manage all registered seekers on the platform.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                            exportSeekersCsv(data)
                            showToast("Seekers CSV exported.", "success")
                        }}
                        disabled={loading || data.length === 0}
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Total Seekers (Filtered)"
                    value={totalCount.toString()}
                    description="Matches filters and search in range"
                    icon={<UserCheck className="h-6 w-6 text-[#4318FF]" />}
                />
                <StatsCard
                    title="New Signups (In Range)"
                    value={newSignups.toString()}
                    description="Registrations in date range"
                    icon={<TrendingUp className="h-6 w-6 text-emerald-500" />}
                />
            </div>

            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-4 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_180px_auto] items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3AED0]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or ID"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                    </div>

                    <DateRangePicker
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        customStartDate={customStartDate}
                        setCustomStartDate={setCustomStartDate}
                        customEndDate={customEndDate}
                        setCustomEndDate={setCustomEndDate}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        <option value="">All statuses</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Pending">Pending</option>
                    </select>

                    <Button type="button" variant="ghost" onClick={clearFilters} disabled={!canClear}>
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                {loading ? (
                    <div className="py-16 text-center text-sm text-[#A3AED0]">Loading seekers...</div>
                ) : data.length === 0 ? (
                    <div className="py-16 text-center text-sm text-[#A3AED0] font-medium">
                        No signups in this range
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} />
                )}
            </div>
        </div>
    )
}
