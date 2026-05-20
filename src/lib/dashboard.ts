import { getAuth } from "firebase/auth";
import axios from "axios";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DashboardStats {
  totalHealers: number;
  totalSeekers: number;
  revenueThisMonth: number;
  activeDisputes: number;
  healersChange: string;
  seekersChange: string;
  revenueChange: string;
  disputesChange: string;
  chartData: Array<{ name: string; revenue: number }>;
  recentActivity: Array<{
    id: string;
    type: "booking" | "dispute";
    title: string;
    timestamp: string;
    status: string;
    isRed?: boolean;
  }>;
}

export const fetchDashboardStats = async (range: string = "this_month"): Promise<DashboardStats> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  
  const token = await user.getIdToken();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  
  const response = await axios.get(`${API_URL}/api/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { range }
  });
  
  return response.data.data;
};

/**
 * Apply number formatting and right-alignment to every numeric cell in a worksheet.
 * Uses xlsx-style-compatible `z` (number format) and `s` (style) properties.
 */
const formatNumericCells = (ws: any) => {
  const range = ws['!ref'];
  if (!range) return;

  // Parse range like "A1:C5"
  const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
  if (!match) return;

  const startCol = match[1];
  const startRow = parseInt(match[2], 10);
  const endCol = match[3];
  const endRow = parseInt(match[4], 10);

  const colToNum = (col: string) => {
    let num = 0;
    for (let i = 0; i < col.length; i++) {
      num = num * 26 + col.charCodeAt(i) - 64;
    }
    return num;
  };
  const numToCol = (num: number): string => {
    let col = '';
    while (num > 0) {
      const rem = (num - 1) % 26;
      col = String.fromCharCode(65 + rem) + col;
      num = Math.floor((num - 1) / 26);
    }
    return col;
  };

  const sc = colToNum(startCol);
  const ec = colToNum(endCol);

  // Track max width per column for auto-sizing
  const colWidths: Record<string, number> = {};

  for (let r = startRow; r <= endRow; r++) {
    for (let c = sc; c <= ec; c++) {
      const addr = `${numToCol(c)}${r}`;
      const cell = ws[addr];
      if (!cell) continue;

      const colKey = numToCol(c);
      const cellLen = String(cell.v ?? '').length;
      colWidths[colKey] = Math.max(colWidths[colKey] || 8, cellLen + 2);

      if (typeof cell.v === 'number') {
        // Apply comma-thousands format and right-alignment
        cell.z = '#,##0';
        cell.s = { alignment: { horizontal: 'right' } };
      }
    }
  }

  // Auto-fit column widths
  const cols = [];
  for (let c = sc; c <= ec; c++) {
    const colKey = numToCol(c);
    cols.push({ wch: colWidths[colKey] || 12 });
  }
  ws['!cols'] = cols;
};

export const exportDashboardStats = (stats: DashboardStats) => {
  import('xlsx').then(XLSX => {
    const wb = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
      { Metric: "Total Registered Healers", Value: stats.totalHealers, "Trend/Change": stats.healersChange },
      { Metric: "Total Registered Seekers", Value: stats.totalSeekers, "Trend/Change": stats.seekersChange },
      { Metric: "Revenue This Month", Value: stats.revenueThisMonth, "Trend/Change": stats.revenueChange },
      { Metric: "Active Disputes", Value: stats.activeDisputes, "Trend/Change": stats.disputesChange },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    formatNumericCells(wsSummary);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Overview Summary");

    // 2. Revenue Trend Chart Data Sheet
    const chartExport = (stats.chartData || []).map(d => ({
      Date: d.name,
      Revenue: d.revenue,
    }));
    const wsChart = XLSX.utils.json_to_sheet(chartExport);
    formatNumericCells(wsChart);
    XLSX.utils.book_append_sheet(wb, wsChart, "Revenue Trend");

    // 3. Recent Activity Sheet
    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    const activityData = (stats.recentActivity || []).map(a => ({
      "Timestamp": new Date(a.timestamp).toLocaleString(),
      "Activity Type": capitalize(a.type),
      "Title": a.title,
      "Status": capitalize(typeof a.status === 'string' ? a.status : 'active')
    }));
    const wsActivity = XLSX.utils.json_to_sheet(activityData);
    formatNumericCells(wsActivity);
    XLSX.utils.book_append_sheet(wb, wsActivity, "Recent Activity");

    // Generate and Download
    XLSX.writeFile(wb, `UltraHealer_Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  });
};

export const exportDashboardPdf = (stats: DashboardStats) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(20);
  doc.setTextColor(27, 37, 75);
  doc.text("Dashboard Overview Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(115, 124, 170);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Exported from UltraHealer Dashboard`, 14, 34);

  doc.setFontSize(12);
  doc.setTextColor(27, 37, 75);
  doc.text("Summary Metrics", 14, 44);

  autoTable(doc, {
    startY: 48,
    head: [["Metric", "Value"]],
    body: [
      ["Total Registered Healers", String(stats.totalHealers)],
      ["Total Registered Seekers", String(stats.totalSeekers)],
      ["Revenue This Month", `$${stats.revenueThisMonth.toLocaleString()}`],
      ["Active Disputes", String(stats.activeDisputes)],
    ],
    theme: "grid",
    headStyles: { fillColor: [67, 24, 255], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  const revenueStart = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setTextColor(27, 37, 75);
  doc.text("Revenue Trend", 14, revenueStart);

  autoTable(doc, {
    startY: revenueStart + 6,
    head: [["Date", "Revenue"]],
    body: stats.chartData.map((row) => [row.name, `$${row.revenue.toLocaleString()}`]),
    theme: "striped",
    headStyles: { fillColor: [67, 24, 255], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  const activityStart = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setTextColor(27, 37, 75);
  doc.text("Recent Activity", 14, activityStart);

  const formatStatusLabel = (status: string) =>
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());

  const activityRows = stats.recentActivity.length
    ? stats.recentActivity.map((activity) => [
        new Date(activity.timestamp).toLocaleString(),
        activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
        activity.title,
        typeof activity.status === 'string' ? formatStatusLabel(activity.status) : 'Active',
      ])
    : [["-", "-", "No recent activity", "-"]];

  autoTable(doc, {
    startY: activityStart + 6,
    head: [["Timestamp", "Activity Type", "Title", "Status"]],
    body: activityRows,
    theme: "grid",
    headStyles: { fillColor: [67, 24, 255], textColor: 255 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 30 },
      2: { cellWidth: 75 },
      3: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`UltraHealer_Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

