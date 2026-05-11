import { useMemo, useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Target,
  DollarSign
} from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import {
  DateRangePicker,
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
import { getRetreatsReport } from "../../api/reports";
import type { RetreatReportData } from "../../api/reports";
import { ReportSkeleton } from "../../components/ui/skeleton";

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

// --- Component ---

export function RetreatReport() {
  const [dateRange, setDateRange] = useState("Monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Monthly");
  const [reportData, setReportData] = useState<RetreatReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache to prevent duplicate requests
  const reportCache = useRef<Record<string, RetreatReportData>>({});

  // Sync granularity with the dropdown selection
  useEffect(() => {
    if (dateRange === "Daily") setGranularity("Daily");
    if (dateRange === "Weekly") setGranularity("Weekly");
    if (dateRange === "Monthly") setGranularity("Monthly");
  }, [dateRange]);

  // Fetch report data
  useEffect(() => {
    const rangeMap: Record<string, string> = {
      "Daily": "Today",
      "Weekly": "This Week",
      "Monthly": "This Month"
    };

    const apiRange = rangeMap[dateRange] || dateRange;
    const cacheKey = `${customStartDate}_${customEndDate}_${granularity}_${apiRange}`;

    const fetchData = async () => {
      if (reportCache.current[cacheKey]) {
        setReportData(reportCache.current[cacheKey]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getRetreatsReport(customStartDate, customEndDate, granularity, apiRange);
        setReportData(data);
        reportCache.current[cacheKey] = data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch retreat report data");
        console.error("Error fetching retreat report:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customStartDate, customEndDate, granularity, dateRange]);

  // Provide fallback data while loading
  const defaultData: RetreatReportData = {
    summary: [
      { title: "Active Retreats", value: "0", description: "0 total in period" },
      { title: "Booking Rate", value: "0%", description: "Platform wide capacity" },
      { title: "Total Revenue (Retreats)", value: "$0", description: "Current period" },
      { title: "Avg. Price", value: "$0", description: "Per person average" },
    ],
    retreatCountTrend: [],
    bookingRateTrend: [],
    revenueByEvent: [],
    topLocations: [],
    avgPriceTrend: [],
    durationBreakdown: [
      { name: "1-3 Days", value: 0, color: "#4318FF" },
      { name: "4-7 Days", value: 0, color: "#01A3B4" },
      { name: "7+ Days", value: 0, color: "#7C3AED" },
    ],
    retreatPerformanceData: [],
  };

  const data = reportData || defaultData;

  return (
    <div className="space-y-6 pb-12 px-4 md:px-0">
      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">Error: {error}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && <ReportSkeleton />}

      {/* Report Content */}
      <div className={isLoading ? "hidden" : "block space-y-6"}>

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Retreat Reports</h2>
            <p className="text-[#A3AED0] text-sm mt-1 font-medium italic">
              Analyze retreat listing growth, booking efficiency, and geographical popularity.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
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
                summaryData: data.summary,
                retreatCountTrend: data.retreatCountTrend,
                bookingRateTrend: data.bookingRateTrend,
                revenueByEvent: data.revenueByEvent,
                topLocations: data.topLocations,
                avgPriceTrend: data.avgPriceTrend,
                durationBreakdown: data.durationBreakdown,
                retreatPerformanceData: data.retreatPerformanceData,
              })}
              onExportPdf={() => exportRetreatReportPdf({
                summaryData: data.summary,
                retreatCountTrend: data.retreatCountTrend,
                bookingRateTrend: data.bookingRateTrend,
                revenueByEvent: data.revenueByEvent,
                topLocations: data.topLocations,
                avgPriceTrend: data.avgPriceTrend,
                durationBreakdown: data.durationBreakdown,
                retreatPerformanceData: data.retreatPerformanceData,
              })}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {data.summary.map((card, idx) => (
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
            data={data.retreatCountTrend}
            areas={[{ name: "Retreats", dataKey: "active", stroke: "#4318FF" }]}
          />
          <BaseLineChart
            title="Booking Rate over time (%)"
            data={data.bookingRateTrend}
            lines={[{ name: "Booking Rate", dataKey: "rate", stroke: "#01A3B4" }]}
          />
        </div>

        {/* Revenue & Locations Grid */}
        <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
          <BaseHorizontalBarChart
            title="Revenue by Retreat Event ($)"
            data={data.revenueByEvent}
            dataKey="revenue"
            nameKey="event"
            fill="#4318FF"
          />
          <BaseHorizontalBarChart
            title="Top Destinations for Retreats"
            data={data.topLocations}
            dataKey="count"
            nameKey="location"
            fill="#01A3B4"
          />
        </div>

        {/* Pricing & Duration Grid */}
        <div className="grid gap-5 md:grid-cols-1 xl:grid-cols-[1fr_400px]">
          <BaseBarChart
            title="Average Retreat Price per Person ($)"
            data={data.avgPriceTrend}
            bars={[{ name: "Avg Price", dataKey: "price", fill: "#7C3AED" }]}
          />
          <BasePieChart
            title="Retreats by Duration"
            data={data.durationBreakdown}
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
          <div className="overflow-x-auto -mx-6 px-6">
            <DataTable columns={columns} data={data.retreatPerformanceData} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default RetreatReport;
