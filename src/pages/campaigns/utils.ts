import type { Campaign, CampaignStatus, AudienceType } from "./type"
import { Clock, CheckCircle2, AlertCircle } from "lucide-react"
import React from "react"

export const STATUS_OPTIONS = ["All", "Draft", "Scheduled", "Sending", "Sent", "Paused", "Failed"] as const
export const AUDIENCE_OPTIONS = ["All", "Healers", "Seekers", "All Users", "Free Healers", "Premium Healers", "Custom"] as const

export const STATUS_STYLES: Record<CampaignStatus, { bg: string; text: string; darkBg: string; darkText: string }> = {
    "draft": { bg: "bg-slate-100", text: "text-slate-600", darkBg: "dark:bg-slate-900/40", darkText: "dark:text-slate-400" },
    "scheduled": { bg: "bg-amber-50", text: "text-amber-600", darkBg: "dark:bg-amber-900/20", darkText: "dark:text-amber-400" },
    "sending": { bg: "bg-blue-50", text: "text-blue-600", darkBg: "dark:bg-blue-900/20", darkText: "dark:text-blue-400" },
    "sent": { bg: "bg-emerald-50", text: "text-emerald-600", darkBg: "dark:bg-emerald-900/20", darkText: "dark:text-emerald-400" },
    "paused": { bg: "bg-orange-50", text: "text-orange-600", darkBg: "dark:bg-orange-900/20", darkText: "dark:text-amber-400" },
    "failed": { bg: "bg-red-50", text: "text-red-600", darkBg: "dark:bg-red-900/20", darkText: "dark:text-red-400" },
}

export const STATUS_ICONS: Record<CampaignStatus, React.ReactNode | null> = {
    "draft": null,
    "scheduled": null,
    "sending": React.createElement(Clock, { className: "w-3 h-3 mr-1" }),
    "sent": React.createElement(CheckCircle2, { className: "w-3 h-3 mr-1" }),
    "paused": null,
    "failed": React.createElement(AlertCircle, { className: "w-3 h-3 mr-1" }),
}

export function calculateAverage(campaigns: Campaign[], getValue: (c: Campaign) => number): number {
    const validCampaigns = campaigns.filter(c => c.metrics && c.metrics.sent > 0)
    if (validCampaigns.length === 0) return 0
    const sum = validCampaigns.reduce((acc, c) => acc + (getValue(c) / (c.metrics?.sent ?? 1)), 0)
    return sum / validCampaigns.length
}

export function normalizeStatus(status: string): CampaignStatus {
    return (status.toLowerCase() as CampaignStatus) || "draft"
}

export function normalizeCampaign(campaign: any): Campaign {
    const metrics = campaign.metrics as Campaign["metrics"]
    return {
        id: campaign.id as string,
        name: campaign.name as string || campaign.title as string || "",
        subject: campaign.subject as string || "",
        status: normalizeStatus((campaign.status as string) || "draft"),
        audience: (campaign.audience as AudienceType) || (campaign.audienceType as AudienceType) || (campaign.segments?.[0] as AudienceType) || "All Users",
        recipients: (campaign.recipientCount as number) || (campaign.recipients as number) || 0,
        openRate: (campaign.openRate as number) || (metrics?.opens && metrics?.sent ? (metrics.opens / metrics.sent) * 100 : 0),
        clickRate: (campaign.clickRate as number) || (metrics?.clicks && metrics?.sent ? (metrics.clicks / metrics.sent) * 100 : 0),
        sentAt: campaign.sentAt ? (typeof campaign.sentAt === 'object' && 'seconds' in campaign.sentAt ? new Date((campaign.sentAt as any).seconds * 1000).toISOString() : campaign.sentAt as string) : null,
        createdBy: campaign.createdBy as string || campaign.createdByEmail as string || "",
        metrics,
    }
}

export function extractCampaignData(res: { data: unknown }): { campaigns: Campaign[]; total: number } {
    const data = res.data
    if (Array.isArray(data)) {
        return {
            campaigns: data.map(c => normalizeCampaign(c as Record<string, unknown>)),
            total: data.length
        }
    }
    const responseObj = data as { campaigns?: Record<string, unknown>[]; data?: Record<string, unknown>[]; total?: number; length?: number }
    const rawCampaigns = responseObj.campaigns || responseObj.data || []
    const campaigns = rawCampaigns.map(c => normalizeCampaign(c))
    const total = responseObj.total ?? campaigns.length ?? 0
    return { campaigns, total }
}
