import { Bell, Search, LogOut } from "lucide-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export function TopBar() {
    const { logout } = useAdminAuth();

    return (
        <header className="sticky top-4 z-50 w-full rounded-full bg-white/70 dark:bg-[#111C44]/70 backdrop-blur-xl border border-white/20 dark:border-white/5 px-4 py-3 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] flex items-center justify-between mb-2">

            {/* Page Title Context / Breadcrumb area could go here, but keeping it clean for now */}
            <div className="flex-1 md:px-4 hidden md:flex items-center text-[#1b254b] dark:text-white font-bold text-lg">
                Pages / <span className="text-[#4318FF] dark:text-[#01A3B4] ml-1">Dashboard</span>
            </div>

            {/* Actions & Search */}
            <div className="flex items-center gap-4 bg-white dark:bg-[#0B1437] rounded-full px-3 py-2 shadow-sm border border-gray-50 dark:border-white/5 ml-auto">
                <div className="relative flex items-center bg-[#F4F7FE] dark:bg-[#111C44] rounded-full px-4 py-1.5 w-[200px] lg:w-[260px]">
                    <Search className="h-4 w-4 text-[#A3AED0]" />
                    <input
                        type="search"
                        placeholder="Search..."
                        className="bg-transparent border-none text-sm w-full pl-3 outline-none text-[#1b254b] dark:text-white placeholder:text-[#A3AED0]"
                    />
                </div>

                <div className="flex items-center gap-1.5 pl-2">
                    <button className="h-10 w-10 flex items-center justify-center rounded-full text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white hover:bg-[#F4F7FE] dark:hover:bg-[#111C44] transition-colors relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0B1437]"></span>
                    </button>

                    <button
                        onClick={logout}
                        title="Logout"
                        className="h-10 w-10 flex items-center justify-center rounded-full text-[#A3AED0] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>

                    <button className="ml-1 rounded-full border-2 border-transparent hover:border-[#4318FF] transition-all">
                        <img
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=admin&backgroundColor=01A3B4"
                            alt="Admin"
                            className="h-9 w-9 rounded-full bg-[#F4F7FE] object-cover"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
}
