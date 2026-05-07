import { useState, useEffect } from "react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { StatsCard } from "../components/StatsCard";
import { Users, UserCheck, DollarSign, AlertCircle, Activity, Loader2, Calendar, ChevronDown, Check } from "lucide-react";
import { fetchDashboardStats, exportDashboardStats, type DashboardStats } from "../lib/dashboard";
import { ExportDropdown } from "../components/common/ExportDropdown";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(val);
};

export function Dashboard() {
    useAdminAuth();
    
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("last_7_days");

    const rangeOptions = [
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'all_time', label: 'All Time' },
    ];

    const rangeLabels: Record<string, string> = {
        last_7_days: 'Last 7 Days',
        this_month: 'This Month',
        last_month: 'Last Month',
        all_time: 'All Time',
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchDashboardStats(range);
                if (mounted) setStats(data);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [range]);

    const handleDownloadReport = () => {
        if (stats) {
            exportDashboardStats(stats);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Overview</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Here's what's happening with the platform today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex justify-between sm:justify-start items-center gap-3 w-full sm:w-auto bg-white dark:bg-[#111C44] py-3 px-5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-[#1b254b] dark:text-white font-bold text-sm shadow-sm cursor-pointer">
                                <div className="flex items-center gap-2.5">
                                    <Calendar className="h-4 w-4 text-[#A3AED0] shrink-0" />
                                    <span className="whitespace-nowrap">{rangeLabels[range]}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-[#A3AED0] shrink-0 ml-1" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="min-w-[200px] w-[var(--radix-dropdown-menu-trigger-width)] p-2 rounded-2xl border-none shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                            {rangeOptions.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => setRange(opt.value)}
                                    className="flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer font-semibold text-[13px] text-[#1b254b] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 transition-colors data-[highlighted]:bg-[#F4F7FE] data-[highlighted]:text-[#4318FF] dark:data-[highlighted]:bg-white/5 dark:data-[highlighted]:text-white"
                                >
                                    {opt.label}
                                    {range === opt.value && <Check className="h-3.5 w-3.5 text-[#4318FF] dark:text-[#01A3B4]" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <ExportDropdown
                        onExportExcel={handleDownloadReport}
                        onExportPdf={handleDownloadReport}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#4318FF]" />
                </div>
            ) : (
                <>
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                        <StatsCard
                            title="Total Registered Healers"
                            value={stats?.totalHealers?.toString() || "0"}
                            description={stats?.healersChange || ""}
                            icon={<UserCheck className="h-6 w-6" />}
                            trend={stats?.healersChange?.startsWith('-') ? "down" : "up"}
                        />
                        <StatsCard
                            title="Total Registered Seekers"
                            value={stats?.totalSeekers?.toString() || "0"}
                            description={stats?.seekersChange || ""}
                            icon={<Users className="h-6 w-6" />}
                            trend={stats?.seekersChange?.startsWith('-') ? "down" : "up"}
                        />
                        <StatsCard
                            title="Revenue This Month"
                            value={formatCurrency(stats?.revenueThisMonth || 0)}
                            description={stats?.revenueChange || ""}
                            icon={<DollarSign className="h-6 w-6" />}
                            trend={stats?.revenueChange?.startsWith('-') ? "down" : "up"}
                        />
                        <StatsCard
                            title="Active Disputes"
                            value={stats?.activeDisputes?.toString() || "0"}
                            description={stats?.disputesChange || ""}
                            icon={<AlertCircle className="h-6 w-6" />}
                            trend={stats?.disputesChange?.startsWith('-') ? "up" : "down"}
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
                            <div className="w-full min-w-[0px]" style={{ height: "300px" }}>
                                {stats?.chartData && stats.chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
                                        <AreaChart data={stats.chartData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4318FF" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#E9EDF780" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }} tickFormatter={(val) => `$${val}`} />
                                            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }} itemStyle={{ fontWeight: 900, fontSize: '14px' }} cursor={{ stroke: '#4318FF', strokeWidth: 2, strokeDasharray: '5 5' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={5} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[#A3AED0] rounded-2xl bg-[#F4F7FE] dark:bg-white/5">
                                        <span className="font-semibold text-sm">No chart data available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-span-3 bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                {stats?.recentActivity?.length ? stats.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex flex-col gap-1.5 border-b border-gray-100 dark:border-white/5 pb-4 last:border-0">
                                        <span className={`text-sm font-bold ${activity.isRed ? 'text-red-500' : 'text-[#1b254b] dark:text-white'}`}>
                                            {activity.title}
                                        </span>
                                        <span className="text-xs font-medium text-[#A3AED0]">
                                            {new Date(activity.timestamp).toLocaleString()} • {typeof activity.status === 'string' ? activity.status : 'active'}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-[#A3AED0]">No recent activity.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
