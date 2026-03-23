interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-[#F4F7FE] dark:bg-white/5 ${className}`}
        />
    )
}

export function CampaignTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
            </div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
                </div>
            ))}
        </div>
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="flex items-center rounded-2xl bg-white dark:bg-[#111C44] p-6 border border-transparent dark:border-white/5">
            <Skeleton className="h-14 w-14 rounded-full mr-4 shrink-0" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
            </div>
        </div>
    )
}
