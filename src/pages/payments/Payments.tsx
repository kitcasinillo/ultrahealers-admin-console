import { useState, useEffect } from "react";
import { StatsCard } from "../../components/StatsCard";
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    Calendar,
    ChevronDown,
    Activity,
    PieChart as PieChartIcon
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "../../components/ui/button";
import { CommissionTable } from "./CommissionTable";
import { PremiumSubscriptionsTable } from "./PremiumSubscriptionsTable";

const COLORS = ['#4318FF', '#6AD2FF', '#EFF4FB'];
const FALLBACK_CHART_DATA = [
    { name: 'No Data', revenue: 0, commission: 0 },
];

export function Payments() {
    const [timeRange, setTimeRange] = useState('month');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [customDates, setCustomDates] = useState({ start: "", end: "" });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const queryParams = new URLSearchParams({
                    timeRange,
                    ...(timeRange === 'custom' && { startDate: customDates.start, endDate: customDates.end })
                });
                const response = await fetch(`${apiUrl}/api/admin/finance/revenue-stats?${queryParams}`);
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [timeRange, customDates.start, customDates.end]);

    const pieData = stats?.distribution ? [
        { name: 'Sessions', value: stats.distribution.sessionCommissions || 1 },
        { name: 'Premium', value: stats.distribution.premiumSubscriptions || 0 },
        { name: 'Retreats', value: stats.distribution.retreatPlatformFees || 0 },
    ] : [];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val);
    };

    const ranges = [
        { id: 'all-time', label: 'All Time' },
        { id: 'month', label: 'This Month' },
        { id: 'week', label: 'This Week' },
        { id: 'custom', label: 'Custom Range' }
    ];

    const currentRange = ranges.find(r => r.id === timeRange)?.label || 'Select Range';

    return (
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-8 block" onClick={() => setIsDropdownOpen(false)}>
            {/* Standard Global Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4318FF]/10 text-[#4318FF] text-[10px] font-black uppercase tracking-widest">
                        <Activity className="h-3 w-3" />
                        Platform Finance
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1b254b] dark:text-white uppercase leading-none">Payments Center</h2>
                </div>

                <div className="flex bg-white/50 dark:bg-[#111C44]/50 p-2 rounded-[24px] border border-[#E9EDF7] dark:border-white/5 backdrop-blur-xl shadow-sm">
                    <Tabs.List className="flex gap-1">
                        {['overview', 'commission', 'premium'].map((tab) => (
                            <Tabs.Trigger
                                key={tab}
                                value={tab}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === tab
                                        ? "bg-white dark:bg-[#1b254b] text-[#4318FF] dark:text-white shadow-sm"
                                        : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
                                    }`}
                            >
                                {tab === 'overview' ? 'Revenue Overview' : tab === 'commission' ? 'Commission Reports' : 'Premium Subscriptions'}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>
                </div>
            </div>

            {/* TAB CONTENT */}
            <Tabs.Content value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Metrics & Filter moved INSIDE Overview Content */}
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-[#A3AED0] uppercase tracking-[0.3em]">Performance Architecture</h3>
                         
                         {/* Integrated Date Picker for Overview Only */}
                         <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                                className="flex items-center gap-3 bg-white dark:bg-[#111C44] px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1b254b] dark:text-white border border-[#E9EDF7] dark:border-white/5 transition-all hover:border-[#4318FF] shadow-sm"
                            >
                                <Calendar className="h-3 w-3 text-[#A3AED0]" />
                                {currentRange}
                                <ChevronDown className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div 
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1b254b] rounded-[24px] shadow-2xl border border-[#E9EDF7] dark:border-white/5 py-3 z-50"
                                >
                                    <div className="px-2 space-y-1">
                                        {ranges.map((range) => (
                                            <button
                                                key={range.id}
                                                onClick={() => {
                                                    setTimeRange(range.id);
                                                    if (range.id !== 'custom') setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${timeRange === range.id
                                                    ? "text-[#4318FF] bg-[#F4F7FE] dark:bg-white/5"
                                                    : "text-[#A3AED0] hover:text-[#1b254b] hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                                                    }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                    {timeRange === 'custom' && (
                                        <div className="mt-3 px-4 py-4 border-t border-[#E9EDF7] dark:border-white/5 space-y-3">
                                            <input type="date" className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl p-3 text-[10px] font-black text-[#1b254b] dark:text-white" value={customDates.start} onChange={(e) => setCustomDates(p => ({ ...p, start: e.target.value }))} />
                                            <input type="date" className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl p-3 text-[10px] font-black text-[#1b254b] dark:text-white" value={customDates.end} onChange={(e) => setCustomDates(p => ({ ...p, end: e.target.value }))} />
                                            <Button size="sm" className="w-full bg-[#4318FF] text-white rounded-xl h-11 font-black text-[10px] uppercase tracking-widest" onClick={() => setIsDropdownOpen(false)}>Set Range</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard title="Total Platform Revenue" value={loading ? "..." : formatCurrency(stats?.totalPlatformRevenue || 0)} description="Earnings from all sources" icon={<DollarSign className="h-5 w-5" />} trend="up" />
                        <StatsCard title="Net Platform Revenue" value={loading ? "..." : formatCurrency(stats?.netPlatformRevenue || 0)} description="After processing fees" icon={<TrendingUp className="h-5 w-5" />} trend={Number(stats?.netPlatformRevenue) >= 0 ? 'up' : 'down'} />
                        <StatsCard title="Gross Booking Volume" value={loading ? "..." : formatCurrency(stats?.totalGrossBookingVolume || 0)} description="Total processed through Stripe" icon={<CreditCard className="h-5 w-5" />} trend="up" />
                        <StatsCard title="Premium Growth" value={loading ? "..." : formatCurrency(stats?.totalPremiumRevenue || 0)} description="$120 upgrade performance" icon={<ArrowUpRight className="h-5 w-5" />} trend="up" />
                    </div>
                </div>

                <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
                    {/* Main Performance Chart */}
                    <div className="lg:col-span-8 bg-white dark:bg-[#111C44] rounded-[40px] p-10 shadow-sm border border-transparent dark:border-white/5 group">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-[#1b254b] dark:text-white uppercase tracking-tight">Revenue Trajectory</h3>
                                <p className="text-sm font-medium text-[#A3AED0] mt-1">Growth trends vs commission volume.</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#4318FF]" /><span className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">Revenue</span></div>
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#6AD2FF]" /><span className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">Commission</span></div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.chartData || FALLBACK_CHART_DATA}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4318FF" stopOpacity={0.15} /><stop offset="95%" stopColor="#4318FF" stopOpacity={0} /></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#E9EDF780" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }} dy={20} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }} itemStyle={{ fontWeight: 900, fontSize: '14px' }} cursor={{ stroke: '#4318FF', strokeWidth: 2, strokeDasharray: '5 5' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={5} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="commission" stroke="#6AD2FF" strokeWidth={5} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue Sources Chart */}
                    <div className="lg:col-span-4 bg-white dark:bg-[#111C44] rounded-[40px] p-10 shadow-sm border border-transparent dark:border-white/5">
                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-[#1b254b] dark:text-white uppercase tracking-tight">Revenue Breakdown</h3>
                            <p className="text-sm font-medium text-[#A3AED0] mt-1">Total share by source.</p>
                        </div>

                        <div className="h-[280px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={85} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                                        {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <PieChartIcon className="h-6 w-6 text-[#A3AED0] mb-2 opacity-20" />
                                <span className="text-2xl font-black text-[#1b254b] dark:text-white leading-none">Sources</span>
                            </div>
                        </div>

                        <div className="mt-12 space-y-6">
                            {pieData.map((item, index) => (
                                <div key={item.name} className="group cursor-default">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-xs font-black text-[#1b254b] dark:text-white uppercase tracking-wider">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-[#4318FF]">{stats?.totalPlatformRevenue ? ((item.value / stats.totalPlatformRevenue) * 100).toFixed(1) : 0}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#F4F7FE] dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80" style={{ backgroundColor: COLORS[index % COLORS.length], width: `${stats?.totalPlatformRevenue ? (item.value / stats.totalPlatformRevenue) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Tabs.Content>

            <Tabs.Content value="commission" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CommissionTable />
            </Tabs.Content>

            <Tabs.Content value="premium" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PremiumSubscriptionsTable />
            </Tabs.Content>
        </Tabs.Root>
    );
}
