export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed"
export type AudienceType = "Healers" | "Seekers" | "All Users" | "Free Healers" | "Premium Healers" | "Custom"

export type Campaign = {
    id: string
    name: string
    subject: string
    status: CampaignStatus
    audience: AudienceType
    recipients: number
    openRate: number
    clickRate: number
    sentAt: string | null
    createdBy: string
    metrics?: {
        sent: number
        opens: number
        clicks: number
    }
}
