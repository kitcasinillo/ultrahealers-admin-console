import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { StatsCard } from "../../components/StatsCard"
import { ArrowLeft, Mail, MousePointer2, Eye, MoreVertical } from "lucide-react"

export function CampaignDetail() {
    const { id } = useParams()

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="rounded-xl border-gray-200 dark:border-white/10">
                    <Link to="/campaigns">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white">Campaign Analytics</h2>
                    <p className="text-[#A3AED0] text-sm font-medium">ID: {id} • Sent on March 1, 2026</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-full font-bold border-gray-200 dark:border-white/10">Resend to Unopened</Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Total Sent"
                    value="1,420"
                    description="Delivered to 99.8%"
                    icon={<Mail className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Open Rate"
                    value="45.2%"
                    description="642 unique opens"
                    icon={<Eye className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Click Rate"
                    value="12.8%"
                    description="182 unique clicks"
                    icon={<MousePointer2 className="h-6 w-6" />}
                    trend="up"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Message Content</h3>
                        <div className="border border-gray-100 dark:border-white/5 rounded-2xl p-6 bg-gray-50/50 dark:bg-white/5">
                            <div className="mb-4 pb-4 border-b border-gray-100 dark:border-white/10">
                                <p className="text-xs font-bold text-[#A3AED0] uppercase mb-1">Subject Line</p>
                                <p className="font-bold text-[#1b254b] dark:text-white">Welcome to UltraHealers! 🌟</p>
                            </div>
                            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-[#1b254b] dark:text-white">
                                <p>Hello there,</p>
                                <p>We're thrilled to have you join our community of healers. At UltraHealers, we believe in the power of connection and holistic wellness...</p>
                                <p>Check out your dashboard to get started with your first listing!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-4">Audience Breakdown</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[#A3AED0]">New Healers</span>
                                <span className="text-sm font-bold text-[#1b254b] dark:text-white">1,200</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[#A3AED0]">Verified Waitlist</span>
                                <span className="text-sm font-bold text-[#1b254b] dark:text-white">220</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                                <Badge variant="outline" className="rounded-full font-bold">Healer Segment</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-4">Recent Interactions</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-xs font-bold text-[#4318FF] dark:text-[#01A3B4]">
                                        JD
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#1b254b] dark:text-white">John Doe opened email</p>
                                        <p className="text-[10px] font-medium text-[#A3AED0]">2 minutes ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
