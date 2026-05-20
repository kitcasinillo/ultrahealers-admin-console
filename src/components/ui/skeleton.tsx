import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-[#F4F7FE] dark:bg-white/5", className)}
            {...props}
        />
    )
}

export { Skeleton }

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
export function ReportSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64 rounded-lg" />
                    <Skeleton className="h-4 w-96 rounded-md" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-48 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <StatsCardSkeleton key={i} />
                ))}
            </div>

            {/* Chart Grid 1 */}
            <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
                <div className="bg-white dark:bg-[#111C44] p-6 rounded-3xl border border-transparent dark:border-white/5 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
                <div className="bg-white dark:bg-[#111C44] p-6 rounded-3xl border border-transparent dark:border-white/5 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>

            {/* Chart Grid 2 */}
            <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
                <div className="bg-white dark:bg-[#111C44] p-6 rounded-3xl border border-transparent dark:border-white/5 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[350px] w-full" />
                </div>
                <div className="bg-white dark:bg-[#111C44] p-6 rounded-3xl border border-transparent dark:border-white/5 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[350px] w-full" />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white dark:bg-[#111C44] p-6 rounded-3xl border border-transparent dark:border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                </div>
                <div className="space-y-4">
                    <div className="flex gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 py-2">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
