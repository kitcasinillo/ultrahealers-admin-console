import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  DateRangePicker,
  GranularityTabs,
  ExportDropdown
} from "../../components/common";
import {
  BaseAreaChart,
  BasePieChart,
  BaseBarChart,
  BaseHorizontalBarChart,
  BaseLineChart
} from "../../components/Charts";
import { exportDisputeExcel, exportDisputePdf } from "../../lib/exportUtils";

// --- Mock Data ---

// Dispute rate (disputes / bookings)
const disputeRateTrend = [
  { name: "Jan", disputes: 12, bookings: 1000, rate: 1.2 },
  { name: "Feb", disputes: 18, bookings: 1200, rate: 1.5 },
  { name: "Mar", disputes: 15, bookings: 1360, rate: 1.1 },
  { name: "Apr", disputes: 28, bookings: 1550, rate: 1.8 },
  { name: "May", disputes: 24, bookings: 1710, rate: 1.4 },
  { name: "Jun", disputes: 18, bookings: 2000, rate: 0.9 },
];

const disputesByType = [
  { name: "No-show", value: 35, color: "#4318FF" },
  { name: "Unprofessional Behavior", value: 25, color: "#6AD2FF" },
  { name: "Technical Issues", value: 20, color: "#01A3B4" },
  { name: "Billing/Refund", value: 15, color: "#FFB547" },
  { name: "Other", value: 5, color: "#7C3AED" },
];

// Disputes by severity (normal vs safety)
const disputesBySeverity = [
  { name: "Mon", normal: 8, safety: 1 },
  { name: "Tue", normal: 12, safety: 0 },
  { name: "Wed", normal: 6, safety: 2 },
  { name: "Thu", normal: 9, safety: 1 },
  { name: "Fri", normal: 15, safety: 3 },
  { name: "Sat", normal: 4, safety: 0 },
  { name: "Sun", normal: 5, safety: 1 },
];

// Average resolution time (hours)
const resolutionTimeTrend = [
  { name: "Week 1", hours: 48 },
  { name: "Week 2", hours: 36 },
  { name: "Week 3", hours: 120 },
  { name: "Week 4", hours: 24 },
  { name: "Week 5", hours: 18 },
];

// Resolution outcomes breakdown (refund/partial/credit/deny)
const outcomeBreakdown = [
  { name: "Jan", refund: 10, partial: 5, credit: 8, deny: 2 },
  { name: "Feb", refund: 12, partial: 8, credit: 5, deny: 3 },
  { name: "Mar", refund: 8, partial: 4, credit: 12, deny: 1 },
  { name: "Apr", refund: 15, partial: 10, credit: 4, deny: 5 },
];

const modalityDisputeRate = [
  { name: "Sound Healing", value: 0.5 },
  { name: "Breathwork", value: 0.8 },
  { name: "Reiki", value: 1.2 },
  { name: "Yoga", value: 2.1 },
  { name: "Tarot", value: 3.5 },
];

// Healer repeat dispute rate (healers with 2+ disputes — flagged)
const healerRepeatDisputes = [
  { id: "1", name: "Dr. Sarah Johnson", disputes: 4, status: "flagged" },
  { id: "2", name: "Mark Williams", disputes: 3, status: "flagged" },
  { id: "3", name: "Elara Moon", disputes: 2, status: "flagged" },
  { id: "4", name: "John Doe", disputes: 2, status: "flagged" },
  { id: "5", name: "Jane Smith", disputes: 0, status: "good" },
];

// --- Main Component ---

export function DisputeReport() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [granularity, setGranularity] = useState("Monthly");

  const exportPayload = {
    summaryData: [],
    disputeRateTrend,
    disputesByType,
    disputesBySeverity,
    resolutionTimeTrend,
    outcomeBreakdown,
    modalityDisputeRate,
    healerRepeatDisputes
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Dispute Report</h2>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium italic">
            Detailed analytics for disputes, resolution outcomes, and healer flags.
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
            onExportExcel={() => exportDisputeExcel(exportPayload)}
            onExportPdf={() => exportDisputePdf(exportPayload)}
          />
        </div>
      </div>

      {/* Row 1: Dispute Rate & Type */}
      <div className="grid gap-5 md:grid-cols-2">
        <BaseAreaChart
          title="Dispute Rate (disputes / bookings)"
          data={disputeRateTrend}
          areas={[
            { name: "Dispute Rate (%)", dataKey: "rate", stroke: "#4318FF" }
          ]}
          // To help visualize (disputes / bookings), we can show them in tooltip implicitly by including them in data
        />
        <BasePieChart
          title="Disputes by Type"
          data={disputesByType}
        />
      </div>

      {/* Row 2: Severity & Resolution Time */}
      <div className="grid gap-5 md:grid-cols-2">
        <BaseBarChart
          title="Disputes by Severity (normal vs safety)"
          data={disputesBySeverity}
          bars={[
            { name: "Normal", dataKey: "normal", fill: "#4318FF" },
            { name: "Safety", dataKey: "safety", fill: "#FF5B5B", radius: [4, 4, 0, 0] }
          ]}
        />
        <BaseLineChart
          title="Average Resolution Time (hours)"
          data={resolutionTimeTrend}
          lines={[
            { name: "Resolution Time", dataKey: "hours", stroke: "#01A3B4" }
          ]}
        />
      </div>

      {/* Row 3: Outcomes & Modality */}
      <div className="grid gap-5 md:grid-cols-2">
        <BaseBarChart
          title="Resolution Outcomes Breakdown (refund/partial/credit/deny)"
          data={outcomeBreakdown}
          bars={[
            { name: "Refund", dataKey: "refund", fill: "#4318FF", stackId: "a" },
            { name: "Partial", dataKey: "partial", fill: "#6AD2FF", stackId: "a" },
            { name: "Credit", dataKey: "credit", fill: "#01A3B4", stackId: "a" },
            { name: "Deny", dataKey: "deny", fill: "#A3AED0", stackId: "a", radius: [4, 4, 0, 0] }
          ]}
        />
        <BaseHorizontalBarChart
          title="Dispute Rate by Modality"
          data={modalityDisputeRate}
          dataKey="value"
          nameKey="name"
          fill="#7C3AED"
        />
      </div>

      {/* Healer Repeat Dispute Rate - Flagged Healers */}
      <Card className="rounded-3xl border-none shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:bg-[#111C44]">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#FF5B5B]" />
            Healer Repeat Dispute Rate (2+ disputes — flagged)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Healer Name</TableHead>
                <TableHead>Total Disputes</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healerRepeatDisputes
                .filter(h => h.disputes >= 2)
                .sort((a, b) => b.disputes - a.disputes)
                .map((healer) => (
                  <TableRow key={healer.id}>
                    <TableCell className="font-medium text-[#1b254b] dark:text-white">
                      {healer.name}
                    </TableCell>
                    <TableCell className="font-bold text-[#1b254b] dark:text-white">
                      {healer.disputes}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive" className="bg-[#FF5B5B] hover:bg-[#FF5B5B]/80 text-white rounded-md px-3">
                        {healer.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
