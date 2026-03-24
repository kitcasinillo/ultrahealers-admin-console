import { cn } from "@/lib/utils";

export type StatsCardColor = "primary" | "success" | "danger" | "warning" | "info" | "purple" | "default";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    color?: StatsCardColor;
}

export function StatsCard({ title, value, description, icon, trend = "neutral", color }: StatsCardProps) {
    const iconColorStyles = {
        primary: "bg-[#F4F7FE] text-[#4318FF] dark:bg-[#4318FF]/10 dark:text-[#4318FF]",
        success: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-500",
        danger: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-500",
        warning: "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-500",
        info: "bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-500",
        purple: "bg-purple-50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-500",
        default: "bg-[#F4F7FE] text-[#4318FF] dark:bg-white/5 dark:text-[#01A3B4]"
    };

    const textColorStyles = {
        primary: "text-[#4318FF]",
        success: "text-emerald-500",
        danger: "text-red-500",
        warning: "text-orange-500",
        info: "text-sky-500",
        purple: "text-purple-500",
        default: "text-[#A3AED0]"
    };

    const getIconClasses = () => {
        if (color) return iconColorStyles[color];
        if (trend === "up") return iconColorStyles.success;
        if (trend === "down") return iconColorStyles.danger;
        return iconColorStyles.default;
    };

    const getTextClasses = () => {
        if (color) return textColorStyles[color];
        if (trend === "up") return textColorStyles.success;
        if (trend === "down") return textColorStyles.danger;
        return textColorStyles.default;
    };

    return (
        <div className="flex items-center rounded-2xl bg-white dark:bg-[#111C44] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 transition-transform hover:-translate-y-1 duration-300">
            {icon && (
                <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full mr-4 shrink-0 shadow-sm transition-colors",
                    getIconClasses()
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
                            "text-xs font-bold mt-2 transition-colors",
                            getTextClasses()
                        )}>
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
