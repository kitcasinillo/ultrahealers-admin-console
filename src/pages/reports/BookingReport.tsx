import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  Award
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
  BaseHorizontalBarChart,
  BaseLineChart,
  BasePieChart
} from "../../components/Charts";
import { exportBookingReportExcel, exportBookingReportPdf } from "../../lib/exportUtils";

// --- Mock Data ---

const bookingVolume = [
  { name: "Mon", bookings: 145 },
  { name: "Tue", bookings: 132 },
  { name: "Wed", bookings: 164 },
  { name: "Thu", bookings: 188 },
  { name: "Fri", bookings: 210 },
  { name: "Sat", bookings: 245 },
  { name: "Sun", bookings: 198 },
];

const modalityPopularity = [
  { modality: "Meditation", sessions: 850 },
  { modality: "Yoga", sessions: 720 },
  { modality: "Reiki", sessions: 450 },
  { modality: "Astrology", sessions: 380 },
  { modality: "Counseling", sessions: 310 },
];

const formatBreakdown = [
  { name: "Remote", value: 65, color: "#4318FF" },
  { name: "In-Person", value: 35, color: "#01A3B4" },
];

const durationDistribution = [
  { length: "30m", count: 420 },
  { length: "60m", count: 850 },
  { length: "90m", count: 310 },
  { length: "2h+", count: 145 },
];

const completionRate = [
  { status: "Requested", rate: 100 },
  { status: "Confirmed", rate: 88 },
  { status: "Paid", rate: 85 },
  { status: "Completed", rate: 82 },
  { status: "Reviewed", rate: 65 },
];

const avgBookingValue = [
  { name: "Week 1", value: 85 },
  { name: "Week 2", value: 92 },
  { name: "Week 3", value: 88 },
  { name: "Week 4", value: 95 },
  { name: "Week 5", value: 102 },
  { name: "Week 6", value: 98 },
];

const topHealersByCount = [
  { name: "Sarah Chen", count: 145, revenue: 12500, rating: 4.9 },
  { name: "Marcus Thorne", count: 132, revenue: 11200, rating: 4.8 },
  { name: "Elena Rodriguez", count: 118, revenue: 9800, rating: 4.7 },
  { name: "Brother John", count: 105, revenue: 8400, rating: 4.6 },
  { name: "Aria Moonsong", count: 98, revenue: 7600, rating: 4.9 },
  { name: "David Kim", count: 85, revenue: 6800, rating: 4.5 },
  { name: "Maya Patel", count: 72, revenue: 5900, rating: 4.8 },
  { name: "Samuel Green", count: 65, revenue: 5200, rating: 4.4 },
  { name: "Luna Star", count: 58, revenue: 4800, rating: 5.0 },
  { name: "Zoe Rivers", count: 42, revenue: 3500, rating: 4.3 },
];

const topHealersByRevenue = [...topHealersByCount].sort((a, b) => b.revenue - a.revenue);

// --- Column Definitions ---
import { DataTable } from "../../components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Practitioner",
    cell: ({ row }) => <span className="font-bold text-[#1b254b] dark:text-white">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "count",
    header: "Bookings",
    cell: ({ row }) => <span className="font-semibold text-[#A3AED0]">{row.getValue("count")}</span>,
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => <span className="font-bold text-[#4318FF] dark:text-[#01A3B4]">${Number(row.getValue("revenue")).toLocaleString()}</span>,
  },
  {
    accessorKey: "rating",
    header: "Avg Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="font-bold text-amber-500">{row.getValue("rating")}</span>
        <span className="text-[#A3AED0] text-[10px]">★</span>
      </div>
    ),
  },
];

export function BookingReport() {
  const [dateRange, setDateRange] = useState("This Month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Daily");

  const summaryData = [
    { title: "Total Bookings", value: "1,245", description: "+8% from last month" },
    { title: "Avg. Session Value", value: "$92.40", description: "Steady platform average" },
    { title: "Repeat Rate", value: "24.5%", description: "Seekers with 2+ bookings" },
    { title: "Completion Rate", value: "82%", description: "Request to successfully finished" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Booking & Session Report</h2>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium italic">
            Monitor platform booking volume, practitioner performance, and session demographics.
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
            onExportExcel={() => exportBookingReportExcel({ 
              summaryData, 
              bookingVolume, 
              avgBookingValue,
              modalityPopularity, 
              durationDistribution, 
              completionRate, 
              formatBreakdown,
              topHealersByCount,
              topHealersByRevenue
            })} 
            onExportPdf={() => exportBookingReportPdf({ 
              summaryData, 
              bookingVolume, 
              avgBookingValue,
              modalityPopularity, 
              durationDistribution, 
              completionRate, 
              formatBreakdown,
              topHealersByCount,
              topHealersByRevenue
            })} 
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((card, idx) => (
          <StatsCard
            key={idx}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={
              card.title.includes("Total") ? <Calendar className="h-6 w-6 text-[#4318FF]" /> :
                card.title.includes("Value") ? <DollarSign className="h-6 w-6 text-emerald-500" /> :
                  card.title.includes("Repeat") ? <Users className="h-6 w-6 text-[#01A3B4]" /> :
                    <CheckCircle2 className="h-6 w-6 text-amber-500" />
            }
          />
        ))}
      </div>

      {/* Main Trends Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseBarChart
          title="Booking Volume"
          data={bookingVolume}
          bars={[{ name: "Bookings", dataKey: "bookings", fill: "#4318FF" }]}
        />
        <BaseLineChart
          title="Average Booking Value ($)"
          data={avgBookingValue}
          lines={[{ name: "Avg Value", dataKey: "value", stroke: "#01A3B4" }]}
        />
      </div>

      {/* Specialty Metrics Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseHorizontalBarChart
          title="Modality Popularity (Sessions count)"
          data={modalityPopularity}
          dataKey="sessions"
          nameKey="modality"
          fill="#4318FF"
        />
        <BaseBarChart
          title="Session Length Distribution"
          data={durationDistribution}
          xAxisKey="length"
          bars={[{ name: "Sessions", dataKey: "count", fill: "#01A3B4" }]}
        />
      </div>

      {/* Funnels & Formats Grid */}
      <div className="grid gap-5 md:grid-cols-1 xl:grid-cols-[1fr_400px]">
        <BaseAreaChart
          title="Booking Lifecycle Completion Rate (%)"
          data={completionRate}
          xAxisKey="status"
          areas={[{ name: "Success %", dataKey: "rate", stroke: "#7C3AED" }]}
        />
        <BasePieChart
          title="Format Breakdown (Remote vs In-Person)"
          data={formatBreakdown}
        />
      </div>

      {/* Top Healers Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseHorizontalBarChart
          title="Top 10 Practitioners by Booking Count"
          data={topHealersByCount}
          dataKey="count"
          nameKey="name"
          fill="#4318FF"
        />
        <BaseHorizontalBarChart
          title="Top 10 Practitioners by Revenue ($)"
          data={topHealersByRevenue}
          dataKey="revenue"
          nameKey="name"
          fill="#01A3B4"
        />
      </div>

      {/* Performance Table */}
      <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Practitioner Performance Summary</h3>
          <div className="flex items-center gap-2 bg-[#F4F7FE] dark:bg-white/5 px-4 py-2 rounded-full text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            Top Performers
          </div>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <DataTable columns={columns} data={topHealersByCount} />
        </div>
      </div>

    </div>
  );
}

export default BookingReport;
