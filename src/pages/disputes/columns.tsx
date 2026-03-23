import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Dispute, DisputeStatus } from "@/lib/disputes"
import { StatusBadge } from "@/components/StatusBadge"
import { format, isPast, isToday } from "date-fns"
import { Link } from "react-router-dom"
import { Copy, Eye, AlertTriangle, Search, Mail, MoreHorizontal } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

// Define colors for dispute types
const typeStyles: Record<string, string> = {
  no_show: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  quality: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  safety: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refund_request: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
};

const typeLabels: Record<string, string> = {
  no_show: "No Show",
  quality: "Quality",
  safety: "Safety",
  refund_request: "Refund Request",
  other: "Other"
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_review: "In Review",
  resolved_refunded: "Resolved (Refunded)",
  resolved_partial_refund: "Resolved (Partial)",
  resolved_credit: "Resolved (Credit)",
  denied: "Denied",
};

const statusColors: Record<string, string> = {
  open: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  in_review: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  resolved_refunded: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  resolved_partial_refund: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  resolved_credit: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  denied: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

export interface DisputesColumnsActions {
  onMarkInReview: (id: string) => void;
  onEscalate: (id: string) => void;
  onSendEmail: (id: string) => void;
  onCopyPath?: (msg: string) => void;
}

export const getColumns = (actions: DisputesColumnsActions): ColumnDef<Dispute>[] => [
  {
    accessorKey: "id",
    header: "Dispute ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const severity = row.original.severity;
      const isOverdue = row.original.isOverdue;
      return (
        <div 
          className="flex items-center gap-2 font-mono text-sm text-gray-800 dark:text-gray-200"
          data-safety={severity === 'safety'}
          data-overdue={isOverdue}
        >
          <span>{id}</span>
          <button onClick={() => {
            navigator.clipboard.writeText(id);
            if (actions.onCopyPath) actions.onCopyPath('ID copied');
          }} className="text-gray-400 hover:text-gray-700 transition" title="Copy ID">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const tStyle = typeStyles[type] || typeStyles.other;
      const tLabel = typeLabels[type] || "Other";
      return <Badge variant="secondary" className={`${tStyle} border-none`}>{tLabel}</Badge>;
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = row.getValue("severity") as string;
      if (severity === "safety") {
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white border-red-500 font-bold px-2 py-0.5 whitespace-nowrap">
            Safety
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-200 dark:border-gray-800 font-medium px-2 py-0.5">
          Normal
        </Badge>
      );
    },
  },
  {
    accessorKey: "bookingId",
    header: "Booking",
    cell: ({ row }) => {
      const bookingId = row.getValue("bookingId") as string;
      return (
        <Link to={`/bookings/sessions/${bookingId}`} className="text-blue-600 dark:text-blue-400 hover:underline">
          {bookingId.substring(0, 8)}...
        </Link>
      );
    },
  },
  {
    accessorKey: "seekerName",
    header: "Seeker",
    cell: ({ row }) => {
      return (
        <Link to={`/users/seekers/${row.original.seekerId}`} className="text-gray-900 dark:text-gray-100 hover:underline font-medium">
          {row.getValue("seekerName")}
        </Link>
      );
    },
  },
  {
    accessorKey: "healerName",
    header: "Healer",
    cell: ({ row }) => {
      return (
        <Link to={`/users/healers/${row.original.healerId}`} className="text-gray-900 dark:text-gray-100 hover:underline font-medium">
          {row.getValue("healerName")}
        </Link>
      );
    },
  },
  {
    accessorKey: "requestedAmount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("requestedAmount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency || "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as DisputeStatus;
      const label = statusLabels[status] || status;
      const colorClass = statusColors[status] || statusColors.denied;
      return (
        <StatusBadge status={label as any} className={colorClass} />
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted At",
    cell: ({ row }) => {
      const dateStr = row.getValue("submittedAt") as string;
      if (!dateStr) return null;
      return <div className="text-sm whitespace-nowrap">{format(new Date(dateStr), "MMM d, yyyy")}</div>;
    },
  },
  {
    accessorKey: "responseDueAt",
    header: "Response Due",
    cell: ({ row }) => {
      const dateStr = row.getValue("responseDueAt") as string;
      if (!dateStr) return null;
      const date = new Date(dateStr);
      const past = isPast(date) && !isToday(date);
      const status = row.original.status;
      const isOpenOrReview = status === 'open' || status === 'in_review';
      
      const isDueSoon = date.getTime() < Date.now() + 24 * 60 * 60 * 1000 && !past && !isToday(date);
      
      if (past && isOpenOrReview) {
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="text-red-600 font-bold text-sm whitespace-nowrap">{format(date, "MMM d, yyyy")}</span>
            <Badge variant="destructive" className="h-5 text-[10px] px-1 py-0 bg-red-600 text-white">Overdue</Badge>
          </div>
        );
      } else if (isDueSoon && isOpenOrReview) {
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="text-orange-500 font-bold text-sm whitespace-nowrap">{format(date, "MMM d, yyyy")}</span>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 h-5 text-[10px] px-1 py-0 border">Due Soon</Badge>
          </div>
        );
      }
      return <div className="text-sm whitespace-nowrap">{format(date, "MMM d, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/disputes/${id}`} className="flex items-center cursor-pointer">
                <Eye className="mr-2 h-4 w-4" /> View detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status === 'open' && (
              <DropdownMenuItem onClick={() => actions.onMarkInReview(id)} className="cursor-pointer">
                <Search className="mr-2 h-4 w-4" /> Mark as In Review
              </DropdownMenuItem>
            )}
            {row.original.severity !== 'safety' && (
              <DropdownMenuItem onClick={() => actions.onEscalate(id)} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                <AlertTriangle className="mr-2 h-4 w-4" /> Escalate to Safety
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => actions.onSendEmail(id)} className="cursor-pointer">
              <Mail className="mr-2 h-4 w-4" /> Send Email Notification
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
