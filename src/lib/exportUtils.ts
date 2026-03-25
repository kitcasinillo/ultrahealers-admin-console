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

    doc.save('Platform-Overview-Report.pdf');
  }).catch(err => {
    console.error("Failed to generate styled PDF report:", err);
  });
};

export const exportPlatformOverviewExcel = (data: ReportDataPayload) => {
  const wb = XLSX.utils.book_new();

  // 1. Summary Metrics Sheet
  const summaryFormatted = data.summaryData.map(card => ({
    Metric: card.title,
    Value: card.value,
    Details: card.description || '-'
  }));
  const ws1 = XLSX.utils.json_to_sheet(summaryFormatted);
  ws1['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Summary Metrics");

  // 2. User Growth Sheet
  const growthFormatted = data.userGrowthData.map(d => ({
    Period: d.name,
    Healers: d.healers,
    Seekers: d.seekers,
    'Total Added': d.healers + d.seekers
  }));
  const ws2 = XLSX.utils.json_to_sheet(growthFormatted);
  ws2['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, "User Growth");

  // 3. Booking Volume Sheet
  const bookingsFormatted = data.bookingVolumeData.map(d => ({
    Period: d.name,
    Sessions: d.sessions,
    Retreats: d.retreats,
    'Total Volume': d.sessions + d.retreats
  }));
  const ws3 = XLSX.utils.json_to_sheet(bookingsFormatted);
  ws3['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Booking Volume");

  // 4. Revenue Composition Sheet
  const revenueFormatted = data.revenueData.map(d => ({
    Period: d.name,
    'Session Commission': `$${d.commission.toLocaleString()}`,
    'Seeker Fees': `$${d.fees.toLocaleString()}`,
    'Premium Subscriptions': `$${d.premium.toLocaleString()}`,
    'Total Context Revenue': `$${(d.commission + d.fees + d.premium).toLocaleString()}`
  }));
  const ws4 = XLSX.utils.json_to_sheet(revenueFormatted);
  ws4['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Revenue Composition");

  XLSX.writeFile(wb, "Platform-Overview-Data.xlsx");
};
