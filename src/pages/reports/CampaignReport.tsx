import { useState } from "react";
import {
  Send,
  CheckCircle2,
  Award,
  Zap,
  BarChart3
} from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import {
  DateRangePicker,
  GranularityTabs,
  ExportDropdown
} from "../../components/common";
import {
  BaseAreaChart,
  BaseBarChart,
  BaseGaugeChart,
  BaseLineChart
} from "../../components/Charts";
import { DataTable } from "../../components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { exportCampaignExcel, exportCampaignPdf } from "../../lib/exportUtils";

// --- Mock Data ---

const summaryData: any[] = [
  { id: "1", name: "Welcome Series #1", sent: 12400, openRate: 48.2, ctr: 8.4, bounceRate: 0.1, status: "completed" },
  { id: "2", name: "Monthly Wellness Mar", sent: 8500, openRate: 32.5, ctr: 4.1, bounceRate: 0.3, status: "completed" },
  { id: "3", name: "Healer Spotlight: Yoga", sent: 3200, openRate: 25.1, ctr: 3.2, bounceRate: 0.5, status: "completed" },
  { id: "4", name: "New Feature: Audio Sessions", sent: 15600, openRate: 41.8, ctr: 6.7, bounceRate: 0.2, status: "completed" },
  { id: "5", name: "Feedback Request - Feb", sent: 9800, openRate: 18.9, ctr: 2.1, bounceRate: 0.8, status: "completed" },
];

const unsubscribeTrend = [
  { name: "Week 1", rate: 0.12 },
  { name: "Week 2", rate: 0.15 },
  { name: "Week 3", rate: 0.11 },
  { name: "Week 4", rate: 0.08 },
  { name: "Week 5", rate: 0.09 },
  { name: "Week 6", rate: 0.07 },
];

const segmentPerformance = [
  { name: "Seekers", value: 85 },
  { name: "Healers", value: 72 },
  { name: "Inactive", value: 45 },
  { name: "Premium", value: 94 },
];

const reachData = [
  { name: "Jan", sent: 45000, delivered: 44200 },
  { name: "Feb", sent: 52000, delivered: 51000 },
  { name: "Mar", sent: 61000, delivered: 60500 },
];

// --- Column Definitions ---

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Campaign Name",
    cell: ({ row }) => <span className="font-bold text-[#1b254b] dark:text-white">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "sent",
    header: "Sent",
    cell: ({ row }) => <span className="font-semibold text-[#A3AED0]">{Number(row.getValue("sent")).toLocaleString()}</span>,
  },
  {
    accessorKey: "openRate",
    header: "Open Rate",
    cell: ({ row }) => <span className="font-bold text-emerald-500">{row.getValue("openRate")}%</span>,
  },
  {
    accessorKey: "ctr",
    header: "CTR",
    cell: ({ row }) => <span className="font-bold text-[#4318FF] dark:text-[#01A3B4]">{row.getValue("ctr")}%</span>,
  },
  {
    accessorKey: "bounceRate",
    header: "Bounce",
    cell: ({ row }) => <span className="font-medium text-red-500">{row.getValue("bounceRate")}%</span>,
  },
];

export function CampaignReport() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Weekly");

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Campaign Performance</h2>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium italic">
            Detailed analytics for all email and platform notification campaigns.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <GranularityTabs granularity={granularity} setGranularity={setGranularity} />
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />
          <ExportDropdown
            onExportExcel={() => exportCampaignExcel({ summaryData, reachData, unsubscribeTrend, segmentPerformance })}
            onExportPdf={() => exportCampaignPdf({ summaryData, reachData, unsubscribeTrend, segmentPerformance })}
          />
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Best-performing campaign by open rate"
          value="48.2%"
          description="Welcome Series #1"
          icon={<Award className="h-6 w-6" />}
        />
        <StatsCard
          title="Avg. CTR (Clicks)"
          value="5.25%"
          description="+1.2% from last month"
          icon={<Zap className="h-6 w-6" />}
        />
        <StatsCard
          title="Total Transmitted"
          value="49,500"
          description="Across 5 active campaigns"
          icon={<Send className="h-6 w-6" />}
        />
        <StatsCard
          title="Deliverability Score"
          value="98.2%"
          description="-0.05% fluctuation"
          icon={<BarChart3 className="h-6 w-6" />}
        />
      </div>

      {/* Charts Main Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseAreaChart
          title="Reach & Deliverability Trend"
          data={reachData}
          areas={[
            { name: "Sent", dataKey: "sent", stroke: "#4318FF" },
            { name: "Delivered", dataKey: "delivered", stroke: "#01A3B4" }
          ]}
        />
        <BaseGaugeChart
          title="Deliverability Health"
          score={98.2}
          data={[
            { name: "Pass", value: 98.2 },
            { name: "Fail", value: 1.8 }
          ]}
          colors={["#01A3B4", "#E2E8F0"]}
          subtitle="Your current SPF/DKIM/DMARC health is excellent."
          statusBadge={{ text: "HEALTHY", className: "bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold" }}
        />
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseLineChart
          title="Unsubscribe Rate Trend (%)"
          data={unsubscribeTrend}
          lines={[{ name: "Unsubscribe Rate", dataKey: "rate", stroke: "#FF5B5B" }]}
        />
        <BaseBarChart
          title="Audience Segment Performance (Engagement %)"
          data={segmentPerformance}
          bars={[{ name: "Engagement", dataKey: "value", fill: "#4318FF", radius: [10, 10, 0, 0] }]}
        />
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">All Campaigns Summary</h3>
          <div className="flex items-center gap-2 bg-[#F4F7FE] dark:bg-white/5 px-4 py-2 rounded-full text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Verified Statistics
          </div>
        </div>
        <DataTable columns={columns} data={summaryData} />
      </div>

    </div>
  );
}
