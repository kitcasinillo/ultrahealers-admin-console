import { Link } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../../../components/ui/badge"
import { MoreHorizontal, Eye, Mail, Calendar, Tag, Trash2, Activity } from "lucide-react"
import { Button } from "../../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import type { Booking } from "../../../lib/bookings"
import { formatDateTime, formatCurrency } from "../../../lib/bookings"
import { cn } from "../../../lib/utils"

const StatusIcon = ({ active, title }: { active: boolean, title: string }) => (
    <div
        className={cn(
            "p-1.5 rounded-full transition-all flex items-center justify-center",
            active ? "bg-green-50 dark:bg-green-500/10 text-green-500" : "bg-gray-50 dark:bg-white/5 text-gray-300 opacity-40"
        )}
        title={title}
    >
        <Activity className="h-3.5 w-3.5" />
    </div>
)

export const getSessionColumns = (onCancel: (id: string, name: string) => void): ColumnDef<Booking>[] => [
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
        accessorKey: "listingTitle",
        header: "Listing",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-[#1b254b] dark:text-white text-[14px] leading-tight mb-1">
                    {row.original.listingTitle}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A3AED0]">
                    <Tag className="h-3 w-3" />
                    {row.original.modality || "Healing"}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "healerName",
        header: "Healer",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-[11px]">
                    {row.original.healerName.split(' ').map(n => n[0]).join('')}
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
        accessorKey: "sessionDate",
        header: "Session Date",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[13px] text-[#1b254b] dark:text-white font-medium">
                <Calendar className="h-3.5 w-3.5 text-[#A3AED0]" />
                <div className="flex flex-col">
                    <span>{row.original.sessionDate}</span>
                    <span className="text-[11px] text-[#A3AED0] font-normal">{row.original.sessionTime}</span>
                </div>
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
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-[10px] font-bold border-gray-200 text-[#A3AED0]">
                {row.original.currency}
            </Badge>
        ),
    },
    {
        id: "commission",
        header: "Commission",
        cell: ({ row }) => {
            const platformFee = row.original.amount * 0.15
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-green-600 dark:text-green-400 text-[13px]">
                        +{formatCurrency(platformFee, row.original.currency)}
                    </span>
                    <span className="text-[10px] text-[#A3AED0] font-medium">15% Fee</span>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status Flags",
        cell: ({ row }) => {
            const status = row.original.status || {}
            return (
                <div className="flex items-center gap-1.5">
                    <StatusIcon active={!!status['invite-email-to-seeker']} title="Seeker Email Sent" />
                    <StatusIcon active={!!status['invite-email-to-healer']} title="Healer Email Sent" />
                    <StatusIcon active={!!status['booking-confirmed-by-healer']} title="Confirmed" />
                    <StatusIcon active={!!status['booking-marked-as-complete-by-healer']} title="Completed" />
                </div>
            )
        },
    },
    {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
            const status = (row.original.paymentStatus || "pending").toLowerCase()
            const isCancelled = status === "cancelled"
            const isSucceeded = status === "succeeded"
            
            return (
                <Badge
                    className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold capitalize shadow-sm border-none transition-colors",
                        isSucceeded 
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400"
                            : isCancelled
                                ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400"
                                : "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-400"
                    )}
                >
                    <div className={cn(
                        "mr-1.5 h-1.5 w-1.5 rounded-full",
                        isSucceeded ? "bg-green-600" : isCancelled ? "bg-red-600" : "bg-orange-600"
                    )} />
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
            <span className="text-[12px] text-[#A3AED0] font-medium">
                {formatDateTime(row.original.createdAt).split(',')[0]}
            </span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-[#A3AED0]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-2xl border-none shadow-2xl dark:bg-[#111C44] backdrop-blur-md bg-white/90">
                    <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">Management</DropdownMenuLabel>
                    <Link to={`/bookings/sessions/${row.original.id}`}>
                        <DropdownMenuItem className="flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium text-[#1b254b] dark:text-white rounded-xl cursor-pointer focus:bg-gray-50 dark:focus:bg-white/5">
                            <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium text-[#1b254b] dark:text-white rounded-xl cursor-pointer focus:bg-gray-50 dark:focus:bg-white/5">
                        <Mail className="h-4 w-4" /> Resend Emails
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-gray-100/50 dark:bg-white/5" />
                    <DropdownMenuItem
                        onClick={() => row.original.paymentStatus !== 'cancelled' && onCancel(row.original.id, row.original.listingTitle)}
                        disabled={row.original.paymentStatus === 'cancelled'}
                        className={cn(
                            "flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium rounded-xl cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10",
                            row.original.paymentStatus === 'cancelled' ? "text-gray-400 cursor-not-allowed opacity-50" : "text-red-500"
                        )}
                    >
                        <Trash2 className="h-4 w-4" /> 
                        {row.original.paymentStatus === 'cancelled' ? "Already Cancelled" : "Cancel Booking"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
]
