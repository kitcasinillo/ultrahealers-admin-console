import { type ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { MoreHorizontal } from "lucide-react"

export type Listing = {
    id: string
    title: string
    healerName: string
    category: string
    price: number
    status: "Active" | "Pending" | "Rejected" | "Hidden"
    rating: number
    createdAt: string
}

const data: Listing[] = [
    {
        id: "L-1001",
        title: "Chakra Balancing Session",
        healerName: "John Doe",
        category: "Energy Healing",
        price: 150,
        status: "Active",
        rating: 4.9,
        createdAt: "2025-02-10",
    },
    {
        id: "L-1002",
        title: "Virtual Sound Bath",
        healerName: "Alice Johnson",
        category: "Sound Therapy",
        price: 85,
        status: "Pending",
        rating: 0,
        createdAt: "2026-02-25",
    },
    {
        id: "L-1003",
        title: "Past Life Regression",
        healerName: "Jane Smith",
        category: "Spiritual",
        price: 300,
        status: "Rejected",
        rating: 4.2,
        createdAt: "2026-01-05",
    },
]

export const columns: ColumnDef<Listing>[] = [
    {
        accessorKey: "title",
        header: "Listing Title",
        cell: ({ row }) => {
            const listing = row.original
            return (
                <Link to={`/listings/${listing.id}`} className="font-medium text-primary hover:underline">
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
            const status = row.getValue("status") as string
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
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
    },
    {
        id: "actions",
        cell: () => {
            return (
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            )
        },
    },
]

export function Listings() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Listings Management</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        View, approve, and manage healer sessions and retreats.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center bg-[#F4F7FE] dark:bg-white/5 hover:bg-[#E2E8F0] dark:hover:bg-white/10 text-[#4318FF] dark:text-white font-semibold py-2.5 px-5 rounded-full transition-all text-sm">
                        Export CSV
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
