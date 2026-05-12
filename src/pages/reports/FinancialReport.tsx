import { useState, useEffect, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  Wallet,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  DollarSign,
  BarChart2,
  Percent
} from "lucide-react";

// Common Components
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { ExportDropdown } from "@/components/common/ExportDropdown";
import { StatsCard } from "@/components/StatsCard";
import { ReportSkeleton } from "@/components/ui/skeleton";

// Utilities
import { exportFinancialPdf, exportFinancialExcel, type FinancialExportPayload } from "@/lib/exportUtils";
import { getFinancialReport, type FinancialReportData } from "@/api/reports";

// Chart Components
import { BaseAreaChart, type AreaConfig } from "@/components/Charts/BaseAreaChart";
import { BaseBarChart } from "@/components/Charts/BaseBarChart";
import { BaseLineChart } from "@/components/Charts/BaseLineChart";
import { BasePieChart } from "@/components/Charts/BasePieChart";
import { BaseHorizontalBarChart } from "@/components/Charts/BaseHorizontalBarChart";


// --- Column Definitions ---

const bookingColumns: ColumnDef<any>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "bookingId", header: "Booking ID" },
  { accessorKey: "listing", header: "Listing/Retreat" },
  { accessorKey: "healer", header: "Healer" },
  { accessorKey: "seeker", header: "Seeker" },
  {
    accessorKey: "grossAmount",
    header: "Gross ($)",
    cell: ({ row }: { row: any }) => `$${row.original.grossAmount.toLocaleString()}`,
  },
  {
    accessorKey: "healerCommission",
    header: "Commission ($)",
    cell: ({ row }: { row: any }) => `$${row.original.healerCommission.toLocaleString()}`,
  },
  {
    accessorKey: "seekerFee",
    header: "Seeker Fee ($)",
    cell: ({ row }: { row: any }) => `$${row.original.seekerFee.toLocaleString()}`,
  },
  {
    accessorKey: "processingFee",
    header: "Stripe Fee ($)",
    cell: ({ row }: { row: any }) => `$${row.original.processingFee.toFixed(2)}`,
  },
  {
    accessorKey: "netRevenue",
    header: "Net Revenue ($)",
    cell: ({ row }: { row: any }) => `$${row.original.netRevenue.toLocaleString()}`,
  },
  {
    accessorKey: "stripePi",
    header: "Stripe P.I.",
    cell: ({ row }: { row: any }) => (
      <code className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono leading-none">
        {row.original.stripePi}
      </code>
    ),
  },
];

const premiumColumns: ColumnDef<any>[] = [
  { accessorKey: "healer", header: "Healer" },
  { accessorKey: "activationDate", header: "Date Activated" },
  {
    accessorKey: "amount",
    header: "Amount ($)",
    cell: ({ row }: { row: any }) => `$${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: "stripeSessionId",
    header: "Stripe Session ID",
    cell: ({ row }: { row: any }) => (
      <code className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono leading-none">
        {row.original.stripeSessionId}
      </code>
    ),
  },
];

function SectionHeader({ title, icon: Icon, description }: any) {
  return (
    <div className="space-y-1 mb-6 border-l-4 border-[#4318FF] pl-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-[#4318FF]" />}
        <h2 className="text-xl font-bold text-[#1b254b] dark:text-white uppercase tracking-tight">{title}</h2>
      </div>
      {description && <p className="text-[10px] text-[#A3AED0] font-bold uppercase tracking-widest leading-relaxed">{description}</p>}
    </div>
  );
}

export function FinancialReport() {
  const [dateRange, setDateRange] = useState("Monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Monthly");

  // Sync granularity with the dropdown selection
  useEffect(() => {
    if (dateRange === "Daily") setGranularity("Daily");
    if (dateRange === "Weekly") setGranularity("Weekly");
    if (dateRange === "Monthly") setGranularity("Monthly");
  }, [dateRange]);

  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportCache = useRef<Record<string, FinancialReportData>>({});

  const areaConfigs: AreaConfig[] = [
    { name: "Sessions", dataKey: "sessions", stroke: "#4318FF" },
    { name: "Retreats", dataKey: "retreats", stroke: "#6AD2FF" },
    { name: "Subscriptions", dataKey: "subs", stroke: "#8A99AF" },
  ];

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
        const data = await getFinancialReport(customStartDate, customEndDate, granularity, apiRange);
        setReportData(data);
        reportCache.current[cacheKey] = data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch financial report");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, customStartDate, customEndDate, granularity]);

  const defaultData: FinancialReportData = {
    summary: [
      { title: "Total Platform Revenue", value: "$0", description: "0 bookings + 0 subscriptions" },
      { title: "Revenue Growth", value: "0%", description: "vs. prior period" },
      { title: "Gross Booking Volume", value: "$0", description: "All sources combined" },
      { title: "Avg. Stripe Fee", value: "$0", description: "Per transaction average" },
    ],
    revenueBySource: [],
    revenueTrend: [],
    monthlyComparison: [],
    stripeFeeImpact: [],
    topHealers: [],
    topRetreats: [],
    bookingAudit: [],
    premiumLog: [],
  };

  const data = reportData || defaultData;

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

      {/* 1. Dashboard Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b254b] dark:text-white tracking-tighter">Financial Overview</h1>
            {isLoading && <Loader2 className="w-6 h-6 text-[#4318FF] animate-spin" />}
          </div>
          <p className="text-xs font-medium text-[#A3AED0] uppercase tracking-widest pl-0.5">
            {dateRange === 'Custom Range' ? `From ${customStartDate} to ${customEndDate}` : `Reporting: ${dateRange}`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-4 w-full">
            <DateRangePicker
              dateRange={dateRange} setDateRange={setDateRange}
              customStartDate={customStartDate} setCustomStartDate={setCustomStartDate}
              customEndDate={customEndDate} setCustomEndDate={setCustomEndDate}
            />
          </div>
          <ExportDropdown
            onExportExcel={() => {
              const payload: FinancialExportPayload = {
                ...data,
                title: "Booking Financial Report",
                dateRangeLabel: dateRange === 'Custom Range' ? `${customStartDate} to ${customEndDate}` : dateRange,
              };
              exportFinancialExcel(payload);
            }}
            onExportPdf={() => {
              const payload: FinancialExportPayload = {
                ...data,
                title: "Booking Financial Report",
                dateRangeLabel: dateRange === 'Custom Range' ? `${customStartDate} to ${customEndDate}` : dateRange,
              };
              exportFinancialPdf(payload);
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <ReportSkeleton />}

      {/* Report Content */}
      <div className={isLoading ? "hidden" : "block space-y-12"}>

        {/* 1.5 Stats Cards Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {data.summary.map((card, idx) => (
            <StatsCard
              key={idx}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={
                card.title.includes("Revenue") ? <DollarSign className="h-6 w-6 text-[#4318FF]" /> :
                  card.title.includes("Growth") ? <TrendingUp className="h-6 w-6 text-emerald-500" /> :
                    card.title.includes("Volume") ? <BarChart2 className="h-6 w-6 text-amber-500" /> :
                      <Percent className="h-6 w-6 text-[#01A3B4]" />
              }
            />
          ))}
        </div>

        {/* 2. Visual Insights (STANDARD DASHBOARD FLOW) */}
        <div className="space-y-12">

          {/* REQUIREMENT: Revenue by source (session vs retreat vs subscription) — Pie + trend */}
          <div className="space-y-6">
            <SectionHeader title="Revenue by Source" icon={PieIcon} description="Income distribution (Pie) and historical lifecycle trends (Area Chart)." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BasePieChart title="Revenue Mix Overview" data={data.revenueBySource} />
              <BaseAreaChart title="Revenue Trend Analytics" data={data.revenueTrend} areas={areaConfigs} yAxisTickFormatter={(v: number) => `$${v / 1000}k`} />
            </div>
          </div>

          {/* Level 2: Performance & Fees */}
          <div className="space-y-6">
            <SectionHeader title="Growth & Efficiency" icon={TrendingUp} description="Reporting vs. prior periods and Stripe processing fee impact." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[40px] border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:bg-[#111C44]">
                <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
                  <CardTitle className="text-sm font-bold text-[#1b254b] dark:text-white uppercase tracking-wider">Revenue Growth Performance</CardTitle>
                  <div className={`flex items-center gap-1 ${data.summary[1].value.includes('-') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} text-[10px] font-black px-2 py-0.5 rounded-full`}>
                    <ArrowUpRight className={`w-2 h-2 ${data.summary[1].value.includes('-') ? 'rotate-90' : ''}`} />
                    {data.summary[1].value}
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <BaseBarChart
                    title=""
                    data={data.monthlyComparison}
                    bars={[{ name: "Current Period", dataKey: "revenue", fill: "#4318FF", radius: [8, 8, 0, 0] }, { name: "Prior Period", dataKey: "prior", fill: "#6AD2FF", radius: [8, 8, 0, 0] }]}
                    yAxisTickFormatter={(v: number) => `$${v / 1000}k`}
                  />
                </CardContent>
              </Card>

              <BaseLineChart title="Stripe Processing Fee Impact" data={data.stripeFeeImpact} lines={[
                { name: "Gross Value ($)", dataKey: "gross", stroke: "#4318FF" },
                { name: "Stripe Fees ($)", dataKey: "fees", stroke: "#6AD2FF" }
              ]} />
            </div>
          </div>

          {/* Level 3: Rankings */}
          <div className="space-y-6">
            <SectionHeader title="Platform Activity Standings" icon={Award} description="Leadership rankings for healers and retreat events." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BaseHorizontalBarChart title="Top 10 High-Revenue Healers" data={data.topHealers} dataKey="revenue" nameKey="name" fill="#4318FF" />
              <BaseHorizontalBarChart title="Top 10 High-Growth Retreat Events" data={data.topRetreats} dataKey="revenue" nameKey="name" fill="#6AD2FF" />
            </div>
          </div>
        </div>

        {/* 3. Transaction Audit (Evidence Rows) */}
        <div className="space-y-8 pt-12 border-t border-gray-100 dark:border-white/5">
          <SectionHeader title="Financial Evidence Logs" icon={Database} description="Transactional audit registry for bookings and premiums." />

          <Card className="rounded-[40px] border-none shadow-[0_20px_50px_rgba(11,20,55,0.06)] dark:bg-[#111C44]">
            <CardHeader className="p-10 border-b border-gray-50 dark:border-white/5 bg-white dark:bg-white/5 rounded-t-[40px]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-xl font-bold text-[#1b254b] dark:text-white uppercase tracking-tight">Booking Financial Registry</CardTitle>
                  <span className="text-[10px] text-[#A3AED0] font-black tracking-[0.2em] uppercase opacity-70">Transactional Daily Audit Ledger</span>
                </div>
                <Wallet className="w-5 h-5 text-[#4318FF] opacity-30" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pb-10">
              <DataTable columns={bookingColumns} data={data.bookingAudit} />
            </CardContent>
          </Card>

          <Card className="rounded-[40px] border-none shadow-[0_20px_50px_rgba(11,20,55,0.06)] dark:bg-[#111C44]">
            <CardHeader className="p-10 border-b border-gray-50 dark:border-white/5 bg-white dark:bg-white/5 rounded-t-[40px]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-xl font-bold text-[#1b254b] dark:text-white uppercase tracking-tight">Premium Activation Registry</CardTitle>
                  <span className="text-[10px] text-[#A3AED0] font-black tracking-[0.2em] uppercase opacity-70">Membership Subscription Audit Ledger</span>
                </div>
                <Award className="w-5 h-5 text-amber-500 opacity-30" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pb-10">
              <DataTable columns={premiumColumns} data={data.premiumLog} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
