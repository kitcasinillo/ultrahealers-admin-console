import { useMemo, useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  UserCheck,
  UserMinus,
  CreditCard
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
  BaseLineChart
} from "../../components/Charts";
import { exportGrowthExcel, exportGrowthPdf } from "../../lib/exportUtils";
import { getUserReport } from "../../api/reports";
import type { UserReportData } from "../../api/reports";
import { ReportSkeleton } from "../../components/ui/skeleton";


// --- Components ---

export function UserReport() {
  const [dateRange, setDateRange] = useState("Monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Monthly");
  const [reportData, setReportData] = useState<UserReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache to prevent duplicate requests on tab/range switches
  const reportCache = useRef<Record<string, UserReportData>>({});

  // Sync granularity with the dropdown selection
  useEffect(() => {
    if (dateRange === "Daily") setGranularity("Daily");
    if (dateRange === "Weekly") setGranularity("Weekly");
    if (dateRange === "Monthly") setGranularity("Monthly");
  }, [dateRange]);

  // Fetch report data when date range or granularity changes
  useEffect(() => {
    // Map dropdown labels to backend range keywords
    const rangeMap: Record<string, string> = {
      "Daily": "Today",
      "Weekly": "This Week",
      "Monthly": "This Month"
    };

    const apiRange = rangeMap[dateRange] || dateRange;
    const cacheKey = `${customStartDate}_${customEndDate}_${granularity}_${apiRange}`;

    const fetchData = async () => {
      // Check cache first
      if (reportCache.current[cacheKey]) {
        setReportData(reportCache.current[cacheKey]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserReport(customStartDate, customEndDate, granularity, apiRange);
        setReportData(data);
        // Save to cache
        reportCache.current[cacheKey] = data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch report data");
        console.error("Error fetching report:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customStartDate, customEndDate, granularity, dateRange]);

  // Provide fallback data while loading
  const defaultData: UserReportData = {
    summary: [
      {
        title: "New Healers (Daily)",
        value: "0",
        description: "Total for selected daily period"
      },
      {
        title: "Conversion Rate",
        value: "0%",
        description: "Healer conversions"
      },
      {
        title: "At Risk Users",
        value: "0",
        description: "Trends for Daily"
      },
      {
        title: "Avg. LTV",
        value: "$0.00",
        description: "Estimated value"
      },
    ],
    registration: [],
    churn: [
      { name: "30 Days Inactive", seekers: 0, healers: 0 },
      { name: "60 Days Inactive", seekers: 0, healers: 0 },
      { name: "90 Days Inactive", seekers: 0, healers: 0 },
    ],
    healerFunnel: [],
    seekerFunnel: [],
    subscriptionCohort: [],
    retentionData: [],
  };

  // Simulated dynamic filtering using range and granularity
  const filteredData = useMemo(() => {
    const data = reportData || defaultData;

    return {
      summary: data.summary,
      registration: data.registration,
      churn: data.churn,
      hFunnel: data.healerFunnel,
      sFunnel: data.seekerFunnel,
      subs: data.subscriptionCohort,
      retention: data.retentionData,
    };
  }, [reportData, dateRange]);

  const summaryData = filteredData.summary;
  const currentRegistrationTrend = filteredData.registration;
  const currentChurnIndicators = filteredData.churn;
  const currentHealerFunnel = filteredData.hFunnel;
  const currentSeekerFunnel = filteredData.sFunnel;
  const currentSubscriptionCohort = filteredData.subs;
  const currentRetentionData = filteredData.retention;

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

      {/* Report Content - Hidden while loading first time, but shown if we have cached data */}
      <div className={isLoading ? "hidden" : "block space-y-6"}>


        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">
              User Statistics
            </h2>
            <p className="text-[#A3AED0] text-xs md:text-sm font-medium italic">
              Analyze healer and seeker acquisition, lifecycle conversion, and churn.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 shrink-0">
            <DateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
              customStartDate={customStartDate}
              setCustomStartDate={setCustomStartDate}
              customEndDate={customEndDate}
              setCustomEndDate={setCustomEndDate}
            />
            <ExportDropdown
              onExportExcel={() => exportGrowthExcel({
                summaryData,
                registrationTrend: currentRegistrationTrend,
                churnIndicators: currentChurnIndicators,
                healerFunnel: currentHealerFunnel,
                seekerFunnel: currentSeekerFunnel,
                subscriptionCohort: currentSubscriptionCohort,
                retentionData: currentRetentionData,
                granularity
              })}
              onExportPdf={() => exportGrowthPdf({
                summaryData,
                registrationTrend: currentRegistrationTrend,
                churnIndicators: currentChurnIndicators,
                healerFunnel: currentHealerFunnel,
                seekerFunnel: currentSeekerFunnel,
                subscriptionCohort: currentSubscriptionCohort,
                retentionData: currentRetentionData,
                granularity
              })}
            />
          </div>
        </div>

        {/* Top Cards Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {summaryData.map((card, idx) => (
            <StatsCard
              key={idx}
              title={card.title}
              value={card.value}
              description={card.description || ""}
              icon={
                card.title.includes("Healers") ? <TrendingUp className="h-6 w-6 text-emerald-500" /> :
                  card.title.includes("Conversion") ? <UserCheck className="h-6 w-6 text-[#4318FF]" /> :
                    card.title.includes("Risk") ? <UserMinus className="h-6 w-6 text-amber-500" /> :
                      <CreditCard className="h-6 w-6 text-[#01A3B4]" />
              }
            />
          ))}
        </div>

        {/* Charts Main Grid */}
        <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
          <BaseAreaChart
            title="Registration Trend"
            data={currentRegistrationTrend}
            areas={[
              { name: "Seekers", dataKey: "seekers", stroke: "#4318FF" },
              { name: "Healers", dataKey: "healers", stroke: "#01A3B4" }
            ]}
          />
          <BaseBarChart
            title="Churn Indicators (Inactive Users)"
            data={currentChurnIndicators}
            bars={[
              { name: "Seekers", dataKey: "seekers", fill: "#4318FF" },
              { name: "Healers", dataKey: "healers", fill: "#01A3B4" }
            ]}
          />
        </div>

        {/* Funnels Grid */}
        <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
          <BaseHorizontalBarChart
            title="Healer Conversion Funnel"
            data={currentHealerFunnel}
            dataKey="value"
            nameKey="step"
            fill="#01A3B4"
          />
          <BaseHorizontalBarChart
            title="Seeker Lifecycle Funnel"
            data={currentSeekerFunnel}
            dataKey="value"
            nameKey="step"
            fill="#4318FF"
          />
        </div>

        {/* Cohort & Retention Grid */}
        <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
          <BaseLineChart
            title="Subscription Upgrade Rate (%)"
            data={currentSubscriptionCohort}
            lines={[{ name: "Upgrade %", dataKey: "rate", stroke: "#7C3AED" }]}
          />
          <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 overflow-hidden">
            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6">Retention Cohort (Monthly)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#A3AED0] text-[13px] font-bold border-b border-gray-100 dark:border-white/5">
                    <th className="pb-4 pr-4">Cohort</th>
                    <th className="pb-4 px-4">Size</th>
                    <th className="pb-4 px-4">Month 0</th>
                    <th className="pb-4 px-4">Month 1</th>
                    <th className="pb-4 px-4">Month 2</th>
                    <th className="pb-4 px-4">Month 3</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold">
                  {currentRetentionData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                      <td className="py-4 pr-4 text-[#1b254b] dark:text-white whitespace-nowrap">{row.cohort}</td>
                      <td className="py-4 px-4 text-[#A3AED0]">{row.users.toLocaleString()}</td>
                      {[row.m0, row.m1, row.m2, row.m3].map((val, i) => {
                        const getBackgroundColor = (value: number | null) => {
                          if (value === null) return "transparent";
                          if (value >= 80) return "rgba(1, 163, 180, 0.8)";
                          if (value >= 60) return "rgba(1, 163, 180, 0.6)";
                          if (value >= 40) return "rgba(1, 163, 180, 0.4)";
                          if (value >= 20) return "rgba(1, 163, 180, 0.2)";
                          return "rgba(1, 163, 180, 0.1)";
                        };
                        return (
                          <td
                            key={i}
                            className="py-4 px-4 text-center"
                            style={{ backgroundColor: getBackgroundColor(val) }}
                          >
                            <span className={val !== null && val > 40 ? "text-white" : "text-[#1b254b] dark:text-white"}>
                              {val !== null ? `${val}%` : "-"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserReport;
