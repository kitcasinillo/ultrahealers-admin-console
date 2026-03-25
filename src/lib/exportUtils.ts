import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export interface ReportDataPayload {
  dateRange: string;
  summaryData: Array<{ title: string; value: string; description?: string }>;
  userGrowthData: Array<{ name: string; healers: number; seekers: number }>;
  bookingVolumeData: Array<{ name: string; sessions: number; retreats: number }>;
  revenueData: Array<{ name: string; commission: number; fees: number; premium: number }>;
}

export const exportPlatformOverviewPdf = (data: ReportDataPayload) => {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Platform Overview Report", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Reporting Period: ${data.dateRange}`, 14, 36);

  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("1. Key Performance Metrics", 14, 48);

  import('jspdf-autotable').then(({ default: autoTable }) => {
    autoTable(doc, {
      startY: 53,
      head: [['Metric', 'Value', 'Details']],
      body: data.summaryData.map(card => [card.title, String(card.value), card.description || '-']),
      theme: 'grid',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    const finalYMetrics = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text("2. User Growth Trends", 14, finalYMetrics);

    autoTable(doc, {
      startY: finalYMetrics + 5,
      head: [['Period', 'Healers', 'Seekers', 'Total Added']],
      body: data.userGrowthData.map(d => [d.name, String(d.healers), String(d.seekers), String(d.healers + d.seekers)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    const finalYGrowth = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.text("3. Booking Volumes", 14, finalYGrowth);

    autoTable(doc, {
      startY: finalYGrowth + 5,
      head: [['Period', 'Sessions', 'Retreats', 'Total Volume']],
      body: data.bookingVolumeData.map(d => [d.name, String(d.sessions), String(d.retreats), String(d.sessions + d.retreats)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    doc.addPage();
    doc.setFontSize(14);
    doc.text("4. Revenue Composition", 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Period', 'Session Commission', 'Seeker Fees', 'Premium Subscriptions', 'Total Context Revenue']],
      body: data.revenueData.map(d => [
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

    doc.save(`Platform-Overview-Report-${data.dateRange.replace(/\s+/g, '-')}.pdf`);
  }).catch(err => {
    console.error("Failed to generate styled PDF report:", err);
  });
};

export const exportPlatformOverviewExcel = (data: ReportDataPayload) => {
  const wb = XLSX.utils.book_new();

  // 1. Summary Metrics Sheet (including Report Info)
  // Combine header and data
  const ws1Data = [
    ["PLATFORM OVERVIEW REPORT", "", ""],
    ["Reporting Period:", data.dateRange, ""],
    ["Generated On:", new Date().toLocaleDateString(), ""],
    [],
    ["METRIC", "VALUE", "DETAILS"],
    ...data.summaryData.map(card => [card.title, card.value, card.description || '-'])
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  
  // Style column widths
  ws1['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 45 }];
  
  XLSX.utils.book_append_sheet(wb, ws1, "Summary Metrics");

  // 2. User Growth Sheet
  const growthData = [
    ["USER GROWTH TRENDS", "", "", ""],
    ["Reporting Period:", data.dateRange, "", ""],
    [],
    ["PERIOD", "HEALERS", "SEEKERS", "TOTAL ADDED"],
    ...data.userGrowthData.map(d => [d.name, d.healers, d.seekers, d.healers + d.seekers])
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(growthData);
  ws2['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, "User Growth");

  // 3. Booking Volume Sheet
  const bookingsData = [
    ["BOOKING VOLUME TRENDS", "", "", ""],
    ["Reporting Period:", data.dateRange, "", ""],
    [],
    ["PERIOD", "SESSIONS", "RETREATS", "TOTAL VOLUME"],
    ...data.bookingVolumeData.map(d => [d.name, d.sessions, d.retreats, d.sessions + d.retreats])
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(bookingsData);
  ws3['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Booking Volume");

  // 4. Revenue Composition Sheet
  const revenueData = [
    ["REVENUE COMPOSITION", "", "", "", ""],
    ["Reporting Period:", data.dateRange, "", "", ""],
    [],
    ["PERIOD", "SESSION COMMISSION", "SEEKER FEES", "PREMIUM SUBSCRIPTIONS", "TOTAL REVENUE"],
    ...data.revenueData.map(d => [
      d.name,
      `$${d.commission.toLocaleString()}`,
      `$${d.fees.toLocaleString()}`,
      `$${d.premium.toLocaleString()}`,
      `$${(d.commission + d.fees + d.premium).toLocaleString()}`
    ])
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(revenueData);
  ws4['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Revenue Composition");

  XLSX.writeFile(wb, `Platform-Overview-Report-${data.dateRange.replace(/\s+/g, '-')}.xlsx`);
};
