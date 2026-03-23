import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../../../components/ui/badge"
import { MoreHorizontal, Eye, Calendar, Trash2 } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Link } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { formatCurrency } from "../../../lib/bookings"
import { cn } from "../../../lib/utils"

export const getRetreatColumns = (onCancel: (id: string, name: string) => void): ColumnDef<any>[] => [
    {
        accessorKey: "id",
        header: "Booking ID",
        cell: ({ row }) => (
            <span className="font-bold text-[#1b254b] dark:text-white text-[13px] font-mono">
                #{row.original.id.slice(-6).toUpperCase()}
            </span>
        ),
    },
    {
        accessorKey: "retreatTitle",
        header: "Retreat Title",
        cell: ({ row }) => (
            <span className="font-bold text-[#1b254b] dark:text-white text-[14px] leading-tight mb-1">
                {row.original.retreatTitle}
            </span>
        ),
    },
    {
        accessorKey: "healerName",
        header: "Healer",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-[11px]">
                    {row.original.healerName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <span className="font-medium text-[#1b254b] dark:text-white text-[13px]">
                    {row.original.healerName}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "seekerName",
        header: "Seeker",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-[#1b254b] dark:text-white text-[13px]">
                    {row.original.seekerName}
                </span>
                <span className="text-[11px] text-[#A3AED0]">{row.original.seekerEmail}</span>
            </div>
        ),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
            <span className="font-bold text-[#1b254b] dark:text-white text-[14px]">
                {formatCurrency(row.original.amount, row.original.currency)}
            </span>
        ),
    },
    {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
            const status = (row.original.paymentStatus || "pending").toLowerCase()
            const isCancelled = status === "cancelled"
            return (
                <Badge
                    className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold capitalize shadow-sm border-none",
                        status === "succeeded"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : isCancelled
                                ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                    )}
                >
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "bookingDate",
        header: "Booking Date",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[13px] text-[#1b254b] dark:text-white font-medium">
                <Calendar className="h-3.5 w-3.5 text-[#A3AED0]" />
                {row.original.bookingDate}
            </div>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">
                        <MoreHorizontal className="h-4 w-4 text-[#A3AED0]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-2xl border-none shadow-2xl dark:bg-[#111C44] bg-white">
                    <Link to={`/bookings/retreats/${row.original.id}`}>
                        <DropdownMenuItem className="flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium rounded-xl cursor-pointer">
                            <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem 
                        onClick={() => row.original.paymentStatus !== 'cancelled' && onCancel(row.original.id, row.original.retreatTitle)}
                        disabled={row.original.paymentStatus === 'cancelled'}
                        className={cn(
                            "flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium rounded-xl cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10",
                            row.original.paymentStatus === 'cancelled' ? "text-gray-400 cursor-not-allowed opacity-50" : "text-red-500"
                        )}
                    >
                        <Trash2 className="h-4 w-4" /> 
                        {row.original.paymentStatus === 'cancelled' ? "Already Cancelled" : "Cancel Enrollment"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
]
