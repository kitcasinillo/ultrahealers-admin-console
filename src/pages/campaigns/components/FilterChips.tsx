import { X } from "lucide-react"

interface FilterChipProps {
    label: string
    onRemove: () => void
}

function FilterChip({ label, onRemove }: FilterChipProps) {
    return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4318FF]/10 text-[#4318FF] dark:bg-[#01A3B4]/10 dark:text-[#01A3B4] text-xs font-bold">
            {label}
            <button onClick={onRemove} className="hover:bg-[#4318FF]/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
            </button>
        </span>
    )
}

interface FilterChipsProps {
    searchQuery: string
    statusFilter: string
    audienceFilter: string
    dateRange?: string
    startDate: string
    endDate: string
    createdByFilter: string
    onClearSearch: () => void
    onClearStatus: () => void
    onClearAudience: () => void
    onClearDate: () => void
    onClearCreatedBy: () => void
    onClearAll: () => void
}

export function FilterChips({ 
    searchQuery, statusFilter, audienceFilter, dateRange = "All Time", startDate, endDate, createdByFilter,
    onClearSearch, onClearStatus, onClearAudience, onClearDate, onClearCreatedBy, onClearAll 
}: FilterChipsProps) {
    const hasDateFilter = dateRange !== "All Time" && (dateRange !== "Custom Range" || Boolean(startDate || endDate))
    const hasFilters = searchQuery || statusFilter !== "All" || audienceFilter !== "All" || hasDateFilter || createdByFilter
    if (!hasFilters) return null

    const dateChipLabel =
        dateRange === "Custom Range"
            ? `${startDate || '...'} to ${endDate || '...'}`
            : dateRange

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[#A3AED0]">Active filters:</span>
            {searchQuery && <FilterChip label={`"${searchQuery}"`} onRemove={onClearSearch} />}
            {statusFilter !== "All" && <FilterChip label={statusFilter} onRemove={onClearStatus} />}
            {audienceFilter !== "All" && <FilterChip label={audienceFilter} onRemove={onClearAudience} />}
            {hasDateFilter && <FilterChip label={dateChipLabel} onRemove={onClearDate} />}
            {createdByFilter && <FilterChip label={`By: ${createdByFilter}`} onRemove={onClearCreatedBy} />}
            <button onClick={onClearAll} className="text-xs font-bold text-[#A3AED0] hover:text-red-500 px-2">
                Clear all
            </button>
        </div>
    )
}
