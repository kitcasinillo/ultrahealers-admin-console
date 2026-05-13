import { useState, useEffect, useRef } from "react";
import { AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  DateRangePicker,
  ExportDropdown
} from "../../components/common";
import { ReportSkeleton } from "../../components/ui/skeleton";
import {
  BaseAreaChart,
  BasePieChart,
  BaseBarChart,
  BaseHorizontalBarChart
} from "../../components/Charts";
import { exportDisputeExcel, exportDisputePdf } from "../../lib/exportUtils";
import { getDisputeReport, type DisputeReportData } from "../../api/reports";
import { StatsCard } from "../../components/StatsCard";
import { Loader2 } from "lucide-react";

export function DisputeReport() {
  const [granularity, setGranularity] = useState("Weekly");
  const [dateRange, setDateRange] = useState("Monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [reportData, setReportData] = useState<DisputeReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportCache = useRef<Record<string, DisputeReportData>>({});

  // Sync granularity with the dropdown selection (Monthly -> Weekly -> Daily mapping)
  useEffect(() => {
    if (dateRange === "Daily") setGranularity("Daily");
    if (dateRange === "Weekly") setGranularity("Weekly");
    if (dateRange === "Monthly") setGranularity("Monthly");
  }, [dateRange]);


  useEffect(() => {
    const fetchData = async () => {
      // Map dropdown labels to backend range keywords
      const rangeMap: Record<string, string> = {
        "Daily": "Today",
        "Weekly": "This Week",
        "Monthly": "This Month",
        "Custom Range": "Custom"
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
        const data = await getDisputeReport(customStartDate, customEndDate, granularity, apiRange);
        setReportData(data);
        reportCache.current[cacheKey] = data;
      } catch (err: any) {
        console.error("Error fetching dispute report:", err);
        setError(err.message || "Failed to fetch dispute report");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, customStartDate, customEndDate, granularity]);

  const handleExportPdf = () => {
    exportDisputePdf({
      dateRange: dateRange === 'Custom Range' ? `${customStartDate} to ${customEndDate}` : dateRange,
      ...data
    });
  };

  const handleExportExcel = () => {
    exportDisputeExcel({
      dateRange: dateRange === 'Custom Range' ? `${customStartDate} to ${customEndDate}` : dateRange,
      ...data
    });
  };

  if (isLoading && !reportData) return <ReportSkeleton />;

  const data = reportData!;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-12 animate-in fade-in duration-700 max-w-[1700px] mx-auto overflow-hidden ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b254b] dark:text-white tracking-tighter uppercase">
              Dispute Analytics
            </h1>
            {isLoading && <Loader2 className="w-6 h-6 text-[#4318FF] animate-spin" />}
          </div>
          <p className="text-xs font-medium text-[#A3AED0] uppercase tracking-widest pl-0.5 mt-1">
            {dateRange === 'Custom Range' ? `From ${customStartDate} to ${customEndDate}` : `Reporting: ${dateRange}`}
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full xl:w-auto bg-white/50 dark:bg-white/5 p-2 rounded-3xl backdrop-blur-sm border border-white/20">
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

      {/* Summary Metrics Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {reportData.summaryData.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={
              card.title.includes("Total") ? <AlertTriangle className="h-6 w-6 text-[#4318FF]" /> :
              card.title.includes("Safety") ? <ShieldAlert className="h-6 w-6 text-red-500" /> :
              card.title.includes("Resolution") ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> :
              <Clock className="h-6 w-6 text-amber-500" />
            }
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-12">
        {/* Row 1: Dispute Rate & Type */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-8 shadow-sm border border-gray-100 dark:border-none">
            <BaseAreaChart
              title="Dispute Rate Trend (%)"
              data={reportData.disputeRateTrend}
              areas={[
                { name: "Rate (%)", dataKey: "rate", stroke: "#4318FF" }
              ]}
            />
          </div>
          <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-8 shadow-sm border border-gray-100 dark:border-none">
            <BasePieChart
              title="Disputes by Type"
              data={reportData.disputesByType.map((d, i) => ({
                ...d,
                color: ["#4318FF", "#6AD2FF", "#01B574", "#FFB142", "#FF5B5B"][i % 5]
              }))}
            />
          </div>
        </div>

        {/* Row 2: Severity & Outcomes */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-8 shadow-sm border border-gray-100 dark:border-none">
            <BaseBarChart
              title="Severity Distribution"
              data={reportData.disputesBySeverity}
              bars={[
                { name: "Normal", dataKey: "normal", fill: "#4318FF" },
                { name: "Safety", dataKey: "safety", fill: "#FF5B5B", radius: [4, 4, 0, 0] }
              ]}
            />
          </div>
          <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-8 shadow-sm border border-gray-100 dark:border-none">
            <BaseBarChart
              title="Resolution Outcomes"
              data={reportData.outcomeBreakdown}
              bars={[
                { name: "Refund", dataKey: "refund", fill: "#01B574", stackId: "a" },
                { name: "Partial", dataKey: "partial", fill: "#FFB142", stackId: "a" },
                { name: "Credit", dataKey: "credit", fill: "#4318FF", stackId: "a" },
                { name: "Deny", dataKey: "deny", fill: "#FF5B5B", stackId: "a", radius: [4, 4, 0, 0] }
              ]}
            />
          </div>
        </div>

        {/* Row 3: Modality & Healers */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-8 shadow-sm border border-gray-100 dark:border-none">
            <BaseHorizontalBarChart
              title="Dispute Rate by Modality (%)"
              data={reportData.modalityDisputeRate}
              dataKey="value"
              nameKey="name"
              fill="#6AD2FF"
            />
          </div>
          <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-8 shadow-sm border border-gray-100 dark:border-none">
            <BaseBarChart
              title="Repeat Disputes by Healer"
              data={reportData.healerRepeatDisputes}
              bars={[
                { name: "Disputes", dataKey: "disputes", fill: "#4318FF" }
              ]}
            />
          </div>
        </div>

        {/* Practitioner Risk Watchlist */}
        <Card className="rounded-[30px] border-none shadow-sm dark:bg-[#111C44] p-6">
            <CardHeader className="px-2 pt-2">
              <CardTitle className="text-xl font-bold text-[#1b254b] dark:text-white flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-[#FF5B5B]" />
                Practitioner Risk Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 dark:border-white/10 hover:bg-transparent">
                    <TableHead className="font-bold uppercase text-xs text-[#A3AED0]">Practitioner</TableHead>
                    <TableHead className="font-bold uppercase text-xs text-[#A3AED0]">Disputes</TableHead>
                    <TableHead className="text-right font-bold uppercase text-xs text-[#A3AED0]">Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.healerRepeatDisputes
                    .filter(h => h.disputes >= 2)
                    .map((healer, idx) => (
                      <TableRow key={idx} className="border-gray-100 dark:border-white/10 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <TableCell className="font-bold text-[#1b254b] dark:text-white py-4">
                          {healer.name}
                        </TableCell>
                        <TableCell className="font-black text-[#1b254b] dark:text-white">
                          {healer.disputes}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 border-none rounded-lg px-4 py-1 font-bold">
                            {healer.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  {reportData.healerRepeatDisputes.filter(h => h.disputes >= 2).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-[#A3AED0] italic">
                        No practitioners currently flagged for repeat disputes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
