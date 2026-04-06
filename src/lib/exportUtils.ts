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
        `$${(d.premium || 0).toLocaleString()}`,
        `$${(d.commission + d.fees + (d.premium || 0)).toLocaleString()}`
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

  const ws1 = XLSX.utils.json_to_sheet(data.userGrowthData);
  XLSX.utils.book_append_sheet(wb, ws1, "User Growth");

  const ws2 = XLSX.utils.json_to_sheet(data.bookingVolumeData);
  XLSX.utils.book_append_sheet(wb, ws2, "Booking Volume");

  const ws3 = XLSX.utils.json_to_sheet(data.revenueData);
  XLSX.utils.book_append_sheet(wb, ws3, "Revenue Composition");

  const summaryDataFormatted = data.summaryData.map(card => ({ Metric: card.title, Value: card.value, Details: card.description || '-' }));
  const ws4 = XLSX.utils.json_to_sheet(summaryDataFormatted);
  XLSX.utils.book_append_sheet(wb, ws4, "Summary Metrics");

  XLSX.writeFile(wb, "Platform-Overview-Data.xlsx");
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
/**
 * Campaign Report Exports
 */

export interface CampaignExportPayload {
  kpiData: Array<{ title: string; value: string; description: string }>;
  summaryData: any[];
  reachData: any[];
  unsubscribeTrend: any[];
  segmentPerformance: any[];
}

export const exportCampaignPdf = (payload: CampaignExportPayload) => {
  const { kpiData, summaryData, reachData, unsubscribeTrend, segmentPerformance } = payload;
  const doc = new jsPDF('l', 'mm', 'a4');

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Campaign Performance Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  import('jspdf-autotable').then(({ default: autoTable }) => {
    let currentY = 40;
    let sectionIdx = 1;

    if (kpiData && kpiData.length > 0) {
      if (currentY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14); doc.setTextColor(27, 37, 75);
      doc.text(`${sectionIdx++}. Key Performance Metrics`, 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Metric', 'Value', 'Details']],
        body: kpiData.map(kpi => [kpi.title, kpi.value, kpi.description]),
        theme: 'grid', headStyles: { fillColor: [67, 24, 255] }, styles: { fontSize: 9 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (summaryData && summaryData.length > 0) {
      if (currentY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14); doc.setTextColor(27, 37, 75);
      doc.text(`${sectionIdx++}. Campaign Summary`, 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Campaign Name', 'Sent', 'Open Rate', 'CTR', 'Bounce Rate', 'Status']],
        body: summaryData.map(c => [c.name, c.sent.toLocaleString(), `${c.openRate}%`, `${c.ctr}%`, `${c.bounceRate}%`, c.status]),
        theme: 'striped', headStyles: { fillColor: [67, 24, 255] }, styles: { fontSize: 9 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (reachData && reachData.length > 0) {
      if (currentY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14); doc.setTextColor(27, 37, 75);
      doc.text(`${sectionIdx++}. Reach & Deliverability`, 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Period', 'Sent', 'Delivered', 'Delivery Rate']],
        body: reachData.map(r => [r.name, r.sent.toLocaleString(), r.delivered.toLocaleString(), `${((r.delivered / r.sent) * 100).toFixed(1)}%`]),
        theme: 'striped', headStyles: { fillColor: [67, 24, 255] }, styles: { fontSize: 9 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (unsubscribeTrend && unsubscribeTrend.length > 0) {
      if (currentY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14); doc.setTextColor(27, 37, 75);
      doc.text(`${sectionIdx++}. Unsubscribe Rate Trend`, 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Period', 'Unsubscribe Rate (%)']],
        body: unsubscribeTrend.map(u => [u.name, `${u.rate}%`]),
        theme: 'striped', headStyles: { fillColor: [255, 91, 91] }, styles: { fontSize: 9 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (segmentPerformance && segmentPerformance.length > 0) {
      if (currentY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14); doc.setTextColor(27, 37, 75);
      doc.text(`${sectionIdx++}. Audience Segment Performance`, 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Segment', 'Engagement (%)']],
        body: segmentPerformance.map(s => [s.name, `${s.value}%`]),
        theme: 'striped', headStyles: { fillColor: [67, 24, 255] }, styles: { fontSize: 9 }
      });
    }

    doc.save(`Campaign_Report_${new Date().getTime()}.pdf`);
  });
};

export const exportCampaignExcel = (payload: CampaignExportPayload) => {
  const { kpiData, summaryData, reachData, unsubscribeTrend, segmentPerformance } = payload;
  const wb = XLSX.utils.book_new();

  if (kpiData && kpiData.length > 0) {
    const ws0 = XLSX.utils.json_to_sheet(kpiData.map(kpi => ({ 'Metric': kpi.title, 'Value': kpi.value, 'Details': kpi.description })));
    XLSX.utils.book_append_sheet(wb, ws0, "Key Metrics");
  }

  if (summaryData && summaryData.length > 0) {
    const ws1 = XLSX.utils.json_to_sheet(summaryData.map(c => ({ 'Campaign Name': c.name, 'Sent': c.sent, 'Open Rate (%)': c.openRate, 'CTR (%)': c.ctr, 'Bounce Rate (%)': c.bounceRate, 'Status': c.status })));
    XLSX.utils.book_append_sheet(wb, ws1, "Campaign Summary");
  }

  if (reachData && reachData.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(reachData.map(r => ({ 'Period': r.name, 'Sent': r.sent, 'Delivered': r.delivered, 'Delivery Rate (%)': Number(((r.delivered / r.sent) * 100).toFixed(1)) })));
    XLSX.utils.book_append_sheet(wb, ws2, "Reach & Deliverability");
  }

  if (unsubscribeTrend && unsubscribeTrend.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(unsubscribeTrend.map(u => ({ 'Period': u.name, 'Unsubscribe Rate (%)': u.rate })));
    XLSX.utils.book_append_sheet(wb, ws3, "Unsubscribe Trend");
  }

  if (segmentPerformance && segmentPerformance.length > 0) {
    const ws4 = XLSX.utils.json_to_sheet(segmentPerformance.map(s => ({ 'Segment': s.name, 'Engagement (%)': s.value })));
    XLSX.utils.book_append_sheet(wb, ws4, "Segment Performance");
  }

  XLSX.writeFile(wb, `Campaign_Report_${new Date().getTime()}.xlsx`);
};


/**
 * Dispute Report Exports
 */

export interface DisputeExportPayload {
  summaryData: any[];
  disputeRateTrend: any[];
  disputesByType: any[];
  disputesBySeverity: any[];
  resolutionTimeTrend: any[];
  outcomeBreakdown: any[];
  modalityDisputeRate: any[];
  healerRepeatDisputes: any[];
}

export const exportDisputePdf = (payload: DisputeExportPayload) => {
  const { 
    disputeRateTrend, 
    disputesByType, 
    disputesBySeverity, 
    resolutionTimeTrend, 
    outcomeBreakdown, 
    modalityDisputeRate, 
    healerRepeatDisputes 
  } = payload;
  const doc = new jsPDF('l', 'mm', 'a4');

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Dispute Analysis Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  import('jspdf-autotable').then(({ default: autoTable }) => {
    // 1. Dispute Rate Trend
    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text("1. Dispute Rate Trend", 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Period', 'Dispute Rate (%)']],
      body: disputeRateTrend.map(d => [d.name, `${d.rate}%`]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // 2. Disputes by Type
    doc.text("2. Disputes by Type", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Type', 'Count']],
      body: disputesByType.map(d => [d.name, String(d.value)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 160) { doc.addPage(); currentY = 20; }

    // 3. Resolution Outcomes
    doc.text("3. Resolution Outcomes", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Refund', 'Partial', 'Credit', 'Denied']],
      body: outcomeBreakdown.map(o => [o.name, String(o.refund), String(o.partial), String(o.credit), String(o.deny)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 160) { doc.addPage(); currentY = 20; }

    // 4. Disputes by Severity
    doc.text("4. Disputes by Severity", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Normal', 'Safety']],
      body: disputesBySeverity.map(d => [d.name, String(d.normal), String(d.safety)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 160) { doc.addPage(); currentY = 20; }

    // 5. Avg. Resolution Time
    doc.text("5. Avg. Resolution Time Trend", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Hours']],
      body: resolutionTimeTrend.map(r => [r.name, String(r.hours)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 160) { doc.addPage(); currentY = 20; }

    // 6. Dispute Rate by Modality
    doc.text("6. Dispute Rate by Modality", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Modality', 'Dispute Rate (%)']],
      body: modalityDisputeRate.map(m => [m.name, `${m.value}%`]),
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 160) { doc.addPage(); currentY = 20; }

    // 7. Healer Repeat Disputes
    doc.text("7. Healer Repeat Disputes (Flagged)", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Healer Name', 'Disputes', 'Status']],
      body: healerRepeatDisputes.map(h => [h.name, String(h.disputes), h.status]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 }
    });

    doc.save(`Dispute_Report_${new Date().getTime()}.pdf`);
  });
};

export const exportDisputeExcel = (payload: DisputeExportPayload) => {
  const { 
    disputeRateTrend, 
    disputesByType, 
    disputesBySeverity, 
    resolutionTimeTrend, 
    outcomeBreakdown, 
    modalityDisputeRate, 
    healerRepeatDisputes 
  } = payload;
  const wb = XLSX.utils.book_new();

  // 1. Dispute Rate Trend
  const formattedRate = disputeRateTrend.map(d => ({
    'Period': d.name,
    'Dispute Rate (%)': d.rate
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedRate), "Dispute Rate Trend");

  // 2. Disputes by Type
  const formattedType = disputesByType.map(d => ({
    'Type': d.name,
    'Count': d.value
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedType), "Disputes by Type");

  // 3. Disputes by Severity
  const formattedSeverity = disputesBySeverity.map(d => ({
    'Period': d.name,
    'Normal Disputes': d.normal,
    'Safety Disputes': d.safety
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedSeverity), "Disputes by Severity");

  // 4. Resolution Time Trend
  const formattedTime = resolutionTimeTrend.map(d => ({
    'Period': d.name,
    'Avg. Resolution Time (Hours)': d.hours
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedTime), "Resolution Time Trend");

  // 5. Outcome Breakdown
  const formattedOutcomes = outcomeBreakdown.map(o => ({
    'Period': o.name,
    'Refund': o.refund,
    'Partial Refund': o.partial,
    'Credit': o.credit,
    'Denied': o.deny
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedOutcomes), "Outcome Breakdown");

  // 6. Dispute Rate by Modality
  const formattedModality = modalityDisputeRate.map(m => ({
    'Modality': m.name,
    'Dispute Rate (%)': m.value
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedModality), "Dispute Rate by Modality");

  // 7. Healer Repeat Disputes
  const formattedHealers = healerRepeatDisputes.map(h => ({
    'Healer Name': h.name,
    'Dispute Count': h.disputes,
    'Risk Status': h.status
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedHealers), "Healer Repeat Disputes");

  XLSX.writeFile(wb, `Dispute_Report_${new Date().getTime()}.xlsx`);
};

/**
 * Growth & Retention Report Exports
 */

export interface GrowthExportPayload {
  summaryData: Array<{ title: string; value: string; description?: string }>;
  registrationTrend: any[];
  churnIndicators: any[];
  healerFunnel: any[];
  seekerFunnel: any[];
  subscriptionCohort: any[];
  retentionData: any[];
  granularity: string;
}

export const exportGrowthPdf = (payload: GrowthExportPayload) => {
  const {
    summaryData,
    registrationTrend, 
    churnIndicators, 
    healerFunnel, 
    seekerFunnel, 
    subscriptionCohort, 
    retentionData,
    granularity
  } = payload;

  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Growth & Retention Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Data Granularity: ${granularity}`, 14, 34);

  import('jspdf-autotable').then(({ default: autoTable }) => {
    // 1. Summary Metrics
    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text("1. Key Performance Summary", 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value', 'Context']],
      body: summaryData.map(s => [s.title, s.value, s.description || '-']),
      theme: 'grid',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // 2. Registration Trend
    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text(`2. Registration Trend (${granularity})`, 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Seekers', 'Healers', 'Total']],
      body: registrationTrend.map(r => [r.name, String(r.seekers), String(r.healers), String(r.seekers + r.healers)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 3. Churn Indicators
    doc.text(`3. Churn Indicators (${granularity})`, 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Seekers', 'Healers']],
      body: churnIndicators.map(c => [c.name, String(c.seekers), String(c.healers)]),
      theme: 'striped',
      headStyles: { fillColor: [255, 91, 91] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    // 4. Conversion Funnels (Combined summary)
    doc.text("4. Conversion Funnels Summary", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Funnel Step', 'Healers', 'Seeker Step', 'Seekers']],
      body: healerFunnel.map((h, i) => [
        h.step, String(h.value),
        seekerFunnel[i]?.step || '-', seekerFunnel[i] ? String(seekerFunnel[i].value) : '-'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [1, 163, 180] },
      styles: { fontSize: 8 }
    });

    doc.addPage();
    currentY = 20;

    // 5. Subscription & Retention
    doc.text("5. Subscription & Retention Metrics", 14, currentY);

    // Upgrade Rate
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Cohort', 'Premium Upgrade Rate (%)']],
      body: subscriptionCohort.map(s => [s.name, `${s.rate}%`]),
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Retention Heatmap (Table format)
    doc.text("6. Monthly Retention Cohorts", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Cohort', 'Size', 'M0', 'M1', 'M2', 'M3']],
      body: retentionData.map(r => [
        r.cohort, r.users.toLocaleString(),
        `${r.m0}%`, r.m1 ? `${r.m1}%` : '-', r.m2 ? `${r.m2}%` : '-', r.m3 ? `${r.m3}%` : '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [1, 163, 180] },
      styles: { fontSize: 9 }
    });

    doc.save(`Growth_Report_${granularity}_${new Date().getTime()}.pdf`);
  });
};

export const exportGrowthExcel = (payload: GrowthExportPayload) => {
  const {
    summaryData,
    registrationTrend,
    churnIndicators,
    healerFunnel,
    seekerFunnel,
    subscriptionCohort, 
    retentionData,
    granularity 
  } = payload;
  const wb = XLSX.utils.book_new();

  const summaryFormatted = summaryData.map(s => ({
    "Metric": s.title,
    "Current Value": s.value,
    "Context/Trend": s.description || "-",
    "Granularity": granularity
  }));

  const regFormatted = registrationTrend.map(r => ({
    "Period": r.name,
    "Seekers Added": r.seekers,
    "Healers Added": r.healers,
    "Total Registrations": r.seekers + r.healers
  }));

  const churnFormatted = churnIndicators.map(c => ({
    "Period": c.name,
    "Inactive Seekers (30d)": c.seekers,
    "Inactive Healers (30d)": c.healers,
    "Total Inactive": c.seekers + c.healers
  }));

  const healerFunnelFormatted = healerFunnel.map(h => ({
    "Funnel Step": h.step,
    "Healer Count": h.value
  }));

  const seekerFunnelFormatted = seekerFunnel.map(s => ({
    "Funnel Step": s.step,
    "Seeker Count": s.value
  }));

  const subFormatted = subscriptionCohort.map(s => ({
    "Cohort Period": s.name,
    "Premium Upgrade Rate (%)": s.rate
  }));

  const retentionFormatted = retentionData.map(r => ({
    "Cohort": r.cohort,
    "Size": r.users,
    "Month 0 (%)": r.m0,
    "Month 1 (%)": r.m1 || "-",
    "Month 2 (%)": r.m2 || "-",
    "Month 3 (%)": r.m3 || "-"
  }));

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryFormatted), "Summary Metrics");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(regFormatted), "Registration Trend");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(churnFormatted), "Churn Indicators");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(healerFunnelFormatted), "Healer Funnel");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(seekerFunnelFormatted), "Seeker Funnel");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subFormatted), "Subscription Upgrades");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(retentionFormatted), "Retention Cohorts");

  XLSX.writeFile(wb, `Growth_Report_${granularity}_${new Date().getTime()}.xlsx`);
};

/**
 * Growth Report CSV Export
 */
export const exportGrowthCsv = (payload: GrowthExportPayload) => {
  const {
    summaryData,
    registrationTrend,
    churnIndicators,
    healerFunnel,
    seekerFunnel,
    subscriptionCohort,
    retentionData
  } = payload;

  let csvContent = "";

  // 1. Summary Metrics
  csvContent += "REPORT SUMMARY (KEY METRICS)\n";
  csvContent += "Metric,Value,Context\n";
  summaryData.forEach(s => {
    csvContent += `"${s.title}","${s.value}","${s.description || '-'}"\n`;
  });
  csvContent += "\n";

  // 2. Registration Trend
  csvContent += "REGISTRATION TREND\n";
  csvContent += "Period,Seekers,Healers,Total Added\n";
  registrationTrend.forEach(r => {
    csvContent += `"${r.name}",${r.seekers},${r.healers},${r.seekers + r.healers}\n`;
  });
  csvContent += "\n";

  // 3. Churn Indicators
  csvContent += "CHURN INDICATORS (INACTIVE)\n";
  csvContent += "Period,Seekers,Healers\n";
  churnIndicators.forEach(c => {
    csvContent += `"${c.name}",${c.seekers},${c.healers}\n`;
  });
  csvContent += "\n";

  // 4. Conversion Funnels
  csvContent += "CONVERSION FUNNELS SUMMARY\n";
  csvContent += "Step (Healer),Count (Healer),Step (Seeker),Count (Seeker)\n";
  healerFunnel.forEach((h, i) => {
    const sStep = seekerFunnel[i] ? seekerFunnel[i].step : "-";
    const sVal = seekerFunnel[i] ? seekerFunnel[i].value : "-";
    csvContent += `"${h.step}",${h.value},"${sStep}",${sVal}\n`;
  });
  csvContent += "\n";

  // 5. Subscription Upgrades
  csvContent += "SUBSCRIPTION UPGRADE RATE\n";
  csvContent += "Cohort,Upgrade Rate (%)\n";
  subscriptionCohort.forEach(s => {
    csvContent += `"${s.name}",${s.rate}%\n`;
  });
  csvContent += "\n";

  // 6. Retention Cohorts
  csvContent += "RETENTION COHORTS (MONTHLY)\n";
  csvContent += "Cohort,Size,M0,M1,M2,M3\n";
  retentionData.forEach(r => {
    csvContent += `"${r.cohort}",${r.users},${r.m0}%,${r.m1 || '-'}%,${r.m2 || '-'}%,${r.m3 || '-'}%\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Growth_Report_${new Date().getTime()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


/**
 * Booking Report Exports
 */

export interface BookingExportPayload {
  summaryData: any[];
  bookingVolume: any[];
  avgBookingValue: any[];
  modalityPopularity: any[];
  durationDistribution: any[];
  completionRate: any[];
  formatBreakdown: any[];
  topHealersByCount: any[];
  topHealersByRevenue: any[];
}

export const exportBookingReportPdf = (payload: BookingExportPayload) => {
  const { 
    summaryData, 
    bookingVolume, 
    avgBookingValue, 
    modalityPopularity, 
    durationDistribution, 
    completionRate, 
    formatBreakdown,
    topHealersByCount,
    topHealersByRevenue
  } = payload;
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Booking & Session Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // 1. Summary Metrics
    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text("1. Key Performance Summary", 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value', 'Context']],
      body: summaryData.map(s => [s.title, s.value, s.description || '-']),
      theme: 'grid',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // 2. Booking Volume
    doc.text("2. Booking Volume", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Total Bookings']],
      body: bookingVolume.map(v => [v.name, String(v.bookings)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    // 3. Avg Booking Value
    doc.text("3. Average Booking Value ($)", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Value ($)']],
      body: avgBookingValue.map(v => [v.name, `$${v.value}`]),
      theme: 'striped',
      headStyles: { fillColor: [1, 163, 180] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    // 4. Modality Popularity
    doc.text("4. Modality Popularity", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Modality', 'Sessions Count']],
      body: modalityPopularity.map(m => [m.modality, String(m.sessions)]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    // 5. Session Length Distribution
    doc.text("5. Session Length Distribution", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Length', 'Count']],
      body: durationDistribution.map(d => [d.length, String(d.count)]),
      theme: 'striped',
      headStyles: { fillColor: [1, 163, 180] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    // 6. Completion Rate
    doc.text("6. Booking Lifecycle Completion Rate (%)", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Status', 'Rate (%)']],
      body: completionRate.map(c => [c.status, `${c.rate}%`]),
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    // 7. Format Breakdown
    doc.text("7. Format Breakdown (Remote vs In-Person)", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Format', 'Value (%)']],
      body: formatBreakdown.map(f => [f.name, `${f.value}%`]),
      theme: 'striped',
      headStyles: { fillColor: [1, 163, 180] },
      styles: { fontSize: 9 }
    });

    doc.addPage();
    currentY = 20;

    // 8. Top Healers by Count
    doc.text("8. Top 10 Practitioners by Booking Count", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Practitioner', 'Bookings', 'Rating']],
      body: topHealersByCount.map(h => [h.name, String(h.count), `${h.rating}`]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    // 9. Top Healers by Revenue
    doc.text("9. Top 10 Practitioners by Revenue ($)", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Practitioner', 'Revenue ($)', 'Rating']],
      body: topHealersByRevenue.map(h => [h.name, `$${h.revenue.toLocaleString()}`, `${h.rating}`]),
      theme: 'striped',
      headStyles: { fillColor: [1, 163, 180] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    // 10. Practitioner Performance Summary
    doc.text("10. Practitioner Performance Summary", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Practitioner', 'Bookings', 'Revenue ($)', 'Avg Rating']],
      body: topHealersByCount.map(h => [
        h.name, 
        String(h.count), 
        `$${h.revenue.toLocaleString()}`, 
        `${h.rating} ★`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    doc.save(`Booking_Report_${new Date().getTime()}.pdf`);
};

export const exportBookingReportExcel = (payload: BookingExportPayload) => {
  const { 
    summaryData, 
    bookingVolume, 
    avgBookingValue, 
    modalityPopularity, 
    durationDistribution, 
    completionRate, 
    formatBreakdown,
    topHealersByCount,
    topHealersByRevenue
  } = payload;
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    summaryData.map(s => ({ 'Metric': s.title, 'Value': s.value, 'Context': s.description || '-' }))
  ), "Summary Metrics");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    bookingVolume.map(v => ({ 'Period': v.name, 'Total Bookings': v.bookings }))
  ), "Booking Volume");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    avgBookingValue.map(v => ({ 'Period': v.name, 'Value ($)': v.value }))
  ), "Avg Booking Value");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    modalityPopularity.map(m => ({ 'Modality': m.modality, 'Sessions Count': m.sessions }))
  ), "Modality Popularity");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    durationDistribution.map(d => ({ 'Length': d.length, 'Count': d.count }))
  ), "Length Distribution");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    completionRate.map(c => ({ 'Status': c.status, 'Rate (%)': c.rate }))
  ), "Completion Rate");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    formatBreakdown.map(f => ({ 'Format': f.name, 'Value (%)': f.value }))
  ), "Format Breakdown");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    topHealersByCount.map(h => ({ 'Practitioner': h.name, 'Bookings': h.count, 'Rating': h.rating }))
  ), "Top Healers by Count");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    topHealersByRevenue.map(h => ({ 'Practitioner': h.name, 'Revenue ($)': h.revenue, 'Rating': h.rating }))
  ), "Top Healers by Revenue");

  // Practitioner Performance Summary (Table)
  const performanceData = topHealersByCount.map(h => ({
    'Practitioner': h.name,
    'Bookings': h.count,
    'Revenue ($)': h.revenue,
    'Avg Rating': h.rating
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(performanceData), "Practitioner Performance");

  XLSX.writeFile(wb, `Booking_Report_${new Date().getTime()}.xlsx`);
};

/**
 * Retreat Report Exports
 */

export interface RetreatExportPayload {
  summaryData: any[];
  retreatCountTrend: any[];
  bookingRateTrend: any[];
  revenueByEvent: any[];
  topLocations: any[];
  avgPriceTrend: any[];
  durationBreakdown: any[];
  retreatPerformanceData: any[];
}

export const exportRetreatReportPdf = (payload: RetreatExportPayload) => {
  const { 
    summaryData, 
    retreatCountTrend, 
    bookingRateTrend, 
    revenueByEvent,
    topLocations,
    avgPriceTrend,
    durationBreakdown,
    retreatPerformanceData 
  } = payload;
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Retreat Analysis Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  // 1. Summary Metrics
  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("1. Retreat Market Summary", 14, 40);

  autoTable(doc, {
    startY: 45,
    head: [['Metric', 'Value', 'Context']],
    body: summaryData.map(s => [s.title, s.value, s.description || '-']),
    theme: 'grid',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  // 2. Active Retreats Trend
  doc.text("2. Active Retreats Count Trend", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Period', 'Active']],
    body: retreatCountTrend.map(t => [t.name, String(t.active)]),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;
  if (currentY > 240) { doc.addPage(); currentY = 20; }

  // 3. Booking Rate Trend
  doc.text("3. Booking Rate over time (%)", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Period', 'Rate (%)']],
    body: bookingRateTrend.map(t => [t.name, `${t.rate}%`]),
    theme: 'striped',
    headStyles: { fillColor: [1, 163, 180] },
    styles: { fontSize: 9 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;
  if (currentY > 240) { doc.addPage(); currentY = 20; }

  // 4. Revenue by Event
  doc.text("4. Revenue by Retreat Event ($)", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Event', 'Revenue ($)']],
    body: revenueByEvent.map(e => [e.event, `$${e.revenue.toLocaleString()}`]),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;
  if (currentY > 240) { doc.addPage(); currentY = 20; }

  // 5. Top Destinations
  doc.text("5. Top Destinations for Retreats", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Location', 'Count']],
    body: topLocations.map(l => [l.location, String(l.count)]),
    theme: 'striped',
    headStyles: { fillColor: [1, 163, 180] },
    styles: { fontSize: 9 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;
  if (currentY > 240) { doc.addPage(); currentY = 20; }

  // 6. Average Price Trend
  doc.text("6. Average Retreat Price per Person ($)", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Period', 'Price ($)']],
    body: avgPriceTrend.map(t => [t.name, `$${t.price.toLocaleString()}`]),
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237] },
    styles: { fontSize: 9 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;
  if (currentY > 240) { doc.addPage(); currentY = 20; }

  // 7. Duration Breakdown
  doc.text("7. Retreats by Duration", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Duration', 'Value (%)']],
    body: durationBreakdown.map(d => [d.name, `${d.value}%`]),
    theme: 'striped',
    headStyles: { fillColor: [1, 163, 180] },
    styles: { fontSize: 9 }
  });

  doc.addPage();
  currentY = 20;

  // 8. Performance Overview
  doc.text("8. Retreat Event Performance Overview", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Event Name', 'Revenue', 'Booked Rate', 'Avg Price']],
    body: retreatPerformanceData.map(e => [
      e.event, `$${e.revenue.toLocaleString()}`, `${e.rate}%`, `$${e.price.toLocaleString()}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  doc.save(`Retreat_Report_${new Date().getTime()}.pdf`);
};

export const exportRetreatReportExcel = (payload: RetreatExportPayload) => {
  const { summaryData, retreatCountTrend, bookingRateTrend, revenueByEvent, topLocations, avgPriceTrend, durationBreakdown, retreatPerformanceData } = payload;
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    summaryData.map(s => ({ 'Metric': s.title, 'Value': s.value, 'Context': s.description || '-' }))
  ), "Market Summary");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    retreatCountTrend.map(t => ({ 'Period': t.name, 'Active': t.active }))
  ), "Active Listing Trend");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    bookingRateTrend.map(t => ({ 'Period': t.name, 'Rate (%)': t.rate }))
  ), "Booking Rate Trend");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    revenueByEvent.map(e => ({ 'Event': e.event, 'Revenue ($)': e.revenue }))
  ), "Revenue by Event");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    topLocations.map(l => ({ 'Location': l.location, 'Count': l.count }))
  ), "Top Destinations");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    avgPriceTrend.map(t => ({ 'Period': t.name, 'Price ($)': t.price }))
  ), "Price Trends");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    durationBreakdown.map(d => ({ 'Duration': d.name, 'Value (%)': d.value }))
  ), "Duration Breakdown");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    retreatPerformanceData.map(e => ({
      'Event Name': e.event,
      'Revenue': e.revenue,
      'Booked Rate': e.rate,
      'Avg Price': e.price
    }))
  ), "Performance Overview");

  XLSX.writeFile(wb, `Retreat_Report_${new Date().getTime()}.xlsx`);
};
