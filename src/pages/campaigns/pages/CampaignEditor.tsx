import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { TipTapEditor } from "@/components/campaigns/TipTapEditor"
import {
    ArrowLeft,
    Users,
    Calendar,
    CheckCircle2,
    X,
    RefreshCw,
    Info,
    Layout,
    TestTube,
    ChevronRight,
    Loader2,
    Search,
    UserCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from "@/lib/api"
import {
    getCampaign,
    createCampaign,
    updateCampaign,
    sendCampaign,
    sendTestEmail,
    getAudiencePreview,
    getTemplates,
    searchCampaignUsers,
    type CampaignTemplate,
    type CampaignUserOption,
} from "@/api/campaigns"
import { buildTemplateEmailHtml, deriveTemplateFields } from "../utils/templateHtml"

export function CampaignEditor() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [activeTab, setActiveTab] = useState('audience')
    const [saving, setSaving] = useState(false)
    const [launching, setLaunching] = useState(false)
    const [sendingTest, setSendingTest] = useState(false)
    const [campaignId, setCampaignId] = useState<string | undefined>(id)

    // State: Audience --
    const [selectedSegments, setSelectedSegments] = useState<string[]>([])
    const [selectedModalities, setSelectedModalities] = useState<string[]>([])
    const [selectedRegions, setSelectedRegions] = useState<string[]>([])
    const [excludeUnsubscribed, setExcludeUnsubscribed] = useState(true)
    const [selectedUsers, setSelectedUsers] = useState<CampaignUserOption[]>([])
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'healer' | 'seeker'>('all')
    const [userSearchResults, setUserSearchResults] = useState<CampaignUserOption[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [isRefreshingReach, setIsRefreshingReach] = useState(false)
    const [estimatedReach, setEstimatedReach] = useState(0)
    const [previewLoading, setPreviewLoading] = useState(false)

    // State: Compose --
    const [campaignName, setCampaignName] = useState('')
    const [subject, setSubject] = useState('')
    const [previewText, setPreviewText] = useState('')
    const [fromName, setFromName] = useState('UltraHealers Team')
    const [fromEmail, setFromEmail] = useState('hello@ultrahealers.com')
    const [emailBody, setEmailBody] = useState('<p>Hello {{first_name}},</p><p>We have some exciting news to share...</p>')
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [templates, setTemplates] = useState<CampaignTemplate[]>([])

    // State: Schedule --
    const [sendOption, setSendOption] = useState<'immediate' | 'later'>('immediate')
    const [sendDate, setSendDate] = useState('')
    const [sendTime, setSendTime] = useState('')

    // State: Test Email --
    const [testEmailAddress, setTestEmailAddress] = useState('')

    // Load existing campaign in edit mode --
    useEffect(() => {
        if (id) {
            getCampaign(id)
                .then(res => {
                    const data = res.data.campaign
                    if (!data) throw new Error('Campaign not found')
                    setCampaignName(data.title || data.name || '')
                    setSubject(data.subject || '')
                    setPreviewText(data.previewText || '')
                    setFromName(data.fromName || 'UltraHealers Team')
                    setFromEmail(data.fromEmail || 'hello@ultrahealers.com')
                    setEmailBody(data.content || data.body || data.emailBody || '<p>Hello {{first_name}},</p>')
                    setSelectedSegments(data.segments || data.selectedSegments || [])
                    setSelectedModalities(data.audienceFilter?.modalities || [])
                    setSelectedRegions(data.audienceFilter?.regions || [])
                    if (data.audienceFilter?.excludeUnsubscribed !== undefined) {
                        setExcludeUnsubscribed(Boolean(data.audienceFilter.excludeUnsubscribed))
                    }
                    if (Array.isArray(data.customRecipients) && data.customRecipients.length > 0) {
                        const restoredUsers: CampaignUserOption[] = data.customRecipients.map((item: any, idx: number) => {
                            if (typeof item === 'string') {
                                return { id: `restored_${idx}`, name: item.split('@')[0], email: item, role: 'User' }
                            }
                            return {
                                id: item.id || `restored_${idx}`,
                                name: item.name || item.email?.split('@')[0] || 'User',
                                email: item.email || '',
                                role: item.role || 'User',
                            }
                        }).filter((u: CampaignUserOption) => Boolean(u.email))
                        setSelectedUsers(restoredUsers)
                    }
                    setSendOption(data.scheduledAt ? 'later' : 'immediate')
                    if (data.scheduledAt) {
                        const dateObj = new Date(data.scheduledAt)
                        setSendDate(dateObj.toISOString().split('T')[0])
                        setSendTime(dateObj.toTimeString().split(' ')[0].slice(0, 5))
                    }
                    setCampaignId(data.id)
                })
                .catch(() => toast.error('Failed to load campaign'))
        }
    }, [id])

    const [modalitiesList, setModalitiesList] = useState<string[]>([])
    const [loadingModalities, setLoadingModalities] = useState(true)

    useEffect(() => {
        let mounted = true
        setLoadingModalities(true)
        api.get<{ success: boolean; modalities: Array<Record<string, any>> }>('/api/modalities')
            .then((res) => {
                if (!mounted) return
                const items = (res.data.modalities || [])
                    .filter((item) => item.active !== false)
                    .sort((a, b) => {
                        const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 999
                        const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 999
                        if (orderA !== orderB) return orderA - orderB
                        return String(a.label || a.name || '').localeCompare(String(b.label || b.name || ''))
                    })
                    .map((item) => String(item.label || item.name || item.slug || '').trim())
                    .filter(Boolean)
                setModalitiesList(items)
            })
            .catch(() => {
                if (mounted) setModalitiesList([])
            })
            .finally(() => {
                if (mounted) setLoadingModalities(false)
            })
        return () => {
            mounted = false
        }
    }, [])

    const regionsList = [
        'North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East', 'Africa'
    ]

    // Search specific users for targeted sending
    useEffect(() => {
        let mounted = true
        const timer = setTimeout(() => {
            setLoadingUsers(true)
            searchCampaignUsers(userSearchQuery, userRoleFilter)
                .then((res) => {
                    if (mounted) setUserSearchResults(res.data.users || [])
                })
                .catch(() => {
                    if (mounted) setUserSearchResults([])
                })
                .finally(() => {
                    if (mounted) setLoadingUsers(false)
                })
        }, 250)
        return () => {
            mounted = false
            clearTimeout(timer)
        }
    }, [userSearchQuery, userRoleFilter])

    const toggleSelectedUser = (user: CampaignUserOption) => {
        setSelectedUsers((prev) => {
            const exists = prev.some((u) => u.email.toLowerCase() === user.email.toLowerCase())
            if (exists) return prev.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase())
            return [...prev, user]
        })
    }

    // Reach Estimation
    const updateReach = useCallback(async (isRefresh = false) => {
        if (isRefresh) setIsRefreshingReach(true)
        else setPreviewLoading(true)

        try {
            const payload = buildAudiencePayload()
            const res = await getAudiencePreview(payload)
            setEstimatedReach(res.data.count)
        } catch (error) {
            console.error("Failed to fetch reach estimate:", error)
            setEstimatedReach(0)
        } finally {
            setPreviewLoading(false)
            setIsRefreshingReach(false)
        }
    }, [selectedSegments, selectedModalities, selectedRegions, excludeUnsubscribed, selectedUsers])

    // Reach Estimation
    useEffect(() => {
        if (
            selectedSegments.length === 0 &&
            selectedModalities.length === 0 &&
            selectedRegions.length === 0 &&
            selectedUsers.length === 0
        ) {
            setEstimatedReach(0)
            return
        }

        const timer = setTimeout(() => {
            updateReach()
        }, 600)
        return () => clearTimeout(timer)
    }, [selectedSegments, selectedModalities, selectedRegions, excludeUnsubscribed, selectedUsers, updateReach])

    const buildAudiencePayload = () => {
        const segmentMap: Record<string, Record<string, unknown>> = {
            'all-healers': { role: 'healer' },
            'all-seekers': { role: 'seeker' },
            'all-users': { role: 'all' },
            'free-healers': { role: 'healer', subscriptionType: 'free' },
            'premium-healers': { role: 'healer', subscriptionType: 'premium' },
            'inactive-healers': { role: 'healer', noBookingsInLastDays: 30 },
            'new-healers': { role: 'healer', joinedInLastDays: 7 },
            'inactive-seekers': { role: 'seeker', noBookingsInLastDays: 30 },
            'disputed-seekers': { role: 'seeker', hasPendingDisputes: true },
        }

        const merged: Record<string, unknown> = {}
        for (const seg of selectedSegments) {
            const mapping = segmentMap[seg]
            if (mapping) {
                Object.assign(merged, mapping)
            }
        }

        const selectedRecipients = selectedUsers.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))

        if (selectedRecipients.length > 0) {
            merged.customRecipients = selectedRecipients
        }

        if (selectedModalities.length > 0) {
            merged.modalities = selectedModalities
        }

        if (selectedRegions.length > 0) {
            merged.regions = selectedRegions
        }

        merged.excludeUnsubscribed = excludeUnsubscribed

        return merged
    }

    const buildCampaignPayload = () => {
        const selectedRecipients = selectedUsers.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
        const payload: any = {
            title: campaignName,
            subject,
            previewText,
            fromName,
            fromEmail,
            content: emailBody,
            segments: selectedSegments,
            customRecipients: selectedRecipients,
            audienceFilter: buildAudiencePayload()
        }

        if (sendOption === 'later' && sendDate && sendTime) {
            payload.scheduledAt = new Date(`${sendDate}T${sendTime}`).toISOString()
        } else {
            payload.scheduledAt = null
        }

        return payload
    }

    // Save Draft
    const handleSaveDraft = async () => {
        setSaving(true)
        const payload = { ...buildCampaignPayload(), status: 'draft' }
        try {
            if (campaignId) {
                await updateCampaign(campaignId, payload)
                toast.success('Draft updated')
            } else {
                const res = await createCampaign(payload)
                const newId = res.data.campaignId
                setCampaignId(newId)
                navigate(`/campaigns/${newId}/edit`, { replace: true })
                toast.success('Draft created')
            }
        } catch (error) {
            console.error('Save Draft Error:', error)
            toast.error('Failed to save draft')
        } finally {
            setSaving(false)
        }
    }

    // Confirm & Launch
    const handleLaunch = async () => {
        setLaunching(true)
        try {
            const isScheduled = sendOption === 'later'
            const payload = {
                ...buildCampaignPayload(),
                status: isScheduled ? 'scheduled' : 'draft'
            }

            let currentId = campaignId
            if (currentId) {
                await updateCampaign(currentId, payload)
            } else {
                const res = await createCampaign(payload)
                currentId = res.data.campaignId
                setCampaignId(currentId)
            }

            if (isScheduled) {
                toast.success('Campaign scheduled!')
                navigate('/campaigns')
            } else {
                await sendCampaign(currentId!)
                toast.success('Campaign launched!')
                navigate('/campaigns')
            }
        } catch (error) {
            console.error('Launch Error:', error)
            toast.error('Failed to launch campaign')
        } finally {
            setLaunching(false)
        }
    }

    // Send Test Email
    const handleTestEmail = async () => {
        if (!testEmailAddress) {
            toast.error('Please enter a recipient email')
            return
        }
        setSendingTest(true)
        try {
            let currentId = campaignId
            if (!currentId) {
                const res = await createCampaign({ ...buildCampaignPayload(), status: 'draft' })
                currentId = res.data.campaignId
                setCampaignId(currentId)
                navigate(`/campaigns/${currentId}/edit`, { replace: true })
            }
            await sendTestEmail(currentId!, testEmailAddress)
            toast.success(`Test email sent to ${testEmailAddress}`)
        } catch (error) {
            console.error('Test Email Error:', error)
            toast.error('Failed to send test email')
        } finally {
            setSendingTest(false)
        }
    }

    // Load saved templates from backend
    useEffect(() => {
        getTemplates()
            .then((res) => setTemplates(res.data.templates || []))
            .catch(() => {})
    }, [])

    const segments = [
        { id: 'all-healers', label: 'All Healers' },
        { id: 'all-seekers', label: 'All Seekers' },
        { id: 'all-users', label: 'All Users (Healers + Seekers)' },
        { id: 'free-healers', label: 'Free Healers only' },
        { id: 'premium-healers', label: 'Premium Healers only' },
        { id: 'inactive-healers', label: 'Healers with no bookings in last 30 days' },
        { id: 'new-healers', label: 'Healers who joined in last 7 days' },
        { id: 'inactive-seekers', label: 'Seekers with no bookings in last 30 days' },
        { id: 'disputed-seekers', label: 'Seekers with pending disputes' },
    ]

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="rounded-xl border-gray-200 dark:border-white/10">
                    <Link to="/campaigns">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white">
                        {isEdit ? 'Edit Campaign' : 'Create New Campaign'}
                    </h2>
                    <p className="text-[#A3AED0] text-sm font-medium">
                        {isEdit ? 'Update your campaign details and settings.' : 'Follow the steps to compose and send your campaign.'}
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-8 mb-8 border-b border-gray-100 dark:border-white/5 w-full justify-start rounded-none">
                    <TabsTrigger value="audience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4318FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-1 font-bold text-[#A3AED0] data-[state=active]:text-[#1b254b] dark:data-[state=active]:text-white transition-all">
                        1. Audience
                    </TabsTrigger>
                    <TabsTrigger value="compose" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4318FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-1 font-bold text-[#A3AED0] data-[state=active]:text-[#1b254b] dark:data-[state=active]:text-white transition-all">
                        2. Compose
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4318FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-1 font-bold text-[#A3AED0] data-[state=active]:text-[#1b254b] dark:data-[state=active]:text-white transition-all">
                        3. Schedule
                    </TabsTrigger>
                    <TabsTrigger value="review" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4318FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-1 font-bold text-[#A3AED0] data-[state=active]:text-[#1b254b] dark:data-[state=active]:text-white transition-all">
                        4. Review & Send
                    </TabsTrigger>
                </TabsList>

                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    <div className="lg:col-span-2">
                        {/* TAB 1: AUDIENCE */}
                        <TabsContent value="audience" className="mt-0 space-y-6">
                            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                                <h3 className="text-xl font-bold text-[#1b254b] dark:text-white mb-6 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-[#4318FF]" />
                                    Target Audience
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <p className="text-sm font-bold text-[#1b254b] dark:text-white">Predefined Segments</p>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded text-[#4318FF] focus:ring-[#4318FF]"
                                                    checked={excludeUnsubscribed}
                                                    onChange={(e) => setExcludeUnsubscribed(e.target.checked)}
                                                />
                                                <span className="text-[10px] font-bold text-[#A3AED0] uppercase">Exclude Unsubscribed</span>
                                            </label>
                                        </div>
                                        {segments.map((segment) => (
                                            <label
                                                key={segment.id}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedSegments.includes(segment.id)
                                                    ? 'border-[#4318FF] bg-[#4318FF]/5 dark:border-[#01A3B4] dark:bg-[#01A3B4]/5'
                                                    : 'border-gray-100 dark:border-white/5 bg-[#F4F7FE]/50 dark:bg-white/5 hover:border-gray-200'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-gray-300 text-[#4318FF] focus:ring-[#4318FF]"
                                                    checked={selectedSegments.includes(segment.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedSegments([...selectedSegments, segment.id])
                                                        else setSelectedSegments(selectedSegments.filter(id => id !== segment.id))
                                                    }}
                                                />
                                                <span className="font-bold text-[#1b254b] dark:text-white">{segment.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <p className="text-sm font-bold text-[#1b254b] dark:text-white ml-1">Filter by Modality</p>
                                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-[#F4F7FE]/30 dark:bg-white/3 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                {loadingModalities ? (
                                                    <p className="text-xs text-[#A3AED0] font-medium py-2">Loading modalities...</p>
                                                ) : modalitiesList.length === 0 ? (
                                                    <p className="text-xs text-[#A3AED0] font-medium py-2">No active modalities found.</p>
                                                ) : (
                                                    modalitiesList.map(modality => (
                                                        <label key={modality} className="flex items-center gap-3 cursor-pointer group">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 rounded border-gray-300 text-[#4318FF]"
                                                                checked={selectedModalities.includes(modality)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setSelectedModalities([...selectedModalities, modality])
                                                                    else setSelectedModalities(selectedModalities.filter(m => m !== modality))
                                                                }}
                                                            />
                                                            <span className="text-sm font-medium text-[#A3AED0] group-hover:text-[#1b254b] dark:group-hover:text-white transition-colors">
                                                                {modality}
                                                            </span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-sm font-bold text-[#1b254b] dark:text-white ml-1">Filter by Region</p>
                                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-[#F4F7FE]/30 dark:bg-white/3 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                {regionsList.map(region => (
                                                    <label key={region} className="flex items-center gap-3 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 rounded border-gray-300 text-[#4318FF]"
                                                            checked={selectedRegions.includes(region)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedRegions([...selectedRegions, region])
                                                                else setSelectedRegions(selectedRegions.filter(r => r !== region))
                                                            }}
                                                        />
                                                        <span className="text-sm font-medium text-[#A3AED0] group-hover:text-[#1b254b] dark:group-hover:text-white transition-colors">
                                                            {region}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Select Specific Users */}
                                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-[#F4F7FE]/30 dark:bg-white/3 space-y-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-white dark:bg-[#111C44] flex items-center justify-center text-[#4318FF]">
                                                    <UserCheck className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1b254b] dark:text-white">Select Specific Users</p>
                                                    <p className="text-xs text-[#A3AED0] font-medium">
                                                        Pick individual healers or seekers to target directly (leave broad segments unchecked to send only to these users)
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedUsers.length > 0 && (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge className="bg-[#4318FF]/10 text-[#4318FF] border-none rounded-full text-xs font-bold">
                                                        {selectedUsers.length} selected
                                                    </Badge>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs text-[#A3AED0] hover:text-red-500"
                                                        onClick={() => setSelectedUsers([])}
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected User Chips */}
                                        {selectedUsers.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUsers.map((user) => (
                                                    <span
                                                        key={user.email}
                                                        className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#111C44] border border-[#4318FF]/25 px-3 py-1 text-xs font-semibold text-[#1b254b] dark:text-white shadow-xs"
                                                    >
                                                        <span>{user.name}</span>
                                                        <span className="text-[#A3AED0] font-normal">({user.email})</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSelectedUser(user)}
                                                            className="ml-0.5 text-[#A3AED0] hover:text-red-500 transition-colors"
                                                            aria-label={`Remove ${user.name}`}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Search + Role Filter */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="relative flex-1">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3AED0]" />
                                                <Input
                                                    value={userSearchQuery}
                                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                                    placeholder="Search users by name or email..."
                                                    className="pl-9 h-10 rounded-xl bg-white dark:bg-[#111C44] border-gray-200 dark:border-white/10 text-sm"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 bg-white dark:bg-[#111C44] p-1 rounded-xl border border-gray-200 dark:border-white/10">
                                                {(['all', 'healer', 'seeker'] as const).map((r) => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setUserRoleFilter(r)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                                                            userRoleFilter === r
                                                                ? 'bg-[#4318FF] text-white'
                                                                : 'text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white'
                                                        }`}
                                                    >
                                                        {r === 'all' ? 'All' : `${r}s`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Scrollable User Picker List */}
                                        <div className="max-h-[210px] overflow-y-auto custom-scrollbar rounded-xl bg-white dark:bg-[#111C44] border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
                                            {loadingUsers ? (
                                                <div className="p-4 text-center text-xs text-[#A3AED0] font-medium">
                                                    Searching users...
                                                </div>
                                            ) : userSearchResults.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-[#A3AED0] font-medium">
                                                    No matching users found.
                                                </div>
                                            ) : (
                                                userSearchResults.map((user) => {
                                                    const isSelected = selectedUsers.some(
                                                        (u) => u.email.toLowerCase() === user.email.toLowerCase()
                                                    )
                                                    return (
                                                        <label
                                                            key={user.id}
                                                            className={`flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                                                                isSelected
                                                                    ? 'bg-[#4318FF]/5 dark:bg-[#4318FF]/15'
                                                                    : 'hover:bg-[#F4F7FE]/60 dark:hover:bg-white/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 rounded border-gray-300 text-[#4318FF] shrink-0"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleSelectedUser(user)}
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-[#1b254b] dark:text-white truncate">
                                                                        {user.name}
                                                                    </p>
                                                                    <p className="text-xs text-[#A3AED0] truncate">
                                                                        {user.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                variant="secondary"
                                                                className="rounded-full text-[10px] font-bold shrink-0"
                                                            >
                                                                {user.role}
                                                            </Badge>
                                                        </label>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(selectedSegments.length > 1 || selectedModalities.length > 0 || selectedRegions.length > 0) && (
                                    <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex gap-3">
                                        <Info className="h-5 w-5 text-blue-500 shrink-0" />
                                        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                                            Recipients will be merged and deduplicated across the selected segments and filters.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* TAB 2: COMPOSE */}
                        <TabsContent value="compose" className="mt-0 space-y-6">
                            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#1B254B] dark:text-white">From Name</label>
                                        <Input
                                            value={fromName} onChange={(e) => setFromName(e.target.value)}
                                            className="rounded-xl border-gray-100 dark:border-white/10 bg-[#F4F7FE] dark:bg-white/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#1B254B] dark:text-white">From Email</label>
                                        <Input
                                            value={fromEmail} onChange={(e) => setFromEmail(e.target.value)}
                                            className="rounded-xl border-gray-100 dark:border-white/10 bg-[#F4F7FE] dark:bg-white/5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#1B254B] dark:text-white">Campaign Internal Name</label>
                                        <Input
                                            placeholder="e.g. March 2026 Newsletter"
                                            value={campaignName} onChange={(e) => setCampaignName(e.target.value)}
                                            className="rounded-xl border-gray-100 dark:border-white/10 bg-[#F4F7FE] dark:bg-white/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-sm font-bold text-[#1B254B] dark:text-white">Subject Line</label>
                                            <span className={`text-[10px] font-bold ${subject.length > 80 ? 'text-red-500' : 'text-[#A3AED0]'}`}>
                                                {subject.length}/80
                                            </span>
                                        </div>
                                        <Input
                                            placeholder="Catchy subject line..."
                                            value={subject} onChange={(e) => setSubject(e.target.value)}
                                            className="rounded-xl border-gray-100 dark:border-white/10 bg-[#F4F7FE] dark:bg-white/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-sm font-bold text-[#1B254B] dark:text-white">Preview Text</label>
                                            <span className={`text-[10px] font-bold ${previewText.length > 140 ? 'text-red-500' : 'text-[#A3AED0]'}`}>
                                                {previewText.length}/140
                                            </span>
                                        </div>
                                        <Input
                                            placeholder="Summary showing in inbox..."
                                            value={previewText} onChange={(e) => setPreviewText(e.target.value)}
                                            className="rounded-xl border-gray-100 dark:border-white/10 bg-[#F4F7FE] dark:bg-white/5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Email Body</h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl text-[#4318FF] bg-[#F4F7FE] dark:bg-white/5 border-none font-bold hover:bg-[#4318FF]/10 transition-all"
                                            onClick={() => setIsTemplateModalOpen(true)}
                                        >
                                            <Layout className="h-4 w-4 mr-2" />
                                            Load from Template
                                        </Button>
                                    </div>
                                    <TipTapEditor content={emailBody} onChange={setEmailBody} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB 3: SCHEDULE */}
                        <TabsContent value="schedule" className="mt-0 space-y-6">
                            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 space-y-8">
                                <h3 className="text-xl font-bold text-[#1b254b] dark:text-white mb-6 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-[#4318FF]" />
                                    Scheduling Options
                                </h3>

                                <div className="grid gap-4">
                                    <label className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer ${sendOption === 'immediate' ? 'border-[#4318FF] bg-[#4318FF]/5 dark:border-[#01A3B4]' : 'border-gray-100 dark:border-white/5 bg-[#F4F7FE]/50 dark:bg-white/5'
                                        }`}>
                                        <input
                                            type="radio" name="sendOption" className="w-5 h-5 text-[#4318FF]"
                                            checked={sendOption === 'immediate'} onChange={() => setSendOption('immediate')}
                                        />
                                        <div>
                                            <p className="font-bold text-[#1b254b] dark:text-white">Send Immediately</p>
                                            <p className="text-xs text-[#A3AED0] font-medium">Campaign will enter the sending queue as soon as you confirm.</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer ${sendOption === 'later' ? 'border-[#4318FF] bg-[#4318FF]/5 dark:border-[#01A3B4]' : 'border-gray-100 dark:border-white/5 bg-[#F4F7FE]/50 dark:bg-white/5'
                                        }`}>
                                        <input
                                            type="radio" name="sendOption" className="w-5 h-5 text-[#4318FF]"
                                            checked={sendOption === 'later'} onChange={() => setSendOption('later')}
                                        />
                                        <div>
                                            <p className="font-bold text-[#1b254b] dark:text-white">Schedule for Later</p>
                                            <p className="text-xs text-[#A3AED0] font-medium">Pick a specific date and time for delivery.</p>
                                        </div>
                                    </label>

                                    {sendOption === 'later' && (
                                        <div className="mt-2 grid md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-3xl animate-in fade-in slide-in-from-top-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#A3AED0] ml-1 uppercase transition-all">Send Date</label>
                                                <Input type="date" value={sendDate} onChange={(e) => setSendDate(e.target.value)} className="rounded-xl border-gray-100 bg-white dark:bg-[#111C44]" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#A3AED0] ml-1 uppercase transition-all">Send Time</label>
                                                <Input type="time" value={sendTime} onChange={(e) => setSendTime(e.target.value)} className="rounded-xl border-gray-100 bg-white dark:bg-[#111C44]" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#A3AED0] ml-1 uppercase transition-all">Timezone</label>
                                                <select className="w-full h-10 rounded-xl border border-gray-100 bg-white dark:bg-[#111C44] px-3 font-bold text-sm outline-none">
                                                    <option>UTC +8:00 (Manila)</option>
                                                    <option>UTC +0:00 (London)</option>
                                                    <option>UTC -5:00 (New York)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-gray-100 dark:border-white/10">
                                    <h4 className="text-base font-bold text-[#1b254b] dark:text-white mb-4">Send a Test Email</h4>
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder="Enter recipient email..."
                                            className="rounded-xl border-gray-100 dark:border-white/10 bg-[#F4F7FE] dark:bg-white/5 max-w-sm"
                                            value={testEmailAddress}
                                            onChange={(e) => setTestEmailAddress(e.target.value)}
                                        />
                                        <Button
                                            variant="outline"
                                            className="rounded-xl font-bold border-gray-200 text-[#1b254b] dark:text-white"
                                            onClick={handleTestEmail}
                                            disabled={sendingTest}
                                        >
                                            {sendingTest ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <TestTube className="h-4 w-4 mr-2 text-[#4318FF]" />
                                            )}
                                            {sendingTest ? 'Sending...' : 'Send Test'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB 4: REVIEW */}
                        <TabsContent value="review" className="mt-0 space-y-6">
                            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 space-y-8">
                                <h3 className="text-xl font-bold text-[#1b254b] dark:text-white mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-[#4318FF]" />
                                    Final Review
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 gap-2">
                                        <span className="text-sm font-bold text-[#A3AED0]">Campaign Name</span>
                                        <span className="font-bold text-[#1b254b] dark:text-white">{campaignName || '—'}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 gap-2">
                                        <span className="text-sm font-bold text-[#A3AED0]">Subject Line</span>
                                        <span className="font-bold text-[#1b254b] dark:text-white">{subject || '—'}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 gap-2">
                                        <span className="text-sm font-bold text-[#A3AED0]">From / Reply-to</span>
                                        <span className="font-bold text-[#1b254b] dark:text-white text-right">
                                            {fromName} &lt;{fromEmail}&gt; <br />
                                        </span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 gap-2">
                                        <span className="text-sm font-bold text-[#A3AED0]">Audience</span>
                                        <div className="flex flex-wrap gap-1 justify-end max-w-sm">
                                            {selectedSegments.map(s => <Badge key={s} variant="secondary" className="rounded-full text-[10px]">{s}</Badge>)}
                                            {selectedModalities.map(m => <Badge key={m} className="bg-purple-50 text-purple-600 rounded-full text-[10px]">{m}</Badge>)}
                                            {selectedRegions.map(r => <Badge key={r} className="bg-amber-50 text-amber-600 rounded-full text-[10px]">{r}</Badge>)}
                                            {selectedUsers.length > 0 && <Badge className="bg-emerald-50 text-emerald-600 rounded-full text-[10px]">{selectedUsers.length} Selected {selectedUsers.length === 1 ? 'User' : 'Users'}</Badge>}
                                            {!selectedSegments.length && !selectedModalities.length && !selectedRegions.length && !selectedUsers.length && <span className="text-red-500 text-sm font-bold">No audience selected!</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 gap-2">
                                        <span className="text-sm font-bold text-[#A3AED0]">Recipients</span>
                                        <span className="text-xl font-black text-[#4318FF]">{estimatedReach.toLocaleString()} users</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 gap-2">
                                        <span className="text-sm font-bold text-[#A3AED0]">Scheduled Format</span>
                                        <span className="font-bold text-[#1b254b] dark:text-white">
                                            {sendOption === 'immediate' ? 'Send Immediately' : `Scheduled for ${sendDate} at ${sendTime}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 bg-[#F4F7FE] dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                                    <p className="text-xs font-bold text-[#A3AED0] uppercase mb-4 text-center">Body Preview (Snippet)</p>
                                    <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl border border-gray-100 dark:border-white/5 text-sm prose dark:prose-invert max-w-none line-clamp-[10] overflow-hidden opacity-60">
                                        <div dangerouslySetInnerHTML={{ __html: emailBody }} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>

                    {/* SIDE PANEL: REACH ESTIMATE & QUICK TIPS */}
                    <div className="space-y-6 lg:sticky lg:top-24">
                        <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Estimated Reach</h3>
                            <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#F4F7FE] dark:border-white/5 rounded-3xl">
                                <span className={`text-4xl font-black transition-all ${isRefreshingReach || previewLoading ? 'opacity-30 scale-95' : 'text-[#4318FF]'}`}>
                                    {previewLoading ? '...' : estimatedReach.toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-[#A3AED0] mt-1">RECIPIENTS</span>

                                <Button
                                    variant="ghost" size="sm"
                                    className="mt-6 rounded-xl text-xs font-extrabold text-[#4318FF]"
                                    onClick={() => updateReach(true)}
                                >
                                    <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshingReach ? 'animate-spin' : ''}`} />
                                    Refresh Estimate
                                </Button>
                            </div>
                            <p className="text-[10px] text-[#A3AED0] font-medium mt-4 text-center px-4">
                                * Unsubscribed and bounced users are automatically excluded from the final delivery list.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-4">Pro Tips</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <p className="text-xs font-medium text-[#A3AED0] leading-relaxed">
                                        Use <span className="text-[#1b254b] dark:text-white font-bold">{"{{first_name}}"}</span> to increase open rates by up to 20%.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <p className="text-xs font-medium text-[#A3AED0] leading-relaxed">
                                        Check the <span className="text-[#1b254b] dark:text-white font-bold">Mobile Preview</span> to ensure your layout works on small screens.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Tabs>

            {/* STICKY FOOTER ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 md:left-[290px] bg-white/90 dark:bg-[#111C44]/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 p-5 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <Button variant="ghost" onClick={() => navigate('/campaigns')} className="rounded-full font-bold text-[#A3AED0] hover:text-red-500">
                        Cancel
                    </Button>

                    <div className="flex items-center gap-3">
                        {activeTab !== 'audience' && (
                            <Button
                                variant="outline"
                                className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white px-6 py-5"
                                onClick={() => {
                                    const tabs = ['audience', 'compose', 'schedule', 'review']
                                    setActiveTab(tabs[tabs.indexOf(activeTab) - 1])
                                }}
                            >
                                Previous Step
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="rounded-full font-bold border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white px-6 py-5"
                            onClick={handleSaveDraft}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save as Draft'
                            )}
                        </Button>

                        {activeTab === 'review' ? (
                            <Button
                                className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-full px-10 py-5 font-extrabold shadow-[0_10px_20px_0_rgba(67,24,255,0.25)] transition-all"
                                onClick={handleLaunch}
                                disabled={launching}
                            >
                                {launching ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Launching...
                                    </>
                                ) : (
                                    sendOption === 'immediate' ? 'Send Now' : 'Schedule Campaign'
                                )}
                            </Button>
                        ) : (
                            <Button
                                className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-full px-8 py-5 font-bold shadow-[0_10px_20px_0_rgba(67,24,255,0.15)] group"
                                onClick={() => {
                                    const tabs = ['audience', 'compose', 'schedule', 'review']
                                    setActiveTab(tabs[tabs.indexOf(activeTab) + 1])
                                }}
                            >
                                Next Step
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* TEMPLATE LIBRARY MODAL */}
            <DialogPrimitive.Root open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
                    <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[70] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] rounded-[32px] bg-[#F4F7FE] dark:bg-[#0B1437] p-8 shadow-2xl animate-in zoom-in-95 duration-200 focus:outline-none border border-transparent dark:border-white/5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <DialogPrimitive.Title className="text-2xl font-black text-[#1b254b] dark:text-white">
                                    Template Library
                                </DialogPrimitive.Title>
                                <DialogPrimitive.Description className="text-[#A3AED0] font-medium mt-1">
                                    Choose a pre-designed layout to jumpstart your campaign.
                                </DialogPrimitive.Description>
                            </div>
                            <DialogPrimitive.Close asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white dark:hover:bg-white/5">
                                    <X className="h-5 w-5 text-[#A3AED0]" />
                                </Button>
                            </DialogPrimitive.Close>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className={`group relative bg-white dark:bg-[#111C44] rounded-[24px] overflow-hidden border-2 transition-all p-4 ${selectedTemplateId === template.id ? 'border-[#4318FF] ring-4 ring-[#4318FF]/10' : 'border-transparent hover:border-[#4318FF]/30'
                                        }`}
                                >
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-white/5 relative">
                                        {template.previewImage ? (
                                            <img src={template.previewImage} alt={template.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#A3AED0] text-xs font-bold">Template</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                size="sm"
                                                className="rounded-lg bg-[#4318FF] hover:bg-[#3311CC] text-white font-bold text-xs h-8"
                                                onClick={() => {
                                                    const fields = deriveTemplateFields(template)
                                                    const html = buildTemplateEmailHtml(fields, template.previewImage, template.name)
                                                    setEmailBody(html)
                                                    setSelectedTemplateId(template.id)
                                                    setIsTemplateModalOpen(false)
                                                }}
                                            >
                                                Select
                                            </Button>
                                        </div>
                                    </div>
                                    <Badge className="mb-2 bg-[#F4F7FE] dark:bg-white/5 text-[#4318FF] border-none font-bold text-[10px]">
                                        {template.category}
                                    </Badge>
                                    <h4 className="font-bold text-[#1b254b] dark:text-white mb-1">{template.name}</h4>
                                    <p className="text-[10px] text-[#A3AED0] font-medium leading-relaxed line-clamp-2">
                                        {template.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
        </div>
    )
}
