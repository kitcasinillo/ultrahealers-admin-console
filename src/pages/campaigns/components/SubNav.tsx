import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

export function SubNav() {
    const tabs = [
        { name: "Campaigns", path: "/campaigns", end: true },
        { name: "Templates", path: "/campaigns/templates" },
        { name: "Unsubscribes", path: "/campaigns/unsubscribes" },
    ]

    return (
        <div className="flex items-center gap-8 border-b border-gray-100 dark:border-white/5 mb-8">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.path}
                    to={tab.path}
                    end={tab.end}
                    className={({ isActive }) =>
                        cn(
                            "py-4 text-sm font-bold transition-all relative",
                            isActive
                                ? "text-[#4318FF] dark:text-white"
                                : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white"
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            {tab.name}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4318FF] dark:bg-[#01A3B4] rounded-full" />
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    )
}
