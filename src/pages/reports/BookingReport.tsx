import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  Award,
  Loader2,
  AlertCircle
} from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import {
  DateRangePicker,
  ExportDropdown
} from "../../components/common";
import { ReportSkeleton } from "../../components/ui/skeleton";
import {
  BaseAreaChart,
  BaseBarChart,
  BaseHorizontalBarChart,
  BaseLineChart,
  BasePieChart
} from "../../components/Charts";
import { exportBookingReportExcel, exportBookingReportPdf } from "../../lib/exportUtils";
import { getBookingReport, type BookingReportData } from "../../api/reports";

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
  const [dateRange, setDateRange] = useState("Monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<BookingReportData | null>(null);
  
  const reportCache = useRef<Record<string, BookingReportData>>({});

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if Custom is selected but dates are incomplete
      if (dateRange === "Custom" && (!customStartDate || !customEndDate)) {
        return;
      }

      const cacheKey = `${dateRange}-${customStartDate}-${customEndDate}`;
      if (reportCache.current[cacheKey]) {
        setReportData(reportCache.current[cacheKey]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Map common dateRange strings to backend expected range / granularity
        let rangeParam = dateRange;
        let granularityParam = "Weekly";

        if (dateRange === "Daily" || dateRange === "Today") {
          rangeParam = "Today";
          granularityParam = "Hourly";
        } else if (dateRange === "Weekly" || dateRange === "This Week") {
          rangeParam = "This Week";
          granularityParam = "Daily";
        } else if (dateRange === "Monthly" || dateRange === "This Month") {
          rangeParam = "This Month";
          granularityParam = "Weekly";
        } else if (dateRange === "Yearly" || dateRange === "This Year") {
          rangeParam = "This Year";
          granularityParam = "Monthly";
        }

        const data = await getBookingReport(
          dateRange === "Custom" ? customStartDate : undefined,
          dateRange === "Custom" ? customEndDate : undefined,
          granularityParam,
          rangeParam
        );
        
        reportCache.current[cacheKey] = data;
        setReportData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load booking report data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, customStartDate, customEndDate]);

  const handleRetry = () => {
    const cacheKey = `${dateRange}-${customStartDate}-${customEndDate}`;
    delete reportCache.current[cacheKey];
    setDateRange((prev) => prev); // force re-trigger
  };

  const getExportDateRange = () => {
    if (dateRange === "Custom") {
      return `${customStartDate || "Start"} to ${customEndDate || "End"}`;
    }
    return dateRange;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Booking & Session Report</h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-[#4318FF]" />}
          </div>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium italic">
            Monitor platform booking volume, practitioner performance, and session demographics.
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
            onExportExcel={() => reportData && exportBookingReportExcel({ 
              dateRange: getExportDateRange(),
              summaryData: reportData.summaryData, 
              bookingVolume: reportData.bookingVolume, 
              avgBookingValue: reportData.avgBookingValue,
              modalityPopularity: reportData.modalityPopularity, 
              durationDistribution: reportData.durationDistribution, 
              completionRate: reportData.completionRate, 
              formatBreakdown: reportData.formatBreakdown,
              topHealersByCount: reportData.topHealersByCount,
              topHealersByRevenue: reportData.topHealersByRevenue
            })} 
            onExportPdf={() => reportData && exportBookingReportPdf({ 
              dateRange: getExportDateRange(),
              summaryData: reportData.summaryData, 
              bookingVolume: reportData.bookingVolume, 
              avgBookingValue: reportData.avgBookingValue,
              modalityPopularity: reportData.modalityPopularity, 
              durationDistribution: reportData.durationDistribution, 
              completionRate: reportData.completionRate, 
              formatBreakdown: reportData.formatBreakdown,
              topHealersByCount: reportData.topHealersByCount,
              topHealersByRevenue: reportData.topHealersByRevenue
            })} 
          />
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#111C44] rounded-3xl shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-[#1b254b] dark:text-white mb-2">Error Loading Report</h3>
          <p className="text-[#A3AED0] mb-6 text-center max-w-md">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-6 py-2.5 bg-[#4318FF] hover:bg-[#3311DB] text-white rounded-xl font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      ) : isLoading && !reportData ? (
        <ReportSkeleton />
      ) : reportData ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {reportData.summaryData.map((card, idx) => (
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
          data={reportData.bookingVolume}
          bars={[{ name: "Bookings", dataKey: "bookings", fill: "#4318FF" }]}
        />
        <BaseLineChart
          title="Average Booking Value ($)"
          data={reportData.avgBookingValue}
          lines={[{ name: "Avg Value", dataKey: "value", stroke: "#01A3B4" }]}
        />
      </div>

      {/* Specialty Metrics Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseHorizontalBarChart
          title="Modality Popularity (Sessions count)"
          data={reportData.modalityPopularity}
          dataKey="sessions"
          nameKey="modality"
          fill="#4318FF"
        />
        <BaseBarChart
          title="Session Length Distribution"
          data={reportData.durationDistribution.map(d => ({ ...d, name: d.length }))}
          bars={[{ name: "Sessions", dataKey: "count", fill: "#01A3B4" }]}
        />
      </div>

      {/* Funnels & Formats Grid */}
      <div className="grid gap-5 md:grid-cols-1 xl:grid-cols-[1fr_400px]">
        <BaseAreaChart
          title="Booking Lifecycle Completion Rate (%)"
          data={reportData.completionRate.map(c => ({ ...c, name: c.status }))}
          areas={[{ name: "Success %", dataKey: "rate", stroke: "#7C3AED" }]}
        />
        <BasePieChart
          title="Format Breakdown (Remote vs In-Person)"
          data={reportData.formatBreakdown}
        />
      </div>

      {/* Top Healers Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseHorizontalBarChart
          title="Top 10 Practitioners by Booking Count"
          data={reportData.topHealersByCount}
          dataKey="count"
          nameKey="name"
          fill="#4318FF"
        />
        <BaseHorizontalBarChart
          title="Top 10 Practitioners by Revenue ($)"
          data={reportData.topHealersByRevenue}
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
          <DataTable columns={columns} data={reportData.topHealersByCount} />
        </div>
      </div>
      </div>
      ) : null}
    </div>
  );
}

export default BookingReport;
