import { type ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { MoreHorizontal } from "lucide-react"

export type Healer = {
    id: string
    name: string
    email: string
    subscription: "Free" | "Premium"
    status: "Active" | "Suspended"
    totalEarned: number
    joinedDate: string
}

const data: Healer[] = [
    {
        id: "728ed52f",
        name: "John Doe",
        email: "john@example.com",
        subscription: "Premium",
        status: "Active",
        totalEarned: 15400,
        joinedDate: "2025-01-12",
    },
    {
        id: "489e1d42",
        name: "Jane Smith",
        email: "jane@example.com",
        subscription: "Free",
        status: "Active",
        totalEarned: 850,
        joinedDate: "2026-02-15",
    },
    {
        id: "0a1b2c3d",
        name: "Alice Johnson",
        email: "alice@example.com",
        subscription: "Free",
        status: "Suspended",
        totalEarned: 120,
        joinedDate: "2025-11-05",
    },
]

export const columns: ColumnDef<Healer>[] = [
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
    },
    {
        accessorKey: "subscription",
        header: "Subscription",
        cell: ({ row }) => {
            const type = row.getValue("subscription") as string
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
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "Active" ? "outline" : "destructive"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "totalEarned",
        header: () => <div className="text-right">Total Earned</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalEarned"))
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

export function Healers() {
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
