import { useState, useMemo, useCallback } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/StatsCard"
import { StatsCardSkeleton, CampaignTableSkeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import {
    Plus,
    Search,
    Mail,
    CheckCircle2,
    Send,
    MousePointer2,
    RefreshCw,
} from "lucide-react"

import type { Campaign } from "./type"
import { STATUS_OPTIONS, AUDIENCE_OPTIONS, calculateAverage } from "./utils"
import { StatusBadge, ActionMenu, FilterChips, EmptyState } from "./components"
import { useCampaigns } from "./useCampaigns"


export function CampaignList() {
    const {
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
    } = useCampaigns()

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)

    const handleDeleteClick = useCallback((campaign: Campaign) => {
        setCampaignToDelete(campaign)
        setIsDeleteModalOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (campaignToDelete) {
            await handleDelete(campaignToDelete.id)
        }
        setIsDeleteModalOpen(false)
        setCampaignToDelete(null)
    }, [campaignToDelete, handleDelete])


    const stats = useMemo(() => {
        const sentThisMonth = campaigns.filter(c => {
            if (!c.sentAt) return false
            const sent = new Date(c.sentAt)
            const now = new Date()
            return sent.getMonth() === now.getMonth() && sent.getFullYear() === now.getFullYear()
        })

        const avgOpenRate = calculateAverage(campaigns, c => c.metrics?.opens ?? 0)
        const avgClickRate = calculateAverage(campaigns, c => c.metrics?.clicks ?? 0)

        return [
            { title: "Total Campaigns", value: campaigns.length, icon: <Mail className="h-6 w-6" />, trend: "neutral" as const },
            { title: "Sent This Month", value: sentThisMonth.length, icon: <Send className="h-6 w-6" />, trend: "up" as const },
            { title: "Avg Open Rate", value: `${(avgOpenRate * 100).toFixed(1)}%`, icon: <CheckCircle2 className="h-6 w-6" />, trend: "up" as const },
            { title: "Avg Click Rate", value: `${(avgClickRate * 100).toFixed(1)}%`, icon: <MousePointer2 className="h-6 w-6" />, trend: "up" as const },
        ]
    }, [campaigns])

    const hasActiveFilters = Boolean(searchQuery || statusFilter !== "All" || audienceFilter !== "All" || startDate || endDate || createdByFilter)

    // Table Columns
    const columns: ColumnDef<Campaign>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <Link
                    to={`/campaigns/${row.original.id}/edit`}
                    className="font-bold text-[#1b254b] dark:text-white hover:text-[#4318FF] transition-colors"
                >
                    {row.original.name}
                </Link>
            ),
        },
        {
            accessorKey: "audience",
            header: "Audience",
            cell: ({ row }) => (
                <span className="font-medium text-[#A3AED0]">{row.original.audience}</span>
            ),
        },
        {
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }) => (
                <span className="text-[#A3AED0] max-w-[200px] truncate block">{row.original.subject}</span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: "recipients",
            header: "Recipients",
            cell: ({ row }) => (
                <span className="font-bold text-[#1b254b] dark:text-white">
                    {row.original.recipients.toLocaleString()}
                </span>
            ),
        },
        {
            accessorKey: "openRate",
            header: "Open Rate",
            cell: ({ row }) => (
                <span className="font-bold text-[#1b254b] dark:text-white">
                    {row.original.openRate.toFixed(1)}%
                </span>
            ),
        },
        {
            accessorKey: "clickRate",
            header: "Click Rate",
            cell: ({ row }) => (
                <span className="font-bold text-[#1b254b] dark:text-white">
                    {row.original.clickRate.toFixed(1)}%
                </span>
            ),
        },
        {
            accessorKey: "sentAt",
            header: "Sent At",
            cell: ({ row }) => (
                <span className="text-[#A3AED0] text-xs font-medium">
                    {row.original.sentAt ? new Date(row.original.sentAt).toLocaleDateString() : "—"}
                </span>
            ),
        },
        {
            accessorKey: "createdBy",
            header: "Created By",
            cell: ({ row }) => (
                <span className="text-[#A3AED0] text-xs font-medium">{row.original.createdBy}</span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <ActionMenu
                        campaign={row.original}
                        onDuplicate={handleDuplicate}
                        onSendTest={handleSendTest}
                        onSendNow={handleSendNow}
                        onDelete={handleDeleteClick}
                    />
                </div>
            ),
        },
    ], [handleDuplicate, handleSendTest, handleSendNow, handleDeleteClick])


    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">
                            Email Campaigns
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-[#01A3B4] p-2"
                        >
                            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Compose, schedule, and track campaigns sent to healers and seekers.
                    </p>
                </div>

                <Button
                    asChild
                    className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-full px-6 py-5 font-bold shadow-[0_10px_20px_0_rgba(67,24,255,0.15)] transition-all"
                >
                    <Link to="/campaigns/new" className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        New Campaign
                    </Link>
                </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <StatsCardSkeleton key={i} />
                        ))}
                    </>
                ) : (
                    stats.map((stat, idx) => (
                        <StatsCard
                            key={idx}
                            title={stat.title}
                            value={stat.value.toString()}
                            icon={stat.icon}
                            trend={stat.trend}
                            description={idx === 1 ? "+2 from last month" : undefined}
                        />
                    ))
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Search & Filters */}
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
                            <Input
                                placeholder="Search campaigns..."
                                className="pl-10 rounded-xl border-gray-100 dark:border-white/10 bg-[#F4F7FE] dark:bg-white/5 focus-visible:ring-[#4318FF]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <select
                            className="bg-[#F4F7FE] dark:bg-white/5 text-[#1b254b] dark:text-white text-sm font-bold rounded-xl border-none px-4 py-2.5 focus:ring-2 focus:ring-[#4318FF] transition-all cursor-pointer outline-none min-w-[140px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status === "All" ? "All Statuses" : status}</option>
                            ))}
                        </select>

                        <select
                            className="bg-[#F4F7FE] dark:bg-white/5 text-[#1b254b] dark:text-white text-sm font-bold rounded-xl border-none px-4 py-2.5 focus:ring-2 focus:ring-[#4318FF] transition-all cursor-pointer outline-none min-w-[140px]"
                            value={audienceFilter}
                            onChange={(e) => setAudienceFilter(e.target.value)}
                        >
                            {AUDIENCE_OPTIONS.map(audience => (
                                <option key={audience} value={audience}>{audience === "All" ? "All Audiences" : audience}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2 bg-[#F4F7FE] dark:bg-white/5 px-4 py-1.5 rounded-xl border-none">
                            <span className="text-[10px] font-bold text-[#A3AED0] uppercase">From</span>
                            <input 
                                type="date" 
                                className="bg-transparent text-[#1b254b] dark:text-white text-xs font-bold outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-[10px] font-bold text-[#A3AED0] uppercase px-1">To</span>
                            <input 
                                type="date" 
                                className="bg-transparent text-[#1b254b] dark:text-white text-xs font-bold outline-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A3AED0]" />
                            <Input
                                placeholder="Created by..."
                                className="pl-9 h-10 w-[180px] rounded-xl border-none bg-[#F4F7FE] dark:bg-white/5 text-sm font-bold focus-visible:ring-[#4318FF]"
                                value={createdByFilter}
                                onChange={(e) => setCreatedByFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Chips & Count */}
                    <div className="flex flex-wrap items-center gap-2">
                        <FilterChips
                            searchQuery={searchQuery}
                            statusFilter={statusFilter}
                            audienceFilter={audienceFilter}
                            startDate={startDate}
                            endDate={endDate}
                            createdByFilter={createdByFilter}
                            onClearSearch={() => setSearchQuery("")}
                            onClearStatus={() => setStatusFilter("All")}
                            onClearAudience={() => setAudienceFilter("All")}
                            onClearDate={() => { setStartDate(""); setEndDate(""); }}
                            onClearCreatedBy={() => setCreatedByFilter("")}
                            onClearAll={() => { 
                                setSearchQuery(""); 
                                setStatusFilter("All"); 
                                setAudienceFilter("All");
                                setStartDate("");
                                setEndDate("");
                                setCreatedByFilter("");
                            }}
                        />
                        <span className="text-sm font-medium text-[#A3AED0] ml-2">
                            {campaigns.length === totalCount
                                ? `${campaigns.length} ${campaigns.length === 1 ? "campaign" : "campaigns"}`
                                : `${campaigns.length} of ${totalCount} ${totalCount === 1 ? "campaign" : "campaigns"}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 overflow-x-auto">
                {loading ? (
                    <CampaignTableSkeleton />
                ) : campaigns.length === 0 ? (
                    <EmptyState hasFilters={hasActiveFilters} />
                ) : (
                    <DataTable columns={columns} data={campaigns} />
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Campaign"
                description={`Are you sure you want to delete "${campaignToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    )
}

