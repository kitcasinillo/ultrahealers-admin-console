import { useState } from 'react';

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

// Utilities
import { exportPlatformOverviewPdf, exportPlatformOverviewExcel } from '../../lib/exportUtils';
import { useMemo } from 'react';

// Mock data segmented by granularity for interactivity
const MOCK_DATA = {
  Daily: {
    userGrowth: [
      { name: 'Mon', healers: 400, seekers: 2400 },
      { name: 'Tue', healers: 405, seekers: 2420 },
      { name: 'Wed', healers: 412, seekers: 2450 },
      { name: 'Thu', healers: 418, seekers: 2490 },
      { name: 'Fri', healers: 425, seekers: 2540 },
      { name: 'Sat', healers: 432, seekers: 2580 },
      { name: 'Sun', healers: 440, seekers: 2650 },
    ],
    bookingVolume: [
      { name: 'Mon', sessions: 20, retreats: 5 },
      { name: 'Tue', sessions: 25, retreats: 8 },
      { name: 'Wed', sessions: 35, retreats: 12 },
      { name: 'Thu', sessions: 28, retreats: 6 },
      { name: 'Fri', sessions: 45, retreats: 15 },
      { name: 'Sat', sessions: 55, retreats: 20 },
      { name: 'Sun', sessions: 60, retreats: 25 },
    ],
    revenue: [
      { name: 'Mon', commission: 400, fees: 240, premium: 200 },
      { name: 'Tue', commission: 500, fees: 300, premium: 250 },
      { name: 'Wed', commission: 700, fees: 420, premium: 350 },
      { name: 'Thu', commission: 560, fees: 340, premium: 280 },
      { name: 'Fri', commission: 900, fees: 540, premium: 450 },
      { name: 'Sat', commission: 1100, fees: 660, premium: 550 },
      { name: 'Sun', commission: 1200, fees: 720, premium: 600 },
    ]
  },
  Weekly: {
    userGrowth: [
      { name: 'Week 1', healers: 400, seekers: 2400 },
      { name: 'Week 2', healers: 600, seekers: 3200 },
      { name: 'Week 3', healers: 800, seekers: 4500 },
      { name: 'Week 4', healers: 1100, seekers: 5800 },
    ],
    bookingVolume: [
      { name: 'Week 1', sessions: 120, retreats: 40 },
      { name: 'Week 2', sessions: 150, retreats: 35 },
      { name: 'Week 3', sessions: 180, retreats: 50 },
      { name: 'Week 4', sessions: 140, retreats: 30 },
    ],
    revenue: [
      { name: 'Week 1', commission: 4000, fees: 2400, premium: 2000 },
      { name: 'Week 2', commission: 5000, fees: 3000, premium: 2500 },
      { name: 'Week 3', commission: 6500, fees: 3800, premium: 3200 },
      { name: 'Week 4', commission: 8000, fees: 4500, premium: 4000 },
    ]
  },
  Monthly: {
    userGrowth: [
      { name: 'Jan', healers: 400, seekers: 2400 },
      { name: 'Feb', healers: 600, seekers: 3200 },
      { name: 'Mar', healers: 800, seekers: 4500 },
      { name: 'Apr', healers: 1100, seekers: 5800 },
      { name: 'May', healers: 1400, seekers: 7200 },
      { name: 'Jun', healers: 1800, seekers: 8900 },
    ],
    bookingVolume: [
      { name: 'Jan', sessions: 520, retreats: 140 },
      { name: 'Feb', sessions: 650, retreats: 185 },
      { name: 'Mar', sessions: 880, retreats: 250 },
      { name: 'Apr', sessions: 740, retreats: 210 },
      { name: 'May', sessions: 920, retreats: 280 },
      { name: 'Jun', sessions: 1050, retreats: 310 },
    ],
    revenue: [
      { name: 'Jan', commission: 16000, fees: 9600, premium: 8000 },
      { name: 'Feb', commission: 20000, fees: 12000, premium: 10000 },
      { name: 'Mar', commission: 26000, fees: 15600, premium: 13000 },
      { name: 'Apr', commission: 32000, fees: 19200, premium: 16000 },
      { name: 'May', commission: 38000, fees: 22800, premium: 19000 },
      { name: 'Jun', commission: 48000, fees: 28800, premium: 24000 },
    ]
  }
};

const healthScoreData = [
  { name: 'Score', value: 85 },
  { name: 'Remaining', value: 15 },
];

export function PlatformOverview() {
  const [granularity, setGranularity] = useState('Weekly');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const summaryCardsData = useMemo(() => {
    const currentData = MOCK_DATA[granularity as keyof typeof MOCK_DATA];

    // Calculate totals for the selected granularity
    const healersStart = currentData.userGrowth[0]?.healers || 0;
    const healersEnd = currentData.userGrowth[currentData.userGrowth.length - 1]?.healers || 0;
    const totalNewHealers = healersEnd - healersStart;

    const seekersStart = currentData.userGrowth[0]?.seekers || 0;
    const seekersEnd = currentData.userGrowth[currentData.userGrowth.length - 1]?.seekers || 0;
    const totalNewSeekers = seekersEnd - seekersStart;

    const totalSessions = currentData.bookingVolume.reduce((acc, d) => acc + d.sessions, 0);
    const totalRetreats = currentData.bookingVolume.reduce((acc, d) => acc + d.retreats, 0);
    const totalBookings = totalSessions + totalRetreats;

    const totalCommission = currentData.revenue.reduce((acc, d) => acc + d.commission, 0);
    const totalFees = currentData.revenue.reduce((acc, d) => acc + d.fees, 0);
    const totalPremium = currentData.revenue.reduce((acc, d) => acc + d.premium, 0);
    const totalRevenue = totalCommission + totalFees + totalPremium;

    // Derived metrics
    const totalGBV = totalRevenue / 0.15;
    const totalDisputes = Math.round(totalBookings * 0.005);
    const resolvedDisputes = Math.max(0, totalDisputes - 2);
    const premiumUpgrades = Math.round(totalPremium / 150);

    return [
      { 
        title: "New Healers", 
        value: totalNewHealers.toLocaleString(), 
        description: `Registered this period`, 
        icon: <UserPlus className="h-6 w-6" /> 
      },
      { 
        title: "New Seekers", 
        value: totalNewSeekers.toLocaleString(), 
        description: `Registered this period`, 
        icon: <UserPlus className="h-6 w-6" /> 
      },
      { 
        title: "Total Bookings", 
        value: totalBookings.toLocaleString(), 
        description: `${totalSessions.toLocaleString()} sessions · ${totalRetreats.toLocaleString()} retreats`, 
        icon: <CalendarCheck className="h-6 w-6" /> 
      },
      { 
        title: "Gross Volume", 
        value: `$${Math.round(totalGBV).toLocaleString()}`, 
        description: "Total GBV this period", 
        icon: <DollarSign className="h-6 w-6" /> 
      },
      { 
        title: "Platform Revenue", 
        value: `$${totalRevenue.toLocaleString()}`, 
        description: `$${(totalCommission/1000).toFixed(1)}k comm · $${((totalFees+totalPremium)/1000).toFixed(1)}k fees`, 
        icon: <TrendingUp className="h-6 w-6" /> 
      },
      { 
        title: "Platform Disputes", 
        value: `${totalDisputes} / ${resolvedDisputes}`, 
        description: "Opened / Resolved", 
        icon: <AlertTriangle className="h-6 w-6" /> 
      },
      { 
        title: "Premium Upgrades", 
        value: premiumUpgrades.toLocaleString(), 
        description: "New subscribers", 
        icon: <Zap className="h-6 w-6" /> 
      }
    ];
  }, [granularity]);

  const handleExportPdf = () => {
    const currentData = MOCK_DATA[granularity as keyof typeof MOCK_DATA];
    exportPlatformOverviewPdf({
      dateRange,
      summaryData: summaryCardsData,
      userGrowthData: currentData.userGrowth,
      bookingVolumeData: currentData.bookingVolume,
      revenueData: currentData.revenue
    });
  };

  const handleExportExcel = () => {
    const currentData = MOCK_DATA[granularity as keyof typeof MOCK_DATA];
    exportPlatformOverviewExcel({
      dateRange,
      summaryData: summaryCardsData,
      userGrowthData: currentData.userGrowth,
      bookingVolumeData: currentData.bookingVolume,
      revenueData: currentData.revenue
    });
  };

  return (
    <div id="report-content" className="space-y-6 bg-transparent dark:bg-transparent p-1">
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Platform Overview Report</h2>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium">
            Monitor overall platform performance, growth, and health metrics.
          </p>
        </div>

        {/* Controls Layout */}
        <div data-html2canvas-ignore="true" className="flex flex-wrap items-center gap-3 mt-4">
          
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

          {/* Invisible Spring Spacer for Desktop Right-Alignment */}
          <div className="hidden lg:block flex-1 min-w-[1rem]" />

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
          data={MOCK_DATA[granularity as keyof typeof MOCK_DATA].userGrowth}
          lines={[
            { name: "Healers", dataKey: "healers", stroke: "#4318FF" },
            { name: "Seekers", dataKey: "seekers", stroke: "#6AD2FF" }
          ]}
        />

        <BaseBarChart
          title="Booking Volume"
          data={MOCK_DATA[granularity as keyof typeof MOCK_DATA].bookingVolume}
          bars={[
            { name: "Sessions", dataKey: "sessions", fill: "#4318FF", stackId: "a", radius: [0, 0, 0, 0] },
            { name: "Retreats", dataKey: "retreats", fill: "#6AD2FF", stackId: "a", radius: [6, 6, 0, 0] }
          ]}
        />

        <BaseAreaChart
          title="Revenue Composition"
          data={MOCK_DATA[granularity as keyof typeof MOCK_DATA].revenue}
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
