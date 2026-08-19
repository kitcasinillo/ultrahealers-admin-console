import { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";

export function AdminLayout() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen w-full bg-[#f4f7fe] dark:bg-[#0B1437] overflow-hidden relative font-sans text-[#1b254b] dark:text-white">
            <Sidebar
                isMobileOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
            />
            <div className="flex flex-col flex-1 overflow-hidden relative">
                <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-10 pt-4">
                    <TopBar onMenuClick={() => setIsMobileOpen(prev => !prev)} />
                    <div className="w-full mt-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

