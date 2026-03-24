import { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

import {
  UserPlus,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';

// Common Components
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { GranularityTabs } from '../../components/common/GranularityTabs';
import { ExportDropdown } from '../../components/common/ExportDropdown';

// Reusable Chart Components
import { BaseLineChart } from '../../components/Charts/BaseLineChart';
import { BaseBarChart } from '../../components/Charts/BaseBarChart';
import { BaseAreaChart } from '../../components/Charts/BaseAreaChart';
import { BaseGaugeChart } from '../../components/Charts/BaseGaugeChart';

// Sample data for charts
const userGrowthData = [
  { name: 'Jan', healers: 400, seekers: 2400 },
  { name: 'Feb', healers: 600, seekers: 3200 },
  { name: 'Mar', healers: 800, seekers: 4500 },
  { name: 'Apr', healers: 1100, seekers: 5800 },
  { name: 'May', healers: 1400, seekers: 7200 },
  { name: 'Jun', healers: 1800, seekers: 8900 },
];

const bookingVolumeData = [
  { name: 'Mon', sessions: 120, retreats: 40 },
  { name: 'Tue', sessions: 150, retreats: 35 },
  { name: 'Wed', sessions: 180, retreats: 50 },
  { name: 'Thu', sessions: 140, retreats: 30 },
  { name: 'Fri', sessions: 220, retreats: 65 },
  { name: 'Sat', sessions: 280, retreats: 90 },
  { name: 'Sun', sessions: 250, retreats: 85 },
];

const revenueCompositionData = [
  { name: 'Jan', commission: 4000, fees: 2400, premium: 2000 },
  { name: 'Feb', commission: 5000, fees: 3000, premium: 2500 },
  { name: 'Mar', commission: 6500, fees: 3800, premium: 3200 },
  { name: 'Apr', commission: 8000, fees: 4500, premium: 4000 },
  { name: 'May', commission: 9500, fees: 5500, premium: 4800 },
  { name: 'Jun', commission: 12000, fees: 7000, premium: 6000 },
];

const healthScoreData = [
  { name: 'Score', value: 85 },
  { name: 'Remaining', value: 15 },
];

const summaryCardsData = [
  { title: "New Healers", value: "145", description: "Registered this period", icon: <UserPlus className="h-6 w-6" /> },
  { title: "New Seekers", value: "892", description: "Registered this period", icon: <UserPlus className="h-6 w-6" /> },
  { title: "Total Bookings", value: "2,450", description: "1,980 sessions · 470 retreats", icon: <CalendarCheck className="h-6 w-6" /> },
  { title: "Gross Volume", value: "$124,500", description: "Total GBV", icon: <DollarSign className="h-6 w-6" /> },
  { title: "Platform Revenue", value: "$18,675", description: "$12.4k comm · $6.2k subs", icon: <TrendingUp className="h-6 w-6" /> },
  { title: "Platform Disputes", value: "12 / 10", description: "Opened / Resolved", icon: <AlertTriangle className="h-6 w-6" /> },
  { title: "Premium Upgrades", value: "56", description: "New subscribers", icon: <Zap className="h-6 w-6" /> }
];

export function PlatformOverview() {
  const [granularity, setGranularity] = useState('Weekly');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleExportPdf = () => {
    const doc = new jsPDF();

    // Add Report Header
    doc.setFontSize(22);
    doc.setTextColor(27, 37, 75); // Dark Blue
    doc.text("Platform Overview Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(163, 174, 208); // Gray Text
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Reporting Period: ${dateRange}`, 14, 36);

    // Key Metrics Header
    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text("1. Key Performance Metrics", 14, 48);

    // Dynamically import autotable to render PDF tables
    import('jspdf-autotable').then(({ default: autoTable }) => {
      autoTable(doc, {
        startY: 53,
        head: [['Metric', 'Value', 'Details']],
        body: summaryCardsData.map(card => [card.title, String(card.value), card.description || '-']),
        theme: 'grid',
        headStyles: { fillColor: [67, 24, 255] },
        styles: { fontSize: 9 }
      });

      const finalYMetrics = (doc as any).lastAutoTable.finalY + 15;

      // User Growth Data
      doc.setFontSize(14);
      doc.setTextColor(27, 37, 75);
      doc.text("2. User Growth Trends", 14, finalYMetrics);

      autoTable(doc, {
        startY: finalYMetrics + 5,
        head: [['Month', 'Healers', 'Seekers', 'Total Added']],
        body: userGrowthData.map(d => [d.name, String(d.healers), String(d.seekers), String(d.healers + d.seekers)]),
        theme: 'striped',
        headStyles: { fillColor: [67, 24, 255] },
        styles: { fontSize: 9 }
      });

      const finalYGrowth = (doc as any).lastAutoTable.finalY + 15;

      // Booking Volume Data
      doc.setFontSize(14);
      doc.text("3. Booking Volumes", 14, finalYGrowth);

      autoTable(doc, {
        startY: finalYGrowth + 5,
        head: [['Day', 'Sessions', 'Retreats', 'Total Daily Volume']],
        body: bookingVolumeData.map(d => [d.name, String(d.sessions), String(d.retreats), String(d.sessions + d.retreats)]),
        theme: 'striped',
        headStyles: { fillColor: [67, 24, 255] },
        styles: { fontSize: 9 }
      });

      // Next Page for Revenue Composition
      doc.addPage();
      doc.setFontSize(14);
      doc.text("4. Revenue Composition", 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [['Month', 'Session Commission', 'Seeker Fees', 'Premium Subscriptions', 'Total Monthly']],
        body: revenueCompositionData.map(d => [
          d.name,
          `$${d.commission.toLocaleString()}`,
          `$${d.fees.toLocaleString()}`,
          `$${d.premium.toLocaleString()}`,
          `$${(d.commission + d.fees + d.premium).toLocaleString()}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [67, 24, 255] },
        styles: { fontSize: 9 }
      });

      doc.save('Platform-Overview-Report.pdf');
    }).catch(err => {
      console.error("Failed to generate styled PDF report:", err);
    });
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(userGrowthData);
    XLSX.utils.book_append_sheet(wb, ws1, "User Growth");

    const ws2 = XLSX.utils.json_to_sheet(bookingVolumeData);
    XLSX.utils.book_append_sheet(wb, ws2, "Booking Volume");

    const ws3 = XLSX.utils.json_to_sheet(revenueCompositionData);
    XLSX.utils.book_append_sheet(wb, ws3, "Revenue Composition");

    const summaryData = summaryCardsData.map(card => ({ Metric: card.title, Value: card.value }));
    const ws4 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws4, "Summary Metrics");

    XLSX.writeFile(wb, "Platform-Overview-Data.xlsx");
  };

  return (
    <div id="report-content" className="space-y-6 bg-transparent dark:bg-transparent p-1">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Platform Overview Report</h2>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium">
            Monitor overall platform performance, growth, and health metrics.
          </p>
        </div>

        <div data-html2canvas-ignore="true" className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mt-4 lg:mt-0 w-full lg:w-auto lg:justify-end">
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />

          <GranularityTabs
            granularity={granularity}
            setGranularity={setGranularity}
          />

          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
        {summaryCardsData.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
        <BaseLineChart
          title="User Growth"
          data={userGrowthData}
          lines={[
            { name: "Healers", dataKey: "healers", stroke: "#4318FF" },
            { name: "Seekers", dataKey: "seekers", stroke: "#6AD2FF" }
          ]}
        />

        <BaseBarChart
          title="Booking Volume"
          data={bookingVolumeData}
          bars={[
            { name: "Sessions", dataKey: "sessions", fill: "#4318FF", stackId: "a", radius: [0, 0, 0, 0] },
            { name: "Retreats", dataKey: "retreats", fill: "#6AD2FF", stackId: "a", radius: [6, 6, 0, 0] }
          ]}
        />

        <BaseAreaChart
          title="Revenue Composition"
          data={revenueCompositionData}
          yAxisTickFormatter={(val) => `$${val / 1000}k`}
          areas={[
            { name: "Session Commission", dataKey: "commission", stroke: "#4318FF" },
            { name: "Seeker Fees", dataKey: "fees", stroke: "#6AD2FF" },
            { name: "Premium Subscriptions", dataKey: "premium", stroke: "#01A3B4" }
          ]}
        />

        <BaseGaugeChart
          title="Platform Health Score"
          data={healthScoreData}
          colors={['#4318FF', '#F4F7FE']}
          score={85}
          statusBadge={{ text: 'Excellent', className: 'bg-emerald-50 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full' }}
          subtitle={
            <>Based on <span className="text-[#4318FF] font-bold">204:1</span> bookings-to-disputes ratio</>
          }
        />
      </div>
    </div>
  );
}
