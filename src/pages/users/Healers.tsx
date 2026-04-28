import { useEffect, useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Download, MoreHorizontal, Search, X } from "lucide-react"
import { Link } from "react-router-dom"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { useToast } from "../../contexts/ToastContext"
import { exportHealersCsv } from "../../lib/userExports"
import { fetchHealers, type AdminHealer } from "../../lib/users"

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
}).format(amount || 0)

const formatDate = (value: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

export function Healers() {
    const [data, setData] = useState<AdminHealer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Suspended" | "Pending">("")
    const [subscriptionFilter, setSubscriptionFilter] = useState<"" | "Free" | "Premium">("")
    const { showToast } = useToast()

    useEffect(() => {
        let mounted = true

        const timeout = setTimeout(() => {
            const load = async () => {
                try {
                    setLoading(true)
                    setError(null)
                    const results = await fetchHealers({
                        q: search,
                        status: statusFilter,
                        subscription: subscriptionFilter,
                    })
                    if (!mounted) return
                    setData(results)
                } catch (err: any) {
                    console.error("Failed to load healers:", err)
                    if (!mounted) return
                    setError(err?.response?.data?.error || err?.message || "Failed to load healers")
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
    }, [search, statusFilter, subscriptionFilter])

    const columns = useMemo<ColumnDef<AdminHealer>[]>(() => [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const healer = row.original
                return (
                    <Link to={`/users/healers/${healer.id}`} className="font-medium text-primary hover:underline">
                        {healer.name}
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
            accessorKey: "subscription",
            header: "Subscription",
            cell: ({ row }) => {
                const type = row.original.subscription
                return (
                    <Badge variant={type === "Premium" ? "default" : "secondary"}>
                        {type} {type === "Premium" && "🏅"}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <Badge variant={status === "Active" ? "outline" : status === "Pending" ? "secondary" : "destructive"}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "totalEarned",
            header: () => <div className="text-right">Total Earned</div>,
            cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.totalEarned)}</div>,
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
                    <Link to={`/users/healers/${row.original.id}`}>
                        <span className="sr-only">Open healer details</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Link>
                </Button>
            ),
        },
    ], [])

    const clearFilters = () => {
        setSearch("")
        setStatusFilter("")
        setSubscriptionFilter("")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Healers Management</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        View and manage all registered healers on the platform.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                            exportHealersCsv(data)
                            showToast("Healers CSV exported.", "success")
                        }}
                        disabled={loading || data.length === 0}
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-4 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3AED0]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or ID"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                    </div>

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

                    <select
                        value={subscriptionFilter}
                        onChange={(e) => setSubscriptionFilter(e.target.value as typeof subscriptionFilter)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        <option value="">All subscriptions</option>
                        <option value="Free">Free</option>
                        <option value="Premium">Premium</option>
                    </select>

                    <Button type="button" variant="ghost" onClick={clearFilters} disabled={!search && !statusFilter && !subscriptionFilter}>
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
                    <div className="py-16 text-center text-sm text-[#A3AED0]">Loading healers...</div>
                ) : (
                    <DataTable columns={columns} data={data} />
                )}
            </div>
        </div>
    )
}
