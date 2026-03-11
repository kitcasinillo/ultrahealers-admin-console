import { useAdminAuth } from "../contexts/AdminAuthContext";
import { StatsCard } from "../components/StatsCard";
import { Users, UserCheck, DollarSign, AlertCircle, DownloadCloud, Activity } from "lucide-react";

export function Dashboard() {
    useAdminAuth();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Overview</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Here's what's happening with the platform today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="hidden sm:flex items-center bg-[#F4F7FE] dark:bg-white/5 hover:bg-[#E2E8F0] dark:hover:bg-white/10 text-[#4318FF] dark:text-white font-semibold py-2.5 px-5 rounded-full transition-all text-sm">
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        Download Report
                    </button>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Registered Healers"
                    value="1,234"
                    description="+12% from last month"
                    icon={<UserCheck className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Total Registered Seekers"
                    value="8,401"
                    description="+4% from last month"
                    icon={<Users className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Revenue This Month"
                    value="$24,500"
                    description="+18% from last month"
                    icon={<DollarSign className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Active Disputes"
                    value="3"
                    description="+1 since yesterday"
                    icon={<AlertCircle className="h-6 w-6" />}
                    trend="down"
                />
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Revenue Trend</h3>
                        <button className="h-8 w-8 rounded-full bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#4318FF] dark:text-[#01A3B4]">
                            <Activity className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="h-[300px] flex items-center justify-center text-[#A3AED0] rounded-2xl bg-[#F4F7FE] dark:bg-white/5">
                        <span className="font-semibold text-sm">Chart Configuration Pending</span>
                    </div>
                </div>

                <div className="col-span-3 bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                    <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1.5 border-b border-gray-100 dark:border-white/5 pb-4">
                            <span className="text-sm font-bold text-[#1b254b] dark:text-white">New Seeker Registered</span>
                            <span className="text-xs font-medium text-[#A3AED0]">Just now</span>
                        </div>
                        <div className="flex flex-col gap-1.5 border-b border-gray-100 dark:border-white/5 pb-4">
                            <span className="text-sm font-bold text-[#1b254b] dark:text-white">Booking Created #1204</span>
                            <span className="text-xs font-medium text-[#A3AED0]">5 minutes ago</span>
                        </div>
                        <div className="flex flex-col gap-1.5 pb-2">
                            <span className="text-sm font-bold text-[#1b254b] dark:text-white">Dispute Opened #89</span>
                            <span className="text-xs text-red-500 font-bold">1 hour ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
