import { useState } from "react";
import {
  TrendingUp,
  Target,
  DollarSign
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
import { exportRetreatReportExcel, exportRetreatReportPdf } from "../../lib/exportUtils";

// --- Mock Data ---

const retreatCountTrend = [
  { name: "Oct", active: 12 },
  { name: "Nov", active: 15 },
  { name: "Dec", active: 22 },
  { name: "Jan", active: 18 },
  { name: "Feb", active: 25 },
  { name: "Mar", active: 31 },
];

const bookingRateTrend = [
  { name: "Oct", rate: 62 },
  { name: "Nov", rate: 58 },
  { name: "Dec", rate: 75 },
  { name: "Jan", rate: 68 },
  { name: "Feb", rate: 82 },
  { name: "Mar", rate: 88 },
];

const revenueByEvent = [
  { event: "Silent Zen Bali", revenue: 45000 },
  { event: "Mountain Yoga", revenue: 32000 },
  { event: "Desert Healing", revenue: 28000 },
  { event: "Ocean Flow", revenue: 25000 },
  { event: "Forest Bathing", revenue: 18000 },
];

const topLocations = [
  { location: "Bali, Indonesia", count: 12 },
  { location: "Rishikesh, India", count: 8 },
  { location: "Sedona, USA", count: 5 },
  { location: "Tulum, Mexico", count: 4 },
  { location: "Ibiza, Spain", count: 3 },
];

const avgPriceTrend = [
  { name: "Oct", price: 1200 },
  { name: "Nov", price: 1150 },
  { name: "Dec", price: 1350 },
  { name: "Jan", price: 1280 },
  { name: "Feb", price: 1420 },
  { name: "Mar", price: 1550 },
];

const durationBreakdown = [
  { name: "1–3 Days", value: 25, color: "#4318FF" },
  { name: "4–7 Days", value: 55, color: "#01A3B4" },
  { name: "7+ Days", value: 20, color: "#7C3AED" },
];

// --- Column Definitions ---
import { DataTable } from "../../components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "event",
    header: "Retreat Event",
    cell: ({ row }) => <span className="font-bold text-[#1b254b] dark:text-white">{row.getValue("event")}</span>,
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => <span className="font-extrabold text-[#4318FF] dark:text-[#01A3B4]">${Number(row.getValue("revenue")).toLocaleString()}</span>,
  },
  {
    accessorKey: "rate",
    header: "Booking Rate",
    cell: ({ row }) => {
        const val = Number(row.getValue("rate"));
        return (
            <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${val}%` }} />
                </div>
                <span className="font-bold text-emerald-500 text-xs">{val}%</span>
            </div>
        );
    },
  },
  {
    accessorKey: "price",
    header: "Avg Price",
    cell: ({ row }) => <span className="font-semibold text-[#A3AED0]">${Number(row.getValue("price")).toLocaleString()}</span>,
  },
];

const retreatPerformanceData = [
    { event: "Silent Zen Bali", revenue: 45000, rate: 100, price: 1500 },
    { event: "Mountain Yoga", revenue: 32000, rate: 85, price: 1200 },
    { event: "Desert Healing", revenue: 28000, rate: 72, price: 1400 },
    { event: "Ocean Flow", revenue: 25000, rate: 90, price: 1100 },
    { event: "Forest Bathing", revenue: 18000, rate: 65, price: 900 },
];

export function RetreatReport() {
  const [dateRange, setDateRange] = useState("Last 6 Months");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Monthly");

  const summaryData = [
    { title: "Active Retreats", value: "31", description: "+6 from last month" },
    { title: "Booking Rate", value: "78%", description: "Platform wide capacity" },
    { title: "Total Revenue (Retreats)", value: "$148,200", description: "Current period" },
    { title: "Avg. Price", value: "$1,350", description: "Per person average" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Retreat Reports</h2>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium italic">
            Analyze retreat listing growth, booking efficiency, and geographical popularity.
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
            onExportExcel={() => exportRetreatReportExcel({ 
              summaryData, 
              retreatCountTrend, 
              bookingRateTrend, 
              revenueByEvent, 
              topLocations, 
              avgPriceTrend, 
              durationBreakdown, 
              retreatPerformanceData 
            })} 
            onExportPdf={() => exportRetreatReportPdf({ 
              summaryData, 
              retreatCountTrend, 
              bookingRateTrend, 
              revenueByEvent, 
              topLocations, 
              avgPriceTrend, 
              durationBreakdown, 
              retreatPerformanceData 
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
              card.title.includes("Active") ? <TrendingUp className="h-6 w-6 text-[#4318FF]" /> :
              card.title.includes("Rate") ? <Target className="h-6 w-6 text-amber-500" /> :
              card.title.includes("Revenue") ? <DollarSign className="h-6 w-6 text-emerald-500" /> :
              <TrendingUp className="h-6 w-6 text-[#01A3B4]" />
            }
          />
        ))}
      </div>

      {/* Main Trends Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseAreaChart
          title="Active Retreats Count Trend"
          data={retreatCountTrend}
          areas={[{ name: "Retreats", dataKey: "active", stroke: "#4318FF" }]}
        />
        <BaseLineChart
          title="Booking Rate over time (%)"
          data={bookingRateTrend}
          lines={[{ name: "Booking Rate", dataKey: "rate", stroke: "#01A3B4" }]}
        />
      </div>

      {/* Revenue & Locations Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseHorizontalBarChart
          title="Revenue by Retreat Event ($)"
          data={revenueByEvent}
          dataKey="revenue"
          nameKey="event"
          fill="#4318FF"
        />
        <BaseHorizontalBarChart
          title="Top Destinations for Retreats"
          data={topLocations}
          dataKey="count"
          nameKey="location"
          fill="#01A3B4"
        />
      </div>

      {/* Pricing & Duration Grid */}
      <div className="grid gap-5 md:grid-cols-1 xl:grid-cols-[1fr_400px]">
        <BaseBarChart
          title="Average Retreat Price per Person ($)"
          data={avgPriceTrend}
          bars={[{ name: "Avg Price", dataKey: "price", fill: "#7C3AED" }]}
        />
        <BasePieChart
          title="Retreats by Duration"
          data={durationBreakdown}
        />
      </div>

      {/* Performance Overview Table */}
      <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Retreat Event Performance Overview</h3>
          <div className="flex items-center gap-2 bg-[#F4F7FE] dark:bg-white/5 px-4 py-2 rounded-full text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider">
            <Target className="h-3.5 w-3.5 text-[#4318FF]" />
            Efficiency Tracking
          </div>
        </div>
        <DataTable columns={columns} data={retreatPerformanceData} />
      </div>

    </div>
  );
}

export default RetreatReport;
