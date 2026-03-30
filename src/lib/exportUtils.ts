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

/**
 * Financial Report Specific Exports
 */

export interface FinancialExportPayload {
  bookings: any[];
  premium: any[];
  title: string;
  dateRangeLabel: string;
  revenueBySource: Array<{ name: string; value: number }>;
  revenueTrend: Array<{ month: string; sessions: number; retreats: number; subs: number }>;
  monthlyComparison: Array<{ month: string; revenue: number; prior: number }>;
  stripeFeeImpact: Array<{ name: string; gross: number; fees: number }>;
  topHealers: Array<{ name: string; revenue: number }>;
  topRetreats: Array<{ name: string; revenue: number }>;
}

export const exportFinancialPdf = (payload: FinancialExportPayload) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns
  const { bookings, premium, title, dateRangeLabel, revenueBySource, revenueTrend, monthlyComparison, stripeFeeImpact, topHealers, topRetreats } = payload;

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Active Filter: ${dateRangeLabel}`, 14, 34);

  // --- Section 1: Revenue by Source ---
  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("1. Revenue by Source", 14, 46);

  const totalRevBySource = revenueBySource.length > 0 ? revenueBySource.reduce((s, r) => s + r.value, 0) : 1;
  autoTable(doc, {
    startY: 51,
    head: [['Source', 'Revenue ($)', '% of Total']],
    body: revenueBySource.map(r => [
      r.name,
      `$${r.value.toLocaleString()}`,
      `${((r.value / totalRevBySource) * 100).toFixed(1)}%`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  // --- Section 2: Revenue Trend ---
  let lastY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.text("2. Revenue Trend (Financial Period)", 14, lastY);

  autoTable(doc, {
    startY: lastY + 5,
    head: [['Period', 'Sessions ($)', 'Retreats ($)', 'Subscriptions ($)', 'Total ($)']],
    body: revenueTrend.map(d => [
      d.month,
      `$${d.sessions.toLocaleString()}`,
      `$${d.retreats.toLocaleString()}`,
      `$${d.subs.toLocaleString()}`,
      `$${(d.sessions + d.retreats + d.subs).toLocaleString()}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  // --- Section 3: Revenue Growth Performance ---
  lastY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.text("3. Revenue Growth Performance", 14, lastY);

  autoTable(doc, {
    startY: lastY + 5,
    head: [['Period', 'Current Revenue ($)', 'Prior Period ($)', 'Change ($)', 'Change (%)']],
    body: monthlyComparison.map(d => {
      const change = d.revenue - d.prior;
      const pctChange = d.prior > 0 ? ((change / d.prior) * 100).toFixed(1) : 'N/A';
      return [
        d.month,
        `$${d.revenue.toLocaleString()}`,
        `$${d.prior.toLocaleString()}`,
        `$${change.toLocaleString()}`,
        `${pctChange}%`
      ];
    }),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  // --- Section 4: Stripe Fee Impact ---
  lastY = (doc as any).lastAutoTable.finalY + 12;
  
  // Check for page overflow for header
  if (lastY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    lastY = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("4. Stripe Processing Fee Impact", 14, lastY);
  
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Day/Period', 'Gross Value ($)', 'Stripe Fees ($)', 'Net After Fees ($)', 'Fee Rate (%)']],
    body: stripeFeeImpact.map(d => [
      d.name,
      `$${d.gross.toLocaleString()}`,
      `$${d.fees.toLocaleString()}`,
      `$${(d.gross - d.fees).toLocaleString()}`,
      d.gross > 0 ? `${((d.fees / d.gross) * 100).toFixed(2)}%` : '0%'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });
  
  lastY = (doc as any).lastAutoTable.finalY + 12;
  
  // Check for page overflow for header
  if (lastY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    lastY = 20;
  }
  
  doc.text("5. Top High-Revenue Healers (Top 10)", 14, lastY);
  
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Rank', 'Healer Name', 'Revenue ($)']],
    body: topHealers.map((h, i) => [
      String(i + 1),
      h.name,
      `$${h.revenue.toLocaleString()}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });
  
  lastY = (doc as any).lastAutoTable.finalY + 12;

  // Check for page overflow for header
  if (lastY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    lastY = 20;
  }

  doc.text("6. Top High-Growth Retreat Events (Top 10)", 14, lastY);
  
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Rank', 'Retreat Name', 'Revenue ($)']],
    body: topRetreats.map((r, i) => [
      String(i + 1),
      r.name,
      `$${r.revenue.toLocaleString()}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });
  
  // --- Section 7: Booking Audit ---
  lastY = (doc as any).lastAutoTable.finalY + 12;

  // Audit Logs are long, but let's see if we can start them on the same page
  if (lastY > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    lastY = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("7. Booking Financial Audit", 14, lastY);
  
  autoTable(doc, {
    startY: lastY + 5,
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
  
  // --- Section 8: Premium Activations ---
  lastY = (doc as any).lastAutoTable.finalY + 12;

  if (lastY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    lastY = 20;
  }

  doc.text("8. Premium Activations", 14, lastY);
  
  autoTable(doc, {
    startY: lastY + 5,
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

export const exportFinancialExcel = (payload: FinancialExportPayload) => {
  const wb = XLSX.utils.book_new();
  const { bookings, premium, title, dateRangeLabel, revenueBySource, revenueTrend, monthlyComparison, stripeFeeImpact, topHealers, topRetreats } = payload;

  const createSheetWithHeader = (data: any[], sheetName: string, subTitle: string) => {
    // 1. Create header with branding and metadata
    const header = [
      ["ULTRAHEALERS ADMIN CONSOLE"],
      [title.toUpperCase()],
      [`Section: ${subTitle}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Reporting Period: ${dateRangeLabel}`],
      [], // Spacer
    ];

    const ws = XLSX.utils.aoa_to_sheet(header);

    // 2. Add the actual data starting at row 7 (index 6)
    if (data.length > 0) {
      XLSX.utils.sheet_add_json(ws, data, { origin: "A7" });
      
      // Auto-width helper
      const keys = Object.keys(data[0]);
      ws['!cols'] = keys.map((key, i) => ({
        wch: Math.max(key.length, ...data.map(d => String(d[key] || '').length), i === 0 ? 30 : 10) + 2
      }));
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  // Sheet 1: Revenue by Source
  const totalRevBySource = revenueBySource.length > 0 ? revenueBySource.reduce((s, r) => s + r.value, 0) : 1;
  const formattedRevBySource = revenueBySource.map(r => ({
    'Source': r.name,
    'Revenue ($)': r.value,
    '% of Total': `${((r.value / totalRevBySource) * 100).toFixed(1)}%`
  }));
  createSheetWithHeader(formattedRevBySource, "Revenue by Source", "Income Distribution");

  // Sheet 2: Revenue Trend
  const formattedTrend = revenueTrend.map(d => ({
    'Period': d.month,
    'Sessions ($)': d.sessions,
    'Retreats ($)': d.retreats,
    'Subscriptions ($)': d.subs,
    'Total ($)': d.sessions + d.retreats + d.subs
  }));
  createSheetWithHeader(formattedTrend, "Revenue Trend", "Historical Growth");

  // Sheet 3: Revenue Growth
  const formattedGrowth = monthlyComparison.map(d => {
    const change = d.revenue - d.prior;
    const pctChange = d.prior > 0 ? `${((change / d.prior) * 100).toFixed(1)}%` : 'N/A';
    return {
      'Period': d.month,
      'Current Revenue ($)': d.revenue,
      'Prior Period ($)': d.prior,
      'Change ($)': change,
      'Change (%)': pctChange
    };
  });
  createSheetWithHeader(formattedGrowth, "Revenue Growth", "Period-over-Period Performance");

  // Sheet 4: Stripe Fee Impact
  const formattedFees = stripeFeeImpact.map(d => ({
    'Day/Period': d.name,
    'Gross Value ($)': d.gross,
    'Stripe Fees ($)': d.fees,
    'Net After Fees ($)': d.gross - d.fees,
    'Fee Rate (%)': d.gross > 0 ? `${((d.fees / d.gross) * 100).toFixed(2)}%` : '0%'
  }));
  createSheetWithHeader(formattedFees, "Stripe Fee Impact", "Processing Efficiency");

  // Sheet 5: Top Healers
  const formattedHealers = topHealers.map((h, i) => ({
    'Rank': i + 1,
    'Healer Name': h.name,
    'Revenue ($)': h.revenue
  }));
  createSheetWithHeader(formattedHealers, "Top Healers", "Healer Rankings");

  // Sheet 6: Top Retreats
  const formattedRetreats = topRetreats.map((r, i) => ({
    'Rank': i + 1,
    'Retreat Name': r.name,
    'Revenue ($)': r.revenue
  }));
  createSheetWithHeader(formattedRetreats, "Top Retreats", "Event Performance");

  // Sheet 7: Bookings Audit
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
  createSheetWithHeader(formattedBookings, "Bookings Audit", "Booking Financial Audit");

  // Sheet 8: Premium Activations
  const formattedPremium = premium.map(p => ({
    'Healer': p.healer,
    'Activation Date': p.activationDate,
    'Amount ($)': p.amount,
    'Stripe Session ID': p.stripeSessionId
  }));
  createSheetWithHeader(formattedPremium, "Premium Activations", "Subscription Log");

  XLSX.writeFile(wb, `Financial_Report_${new Date().getTime()}.xlsx`);
};
