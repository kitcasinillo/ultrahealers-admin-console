import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Database,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  Wallet,
  Activity,
  ArrowUpRight
} from "lucide-react";

// Common Components
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { ExportDropdown } from "@/components/common/ExportDropdown";
import { GranularityTabs } from "@/components/common/GranularityTabs";

// Utilities
import { exportFinancialPdf, exportFinancialExcel } from "@/lib/exportUtils";

// Chart Components
import { BaseAreaChart, type AreaConfig } from "@/components/Charts/BaseAreaChart";
import { BaseBarChart } from "@/components/Charts/BaseBarChart";
import { BaseLineChart } from "@/components/Charts/BaseLineChart";
import { BasePieChart } from "@/components/Charts/BasePieChart";
import { BaseHorizontalBarChart } from "@/components/Charts/BaseHorizontalBarChart";


// --- Mock Data & Constants ---

// REFINED PALETTE: Using #8A99AF (Grey) for Subscriptions to ensure READABILITY
const revenueBySourceData = [
  { name: "Sessions", value: 45000, color: "#4318FF" },
  { name: "Retreats", value: 32000, color: "#6AD2FF" },
  { name: "Subscriptions", value: 18000, color: "#8A99AF" },
];

const revenueTrendData = [
  { month: "Jan", sessions: 4000, retreats: 2400, subs: 2400 },
  { month: "Feb", sessions: 3000, retreats: 1398, subs: 2210 },
  { month: "Mar", sessions: 2000, retreats: 9800, subs: 2290 },
  { month: "Apr", sessions: 2780, retreats: 3908, subs: 2000 },
  { month: "May", sessions: 1890, retreats: 4800, subs: 2181 },
  { month: "Jun", sessions: 2390, retreats: 3800, subs: 2500 },
  { month: "Jul", sessions: 3490, retreats: 4300, subs: 2100 },
];

const monthlyRevenueComparison = [
  { month: "Current", revenue: 54000, prior: 48000 },
];

const topHealersData = [
  { name: "Dr. Sarah", revenue: 12500 },
  { name: "Emma Wilson", revenue: 10800 },
  { name: "Michael Chen", revenue: 9200 },
  { name: "Aria Thorne", revenue: 8500 },
  { name: "David Miller", revenue: 7900 },
];

const topRetreatsData = [
  { name: "Zen Meditation", revenue: 15400 },
  { name: "Yoga Wellness", revenue: 12200 },
  { name: "Spiritual Awakening", revenue: 10500 },
  { name: "Beach Escape", revenue: 9800 },
  { name: "Forest Healing", revenue: 8400 },
];

const stripeFeeImpactData = [
  { name: "Mon", gross: 4000, fees: 120 },
  { name: "Tue", gross: 3000, fees: 90 },
  { name: "Wed", gross: 5000, fees: 150 },
  { name: "Thu", gross: 2780, fees: 83 },
  { name: "Fri", gross: 1890, fees: 56 },
  { name: "Sat", gross: 2390, fees: 71 },
  { name: "Sun", gross: 3490, fees: 104 },
];

const bookingsData = [
  {
    date: "2024-03-24",
    bookingId: "BK-8821",
    listing: "Life Coaching Session",
    healer: "Dr. Sarah Johnson",
    seeker: "John Doe",
    grossAmount: 150.0,
    healerCommission: 120.0,
    seekerFee: 15.0,
    processingFee: 4.5,
    netRevenue: 10.5,
    stripePi: "pi_3Oh...",
  },
];

const premiumRevenueData = [
  {
    healer: "Dr. Sarah Johnson",
    activationDate: "2024-03-01",
    amount: 99.0,
    stripeSessionId: "cs_test_...",
  },
];

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
    cell: ({ row }: { row: any }) => `$${row.original.grossAmount.toFixed(2)}`,
  },
  {
    accessorKey: "healerCommission",
    header: "Commission ($)",
    cell: ({ row }: { row: any }) => `$${row.original.healerCommission.toFixed(2)}`,
  },
  {
    accessorKey: "seekerFee",
    header: "Seeker Fee ($)",
    cell: ({ row }: { row: any }) => `$${row.original.seekerFee.toFixed(2)}`,
  },
  {
    accessorKey: "processingFee",
    header: "Stripe Fee ($)",
    cell: ({ row }: { row: any }) => `$${row.original.processingFee.toFixed(2)}`,
  },
  {
    accessorKey: "netRevenue",
    header: "Net Revenue ($)",
    cell: ({ row }: { row: any }) => `$${row.original.netRevenue.toFixed(2)}`,
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
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Monthly");

  // Export operations are now handled by utilities for improved formatting and reliability.

  const trendData = revenueTrendData.map(d => ({ ...d, name: d.month }));
  const areaConfigs: AreaConfig[] = [
    { name: "Sessions", dataKey: "sessions", stroke: "#4318FF" },
    { name: "Retreats", dataKey: "retreats", stroke: "#6AD2FF" },
    { name: "Subscriptions", dataKey: "subs", stroke: "#8A99AF" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-12 animate-in fade-in duration-700 max-w-[1700px] mx-auto overflow-hidden">
      
      {/* 1. Dashboard Header (Reverted to Normal standard) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4318FF] text-[10px] font-black uppercase tracking-[0.3em]">
            <Activity className="w-3 h-3" />
            <span>REPORTING PLATFORM</span>
          </div>
          <h1 className="text-4xl font-extrabold text-[#1b254b] dark:text-white tracking-tighter">Finance Dashboard</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <GranularityTabs granularity={granularity} setGranularity={setGranularity} />
          <DateRangePicker 
            dateRange={dateRange} setDateRange={setDateRange}
            customStartDate={customStartDate} setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate} setCustomEndDate={setCustomEndDate}
          />
          <ExportDropdown 
            onExportExcel={() => exportFinancialExcel(bookingsData, premiumRevenueData)}
            onExportPdf={() => exportFinancialPdf(bookingsData, premiumRevenueData, "Booking Financial Report Audit")}
          />
        </div>
      </div>

      {/* 2. Visual Insights (STANDARD DASHBOARD FLOW) */}
      <div className="space-y-12">
        
        {/* REQUIREMENT: Revenue by source (session vs retreat vs subscription) — Pie + trend */}
        <div className="space-y-6">
           <SectionHeader title="Revenue by Source" icon={PieIcon} description="Income distribution (Pie) and historical lifecycle trends (Area Chart)." />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BasePieChart title="Revenue Mix Overview" data={revenueBySourceData} />
              <BaseAreaChart title="Revenue Trend Analytics" data={trendData} areas={areaConfigs} yAxisTickFormatter={(v) => `$${v / 1000}k`} />
           </div>
        </div>

        {/* Level 2: Performance & Fees */}
        <div className="space-y-6">
           <SectionHeader title="Growth & Efficiency" icon={TrendingUp} description="Reporting vs. prior periods and Stripe processing fee impact." />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[40px] border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:bg-[#111C44]">
                <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
                  <CardTitle className="text-sm font-bold text-[#1b254b] dark:text-white uppercase tracking-wider">Revenue Growth Performance</CardTitle>
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                     <ArrowUpRight className="w-2 h-2" />
                     +12.5%
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                   <BaseBarChart 
                    title="" 
                    data={monthlyRevenueComparison} 
                    bars={[{ name: "Current Monthly", dataKey: "revenue", fill: "#4318FF", radius: [8, 8, 0, 0] }, { name: "Prior Period", dataKey: "prior", fill: "#6AD2FF", radius: [8, 8, 0, 0] }]} 
                    yAxisTickFormatter={(v) => `$${v / 1000}k`} 
                  />
                </CardContent>
              </Card>

              <BaseLineChart title="Stripe Processing Fee Impact" data={stripeFeeImpactData} lines={[
                 { name: "Gross Value ($)", dataKey: "gross", stroke: "#4318FF" },
                 { name: "Stripe Fees ($)", dataKey: "fees", stroke: "#6AD2FF" }
              ]} />
           </div>
        </div>

        {/* Level 3: Rankings */}
        <div className="space-y-6">
           <SectionHeader title="Platform Activity Standings" icon={Award} description="Leadership rankings for healers and retreat events." />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BaseHorizontalBarChart title="Top 10 High-Revenue Healers" data={topHealersData} dataKey="revenue" nameKey="name" fill="#4318FF" />
              <BaseHorizontalBarChart title="Top 10 High-Growth Retreat Events" data={topRetreatsData} dataKey="revenue" nameKey="name" fill="#6AD2FF" />
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
            <DataTable columns={bookingColumns} data={bookingsData} />
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-none shadow-sm dark:bg-[#111C44]">
          <CardHeader className="py-5 px-10 border-b border-gray-50 dark:border-white/5 flex items-center gap-3">
            <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white uppercase tracking-tighter">Premium Activation Log</CardTitle>
          </CardHeader>
          <CardContent className="p-8 px-10"><DataTable columns={premiumColumns} data={premiumRevenueData} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
