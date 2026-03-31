import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { Outlet } from "react-router-dom";

export function AdminLayout() {
    return (
        <div className="flex h-screen w-full bg-[#f4f7fe] dark:bg-[#0B1437] overflow-hidden relative font-sans text-[#1b254b] dark:text-white">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden relative">
                <main className="flex-1 overflow-hidden px-4 sm:px-6 md:px-8 pb-10 pt-4 relative flex flex-col">
                    <TopBar />
                    <div className="mx-auto w-full max-w-7xl mt-6 flex-1 overflow-hidden flex flex-col">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
