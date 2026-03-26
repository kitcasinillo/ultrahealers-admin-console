import { NavLink } from "react-router-dom";
import { Users, LayoutDashboard, List, Activity, Settings, UserCircle, MessageSquareWarning, CreditCard, Mail, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    return (
        <aside className="w-[290px] bg-white dark:bg-[#111C44] flex-col h-full hidden md:flex z-20 shrink-0">
            {/* Logo area */}
            <div className="h-28 flex flex-col items-center justify-center border-b border-gray-100 dark:border-white/5 mx-6">
                <div className="flex items-center gap-3 font-bold text-2xl tracking-tight text-[#1b254b] dark:text-white mt-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #01A3B4, #7C3AED)" }}>
                        <Activity className="h-5 w-5" />
                    </div>
                    <span>UltraHealers</span>
                </div>
            </div>

            {/* Navigation area */}
            <nav className="flex-1 py-8 overflow-y-auto font-medium scrollbar-hide">
                <div className="mb-8 relative">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <LayoutDashboard className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                <span>Dashboard</span>
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                            </>
                        )}
                    </NavLink>
                </div>

                <div className="mb-8">
                    <p className="px-8 text-sm font-bold text-[#A3AED0] mb-4">
                        Users
                    </p>
                    <div className="space-y-1">
                        <NavLink
                            to="/users/healers"
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <UserCircle className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Healers</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/users/seekers"
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Users className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Seekers</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="px-8 text-sm font-bold text-[#A3AED0] mb-4">
                        Platform Management
                    </p>
                    <div className="space-y-1">
                        <NavLink
                            to="/listings"
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <List className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Listings</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/disputes"
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <MessageSquareWarning className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Disputes</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="px-8 text-sm font-bold text-[#A3AED0] mb-4">
                        Finance
                    </p>
                    <div className="space-y-1">
                        <NavLink
                            to="/finance"
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <CreditCard className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Finance</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/campaigns"
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Mail className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Campaigns</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="px-8 text-sm font-bold text-[#A3AED0] mb-4">
                        System
                    </p>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Settings className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                <span>Settings</span>
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to="/seo"
                        className={({ isActive }) =>
                            cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Search className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                <span>SEO Controls</span>
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                            </>
                        )}
                    </NavLink>
                </div>
            </nav>
        </aside>
    );
}
