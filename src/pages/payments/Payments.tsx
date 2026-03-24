import { useState } from "react";
import { StatsCard } from "../../components/StatsCard";
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    Calendar,
    ChevronDown,
    Zap,
    Activity,
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

const data = [
    { name: 'Jan', revenue: 60, commission: 20 },
    { name: 'Feb', revenue: 150, commission: 45 },
    { name: 'Mar', revenue: 90, commission: 30 },
    { name: 'Apr', revenue: 220, commission: 80 },
    { name: 'May', revenue: 160, commission: 50 },
    { name: 'Jun', revenue: 310, commission: 110 },
    { name: 'Jul', revenue: 240, commission: 85 },
];

const pieData = [
    { name: 'Sessions', value: 100, color: '#4318FF' },
    { name: 'Premium', value: 0, color: '#312E81' },
    { name: 'Retreats', value: 0, color: '#6AD2FF' },
];

export function Payments() {
    const [timeRange, setTimeRange] = useState('month');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('revenue');
    
    // Custom Date Range States
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const ranges = [
        { id: 'all-time', label: 'All Time' },
        { id: 'month', label: 'This Month' },
        { id: 'week', label: 'This Week' },
        { id: 'custom', label: 'Custom Range' }
    ];

    const currentRange = ranges.find(r => r.id === timeRange)?.label || 'Select Range';

    return (
        <div className="space-y-6 pb-10" onClick={() => setIsDropdownOpen(false)}>
            {/* Header with Title and Tabs */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pt-4">
                <div className="flex flex-col gap-2">
                    <div className="flex">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4318FF]/10 text-[9px] font-black text-[#4318FF] uppercase tracking-wider">
                            <Zap className="h-2.5 w-2.5 fill-[#4318FF]" />
                            Platform Finance
                        </span>
                    </div>
                    <h2 className="text-4xl font-black tracking-[-0.03em] text-[#1b254b] dark:text-white uppercase leading-none">
                        Payments Center
                    </h2>
                </div>
                
                <div className="flex items-center bg-white dark:bg-white/5 p-1.5 rounded-full border border-[#E9EDF7] dark:border-white/10 shadow-sm">
                    {[
                        { id: 'revenue', label: 'REVENUE OVERVIEW' },
                        { id: 'commission', label: 'COMMISSION REPORTS' },
                        { id: 'premium', label: 'PREMIUM SUBSCRIPTIONS' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3.5 rounded-full text-[10px] font-black transition-all duration-300 ${
                                activeTab === tab.id
                                    ? "bg-white dark:bg-[#111C44] text-[#4318FF] shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-[1.02]"
                                    : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Performance Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E9EDF7] dark:border-white/5">
                <div>
                    <h4 className="text-[11px] font-black text-[#A3AED0] uppercase tracking-[0.2em]">
                        Performance Architecture
                    </h4>
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
                        <span className="text-xs font-black text-[#1b254b] dark:text-white uppercase">{currentRange}</span>
                        <ChevronDown className={`h-4 w-4 text-[#A3AED0] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div 
                            className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#1b254b] rounded-[30px] shadow-[0_20px_40px_rgba(11,20,55,0.12)] border border-[#E9EDF7] dark:border-white/5 p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-300"
                            onClick={(e) => e.stopPropagation()} // Prevent closure when clicking inside the dropdown
                        >
                            <div className="space-y-1 mb-4">
                                {ranges.map((range) => (
                                    <button
                                        key={range.id}
                                        onClick={() => {
                                            setTimeRange(range.id);
                                            if (range.id !== 'custom') setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-5 py-3 rounded-2xl text-xs font-black transition-all duration-200 ${
                                            timeRange === range.id 
                                                ? "text-[#4318FF] bg-[#F4F7FE] dark:bg-white/5 shadow-sm" 
                                                : "text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5"
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>

                            {/* Conditional Date Selection for Custom Range */}
                            {timeRange === 'custom' && (
                                <div className="mt-4 pt-4 border-t border-[#E9EDF7] dark:border-white/5 space-y-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider ml-1">From</label>
                                        <input 
                                            type="date" 
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-xs font-black text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF]/20 cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider ml-1">To</label>
                                        <input 
                                            type="date" 
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-xs font-black text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF]/20 cursor-pointer"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="w-full bg-[#4318FF] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#4318FF]/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Platform Revenue"
                    value="$48.00"
                    description="Earnings from all sources"
                    icon={<DollarSign className="h-6 w-6" />}
                    color="default"
                />
                <StatsCard
                    title="Net Platform Revenue"
                    value="$33.64"
                    description="After processing fees"
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="default"
                />
                <StatsCard
                    title="Gross Booking Volume"
                    value="$485.00"
                    description="Total processed through Stripe"
                    icon={<CreditCard className="h-6 w-6" />}
                    color="default"
                />
                <StatsCard
                    title="Premium Growth"
                    value="$0.00"
                    description="$120 upgrade performance"
                    icon={<ArrowUpRight className="h-6 w-6" />}
                    color="default"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-5 grid-cols-1 lg:grid-cols-12 mt-5">
                {/* Revenue Trajectory */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111C44] rounded-[40px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.04)] dark:shadow-none border border-transparent dark:border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-[#1b254b] dark:text-white uppercase leading-none">Revenue Trajectory</h3>
                            <p className="text-[11px] font-bold text-[#A3AED0] mt-2 uppercase tracking-tight opacity-70">Growth trends vs commission volume.</p>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#4318FF]" />
                                <span className="text-[10px] font-black text-[#A3AED0] uppercase">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#38B2AC]" />
                                <span className="text-[10px] font-black text-[#A3AED0] uppercase">Commission</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4318FF" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#38B2AC" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF780" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: 800 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 20px 40px 0 rgba(0,0,0,0.08)',
                                        backgroundColor: 'white',
                                        padding: '16px 20px'
                                    }}
                                    itemStyle={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}
                                    labelStyle={{ color: '#1b254b', fontWeight: 900, marginBottom: '6px', fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4318FF"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="commission"
                                    stroke="#38B2AC"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorComm)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="lg:col-span-4 bg-white dark:bg-[#111C44] rounded-[40px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.04)] dark:shadow-none border border-transparent dark:border-white/5">
                    <div>
                        <h3 className="text-2xl font-black text-[#1b254b] dark:text-white uppercase leading-none">Revenue Breakdown</h3>
                        <p className="text-[11px] font-bold text-[#A3AED0] mt-2 uppercase tracking-tight opacity-70">Total share by source.</p>
                    </div>

                    <div className="h-[280px] w-full relative mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                            <Activity className="h-6 w-6 text-[#A3AED0] opacity-30 mb-1" />
                            <span className="text-[11px] font-black text-[#1b254b] dark:text-white uppercase tracking-widest">Sources</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-5">
                        {pieData.map((item) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[10px] font-black text-[#A3AED0] uppercase">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-[#1b254b] dark:text-white">
                                        {item.value.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-[#F4F7FE] dark:bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ 
                                            width: `${item.value}%`,
                                            backgroundColor: item.color 
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
