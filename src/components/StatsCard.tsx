import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
    return (
        <div className="flex items-start gap-4 rounded-2xl bg-white dark:bg-[#111C44] p-5 lg:p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 transition-transform hover:-translate-y-1 duration-300 min-h-[120px] h-full w-full overflow-hidden">
            {icon && (
                <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.05)]",
                    "bg-[#F4F7FE] text-[#4318FF] dark:bg-white/5 dark:text-white"
                )}>
                    {icon}
                </div>
            )}

            <div className="flex flex-col justify-between min-w-0 flex-1 h-full">
                <p className="text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider leading-tight mb-auto truncate">
                    {title}
                </p>
                <h4 className="text-2xl sm:text-[28px] font-extrabold text-[#1b254b] dark:text-white leading-none mt-2 truncate">
                    {value}
                </h4>
                {description && (
                    <p className={cn(
                        "text-[11px] font-medium mt-1.5 leading-relaxed truncate",
                        description.startsWith('-') ? "text-red-500" : "text-emerald-500"
                    )}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
