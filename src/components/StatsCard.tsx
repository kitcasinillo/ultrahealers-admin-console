import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, description, icon, trend = "neutral" }: StatsCardProps) {
    return (
        <div className="flex items-center rounded-2xl bg-white dark:bg-[#111C44] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 transition-transform hover:-translate-y-1 duration-300">
            {icon && (
                <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full mr-4 shrink-0 shadow-sm",
                    trend === "up" ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10" :
                        trend === "down" ? "bg-red-50 text-red-500 dark:bg-red-500/10" :
                            "bg-[#F4F7FE] text-[#4318FF] dark:bg-white/5 dark:text-[#01A3B4]"
                )}>
                    {icon}
                </div>
            )}

            <div className="flex flex-col">
                <p className="text-sm font-medium text-[#A3AED0] mb-1">
                    {title}
                </p>
                <div className="flex flex-col">
                    <h4 className="text-2xl font-bold text-[#1b254b] dark:text-white leading-none">
                        {value}
                    </h4>
                    {description && (
                        <p className={cn(
                            "text-xs font-bold mt-2",
                            trend === "up" ? "text-emerald-500" :
                                trend === "down" ? "text-red-500" :
                                    "text-[#A3AED0]"
                        )}>
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
