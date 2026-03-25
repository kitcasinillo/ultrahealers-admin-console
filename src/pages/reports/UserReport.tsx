import { useState } from "react";
import {
  TrendingUp,
  UserCheck,
  UserMinus,
  CreditCard
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
  BaseLineChart
} from "../../components/Charts";
import { exportGrowthExcel, exportGrowthPdf } from "../../lib/exportUtils";

// --- Mock Data ---

const registrationTrend = [
  { name: "Mar 18", seekers: 42, healers: 12 },
  { name: "Mar 19", seekers: 55, healers: 18 },
  { name: "Mar 20", seekers: 48, healers: 15 },
  { name: "Mar 21", seekers: 62, healers: 22 },
  { name: "Mar 22", seekers: 71, healers: 25 },
  { name: "Mar 23", seekers: 68, healers: 19 },
  { name: "Mar 24", seekers: 85, healers: 31 },
];

const churnIndicators = [
  { name: "30 Days Inactive", seekers: 450, healers: 125 },
  { name: "60 Days Inactive", seekers: 310, healers: 85 },
  { name: "90 Days Inactive", seekers: 180, healers: 45 },
];

const healerFunnel = [
  { step: "Registered", value: 1200 },
  { step: "Onboarding Complete", value: 980 },
  { step: "First Listing", value: 750 },
  { step: "First Booking", value: 420 },
  { step: "Premium Upgrade", value: 145 },
];

const seekerFunnel = [
  { step: "Registered", value: 5400 },
  { step: "Profile Complete", value: 4800 },
  { step: "First Search", value: 4100 },
  { step: "First Booking", value: 1250 },
  { step: "Repeat Booking", value: 520 },
];

const subscriptionCohort = [
  { name: "Oct 25", rate: 1.8 },
  { name: "Nov 25", rate: 2.2 },
  { name: "Dec 25", rate: 3.1 },
  { name: "Jan 26", rate: 3.8 },
  { name: "Feb 26", rate: 4.5 },
  { name: "Mar 26", rate: 5.2 },
];

const retentionData = [
  { cohort: "Jan 2026", users: 1200, m0: 100, m1: 45, m2: 38, m3: 32 },
  { cohort: "Feb 2026", users: 1450, m0: 100, m1: 42, m2: 35, m3: null },
  { cohort: "Mar 2026", users: 1100, m0: 100, m1: 39, m2: null, m3: null },
];

// --- Helper Components ---

function RetentionHeatmap() {
  const getBackgroundColor = (value: number | null) => {
    if (value === null) return "transparent";
    if (value >= 80) return "rgba(1, 163, 180, 0.8)";
    if (value >= 60) return "rgba(1, 163, 180, 0.6)";
    if (value >= 40) return "rgba(1, 163, 180, 0.4)";
    if (value >= 20) return "rgba(1, 163, 180, 0.2)";
    return "rgba(1, 163, 180, 0.1)";
  };

  return (
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
            {retentionData.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                <td className="py-4 pr-4 text-[#1b254b] dark:text-white whitespace-nowrap">{row.cohort}</td>
                <td className="py-4 px-4 text-[#A3AED0]">{row.users.toLocaleString()}</td>
                {[row.m0, row.m1, row.m2, row.m3].map((val, i) => (
                  <td 
                    key={i} 
                    className="py-4 px-4 text-center"
                    style={{ backgroundColor: getBackgroundColor(val) }}
                  >
                    <span className={val !== null && val > 40 ? "text-white" : "text-[#1b254b] dark:text-white"}>
                      {val !== null ? `${val}%` : "-"}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UserReport() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Daily");

  const summaryData = [
    { title: "New Healers (30d)", value: "+145", description: "12% increase from prev month" },
    { title: "Conversion Rate", value: "4.2%", description: "Free to Premium (Healers)" },
    { title: "At Risk Users", value: "450", description: "Inactive for >30 days" },
    { title: "Avg. LTV", value: "$420.50", description: "Seeker booking value (est)" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">User Statistics</h2>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium italic">
            Analyze healer and seeker acquisition, lifecycle conversion, and churn.
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
            onExportExcel={() => exportGrowthExcel({ summaryData, registrationTrend, churnIndicators, healerFunnel, seekerFunnel, subscriptionCohort, retentionData })} 
            onExportPdf={() => exportGrowthPdf({ summaryData, registrationTrend, churnIndicators, healerFunnel, seekerFunnel, subscriptionCohort, retentionData })} 
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
          data={registrationTrend}
          areas={[
            { name: "Seekers", dataKey: "seekers", stroke: "#4318FF" },
            { name: "Healers", dataKey: "healers", stroke: "#01A3B4" }
          ]}
        />
        <BaseBarChart
          title="Churn Indicators (Inactive Users)"
          data={churnIndicators}
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
          data={healerFunnel}
          dataKey="value"
          nameKey="step"
          fill="#01A3B4"
        />
        <BaseHorizontalBarChart
          title="Seeker Lifecycle Funnel"
          data={seekerFunnel}
          dataKey="value"
          nameKey="step"
          fill="#4318FF"
        />
      </div>

      {/* Cohort & Retention Grid */}
      <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
        <BaseLineChart
          title="Subscription Upgrade Rate (%)"
          data={subscriptionCohort}
          lines={[{ name: "Upgrade %", dataKey: "rate", stroke: "#7C3AED" }]}
        />
        <RetentionHeatmap />
      </div>

    </div>
  );
}

export default UserReport;
