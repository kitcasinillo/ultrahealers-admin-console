import { useEffect, useMemo, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/StatsCard"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
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
    Pencil,
} from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import {
    createCampaign,
    deleteCampaign,
    getCampaign,
    sendCampaign,
    updateCampaign,
} from "@/api/campaigns"
import { StatusBadge } from "../components/StatusBadge"
import { normalizeStatus } from "../utils"

interface CampaignDetailRecord {
    id: string
    title: string
    subject: string
    previewText?: string
    fromName?: string
    fromEmail?: string
    content?: string
    status: string
    audience: string
    segments?: string[]
    audienceFilter?: {
        modalities?: string[]
        regions?: string[]
    }
    recipientCount: number
    metrics: {
        sent: number
        delivered: number
        opens: number
        clicks: number
        bounced: number
        unsubscribed: number
        spam: number
    }
    sentAt: string | null
    scheduledAt: string | null
    createdAt: string | null
    createdBy?: string
    activityLog: Array<{
        id: string
        event: string
        user: string
        time: string
        type: string
    }>
}

export function CampaignDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [campaign, setCampaign] = useState<CampaignDetailRecord | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [showEmailPreview, setShowEmailPreview] = useState(false)

    useEffect(() => {
        if (!id) return
        let mounted = true
        setLoading(true)
        setError(null)
        getCampaign(id)
            .then((res) => {
                if (!mounted) return
                if (!res.data?.campaign) {
                    setError("Campaign not found")
                    return
                }
                setCampaign(res.data.campaign)
            })
            .catch((err: any) => {
                if (!mounted) return
                setError(err?.response?.data?.error || "Failed to load campaign details")
            })
            .finally(() => {
                if (mounted) setLoading(false)
            })
        return () => {
            mounted = false
        }
    }, [id])

    const handleTogglePause = async () => {
        if (!campaign) return
        const nextStatus = campaign.status === "paused" ? "scheduled" : "paused"
        try {
            setBusy(true)
            const res = await updateCampaign(campaign.id, { status: nextStatus })
            setCampaign(res.data.campaign)
            toast.success(nextStatus === "paused" ? "Campaign paused" : "Campaign resumed")
        } catch {
            toast.error("Failed to update campaign status")
        } finally {
            setBusy(false)
        }
    }

    const handleSendNow = async () => {
        if (!campaign) return
        try {
            setBusy(true)
            await sendCampaign(campaign.id)
            const res = await getCampaign(campaign.id)
            setCampaign(res.data.campaign)
            toast.success("Campaign sent!")
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to send campaign")
        } finally {
            setBusy(false)
        }
    }

    const handleDuplicate = async () => {
        if (!campaign) return
        try {
            setBusy(true)
            const res = await createCampaign({
                title: `${campaign.title} (Copy)`,
                subject: campaign.subject,
                previewText: campaign.previewText,
                fromName: campaign.fromName,
                fromEmail: campaign.fromEmail,
                content: campaign.content,
                segments: campaign.segments,
                audienceFilter: campaign.audienceFilter,
                status: "draft",
            })
            toast.success("Campaign duplicated")
            navigate(`/campaigns/${res.data.campaignId}/edit`)
        } catch {
            toast.error("Failed to duplicate campaign")
        } finally {
            setBusy(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!campaign) return
        try {
            setBusy(true)
            await deleteCampaign(campaign.id)
            toast.success("Campaign deleted")
            navigate("/campaigns")
        } catch {
            toast.error("Failed to delete campaign")
        } finally {
            setBusy(false)
            setIsDeleteModalOpen(false)
        }
    }

    const handleExportReport = () => {
        if (!campaign) return
        const rows = [
            ["Field", "Value"],
            ["ID", campaign.id],
            ["Title", campaign.title],
            ["Subject", campaign.subject],
            ["Status", campaign.status],
            ["Audience", campaign.audience],
            ["Sent", String(campaign.metrics.sent)],
            ["Delivered", String(campaign.metrics.delivered)],
            ["Opens", String(campaign.metrics.opens)],
            ["Clicks", String(campaign.metrics.clicks)],
            ["Bounced", String(campaign.metrics.bounced)],
            ["Unsubscribed", String(campaign.metrics.unsubscribed)],
            ["Sent At", campaign.sentAt || "N/A"],
        ]
        const csv = "data:text/csv;charset=utf-8," + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
        const link = document.createElement("a")
        link.setAttribute("href", encodeURI(csv))
        link.setAttribute("download", `campaign-${campaign.id}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Campaign report exported")
    }

    const hourlyData = useMemo(() => {
        const logs = campaign?.activityLog || []
        const buckets = new Map<string, { hour: string; opens: number; clicks: number }>()
        logs.forEach((log) => {
            if (log.type !== "open" && log.type !== "click") return
            const d = new Date(log.time)
            if (Number.isNaN(d.getTime())) return
            const hour = `${String(d.getHours()).padStart(2, "0")}:00`
            const current = buckets.get(hour) || { hour, opens: 0, clicks: 0 }
            if (log.type === "open") current.opens += 1
            if (log.type === "click") current.clicks += 1
            buckets.set(hour, current)
        })
        const result = Array.from(buckets.values()).sort((a, b) => a.hour.localeCompare(b.hour))
        return result.length > 0 ? result : [{ hour: "Now", opens: campaign?.metrics.opens || 0, clicks: campaign?.metrics.clicks || 0 }]
    }, [campaign])

    if (loading) {
        return <div className="py-20 text-center text-sm text-[#A3AED0]">Loading campaign details...</div>
    }

    if (error || !campaign) {
        return (
            <div className="py-20 text-center space-y-4">
                <p className="text-red-500 font-bold">{error || "Campaign not found"}</p>
                <Button asChild variant="outline" className="rounded-full">
                    <Link to="/campaigns">Back to Campaigns</Link>
                </Button>
            </div>
        )
    }

    const sent = campaign.metrics.sent || 0
    const delivered = campaign.metrics.delivered || 0
    const opens = campaign.metrics.opens || 0
    const clicks = campaign.metrics.clicks || 0
    const unsubscribed = campaign.metrics.unsubscribed || 0
    const bounced = campaign.metrics.bounced || 0
    const spam = campaign.metrics.spam || 0

    const deliveryRate = sent > 0 ? ((delivered / sent) * 100).toFixed(1) : "0.0"
    const openRate = delivered > 0 ? ((opens / delivered) * 100).toFixed(1) : "0.0"
    const clickRate = delivered > 0 ? ((clicks / delivered) * 100).toFixed(1) : "0.0"
    const churnRate = delivered > 0 ? ((unsubscribed / delivered) * 100).toFixed(2) : "0.00"

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
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white">
                                {campaign.title}
                            </h2>
                            <StatusBadge status={normalizeStatus(campaign.status)} />
                        </div>
                        <p className="text-[#A3AED0] text-sm font-medium">
                            ID: {campaign.id}
                            {campaign.sentAt
                                ? ` • Sent ${new Date(campaign.sentAt).toLocaleString()}`
                                : campaign.scheduledAt
                                ? ` • Scheduled for ${new Date(campaign.scheduledAt).toLocaleString()}`
                                : campaign.createdAt
                                ? ` • Created ${new Date(campaign.createdAt).toLocaleString()}`
                                : ""}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {(campaign.status === "draft" || campaign.status === "scheduled" || campaign.status === "paused") && (
                        <>
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white"
                            >
                                <Link to={`/campaigns/${campaign.id}/edit`}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                className="rounded-full font-bold bg-[#4318FF] hover:bg-[#3311CC] text-white"
                                onClick={handleSendNow}
                                disabled={busy}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Send Now
                            </Button>
                        </>
                    )}

                    {(campaign.status === "scheduled" || campaign.status === "paused") && (
                        <Button
                            variant="outline"
                            className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white"
                            onClick={handleTogglePause}
                            disabled={busy}
                        >
                            {campaign.status === "paused" ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                            {campaign.status === "paused" ? "Resume" : "Pause"}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white"
                        onClick={handleDuplicate}
                        disabled={busy}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                    </Button>

                    <Button
                        variant="outline"
                        className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white"
                        onClick={handleExportReport}
                    >
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
                            <DropdownMenuItem
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="rounded-xl font-bold text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                            >
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
                    value={sent.toLocaleString()}
                    description={`${campaign.recipientCount.toLocaleString()} targeted`}
                    icon={<Send className="h-6 w-6" />}
                />
                <StatsCard
                    title="Delivered"
                    value={delivered.toLocaleString()}
                    description={`${deliveryRate}% delivery rate`}
                    icon={<Mail className="h-6 w-6" />}
                />
                <StatsCard
                    title="Opened"
                    value={opens.toLocaleString()}
                    description={`${openRate}% open rate`}
                    icon={<Eye className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Clicked"
                    value={clicks.toLocaleString()}
                    description={`${clickRate}% click rate (CTR)`}
                    icon={<MousePointer2 className="h-6 w-6" />}
                    trend="up"
                />
                <StatsCard
                    title="Unsubscribed"
                    value={unsubscribed.toLocaleString()}
                    description={`${churnRate}% churn rate`}
                    icon={<UserMinus className="h-6 w-6" />}
                    trend="neutral"
                />
            </div>

            {/* Negative Metrics */}
            <div className="grid gap-5 md:grid-cols-2">
                <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#A3AED0] uppercase mb-1">Bounced / Failed</p>
                        <h4 className="text-xl font-black text-[#1b254b] dark:text-white">{bounced}</h4>
                        <p className="text-[10px] text-red-500 font-bold mt-1">SMTP delivery failures</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500">
                        <XCircle className="h-5 w-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#A3AED0] uppercase mb-1">Spam Reports</p>
                        <h4 className="text-xl font-black text-[#1b254b] dark:text-white">{spam}</h4>
                        <p className="text-[10px] text-amber-500 font-bold mt-1">Reported complaints</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-500">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Charts & Activity Log */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Performance Over Time</h3>
                            <div className="flex gap-2">
                                <Badge className="bg-[#4318FF]/5 text-[#4318FF] border-none font-bold">Opens</Badge>
                                <Badge className="bg-[#6AD2FF]/5 text-[#6AD2FF] border-none font-bold">Clicks</Badge>
                            </div>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={hourlyData}>
                                    <defs>
                                        <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4318FF" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6AD2FF" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6AD2FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF4FB" />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 600 }} />
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
                        {campaign.activityLog.length === 0 ? (
                            <p className="text-sm text-[#A3AED0] py-6 text-center">No activity logged for this campaign yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {campaign.activityLog.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F7FE] dark:bg-white/5 border border-transparent hover:border-gray-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                log.type === 'sent' || log.type === 'created' ? 'bg-blue-50 text-blue-500' :
                                                log.type === 'open' ? 'bg-purple-50 text-purple-500' :
                                                log.type === 'click' ? 'bg-emerald-50 text-emerald-500' :
                                                'bg-red-50 text-red-500'
                                            }`}>
                                                {(log.type === 'sent' || log.type === 'created') && <Send className="h-5 w-5" />}
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
                                            <span className="text-xs font-bold">{new Date(log.time).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Campaign Info</h3>
                        <div className="space-y-5">
                            <div>
                                <p className="text-xs font-bold text-[#A3AED0] uppercase mb-1">Subject Line</p>
                                <p className="text-sm font-semibold text-[#1b254b] dark:text-white">{campaign.subject || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#A3AED0] uppercase mb-1">Sender</p>
                                <p className="text-sm font-medium text-[#1b254b] dark:text-white">
                                    {campaign.fromName || "UltraHealers Team"} ({campaign.fromEmail || "—"})
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#A3AED0] uppercase mb-2">Target Audience</p>
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="secondary" className="rounded-full text-[11px]">{campaign.audience}</Badge>
                                    {(campaign.segments || []).map((seg) => (
                                        <Badge key={seg} variant="outline" className="rounded-full text-[11px]">{seg}</Badge>
                                    ))}
                                    {(campaign.audienceFilter?.modalities || []).map((mod) => (
                                        <Badge key={mod} className="bg-purple-50 text-purple-600 rounded-full text-[11px]">{mod}</Badge>
                                    ))}
                                    {(campaign.audienceFilter?.regions || []).map((reg) => (
                                        <Badge key={reg} className="bg-blue-50 text-blue-600 rounded-full text-[11px]">{reg}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-center">
                                <Button
                                    variant="link"
                                    className="text-[#4318FF] font-bold text-xs p-0 h-auto"
                                    onClick={() => setShowEmailPreview((v) => !v)}
                                >
                                    {showEmailPreview ? "Hide Email Content" : "View Original Email Content"}
                                </Button>
                            </div>
                            {showEmailPreview && (
                                <div
                                    className="p-4 rounded-2xl bg-[#F4F7FE] dark:bg-white/5 text-sm prose dark:prose-invert max-w-none overflow-x-auto"
                                    dangerouslySetInnerHTML={{ __html: campaign.content || "<p>No content.</p>" }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Campaign"
                description={`Are you sure you want to permanently delete "${campaign.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    )
}
