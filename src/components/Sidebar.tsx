import { NavLink } from "react-router-dom";
import { Users, LayoutDashboard, List, Activity, Settings, UserCircle, MessageSquareWarning, CreditCard, Mail, Calendar, BarChart3, Search, Bell, Home, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isMobileOpen?: boolean;
    onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const handleNavClick = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Logo area */}
            <div className="h-28 flex flex-col items-center justify-center border-b border-gray-100 dark:border-white/5 mx-6 shrink-0">
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
                        onClick={handleNavClick}
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
                            onClick={handleNavClick}
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
                            onClick={handleNavClick}
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
                            onClick={handleNavClick}
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
                            to="/retreats"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Calendar className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Retreats</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/bookings/sessions"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Clock className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Session Bookings</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/disputes"
                            onClick={handleNavClick}
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
                    <p className="px-8 text-sm font-bold text-[#A3AED0] mb-4 uppercase tracking-wider">
                        App Management
                    </p>
                    <div className="space-y-1">
                        <NavLink
                            to="/modalities"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <List className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Modalities</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="px-8 text-sm font-bold text-[#A3AED0] mb-4 uppercase tracking-wider">
                        Finance
                    </p>
                    <div className="space-y-1">
                        <NavLink
                            to="/finance"
                            onClick={handleNavClick}
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
                            onClick={handleNavClick}
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
                        Reports
                    </p>
                    <div className="space-y-1">
                        <NavLink
                            to="/reports/overview"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Activity className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Platform Overview</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/reports/analytics"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <BarChart3 className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Web Analytics</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/reports/financial"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <BarChart3 className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Financial Report</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/reports/disputes"
                            onClick={handleNavClick}
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
                        <NavLink
                            to="/reports/campaigns"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Activity className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Campaigns</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/reports/users"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Users className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Users</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/reports/bookings"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Calendar className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Bookings</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                        <NavLink
                            to="/reports/retreats"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Home className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Retreats</span>
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
                    <div className="space-y-1">
                        <NavLink
                            to="/modalities"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                    isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <List className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                    <span>Modalities</span>
                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                                </>
                            )}
                        </NavLink>
                    </div>
                    <NavLink
                        to="/notifications"
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                            cn("flex items-center gap-4 px-8 py-3.5 text-[15px] font-semibold transition-all group relative",
                                isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white")
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Bell className={cn("h-5 w-5 transition-colors", isActive ? "text-[#4318FF] dark:text-white" : "text-[#A3AED0] group-hover:text-[#4318FF] dark:group-hover:text-white")} />
                                <span>Notifications</span>
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-[#4318FF] dark:bg-[#01A3B4] rounded-l-full" />}
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to="/seo"
                        onClick={handleNavClick}
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
                    <NavLink
                        to="/settings"
                        onClick={handleNavClick}
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
                </div>
            </nav>
        </div>
    );
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
    return (
        <>
            {/* Desktop persistent sidebar */}
            <aside className="w-[290px] bg-white dark:bg-[#111C44] flex-col h-full hidden md:flex z-20 shrink-0 border-r border-gray-100 dark:border-white/5">
                <SidebarContent />
            </aside>

            {/* Mobile slide-over drawer overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    {/* Dark semi-transparent backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={onClose}
                    />
                    {/* Drawer panel */}
                    <aside className="relative w-[280px] max-w-[85vw] bg-white dark:bg-[#111C44] flex flex-col h-full z-50 shadow-2xl animate-in slide-in-from-left duration-200">
                        <button
                            data-uh-no-track="true"
                            onClick={onClose}
                            className="absolute top-5 right-4 p-2 rounded-xl text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors z-10"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <SidebarContent onClose={onClose} />
                    </aside>
                </div>
            )}
        </>
    );
}

