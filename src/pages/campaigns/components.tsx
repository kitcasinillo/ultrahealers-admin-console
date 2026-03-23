import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    MoreHorizontal,
    Mail,
    Pencil,
    Copy,
    TestTube,
    Send,
    Trash2,
    X,
} from "lucide-react"
import type { CampaignStatus, Campaign } from "./type"
import { STATUS_STYLES, STATUS_ICONS } from "./utils"

// StatusBadge Component
interface StatusBadgeProps {
    status: CampaignStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles = STATUS_STYLES[status]
    const isSending = status === "Sending"

    return (
        <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles.bg} ${styles.text} ${styles.darkBg} ${styles.darkText} ${isSending ? "animate-pulse" : ""}`}
        >
            {STATUS_ICONS[status]}
            {status}
        </div>
    )
}

// ActionMenu Component
interface ActionMenuProps {
    campaign: Campaign
    onDuplicate: (campaign: Campaign) => void
    onSendTest: (id: string) => void
    onSendNow: (id: string) => void
    onDelete: (campaign: Campaign) => void
}

export function ActionMenu({ campaign, onDuplicate, onSendTest, onSendNow, onDelete }: ActionMenuProps) {
    const canSend = campaign.status === "Draft" || campaign.status === "Scheduled"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#F4F7FE] dark:hover:bg-white/5 rounded-lg">
                    <MoreHorizontal className="h-4 w-4 text-[#A3AED0]" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-gray-100 dark:border-white/10 shadow-xl min-w-[160px]">
                <DropdownMenuItem asChild className="cursor-pointer font-bold text-[#1b254b] dark:text-white hover:text-[#4318FF] focus:text-[#4318FF]">
                    <Link to={`/campaigns/${campaign.id}/edit`} className="flex items-center">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer font-bold text-[#1b254b] dark:text-white hover:text-[#4318FF] focus:text-[#4318FF]"
                    onClick={() => onDuplicate(campaign)}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer font-bold text-[#1b254b] dark:text-white hover:text-[#4318FF] focus:text-[#4318FF]"
                    onClick={() => onSendTest(campaign.id)}
                >
                    <TestTube className="mr-2 h-4 w-4" />
                    Send Test
                </DropdownMenuItem>
                {canSend && (
                    <DropdownMenuItem
                        className="cursor-pointer font-bold text-[#4318FF] hover:bg-[#4318FF]/5"
                        onClick={() => onSendNow(campaign.id)}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Send Now
                    </DropdownMenuItem>
                )}
                <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                <DropdownMenuItem
                    className="cursor-pointer font-bold text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                    onClick={() => onDelete(campaign)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// FilterChip Component
interface FilterChipProps {
    label: string
    onRemove: () => void
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
    return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4318FF]/10 text-[#4318FF] dark:bg-[#01A3B4]/10 dark:text-[#01A3B4] text-xs font-bold">
            {label}
            <button onClick={onRemove} className="hover:bg-[#4318FF]/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
            </button>
        </span>
    )
}

// FilterChips Component
interface FilterChipsProps {
    searchQuery: string
    statusFilter: string
    audienceFilter: string
    onClearSearch: () => void
    onClearStatus: () => void
    onClearAudience: () => void
    onClearAll: () => void
}

export function FilterChips({ searchQuery, statusFilter, audienceFilter, onClearSearch, onClearStatus, onClearAudience, onClearAll }: FilterChipsProps) {
    const hasFilters = searchQuery || statusFilter !== "All" || audienceFilter !== "All"
    if (!hasFilters) return null

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[#A3AED0]">Active filters:</span>
            {searchQuery && <FilterChip label={`"${searchQuery}"`} onRemove={onClearSearch} />}
            {statusFilter !== "All" && <FilterChip label={statusFilter} onRemove={onClearStatus} />}
            {audienceFilter !== "All" && <FilterChip label={audienceFilter} onRemove={onClearAudience} />}
            <button onClick={onClearAll} className="text-xs font-bold text-[#A3AED0] hover:text-red-500 px-2">
                Clear all
            </button>
        </div>
    )
}

// EmptyState Component
interface EmptyStateProps {
    hasFilters: boolean
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-[#F4F7FE] dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-10 w-10 text-[#A3AED0]" />
            </div>
            <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">No campaigns found</h3>
            <p className="text-[#A3AED0] font-medium mt-1">
                {hasFilters
                    ? "Try adjusting your filters to find what you're looking for."
                    : "Create your first campaign to start reaching your users."}
            </p>
        </div>
    )
}
