import { useState } from "react";
import { StatsCard } from "../../components/StatsCard";
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    Calendar,
    ChevronDown,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const data = [
    { name: 'Jan', revenue: 4000, commission: 2400 },
    { name: 'Feb', revenue: 3000, commission: 1398 },
    { name: 'Mar', revenue: 2000, commission: 9800 },
    { name: 'Apr', revenue: 2780, commission: 3908 },
    { name: 'May', revenue: 1890, commission: 4800 },
    { name: 'Jun', revenue: 2390, commission: 3800 },
    { name: 'Jul', revenue: 3490, commission: 4300 },
];

const distributionData = [
    { name: 'Session Commissions', value: 45000 },
    { name: 'Premium Subscriptions', value: 30000 },
    { name: 'Retreat Platform Fees', value: 15000 },
    { name: 'Others', value: 5400 },
];

const COLORS = ['#4318FF', '#39B2AB', '#6AD2FF', '#EFF4FB'];

export function Payments() {
    const [timeRange, setTimeRange] = useState('month');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const ranges = [
        { id: 'all-time', label: 'All Time' },
        { id: 'month', label: 'This Month' },
        { id: 'week', label: 'This Week' },
        { id: 'custom', label: 'Custom Range' }
    ];

    const currentRange = ranges.find(r => r.id === timeRange)?.label || 'Select Range';

    return (
        <div className="space-y-6" onClick={() => setIsDropdownOpen(false)}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Revenue Overview</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Track platform revenue, commissions, and payouts.
                    </p>
                </div>
                <div className="relative">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(!isDropdownOpen);
                        }}
                        className="flex items-center gap-3 bg-white dark:bg-[#111C44] px-5 py-2.5 rounded-2xl border border-[#E9EDF7] dark:border-white/5 shadow-sm transition-all hover:border-[#4318FF] dark:hover:border-[#01A3B4] group"
                    >
                        <Calendar className="h-4 w-4 text-[#A3AED0] group-hover:text-[#4318FF] transition-colors" />
                        <span className="text-sm font-bold text-[#1b254b] dark:text-white">{currentRange}</span>
                        <ChevronDown className={`h-4 w-4 text-[#A3AED0] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1b254b] rounded-2xl shadow-[0_10px_30px_0_rgba(11,20,55,0.1)] border border-[#E9EDF7] dark:border-white/5 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {ranges.map((range) => (
                                <button
                                    key={range.id}
                                    onClick={() => {
                                        setTimeRange(range.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${
                                        timeRange === range.id 
                                            ? "text-[#4318FF] dark:text-[#01A3B4] bg-[#F4F7FE] dark:bg-white/5" 
                                            : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Platform Revenue"
                    value="$143,280.80"
                    description="Aggregate earnings"
                    icon={<DollarSign className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Net Platform Revenue"
                    value="$124,592.00"
                    description="After Stripe fees"
                    icon={<TrendingUp className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Gross Booking Volume"
                    value="$845,920.00"
                    description="Total through Stripe"
                    icon={<CreditCard className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Premium Revenue"
                    value="$12,360.00"
                    description="$120/healer/yr"
                    icon={<ArrowUpRight className="h-6 w-6" />}
                    trend="up"
                />
            </div>

            <div className="grid gap-5 grid-cols-1 lg:grid-cols-12 mt-5">
                {/* Revenue Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111C44] rounded-[30px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white leading-none">Revenue Growth</h3>
                            <p className="text-xs font-medium text-[#A3AED0] mt-1.5">Monthly revenue vs commission trend</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#4318FF]" />
                                <span className="text-xs font-bold text-[#A3AED0]">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#39B2AB]" />
                                <span className="text-xs font-bold text-[#A3AED0]">Commission</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4318FF" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#39B2AB" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#39B2AB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#E9EDF780" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 600 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '20px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px 0 rgba(11,20,55,0.06)',
                                        backgroundColor: 'white',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                                    labelStyle={{ color: '#1b254b', fontWeight: 800, marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4318FF"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="commission"
                                    stroke="#39B2AB"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorComm)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Category */}
                <div className="lg:col-span-4 bg-white dark:bg-[#111C44] rounded-[30px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white leading-none">Category Distribution</h3>
                            <p className="text-xs font-medium text-[#A3AED0] mt-1.5">Revenue share by service type</p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={35}>
                                    {distributionData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 space-y-4">
                        {distributionData.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-sm font-bold text-[#A3AED0]">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-[#1b254b] dark:text-white">
                                    {((item.value / distributionData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Revenue & Commission Models */}
            <div className="grid gap-5 md:grid-cols-2 mt-5">
                <div className="bg-[#4318FF] rounded-[30px] p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold opacity-80">Quick Summary</h3>
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <h4 className="text-4xl font-extrabold mt-6">$95,400.00</h4>
                            <p className="mt-2 text-white/70 font-medium">Net profit after all healer payouts and platform costs this quarter.</p>
                        </div>
                        <div className="mt-8">
                            <button className="bg-white text-[#4318FF] font-bold py-3 px-8 rounded-2xl text-sm transition-all hover:scale-105 active:scale-95 shadow-xl">
                                Download Annual Report
                            </button>
                        </div>
                    </div>
                    {/* Decorative blobs */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110" />
                    <div className="absolute bottom-[-20%] left-[-20%] w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                </div>

                <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-8 border border-transparent dark:border-white/5 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#1b254b] dark:text-white mb-4">Commission Model</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#F4F7FE] dark:bg-white/5 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#A3AED0]">SESSION COMMISSION</p>
                                        <span className="text-lg font-bold text-[#1b254b] dark:text-white">15.0% Total Cut</span>
                                        <p className="text-[10px] font-medium text-[#A3AED0]">10% Healer + 5% Seeker Fee</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-[#F4F7FE] dark:bg-white/5 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#39B2AB]/10 flex items-center justify-center text-[#39B2AB]">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#A3AED0]">PREMIUM PLAN</p>
                                        <span className="text-lg font-bold text-[#1b254b] dark:text-white">$120.00 / YEAR</span>
                                        <p className="text-[10px] font-medium text-[#A3AED0]">Flat platform fee for healers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-48 text-center bg-[#F4F7FE] dark:bg-white/5 rounded-3xl p-6 border border-dashed border-[#A3AED0] dark:border-white/10">
                        <p className="text-xs font-bold text-[#A3AED0] mb-2 uppercase tracking-tight">Active Plan</p>
                        <span className="text-2xl font-black text-[#4318FF] dark:text-white">ULTRA 25</span>
                        <p className="text-[10px] font-medium text-[#A3AED0] mt-2">Default platform-wide commission structure.</p>
                        <button className="mt-4 text-[#4318FF] dark:text-[#01A3B4] text-xs font-black hover:underline">Edit Policy</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
