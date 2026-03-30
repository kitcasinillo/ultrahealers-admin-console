import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = "active" | "inactive" | "draft" | "full" | "pending_review";

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
}

const statusMap: Record<StatusType, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    active: {
        label: "Active",
        variant: "outline",
        className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    },
    inactive: {
        label: "Inactive",
        variant: "secondary",
        className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    },
    draft: {
        label: "Draft",
        variant: "outline",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    },
    full: {
        label: "Full",
        variant: "default",
        className: "bg-blue-500 text-white border-transparent",
    },
    pending_review: {
        label: "Pending Review",
        variant: "outline",
        className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusMap[status] || { label: status, variant: "secondary", className: "" };

    return (
        <Badge 
            variant={config.variant} 
            className={cn("font-semibold px-2.5 py-0.5 rounded-full text-xs transition-colors", config.className, className)}
        >
            {config.label}
        </Badge>
    );
}
