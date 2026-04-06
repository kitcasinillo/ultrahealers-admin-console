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
        <div className="flex items-center rounded-2xl bg-white dark:bg-[#111C44] p-5 lg:p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 transition-transform hover:-translate-y-1 duration-300 h-full w-full">
            {icon && (
                <div className={cn(
                    "flex h-[56px] w-[56px] items-center justify-center rounded-full mr-4 shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.05)]",
                    "bg-[#F4F7FE] text-[#4318FF] dark:bg-white/5 dark:text-white"
                )}>
                    {icon}
                </div>
            )}

            <div className="flex flex-col">
                <p className="text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider mb-1">
                    {title}
                </p>
                <div className="flex flex-col">
                    <h4 className="text-2xl sm:text-[26px] font-extrabold text-[#1b254b] dark:text-white leading-tight">
                        {value}
                    </h4>
                    {description && (
                        <p className={cn(
                            "text-[11px] font-medium mt-1 leading-relaxed",
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
