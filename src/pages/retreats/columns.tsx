import { type ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { StatusBadge, type StatusType } from "../../components/StatusBadge"
import { Button } from "../../components/ui/button"
import { 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    CheckCircle,
    UserCircle,
    MapPin
} from "lucide-react"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"

export type Retreat = {
    id: string
    hostId: string
    hostName: string
    hostAvatar?: string
    title: string
    location: string
    startDate: string
    endDate: string
    price: number
    capacity: number
    bookedSpots: number
    status: StatusType
    revenue: number
}

interface ColumnProps {
    onApprove: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: string) => void;
}

export const getColumns = ({ onApprove, onDelete, onToggleStatus }: ColumnProps): ColumnDef<Retreat>[] => [
    {
        accessorKey: "hostName",
        header: "Host/Healer",
        cell: ({ row }) => {
            const retreat = row.original
            return (
                <Link to={`/users/healers/${retreat.hostId}`} className="flex items-center gap-3 group">
                    <Avatar className="h-8 w-8 border border-gray-100 group-hover:border-primary/30 transition-colors">
                        <AvatarImage src={retreat.hostAvatar} alt={retreat.hostName} />
                        <AvatarFallback><UserCircle className="h-5 w-5 text-[#A3AED0]" /></AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-[#1b254b] dark:text-white group-hover:text-primary transition-colors">
                        {retreat.hostName}
                    </span>
                </Link>
            )
        },
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            const retreat = row.original
            return (
                <Link to={`/retreats/${retreat.id}`} className="font-bold text-[#1b254b] dark:text-white hover:text-primary transition-colors">
                    {retreat.title}
                </Link>
            )
        }
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5 text-[#A3AED0] text-sm font-medium">
                <MapPin className="h-3.5 w-3.5" />
                {row.original.location}
            </div>
        )
    },
    {
        id: "dates",
        header: "Dates",
        cell: ({ row }) => {
            const { startDate, endDate } = row.original
            const start = new Date(startDate)
            const end = new Date(endDate)
            
            const formatDate = (date: Date) => {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
            const year = end.getFullYear()
            
            return (
                <div className="text-sm font-semibold text-[#1b254b] dark:text-white">
                    {formatDate(start)} – {formatDate(end)}, {year}
                </div>
            )
        }
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            return (
                <div className="font-bold text-[#1b254b] dark:text-white">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)}
                </div>
            )
        },
    },
    {
        accessorKey: "capacity",
        header: "Cap.",
        cell: ({ row }) => <div className="text-center font-medium text-[#A3AED0]">{row.original.capacity}</div>
    },
    {
        id: "booked",
        header: "Booked Spots",
        cell: ({ row }) => {
            const { bookedSpots, capacity } = row.original
            const percentage = (bookedSpots / capacity) * 100
            
            return (
                <div className="flex flex-col gap-1 w-28">
                    <div className="flex justify-between text-[11px] font-bold text-[#A3AED0]">
                        <span>{bookedSpots} / {capacity}</span>
                        <span className={percentage >= 100 ? "text-orange-500" : ""}>{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F4F7FE] dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${percentage >= 100 ? 'bg-orange-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status") as StatusType} />,
    },
    {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("revenue"))
            return (
                <div className="font-extrabold text-[#4318FF] dark:text-[#01A3B4]">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Actions</div>,
        cell: ({ row }) => {
            const retreat = row.original
            return (
                <div className="flex justify-end gap-1">
                    {retreat.status === "pending_review" && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onApprove(retreat.id)}
                            className="h-8 w-8 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-full"
                            title="Approve Retreat"
                        >
                            <CheckCircle className="h-5 w-5" />
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#A3AED0]">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-xl p-2 w-48">
                            <DropdownMenuLabel className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider px-3 py-2">Management</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link to={`/retreats/${retreat.id}`} className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer">
                                    <Eye className="h-4 w-4 text-[#A3AED0]" />
                                    <span className="font-semibold text-sm">View Details</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer">
                                <Edit className="h-4 w-4 text-[#A3AED0]" />
                                <span className="font-semibold text-sm">Edit Fields</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onToggleStatus(retreat.id, retreat.status)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer"
                            >
                                <Activity className="h-4 w-4 text-[#A3AED0]" />
                                <span className="font-semibold text-sm">
                                    {retreat.status === "active" ? "Deactivate" : "Activate"}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5 mx-1" />
                            <DropdownMenuItem 
                                onClick={() => onDelete(retreat.id)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="font-semibold text-sm">Delete Retreat</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]

// To fix the Activity icon import
function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
