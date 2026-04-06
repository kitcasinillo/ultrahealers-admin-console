import { Mail } from "lucide-react"

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
