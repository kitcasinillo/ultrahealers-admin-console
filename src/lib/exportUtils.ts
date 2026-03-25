import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    head: [['Period', 'Session Commission', 'Seeker Fees', 'Premium Subscriptions', 'Total Platform Revenue']],
    body: data.revenueData.map(d => [
      d.name,
      `$${d.commission.toLocaleString()}`,
      `$${d.fees.toLocaleString()}`,
      `$${(d.premium || 0).toLocaleString()}`,
      `$${(d.commission + d.fees + (d.premium || 0)).toLocaleString()}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  doc.save('Platform-Overview-Report.pdf');
};

export const exportPlatformOverviewExcel = (data: ReportDataPayload) => {
  const wb = XLSX.utils.book_new();

  // Helper to set column widths
  const setAutoWidth = (ws: any, data: any[]) => {
    if (data.length === 0) return;
    const keys = Object.keys(data[0]);
    ws['!cols'] = keys.map(key => ({
      wch: Math.max(key.length, ...data.map(d => String(d[key] || '').length)) + 2
    }));
  };

  const formattedGrowth = data.userGrowthData.map(d => ({
    'Period': d.name,
    'Healers Added': d.healers,
    'Seekers Added': d.seekers,
    'Total Growth': d.healers + d.seekers
  }));
  const ws1 = XLSX.utils.json_to_sheet(formattedGrowth);
  setAutoWidth(ws1, formattedGrowth);
  XLSX.utils.book_append_sheet(wb, ws1, "User Growth");

  const formattedVolume = data.bookingVolumeData.map(d => ({
    'Period': d.name,
    'Sessions': d.sessions,
    'Retreats': d.retreats,
    'Total Volume': d.sessions + d.retreats
  }));
  const ws2 = XLSX.utils.json_to_sheet(formattedVolume);
  setAutoWidth(ws2, formattedVolume);
  XLSX.utils.book_append_sheet(wb, ws2, "Booking Volume");

  const formattedRevenue = data.revenueData.map(d => ({
    'Period': d.name,
    'Session Commission ($)': d.commission,
    'Seeker Fees ($)': d.fees,
    'Premium Subscriptions ($)': d.premium || 0,
    'Total Revenue ($)': d.commission + d.fees + (d.premium || 0)
  }));
  const ws3 = XLSX.utils.json_to_sheet(formattedRevenue);
  setAutoWidth(ws3, formattedRevenue);
  XLSX.utils.book_append_sheet(wb, ws3, "Revenue Composition");

  const summaryDataFormatted = data.summaryData.map(card => ({ 
    Metric: card.title, 
    Value: card.value, 
    Details: card.description || '-' 
  }));
  const ws4 = XLSX.utils.json_to_sheet(summaryDataFormatted);
  setAutoWidth(ws4, summaryDataFormatted);
  XLSX.utils.book_append_sheet(wb, ws4, "Summary Metrics");

  XLSX.writeFile(wb, "Platform-Overview-Data.xlsx");
};

/**
 * Financial Report Specific Exports
 */

export const exportFinancialPdf = (bookings: any[], premium: any[], title: string) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  // 1. Bookings Table
  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("1. Booking Financial Audit", 14, 40);

  autoTable(doc, {
    startY: 45,
    head: [['Date', 'Booking ID', 'Listing', 'Healer', 'Seeker', 'Gross', 'Comm.', 'S.Fee', 'P.Fee', 'Net', 'Stripe PI']],
    body: bookings.map(b => [
      b.date, b.bookingId, b.listing, b.healer, b.seeker,
      `$${b.grossAmount.toFixed(2)}`, `$${b.healerCommission.toFixed(2)}`,
      `$${b.seekerFee.toFixed(2)}`, `$${b.processingFee.toFixed(2)}`, `$${b.netRevenue.toFixed(2)}`,
      b.stripePi
    ]),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 7 } // Smaller font to accommodate 11 columns
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // 2. Premium Table
  doc.text("2. Premium Activations", 14, finalY);

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Healer', 'Date', 'Amount', 'Session ID']],
    body: premium.map(p => [
      p.healer, p.activationDate, `$${p.amount.toFixed(2)}`, p.stripeSessionId
    ]),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 8 }
  });

  doc.save(`Financial_Report_${new Date().getTime()}.pdf`);
};

export const exportFinancialExcel = (bookings: any[], premium: any[]) => {
  const wb = XLSX.utils.book_new();

  // Helper to set column widths
  const setAutoWidth = (ws: any, data: any[]) => {
    if (data.length === 0) return;
    const keys = Object.keys(data[0]);
    ws['!cols'] = keys.map(key => ({
      wch: Math.max(key.length, ...data.map(d => String(d[key] || '').length)) + 2
    }));
  };

  // Format Bookings for Excel
  const formattedBookings = bookings.map(b => ({
    'Date': b.date,
    'Booking ID': b.bookingId,
    'Listing/Retreat': b.listing,
    'Healer': b.healer,
    'Seeker': b.seeker,
    'Gross Amount ($)': b.grossAmount,
    'Healer Commission ($)': b.healerCommission,
    'Seeker Fee ($)': b.seekerFee,
    'Stripe Fee ($)': b.processingFee,
    'Net Revenue ($)': b.netRevenue,
    'Stripe P.I.': b.stripePi
  }));

  const ws1 = XLSX.utils.json_to_sheet(formattedBookings);
  setAutoWidth(ws1, formattedBookings);
  XLSX.utils.book_append_sheet(wb, ws1, "Bookings Audit");

  // Format Premium for Excel
  const formattedPremium = premium.map(p => ({
    'Healer': p.healer,
    'Activation Date': p.activationDate,
    'Amount ($)': p.amount,
    'Stripe Session ID': p.stripeSessionId
  }));

  const ws2 = XLSX.utils.json_to_sheet(formattedPremium);
  setAutoWidth(ws2, formattedPremium);
  XLSX.utils.book_append_sheet(wb, ws2, "Premium Activations");

  XLSX.writeFile(wb, `Financial_Report_${new Date().getTime()}.xlsx`);
};
