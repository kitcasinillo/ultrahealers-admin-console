import { type ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { MoreHorizontal } from "lucide-react"

export type Seeker = {
    id: string
    name: string
    email: string
    status: "Active" | "Suspended"
    totalSpent: number
    joinedDate: string
}

const data: Seeker[] = [
    {
        id: "9c3c13b",
        name: "Michael Brown",
        email: "michael@example.com",
        status: "Active",
        totalSpent: 450,
        joinedDate: "2026-01-10",
    },
    {
        id: "1f3c14d",
        name: "Sarah Williams",
        email: "sarah@example.com",
        status: "Active",
        totalSpent: 1200,
        joinedDate: "2025-06-22",
    },
    {
        id: "5b2a09c",
        name: "David Lee",
        email: "david@example.com",
        status: "Suspended",
        totalSpent: 0,
        joinedDate: "2026-02-01",
    },
]

export const columns: ColumnDef<Seeker>[] = [
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
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "Active" ? "outline" : "destructive"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "totalSpent",
        header: () => <div className="text-right">Total Spent</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSpent"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "joinedDate",
        header: "Joined Date",
    },
    {
        id: "actions",
        cell: () => {
            // Actions menu goes here
            return (
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            )
        },
    },
]

export function Seekers() {
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
