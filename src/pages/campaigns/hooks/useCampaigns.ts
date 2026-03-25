import { useState, useCallback, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import {
    getCampaigns as fetchCampaigns,
    deleteCampaign,
    createCampaign,
    sendCampaign,
    sendTestEmail,
    getCampaign,
} from "@/api/campaigns"
import type { Campaign } from "../utils/type"
import { extractCampaignData, normalizeCampaign } from "../utils"

export function useCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [audienceFilter, setAudienceFilter] = useState("All")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [createdByFilter, setCreatedByFilter] = useState("")
    const activeIntervals = useRef<Set<ReturnType<typeof setInterval>>>(new Set())

    const buildParams = useCallback(() => {
        const params: Record<string, string | undefined> = {}
        if (statusFilter !== "All") params.status = statusFilter
        if (audienceFilter !== "All") params.audience = audienceFilter
        if (searchQuery) params.search = searchQuery
        if (startDate) params.startDate = startDate
        if (endDate) params.endDate = endDate
        if (createdByFilter) params.createdBy = createdByFilter
        return params
    }, [statusFilter, audienceFilter, searchQuery, startDate, endDate, createdByFilter])

    const fetchAndSetCampaigns = useCallback(async (params: Record<string, string | undefined>) => {
        try {
            const res = await fetchCampaigns(params)
            const { campaigns: data, total } = extractCampaignData(res)
            setCampaigns(data)
            setTotalCount(total)
        } catch (error) {
            console.error("API Error:", error)
            toast.error("Failed to load campaigns")
        }
    }, [])

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        await fetchAndSetCampaigns(buildParams())
        setIsRefreshing(false)
    }, [buildParams, fetchAndSetCampaigns])

    useEffect(() => {
        setLoading(true)
        fetchAndSetCampaigns(buildParams()).finally(() => {
            setLoading(false)
        })
    }, [buildParams, fetchAndSetCampaigns])

    useEffect(() => {
        return () => {
            activeIntervals.current.forEach(clearInterval)
            activeIntervals.current.clear()
        }
    }, [])

    const pollStatus = useCallback((campaignId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await getCampaign(campaignId)
                const campaign = res.data.campaign
                if (!campaign) return

                const isStillSending = campaign.status.toLowerCase() === "sending"
                if (!isStillSending) {
                    clearInterval(interval)
                    activeIntervals.current.delete(interval)
                    setCampaigns(prev =>
                        prev.map(c => c.id === campaignId ? normalizeCampaign(campaign) : c)
                    )
                }
            } catch {
                clearInterval(interval)
                activeIntervals.current.delete(interval)
            }
        }, 3000)
        activeIntervals.current.add(interval)
    }, [])

    const handleDelete = useCallback(async (id: string) => {
        try {
            await deleteCampaign(id)
            setCampaigns(prev => prev.filter(c => c.id !== id))
            toast.success("Campaign deleted")
            return true
        } catch {
            toast.error("Failed to delete campaign")
            return false
        }
    }, [])

    const handleDuplicate = useCallback(async (campaign: Campaign) => {
        try {
            const { name, subject, audience } = campaign
            const res = await createCampaign({
                title: `${name} (Copy)`,
                subject,
                status: "draft",
                audience,
                metrics: {
                    sent: 0,
                    opens: 0,
                    clicks: 0
                }
            })
            if (res.data.campaign) {
                setCampaigns(prev => [normalizeCampaign(res.data.campaign), ...prev])
                toast.success("Campaign duplicated")
            } else {
                throw new Error("Missing campaign data")
            }
        } catch (error) {
            console.error("Duplicate Error:", error)
            toast.error("Failed to duplicate campaign")
        }
    }, [])

    const handleSendNow = useCallback(async (id: string) => {
        try {
            await sendCampaign(id)
            pollStatus(id)
            toast.success("Campaign is sending...")
        } catch {
            toast.error("Failed to send campaign")
        }
    }, [pollStatus])

    const handleSendTest = useCallback(async (id: string) => {
        try {
            const adminEmail = import.meta.env.VITE_ADMIN_EMAILS || "admin@ultrahealers.com"
            await sendTestEmail(id, adminEmail)
            toast.success("Test email sent")
        } catch {
            toast.error("Failed to send test email")
        }
    }, [])

    return {
        campaigns,
        totalCount,
        loading,
        isRefreshing,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        audienceFilter,
        setAudienceFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        createdByFilter,
        setCreatedByFilter,
        handleRefresh,
        handleDelete,
        handleDuplicate,
        handleSendNow,
        handleSendTest,
    }
}
