import { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';

// Common Components
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { ExportDropdown } from '../../components/common/ExportDropdown';
import { ReportSkeleton } from '../../components/ui/skeleton';

// Reusable Chart Components
import { BaseLineChart } from '../../components/Charts/BaseLineChart';
import { BaseBarChart } from '../../components/Charts/BaseBarChart';
import { BaseAreaChart } from '../../components/Charts/BaseAreaChart';
import { BaseGaugeChart } from '../../components/Charts/BaseGaugeChart';

// Utilities
import { exportPlatformOverviewPdf, exportPlatformOverviewExcel } from '../../lib/exportUtils';
import { getPlatformOverview, type PlatformOverviewData } from '../../api/reports';

export function PlatformOverview() {
  const [granularity, setGranularity] = useState('Weekly');
  const [dateRange, setDateRange] = useState('Monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [reportData, setReportData] = useState<PlatformOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportCache = useRef<Record<string, PlatformOverviewData>>({});

  // Sync granularity with the dropdown selection (Monthly -> Weekly -> Daily mapping)
  useEffect(() => {
    if (dateRange === 'Daily') setGranularity('Daily');
    if (dateRange === 'Weekly') setGranularity('Weekly');
    if (dateRange === 'Monthly') setGranularity('Monthly');
  }, [dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      // Map dropdown labels to backend range keywords
      const rangeMap: Record<string, string> = {
        "Daily": "Today",
        "Weekly": "This Week",
        "Monthly": "This Month"
      };

      const apiRange = rangeMap[dateRange] || dateRange;
      const cacheKey = `${apiRange}-${granularity}-${customStartDate}-${customEndDate}`;

      if (reportCache.current[cacheKey]) {
        setReportData(reportCache.current[cacheKey]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getPlatformOverview(customStartDate, customEndDate, granularity, apiRange);
        setReportData(data);
        reportCache.current[cacheKey] = data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch platform overview");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, customStartDate, customEndDate, granularity]);

  const defaultData: PlatformOverviewData = {
    summary: [
      { title: "New Healers", value: "0", description: "Registered this period" },
      { title: "New Seekers", value: "0", description: "Registered this period" },
      { title: "Total Bookings", value: "0", description: "0 sessions · 0 retreats" },
      { title: "Gross Volume", value: "$0", description: "Total GBV this period" },
      { title: "Platform Revenue", value: "$0", description: "Comm. + Fees + Subs" },
      { title: "Platform Disputes", value: "0 / 0", description: "Opened / Resolved" },
      { title: "Premium Upgrades", value: "0", description: "New subscribers" }
    ],
    userGrowth: [],
    bookingVolume: [],
    revenue: [],
    healthScore: 0
  };

  const data = reportData || defaultData;

  const handleExportPdf = () => {
    exportPlatformOverviewPdf({
      dateRange: dateRange === 'Custom Range' ? `${customStartDate} to ${customEndDate}` : dateRange,
      summaryData: data.summary,
      userGrowthData: data.userGrowth,
      bookingVolumeData: data.bookingVolume,
      revenueData: data.revenue
    });
  };

  const handleExportExcel = () => {
    exportPlatformOverviewExcel({
      dateRange: dateRange === 'Custom Range' ? `${customStartDate} to ${customEndDate}` : dateRange,
      summaryData: data.summary,
      userGrowthData: data.userGrowth,
      bookingVolumeData: data.bookingVolume,
      revenueData: data.revenue
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-bold text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#4318FF] text-white rounded-xl font-bold transition-all hover:opacity-80"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-12 animate-in fade-in duration-700 max-w-[1700px] mx-auto overflow-hidden ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b254b] dark:text-white tracking-tighter">Platform Overview</h1>
            {isLoading && <Loader2 className="w-6 h-6 text-[#4318FF] animate-spin" />}
          </div>
          <p className="text-xs font-medium text-[#A3AED0] uppercase tracking-widest pl-0.5 mt-1">
            {dateRange === 'Custom Range' ? `From ${customStartDate} to ${customEndDate}` : `Reporting: ${dateRange}`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full xl:w-auto">
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />
          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <ReportSkeleton />}

      {/* Report Content */}
      <div className={isLoading ? "hidden" : "block space-y-12"}>

        {/* Summary Cards Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
          {data.summary.map((card, index) => (
            <StatsCard
              key={index}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={
                card.title.includes("Healers") ? <UserPlus className="h-6 w-6 text-[#4318FF]" /> :
                  card.title.includes("Seekers") ? <UserPlus className="h-6 w-6 text-[#6AD2FF]" /> :
                    card.title.includes("Bookings") ? <CalendarCheck className="h-6 w-6 text-amber-500" /> :
                      card.title.includes("Gross") ? <DollarSign className="h-6 w-6 text-emerald-500" /> :
                        card.title.includes("Revenue") ? <TrendingUp className="h-6 w-6 text-[#4318FF]" /> :
                          card.title.includes("Disputes") ? <AlertTriangle className="h-6 w-6 text-red-500" /> :
                            <Zap className="h-6 w-6 text-[#01A3B4]" />
              }
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          <BaseLineChart
            title="User Growth"
            data={data.userGrowth}
            lines={[
              { name: "Healers", dataKey: "healers", stroke: "#4318FF" },
              { name: "Seekers", dataKey: "seekers", stroke: "#6AD2FF" }
            ]}
          />

          <BaseBarChart
            title="Booking Volume"
            data={data.bookingVolume}
            bars={[
              { name: "Sessions", dataKey: "sessions", fill: "#4318FF", stackId: "a", radius: [0, 0, 0, 0] },
              { name: "Retreats", dataKey: "retreats", fill: "#6AD2FF", stackId: "a", radius: [6, 6, 0, 0] }
            ]}
          />

          <BaseAreaChart
            title="Revenue Composition"
            data={data.revenue}
            yAxisTickFormatter={(val) => `$${val / 1000}k`}
            areas={[
              { name: "Session Commission", dataKey: "commission", stroke: "#4318FF" },
              { name: "Seeker Fees", dataKey: "fees", stroke: "#6AD2FF" },
              { name: "Premium Subscriptions", dataKey: "premium", stroke: "#01A3B4" }
            ]}
          />

          <BaseGaugeChart
            title="Platform Health Score"
            data={[
              { name: 'Score', value: data.healthScore },
              { name: 'Remaining', value: 100 - data.healthScore },
            ]}
            colors={['#4318FF', '#F4F7FE']}
            score={data.healthScore}
            statusBadge={{
              text: data.summary[2]?.value === '0' ? 'Stable' : (data.healthScore >= 80 ? 'Excellent' : data.healthScore >= 60 ? 'Good' : 'Needs Attention'),
              className: `${data.summary[2]?.value === '0' ? 'bg-blue-50 text-blue-500' : (data.healthScore >= 80 ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500')} text-xs font-bold px-3 py-1 rounded-full`
            }}
            subtitle={
              data.summary[2]?.value === '0'
                ? <>No bookings recorded in this period</>
                : <>Based on <span className="text-[#4318FF] font-bold">{data.summary[2]?.value}</span> bookings this period</>
            }
          />
        </div>
      </div>
    </div>
  );
}
