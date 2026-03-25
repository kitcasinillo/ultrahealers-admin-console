import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/StatsCard"
import {
    ArrowLeft,
    Mail,
    MousePointer2,
    Eye,
    MoreVertical,
    Send,
    XCircle,
    UserMinus,
    AlertTriangle,
    Download,
    Pause,
    Play,
    Copy,
    Trash2,
    Clock,
} from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CampaignDetail() {
    const { id } = useParams()
    const [isPaused, setIsPaused] = useState(false)

    // Mock Data for Charts --
    const hourlyData = [
        { hour: '00:00', opens: 12, clicks: 2 },
        { hour: '02:00', opens: 8, clicks: 1 },
        { hour: '04:00', opens: 5, clicks: 0 },
        { hour: '06:00', opens: 45, clicks: 8 },
        { hour: '08:00', opens: 120, clicks: 24 },
        { hour: '10:00', opens: 250, clicks: 62 },
        { hour: '12:00', opens: 310, clicks: 88 },
        { hour: '14:00', opens: 280, clicks: 75 },
        { hour: '16:00', opens: 210, clicks: 45 },
        { hour: '18:00', opens: 180, clicks: 32 },
        { hour: '20:00', opens: 90, clicks: 15 },
        { hour: '22:00', opens: 40, clicks: 6 },
    ]

    const deviceData = [
        { name: 'Mobile', value: 65, color: '#4318FF' },
        { name: 'Desktop', value: 30, color: '#6AD2FF' },
        { name: 'Tablet', value: 5, color: '#EFF4FB' },
    ]

    const activityLog = [
        { id: 1, event: 'Campaign Launched', user: 'Admin System', time: '2026-03-01 09:00:00', type: 'sent' },
        { id: 2, event: 'First Open Detected', user: 'sarah.j@example.com', time: '2026-03-01 09:05:12', type: 'open' },
        { id: 3, event: 'Link Click: "Dashboard"', user: 'mike.ross@gmail.com', time: '2026-03-01 09:12:45', type: 'click' },
        { id: 4, event: 'Email Bounced', user: 'unknown@provider.net', time: '2026-03-01 09:15:00', type: 'bounce' },
        { id: 5, event: 'Unsubscribe Request', user: 'lisa.v@yahoo.com', time: '2026-03-01 10:30:22', type: 'unsubscribe' },
        { id: 6, event: 'Spam Report', user: 'hater@spam.com', time: '2026-03-01 11:45:10', type: 'spam' },
    ]

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="rounded-xl border-gray-200 dark:border-white/10">
                        <Link to="/campaigns">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white">
                                March Wellness Newsletter
                            </h2>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">Sent</Badge>
                        </div>
                        <p className="text-[#A3AED0] text-sm font-medium">ID: {id} • March 1, 2026 at 9:00 AM</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button 
                        variant="outline" 
                        className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white"
                        onClick={() => setIsPaused(!isPaused)}
                    >
                        {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                        {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    
                    <Button variant="outline" className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white">
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                    </Button>

                    <Button variant="outline" className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-gray-100 dark:border-white/5">
                            <DropdownMenuItem className="rounded-xl font-bold text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Campaign
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <StatsCard
                    title="Total Sent"
                    value="2,840"
                    description="Successfully queued"
                    icon={<Send className="h-6 w-6" />}
                />
                <StatsCard
                    title="Delivered"
                    value="2,812"
                    description="99.01% delivery rate"
                    icon={<Mail className="h-6 w-6" />}
                />
                <StatsCard
                    title="Opened"
                    value="1,280"
                    description="45.5% open rate"
                    icon={<Eye className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Clicked"
                    value="364"
                    description="12.9% click rate (CTR)"
                    icon={<MousePointer2 className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Unsubscribed"
                    value="14"
                    description="0.49% churn rate"
                    icon={<UserMinus className="h-6 w-6" />}
                    trend="neutral"
                />
            </div>

            {/* Negative Metrics */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#A3AED0] uppercase mb-1">Bounced</p>
                        <h4 className="text-xl font-black text-[#1b254b] dark:text-white">28</h4>
                        <p className="text-[10px] text-red-500 font-bold mt-1">Soft: 12 | Hard: 16</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500">
                        <XCircle className="h-5 w-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#A3AED0] uppercase mb-1">Spam Reports</p>
                        <h4 className="text-xl font-black text-[#1b254b] dark:text-white">2</h4>
                        <p className="text-[10px] text-amber-500 font-bold mt-1">Below industry limit</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-500">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 flex items-center justify-between lg:col-span-1 md:col-span-2">
                    <div>
                        <p className="text-xs font-bold text-[#A3AED0] uppercase mb-1">Forwarded</p>
                        <h4 className="text-xl font-black text-[#1b254b] dark:text-white">45</h4>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">Viral reach increased</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-500">
                        <Send className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Performance Over Time</h3>
                            <div className="flex gap-2">
                                <Badge className="bg-[#4318FF]/5 text-[#4318FF] border-none font-bold">Opens</Badge>
                                <Badge className="bg-[#6AD2FF]/5 text-[#6AD2FF] border-none font-bold">Clicks</Badge>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={hourlyData}>
                                    <defs>
                                        <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4318FF" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6AD2FF" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6AD2FF" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF4FB" />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 12, fontWeight: 600}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 12, fontWeight: 600}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ fontWeight: 800, color: '#1b254b' }}
                                    />
                                    <Area type="monotone" dataKey="opens" stroke="#4318FF" strokeWidth={3} fillOpacity={1} fill="url(#colorOpens)" />
                                    <Area type="monotone" dataKey="clicks" stroke="#6AD2FF" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Audience Interaction Log</h3>
                        <div className="space-y-4">
                            {activityLog.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F7FE] dark:bg-white/5 border border-transparent hover:border-gray-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                            log.type === 'sent' ? 'bg-blue-50 text-blue-500' :
                                            log.type === 'open' ? 'bg-purple-50 text-purple-500' :
                                            log.type === 'click' ? 'bg-emerald-50 text-emerald-500' :
                                            'bg-red-50 text-red-500'
                                        }`}>
                                            {log.type === 'sent' && <Send className="h-5 w-5" />}
                                            {log.type === 'open' && <Eye className="h-5 w-5" />}
                                            {log.type === 'click' && <MousePointer2 className="h-5 w-5" />}
                                            {(log.type === 'bounce' || log.type === 'spam' || log.type === 'unsubscribe') && <XCircle className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1b254b] dark:text-white">{log.event}</p>
                                            <p className="text-xs font-medium text-[#A3AED0]">{log.user}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#A3AED0]">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-xs font-bold">{log.time.split(' ')[1]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 rounded-xl font-bold text-[#4318FF] hover:bg-[#4318FF]/5">
                            View Full Activity Log
                        </Button>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Device Breakdown</h3>
                        <div className="h-[200px] w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deviceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-[#1b254b] dark:text-white">65%</span>
                                <span className="text-[10px] font-bold text-[#A3AED0]">MOBILE</span>
                            </div>
                        </div>
                        <div className="mt-6 space-y-3">
                            {deviceData.map((entry) => (
                                <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-sm font-bold text-[#1b254b] dark:text-white">{entry.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#A3AED0]">{entry.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Campaign Info</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-[#A3AED0] uppercase mb-2">Target Audience</p>
                                <div className="flex flex-wrap gap-1">
                                    <Badge variant="secondary" className="rounded-full text-[10px]">All Healers</Badge>
                                    <Badge variant="secondary" className="rounded-full text-[10px]">Premium Only</Badge>
                                    <Badge className="bg-purple-50 text-purple-600 rounded-full text-[10px]">Yoga</Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#A3AED0] uppercase mb-2">Internal Notes</p>
                                <p className="text-sm font-medium text-[#1b254b] dark:text-white leading-relaxed">
                                    Monthly newsletter focus on new seasonal retreats and premium feature updates. Sent via SendGrid.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                                <Button variant="link" className="text-[#4318FF] font-bold text-xs p-0 h-auto">
                                    View Original Email Template
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
