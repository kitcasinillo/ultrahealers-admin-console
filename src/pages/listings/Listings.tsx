import { useEffect, useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Download, MoreHorizontal, Search, X } from "lucide-react"
import { Link } from "react-router-dom"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { useToast } from "../../contexts/ToastContext"
import { fetchListings, type AdminListing } from "../../lib/listings"
import * as XLSX from "xlsx"

const formatCurrency = (amount: number, currency = "USD") => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
}).format(amount || 0)

const formatDate = (value: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

const exportListingsCsv = (rows: AdminListing[]) => {
    const worksheet = XLSX.utils.json_to_sheet(rows.map((row) => ({
        ID: row.id,
        Source: row.source,
        Title: row.title,
        Healer: row.healerName,
        Category: row.category,
        Price: row.price,
        Currency: row.currency,
        Status: row.status,
        Rating: row.rating,
        CreatedAt: row.createdAt || "",
        Location: row.location || "",
        Featured: row.featured ? "Yes" : "No",
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Listings")
    XLSX.writeFile(workbook, "ultrahealers-listings.csv", { bookType: "csv" })
}

export function Listings() {
    const [data, setData] = useState<AdminListing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Pending" | "Rejected" | "Hidden">("")
    const [sourceFilter, setSourceFilter] = useState<"" | "session" | "retreat">("")
    const { showToast } = useToast()

    useEffect(() => {
        let mounted = true

        const timeout = setTimeout(() => {
            const load = async () => {
                try {
                    setLoading(true)
                    setError(null)
                    const results = await fetchListings({
                        q: search,
                        status: statusFilter,
                        source: sourceFilter,
                    })
                    if (!mounted) return
                    setData(results)
                } catch (err: any) {
                    console.error("Failed to load listings:", err)
                    if (!mounted) return
                    setError(err?.response?.data?.error || err?.message || "Failed to load listings")
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
    }, [search, statusFilter, sourceFilter])

    const columns = useMemo<ColumnDef<AdminListing>[]>(() => [
        {
            accessorKey: "title",
            header: "Listing Title",
            cell: ({ row }) => {
                const listing = row.original
                return (
                    <Link to={`/listings/${listing.id}?source=${listing.source}`} className="font-medium text-primary hover:underline">
                        {listing.title}
                    </Link>
                )
            },
        },
        {
            accessorKey: "healerName",
            header: "Healer",
        },
        {
            accessorKey: "category",
            header: "Category",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                let variant: "default" | "secondary" | "destructive" | "outline" = "default"

                switch (status) {
                    case "Active":
                        variant = "outline"
                        break
                    case "Pending":
                        variant = "secondary"
                        break
                    case "Rejected":
                    case "Hidden":
                        variant = "destructive"
                        break
                }

                return <Badge variant={variant}>{status}</Badge>
            },
        },
        {
            accessorKey: "source",
            header: "Type",
            cell: ({ row }) => <Badge variant="secondary">{row.original.source === "retreat" ? "Retreat" : "Session"}</Badge>,
        },
        {
            accessorKey: "price",
            header: () => <div className="text-right">Price</div>,
            cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.price, row.original.currency)}</div>,
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button variant="ghost" className="h-8 w-8 p-0" asChild>
                    <Link to={`/listings/${row.original.id}?source=${row.original.source}`}>
                        <span className="sr-only">Open listing details</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Link>
                </Button>
            ),
        },
    ], [])

    const clearFilters = () => {
        setSearch("")
        setStatusFilter("")
        setSourceFilter("")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Listings Management</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        View, review, and manage healer sessions and retreats from the live backend.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                            exportListingsCsv(data)
                            showToast("Listings CSV exported.", "success")
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
                            placeholder="Search by title, healer, category, or ID"
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
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Hidden">Hidden</option>
                    </select>

                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        <option value="">All types</option>
                        <option value="session">Sessions</option>
                        <option value="retreat">Retreats</option>
                    </select>

                    <Button type="button" variant="ghost" onClick={clearFilters} disabled={!search && !statusFilter && !sourceFilter}>
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
                    <div className="py-16 text-center text-sm text-[#A3AED0]">Loading listings...</div>
                ) : (
                    <DataTable columns={columns} data={data} />
                )}
            </div>
        </div>
    )
}
