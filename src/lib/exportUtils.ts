import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
// Helper to auto-fit Excel columns based on data length
const getAutoFitColumns = (json: any[]) => {
  if (!json || json.length === 0) return [];
  const keys = Object.keys(json[0]);
  return keys.map(key => {
    let maxLength = key.length;
    json.forEach(row => {
      const val = row[key];
      const length = val ? String(val).length : 0;
      if (length > maxLength) maxLength = length;
    });
    return { wch: maxLength + 2 }; // padding
  });
};

// Helper to check for meaningful data (non-zero/non-empty)
const hasMeaningfulData = (arr: any[]) => {
  if (!arr || arr.length === 0) return false;
  return arr.some(item => {
    return Object.values(item).some(v => 
      (typeof v === 'number' && v > 0) || 
      (typeof v === 'string' && v.trim() !== '' && v !== '0' && v !== '0%')
    );
  });
};
export interface ReportDataPayload {
  dateRange: string;
  summaryData: Array<{ title: string; value: string; description?: string }>;
  userGrowthData: Array<{ name: string; healers: number; seekers: number }>;
  bookingVolumeData: Array<{ name: string; sessions: number; retreats: number }>;
  revenueData: Array<{ name: string; commission: number; fees: number; premium: number }>;
}

export const exportPlatformOverviewPdf = (data: ReportDataPayload) => {
  const doc = new jsPDF();

  // Helper to check for meaningful data (non-zero/non-empty)
  const hasMeaningfulData = (arr: any[]) => {
    if (!arr || arr.length === 0) return false;
    return arr.some(item => {
      return Object.values(item).some(v => 
        (typeof v === 'number' && v > 0) || 
        (typeof v === 'string' && v.trim() !== '' && v !== '0' && v !== '0%')
      );
    });
  };

  const noDataBody = [[{ 
    content: 'No data available for the selected period', 
    colSpan: 4, 
    styles: { halign: 'center' as const, fontStyle: 'italic' as const } 
  }]];

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
      body: hasMeaningfulData(data.summaryData) 
        ? data.summaryData.map(card => [card.title, String(card.value), card.description || '-'])
        : [[{ content: 'No data available for the selected period', colSpan: 3, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]],
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
      body: hasMeaningfulData(data.userGrowthData)
        ? data.userGrowthData.map(d => [d.name, String(d.healers), String(d.seekers), String(d.healers + d.seekers)])
        : noDataBody,
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
      body: hasMeaningfulData(data.bookingVolumeData)
        ? data.bookingVolumeData.map(d => [d.name, String(d.sessions), String(d.retreats), String(d.sessions + d.retreats)])
        : noDataBody,
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
      body: hasMeaningfulData(data.revenueData)
        ? data.revenueData.map(d => [
            d.name,
            `$${d.commission.toLocaleString()}`,
            `$${d.fees.toLocaleString()}`,
            `$${(d.premium || 0).toLocaleString()}`,
            `$${(d.commission + d.fees + (d.premium || 0)).toLocaleString()}`
          ])
        : [[{ content: 'No data available for the selected period', colSpan: 5, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]],
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    doc.save(`Platform-Overview-Report_${new Date().getTime()}.pdf`);
  }).catch(err => {
    console.error("Failed to generate styled PDF report:", err);
  });
};

export const exportPlatformOverviewExcel = (data: ReportDataPayload) => {
  const wb = XLSX.utils.book_new();

  // Helper to check for meaningful data (non-zero/non-empty)
  const hasMeaningfulData = (arr: any[]) => {
    if (!arr || arr.length === 0) return false;
    return arr.some(item => {
      return Object.values(item).some(v => 
        (typeof v === 'number' && v > 0) || 
        (typeof v === 'string' && v.trim() !== '' && v !== '0')
      );
    });
  };

  const addSheet = (arr: any[], sheetName: string) => {
    const finalData = hasMeaningfulData(arr) 
      ? arr 
      : [{ 'Status': 'No data available for the selected period' }];
    const ws = XLSX.utils.json_to_sheet(finalData);

    // Auto-width helper
    const keys = Object.keys(finalData[0]);
    ws['!cols'] = keys.map((key) => {
      const maxLength = Math.max(
        key.length,
        ...finalData.map(d => String(d[key] || '').length)
      );
      return { wch: maxLength + 2 };
    });

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  addSheet(data.userGrowthData.map(d => ({
    'Period': d.name,
    'Healers': d.healers,
    'Seekers': d.seekers,
    'Total Added': d.healers + d.seekers
  })), "User Growth");

  addSheet(data.bookingVolumeData.map(d => ({
    'Period': d.name,
    'Sessions': d.sessions,
    'Retreats': d.retreats,
    'Total Volume': d.sessions + d.retreats
  })), "Booking Volume");

  addSheet(data.revenueData.map(d => ({
    'Period': d.name,
    'Session Commission ($)': d.commission,
    'Seeker Fees ($)': d.fees,
    'Premium Subscriptions ($)': d.premium || 0,
    'Total Revenue ($)': d.commission + d.fees + (d.premium || 0)
  })), "Revenue Composition");

  addSheet(data.summaryData.map(card => ({ 
    'Metric': card.title, 
    'Value': card.value, 
    'Details': card.description || '-' 
  })), "Summary Metrics");

  XLSX.writeFile(wb, `Platform-Overview-Data_${new Date().getTime()}.xlsx`);
};

/**
 * Financial Report Specific Exports
 */

export interface FinancialExportPayload {
  summary: Array<{ title: string; value: string; description?: string }>;
  revenueBySource: Array<{ name: string; value: number }>;
  revenueTrend: Array<{ month: string; sessions: number; retreats: number; subs: number }>;
  monthlyComparison: Array<{ month: string; revenue: number; prior: number }>;
  stripeFeeImpact: Array<{ name: string; gross: number; fees: number }>;
  topHealers: Array<{ name: string; revenue: number }>;
  topRetreats: Array<{ name: string; revenue: number }>;
  bookingAudit: Array<{
    date: string;
    bookingId: string;
    listing: string;
    healer: string;
    seeker: string;
    grossAmount: number;
    healerCommission: number;
    seekerFee: number;
    processingFee: number;
    netRevenue: number;
    stripePi: string;
  }>;
  premiumLog: Array<{
    healer: string;
    activationDate: string;
    amount: number;
    stripeSessionId: string;
  }>;
  title: string;
  dateRangeLabel: string;
}

export const exportFinancialPdf = (payload: FinancialExportPayload) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns
  const { 
    summary,
    revenueBySource, 
    revenueTrend, 
    monthlyComparison, 
    stripeFeeImpact, 
    topHealers, 
    topRetreats,
    bookingAudit,
    premiumLog,
    title, 
    dateRangeLabel 
  } = payload;

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Active Filter: ${dateRangeLabel}`, 14, 34);

  // Helper to check for meaningful data
  const hasMeaningfulData = (arr: any[], key?: string) => {
    if (!arr || arr.length === 0) return false;
    return arr.some(item => {
      const val = key ? item[key] : Object.values(item).find(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))));
      if (typeof val === 'number') return val > 0;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
        return !isNaN(num) && num > 0;
      }
      return false;
    });
  };

  const noDataMsg = 'No data available for the selected period';

  // --- Section 1: Summary Metrics ---
  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("1. Financial Summary Metrics", 14, 46);

  autoTable(doc, {
    startY: 51,
    head: [['Metric', 'Value', 'Context']],
    body: summary && summary.length > 0 ? summary.map(s => [s.title, s.value, s.description || '-']) : [[noDataMsg, '', '']],
    theme: 'grid',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  // --- Section 2: Revenue by Source ---
  let lastY = (doc as any).lastAutoTable.finalY + 12;
  doc.text("2. Revenue by Source", 14, lastY);

  const totalRevBySource = (revenueBySource && revenueBySource.length > 0) ? revenueBySource.reduce((s, r) => s + r.value, 0) : 1;
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Source', 'Revenue ($)', '% of Total']],
    body: hasMeaningfulData(revenueBySource, 'value') 
      ? revenueBySource.map(r => [
          r.name,
          `$${r.value.toLocaleString()}`,
          `${((r.value / totalRevBySource) * 100).toFixed(1)}%`
        ]) 
      : [[noDataMsg, '', '']],
    theme: 'grid',
    headStyles: { fillColor: [1, 163, 180] },
    styles: { fontSize: 9 }
  });

  // --- Section 3: Revenue Trend ---
  lastY = (doc as any).lastAutoTable.finalY + 12;
  if (lastY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); lastY = 20; }
  doc.text("3. Revenue Trend Analytics", 14, lastY);

  autoTable(doc, {
    startY: lastY + 5,
    head: [['Period', 'Sessions ($)', 'Retreats ($)', 'Subscriptions ($)', 'Total ($)']],
    body: hasMeaningfulData(revenueTrend) 
      ? revenueTrend.map(d => [
          d.month,
          `$${d.sessions.toLocaleString()}`,
          `$${d.retreats.toLocaleString()}`,
          `$${d.subs.toLocaleString()}`,
          `$${(d.sessions + d.retreats + d.subs).toLocaleString()}`
        ]) 
      : [[noDataMsg, '', '', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  // --- Section 4: Revenue Growth ---
  lastY = (doc as any).lastAutoTable.finalY + 12;
  if (lastY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); lastY = 20; }
  doc.text("4. Revenue Growth Performance", 14, lastY);

  autoTable(doc, {
    startY: lastY + 5,
    head: [['Period', 'Current Revenue ($)', 'Prior Period ($)', 'Change ($)', 'Change (%)']],
    body: hasMeaningfulData(monthlyComparison, 'revenue') 
      ? monthlyComparison.map(d => {
          const change = d.revenue - d.prior;
          const pctChange = d.prior > 0 ? ((change / d.prior) * 100).toFixed(1) : 'N/A';
          return [
            d.month,
            `$${d.revenue.toLocaleString()}`,
            `$${d.prior.toLocaleString()}`,
            `$${change.toLocaleString()}`,
            `${pctChange}%`
          ];
        }) 
      : [[noDataMsg, '', '', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [1, 163, 180] },
    styles: { fontSize: 9 }
  });

  doc.addPage();
  lastY = 20;

  // --- Section 5: Stripe Fee Impact ---
  doc.text("5. Stripe Processing Fee Impact", 14, lastY);
  
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Day/Period', 'Gross Value ($)', 'Stripe Fees ($)', 'Net After Fees ($)', 'Fee Rate (%)']],
    body: hasMeaningfulData(stripeFeeImpact, 'gross') 
      ? stripeFeeImpact.map(d => [
          d.name,
          `$${d.gross.toLocaleString()}`,
          `$${d.fees.toLocaleString()}`,
          `$${(d.gross - d.fees).toLocaleString()}`,
          d.gross > 0 ? `${((d.fees / d.gross) * 100).toFixed(2)}%` : '0%'
        ]) 
      : [[noDataMsg, '', '', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });
  
  lastY = (doc as any).lastAutoTable.finalY + 12;
  if (lastY > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); lastY = 20; }
  
  doc.text("6. Healer and Retreat Rankings (Top 10)", 14, lastY);
  
  // Table 1: Top Healers (Left Side)
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Rank', 'Healer Name', 'Revenue ($)']],
    body: hasMeaningfulData(topHealers, 'revenue') 
      ? topHealers.map((h, i) => [String(i + 1), h.name, `$${h.revenue.toLocaleString()}`]) 
      : [[{ content: noDataMsg, colSpan: 3, styles: { halign: 'center', fontStyle: 'italic' } }]],
    theme: 'grid',
    headStyles: { fillColor: [1, 163, 180] },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 12 }, // Rank
      2: { cellWidth: 25, halign: 'right' } // Revenue
    },
    margin: { left: 14, right: 155 } // Constrain to left half
  });

  // Table 2: Top Retreats (Right Side)
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Rank', 'Retreat Name', 'Revenue ($)']],
    body: hasMeaningfulData(topRetreats, 'revenue') 
      ? topRetreats.map((r, i) => [String(i + 1), r.name, `$${r.revenue.toLocaleString()}`]) 
      : [[{ content: noDataMsg, colSpan: 3, styles: { halign: 'center', fontStyle: 'italic' } }]],
    theme: 'grid',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 12 }, // Rank
      2: { cellWidth: 25, halign: 'right' } // Revenue
    },
    margin: { left: 155, right: 14 } // Constrain to right half
  });
  
  doc.addPage();
  lastY = 20;

  // --- Section 7: Booking Audit ---
  doc.text("7. Booking Financial Audit Registry", 14, lastY);
  
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Date', 'Booking ID', 'Listing', 'Healer', 'Seeker', 'Gross ($)', 'Comm. ($)', 'S.Fee ($)', 'P.Fee ($)', 'Net ($)', 'Stripe PI']],
    body: hasMeaningfulData(bookingAudit, 'grossAmount') 
      ? bookingAudit.map(b => [
          b.date, b.bookingId, b.listing, b.healer, b.seeker,
          `$${b.grossAmount.toLocaleString()}`, `$${b.healerCommission.toLocaleString()}`,
          `$${b.seekerFee.toLocaleString()}`, `$${b.processingFee.toFixed(2)}`, `$${b.netRevenue.toLocaleString()}`,
          b.stripePi
        ]) 
      : [[noDataMsg, '', '', '', '', '', '', '', '', '', '']],
    theme: 'grid',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 7 }
  });

  lastY = (doc as any).lastAutoTable.finalY + 12;
  if (lastY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); lastY = 20; }

  // --- Section 8: Premium Log ---
  doc.text("8. Premium Activation Audit Log", 14, lastY);
  
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Healer Name', 'Activation Date', 'Amount Paid ($)', 'Stripe Session ID']],
    body: hasMeaningfulData(premiumLog, 'amount') 
      ? premiumLog.map(p => [
          p.healer, p.activationDate, `$${p.amount.toLocaleString()}`, p.stripeSessionId
        ]) 
      : [[noDataMsg, '', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [1, 163, 180] },
    styles: { fontSize: 9 }
  });
  
  doc.save(`Financial_Report_${new Date().getTime()}.pdf`);
};

export const exportFinancialExcel = (payload: FinancialExportPayload) => {
  const { 
    summary,
    revenueBySource, 
    revenueTrend, 
    monthlyComparison, 
    stripeFeeImpact, 
    topHealers, 
    topRetreats,
    bookingAudit,
    premiumLog,
    title,
    dateRangeLabel
  } = payload;
  const wb = XLSX.utils.book_new();

  // Helper to check for meaningful data
  const hasMeaningfulData = (arr: any[], key?: string) => {
    if (!arr || arr.length === 0) return false;
    return arr.some(item => {
      const val = key ? item[key] : Object.values(item).find(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))));
      if (typeof val === 'number') return val > 0;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
        return !isNaN(num) && num > 0;
      }
      return false;
    });
  };

  const createSheetWithHeader = (data: any[], sheetName: string, subTitle: string, checkKey?: string) => {
    const isMeaningful = hasMeaningfulData(data, checkKey);
    const finalData = isMeaningful ? data : [{ 'Status': 'No data available for the selected period' }];

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
    XLSX.utils.sheet_add_json(ws, finalData, { origin: "A7" });
    
    // Auto-width helper
    const keys = Object.keys(finalData[0]);
    ws['!cols'] = keys.map((key, i) => ({
      wch: Math.max(key.length, ...finalData.map(d => String(d[key] || '').length), i === 0 ? 30 : 10) + 2
    }));

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  // Sheet 1: Summary
  createSheetWithHeader(
    summary.map(s => ({ 'Metric': s.title, 'Value': s.value, 'Context': s.description || '-' })),
    "Financial Summary",
    "Key Metrics Overview"
  );

  // Sheet 2: Revenue by Source
  const totalRevBySource = (revenueBySource && revenueBySource.length > 0) ? revenueBySource.reduce((s, r) => s + r.value, 0) : 1;
  const formattedRevBySource = revenueBySource.map(r => ({
    'Source': r.name,
    'Revenue ($)': r.value,
    '% of Total': `${((r.value / totalRevBySource) * 100).toFixed(1)}%`
  }));
  createSheetWithHeader(formattedRevBySource, "Revenue Mix", "Income Distribution", "Revenue ($)");

  // Sheet 3: Revenue Trend
  const formattedTrend = revenueTrend.map(d => ({
    'Period': d.month,
    'Sessions ($)': d.sessions,
    'Retreats ($)': d.retreats,
    'Subscriptions ($)': d.subs,
    'Total ($)': d.sessions + d.retreats + d.subs
  }));
  createSheetWithHeader(formattedTrend, "Historical Trends", "Historical Growth Analytics", "Total ($)");

  // Sheet 4: Revenue Growth
  const formattedGrowth = monthlyComparison.map(d => {
    const change = d.revenue - d.prior;
    const pctChange = d.prior > 0 ? `${((change / d.prior) * 100).toFixed(1)}%` : 'N/A';
    return {
      'Period': d.month,
      'Current Revenue ($)': d.revenue,
      'Prior Period ($)': d.prior,
      'Growth ($)': change,
      'Growth (%)': pctChange
    };
  });
  createSheetWithHeader(formattedGrowth, "Growth Metrics", "Period-over-Period Performance", "Current Revenue ($)");

  // Sheet 5: Stripe Fee Impact
  const formattedFees = stripeFeeImpact.map(d => ({
    'Period': d.name,
    'Gross Value ($)': d.gross,
    'Stripe Fees ($)': d.fees,
    'Net After Fees ($)': d.gross - d.fees,
    'Fee Rate (%)': d.gross > 0 ? `${((d.fees / d.gross) * 100).toFixed(2)}%` : '0%'
  }));
  createSheetWithHeader(formattedFees, "Stripe Fee Impact", "Processing Efficiency", "Gross Value ($)");

  // Sheet 6: Top Performers
  const formattedHealers = topHealers.map((h, i) => ({
    'Rank': i + 1,
    'Healer Name': h.name,
    'Revenue ($)': h.revenue
  }));
  createSheetWithHeader(formattedHealers, "Top Healers", "Healer Rankings", "Revenue ($)");

  const formattedRetreats = topRetreats.map((r, i) => ({
    'Rank': i + 1,
    'Retreat Name': r.name,
    'Revenue ($)': r.revenue
  }));
  createSheetWithHeader(formattedRetreats, "Top Retreats", "Event Performance", "Revenue ($)");

  // Sheet 7: Bookings Audit
  const formattedBookings = bookingAudit.map(b => ({
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
  createSheetWithHeader(formattedBookings, "Booking Audit Ledger", "Transactional Audit Registry", "Gross Amount ($)");

  // Sheet 8: Premium Activations
  const formattedPremium = premiumLog.map(p => ({
    'Healer': p.healer,
    'Activation Date': p.activationDate,
    'Amount Paid ($)': p.amount,
    'Stripe Session ID': p.stripeSessionId
  }));
  createSheetWithHeader(formattedPremium, "Premium Activations", "Subscription Audit Log", "Amount Paid ($)");

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
  dateRange: string;
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
    dateRange,
    summaryData,
    disputeRateTrend, 
    disputesByType, 
    outcomeBreakdown, 
    modalityDisputeRate, 
    healerRepeatDisputes 
  } = payload;
  const doc = new jsPDF('l', 'mm', 'a4');

  // Helper to check for meaningful data
  const hasMeaningfulData = (arr: any[]) => {
    if (!arr || arr.length === 0) return false;
    return arr.some(item => {
      return Object.values(item).some(v => 
        (typeof v === 'number' && v > 0) || 
        (typeof v === 'string' && v.trim() !== '' && v !== '0' && v !== '0%')
      );
    });
  };

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Dispute Analysis Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Reporting Period: ${dateRange}`, 14, 34);

  import('jspdf-autotable').then(({ default: autoTable }) => {
    // 1. Summary Metrics
    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text("1. Key Performance Metrics", 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value', 'Details']],
      body: hasMeaningfulData(summaryData)
        ? summaryData.map(s => [s.title, s.value, s.description || '-'])
        : [[{ content: 'No data available', colSpan: 3, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]],
      theme: 'grid',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // 2. Dispute Rate Trend
    doc.text("2. Dispute Rate Trend", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Dispute Rate (%)']],
      body: hasMeaningfulData(disputeRateTrend)
        ? disputeRateTrend.map(d => [d.name, `${d.rate}%`])
        : [[{ content: 'No data available', colSpan: 2, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]],
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 3. Disputes by Type
    doc.text("3. Disputes by Type", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Dispute Type', 'Total Count']],
      body: hasMeaningfulData(disputesByType)
        ? disputesByType.map(d => [d.name, String(d.value)])
        : [[{ content: 'No data available', colSpan: 2, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]],
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 160) { doc.addPage(); currentY = 20; }

    // 4. Resolution Outcomes
    doc.text("4. Resolution Outcomes", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Refunded', 'Partial Refund', 'Platform Credit', 'Denied/Rejected']],
      body: hasMeaningfulData(outcomeBreakdown)
        ? outcomeBreakdown.map(o => [o.name, String(o.refund), String(o.partial), String(o.credit), String(o.deny)])
        : [[{ content: 'No data available', colSpan: 5, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]],
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 160) { doc.addPage(); currentY = 20; }

    // 5. Dispute Rate by Modality
    doc.text("5. Dispute Rate by Modality", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Modality', 'Dispute Rate (%)']],
      body: hasMeaningfulData(modalityDisputeRate)
        ? modalityDisputeRate.map(m => [m.name, `${m.value}%`])
        : [[{ content: 'No data available', colSpan: 2, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]],
      theme: 'striped',
      headStyles: { fillColor: [1, 163, 180] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 160) { doc.addPage(); currentY = 20; }

    // 6. Practitioner Risk Watchlist
    doc.text("6. Practitioner Risk Watchlist", 14, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Healer Name', 'Total Disputes', 'Risk Status']],
      body: hasMeaningfulData(healerRepeatDisputes)
        ? healerRepeatDisputes.filter(h => h.disputes >= 2).map(h => [h.name, String(h.disputes), h.status.toUpperCase()])
        : [[{ content: 'No flagged practitioners in this period', colSpan: 3, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]],
      theme: 'grid',
      headStyles: { fillColor: [255, 91, 91] },
      styles: { fontSize: 9 }
    });

    doc.save(`Dispute_Analysis_Report_${new Date().getTime()}.pdf`);
  });
};

export const exportDisputeExcel = (payload: DisputeExportPayload) => {
  const { 
    summaryData,
    disputeRateTrend, 
    disputesByType, 
    outcomeBreakdown, 
    modalityDisputeRate, 
    healerRepeatDisputes 
  } = payload;
  const wb = XLSX.utils.book_new();

  // Helper to check for meaningful data
  const hasMeaningfulData = (arr: any[]) => {
    if (!arr || arr.length === 0) return false;
    return arr.some(item => {
      return Object.values(item).some(v => 
        (typeof v === 'number' && v > 0) || 
        (typeof v === 'string' && v.trim() !== '' && v !== '0')
      );
    });
  };

  const addSheet = (arr: any[], sheetName: string) => {
    const finalData = hasMeaningfulData(arr) 
      ? arr 
      : [{ 'Status': 'No data available for the selected period' }];
    const ws = XLSX.utils.json_to_sheet(finalData);

    // Auto-width
    const keys = Object.keys(finalData[0]);
    ws['!cols'] = keys.map((key) => {
      const maxLength = Math.max(
        key.length,
        ...finalData.map(d => String(d[key] || '').length)
      );
      return { wch: maxLength + 2 };
    });

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  addSheet(summaryData.map(s => ({ 'Metric': s.title, 'Value': s.value, 'Details': s.description || '-' })), "Summary Metrics");
  addSheet(disputeRateTrend.map(d => ({ 'Period': d.name, 'Dispute Rate (%)': d.rate })), "Dispute Trends");
  addSheet(disputesByType.map(d => ({ 'Dispute Type': d.name, 'Count': d.value })), "Disputes by Type");
  addSheet(payload.disputesBySeverity.map(d => ({ 'Period': d.name, 'Normal': d.normal, 'Safety': d.safety })), "Severity Distribution");
  addSheet(payload.resolutionTimeTrend.map(r => ({ 'Period': r.name, 'Hours': r.hours })), "Resolution Times");
  addSheet(outcomeBreakdown.map(o => ({ 
    'Period': o.name, 
    'Refunded': o.refund, 
    'Partial Refund': o.partial, 
    'Platform Credit': o.credit, 
    'Denied': o.deny 
  })), "Resolution Outcomes");
  addSheet(modalityDisputeRate.map(m => ({ 'Modality': m.name, 'Dispute Rate (%)': m.value })), "Modality Density");
  addSheet(healerRepeatDisputes.filter(h => h.disputes >= 2).map(h => ({ 
    'Healer Name': h.name, 
    'Total Disputes': h.disputes, 
    'Status': h.status.toUpperCase() 
  })), "Risk Watchlist");

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
  dateRange?: string;
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
    dateRange,
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
  if (dateRange) {
    doc.text(`Reporting Period: ${dateRange}`, 14, 34);
  }

  let currentY = dateRange ? 44 : 38;

  const noDataBody = (colSpan: number) => [[{ 
    content: 'No data available for the selected period', 
    colSpan, 
    styles: { halign: 'center' as const, fontStyle: 'italic' as const } 
  }]];

  // 1. Summary Metrics
  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("1. Key Performance Summary", 14, currentY);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Metric', 'Value', 'Context']],
    body: hasMeaningfulData(summaryData) ? summaryData.map(s => [s.title, s.value, s.description || '-']) : noDataBody(3),
    theme: 'grid',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 2. Booking Volume
  doc.text("2. Booking Volume", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Period', 'Total Bookings']],
    body: hasMeaningfulData(bookingVolume) ? bookingVolume.map(v => [v.name, String(v.bookings)]) : noDataBody(2),
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
    body: hasMeaningfulData(avgBookingValue) ? avgBookingValue.map(v => [v.name, `$${v.value}`]) : noDataBody(2),
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
    body: hasMeaningfulData(modalityPopularity) ? modalityPopularity.map(m => [m.modality, String(m.sessions)]) : noDataBody(2),
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
    body: hasMeaningfulData(durationDistribution) ? durationDistribution.map(d => [d.length, String(d.count)]) : noDataBody(2),
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
    body: hasMeaningfulData(completionRate) ? completionRate.map(c => [c.status, `${c.rate}%`]) : noDataBody(2),
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
    body: hasMeaningfulData(formatBreakdown) ? formatBreakdown.map(f => [f.name, `${f.value}%`]) : noDataBody(2),
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
    body: hasMeaningfulData(topHealersByCount) ? topHealersByCount.map(h => [h.name, String(h.count), `${h.rating}`]) : noDataBody(3),
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
    body: hasMeaningfulData(topHealersByRevenue) ? topHealersByRevenue.map(h => [h.name, `$${h.revenue.toLocaleString()}`, `${h.rating}`]) : noDataBody(3),
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
    dateRange,
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

  // Add Date Range sheet if present
  if (dateRange) {
    const metaData = [
      ["Booking Report Metadata"],
      ["Generated On", new Date().toLocaleString()],
      ["Reporting Period", dateRange]
    ];
    const wsMeta = XLSX.utils.aoa_to_sheet(metaData);
    wsMeta['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsMeta, "Metadata");
  }

  const addSheet = (arr: any[], sheetName: string) => {
    const finalData = hasMeaningfulData(arr) 
      ? arr 
      : [{ 'Message': 'No data available for the selected period' }];
    const ws = XLSX.utils.json_to_sheet(finalData);
    ws['!cols'] = getAutoFitColumns(finalData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  addSheet(summaryData.map(s => ({ 'Metric': s.title, 'Value': s.value, 'Context': s.description || '-' })), "Summary Metrics");

  addSheet(bookingVolume.map(v => ({ 'Period': v.name, 'Total Bookings': v.bookings })), "Booking Volume");
  addSheet(avgBookingValue.map(v => ({ 'Period': v.name, 'Value ($)': v.value })), "Avg Booking Value");
  addSheet(modalityPopularity.map(m => ({ 'Modality': m.modality, 'Sessions Count': m.sessions })), "Modality Popularity");
  addSheet(durationDistribution.map(d => ({ 'Length': d.length, 'Count': d.count })), "Session Lengths");
  addSheet(completionRate.map(c => ({ 'Status': c.status, 'Rate (%)': c.rate })), "Completion Rate");
  addSheet(formatBreakdown.map(f => ({ 'Format': f.name, 'Sessions': f.value })), "Format Breakdown");
  addSheet(topHealersByCount.map(h => ({ 'Name': h.name, 'Bookings': h.count, 'Revenue': `$${h.revenue}`, 'Rating': h.rating })), "Top Healers (Volume)");
  addSheet(topHealersByRevenue.map(h => ({ 'Name': h.name, 'Revenue': `$${h.revenue}`, 'Bookings': h.count, 'Rating': h.rating })), "Top Healers (Revenue)");

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

  // Helper to check for meaningful data (non-zero/non-empty)
  const hasMeaningfulData = (arr: any[], key?: string) => {
    if (!arr || arr.length === 0) return false;
    return arr.some(item => {
      const val = key ? item[key] : Object.values(item).find(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))));
      if (typeof val === 'number') return val > 0;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
        return !isNaN(num) && num > 0;
      }
      return false;
    });
  };

  const noDataMsg = 'No data available for the selected period';

  // 1. Summary Metrics
  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("1. Retreat Market Summary", 14, 40);

  autoTable(doc, {
    startY: 45,
    head: [['Metric', 'Value', 'Context']],
    body: summaryData.length > 0 ? summaryData.map(s => [s.title, s.value, s.description || '-']) : [[noDataMsg, '', '']],
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
    body: hasMeaningfulData(retreatCountTrend, 'active') 
      ? retreatCountTrend.map(t => [t.name, String(t.active)]) 
      : [[noDataMsg, '']],
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
    body: hasMeaningfulData(bookingRateTrend, 'rate') 
      ? bookingRateTrend.map(t => [t.name, `${t.rate}%`]) 
      : [[noDataMsg, '']],
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
    body: hasMeaningfulData(revenueByEvent, 'revenue') 
      ? revenueByEvent.map(e => [e.event, `$${e.revenue.toLocaleString()}`]) 
      : [[noDataMsg, '']],
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
    body: hasMeaningfulData(topLocations, 'count') 
      ? topLocations.map(l => [l.location, String(l.count)]) 
      : [[noDataMsg, '']],
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
    body: hasMeaningfulData(avgPriceTrend, 'price') 
      ? avgPriceTrend.map(t => [t.name, `$${t.price.toLocaleString()}`]) 
      : [[noDataMsg, '']],
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
    body: hasMeaningfulData(durationBreakdown, 'value') 
      ? durationBreakdown.map(d => [d.name, `${d.value}%`]) 
      : [[noDataMsg, '']],
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
    body: hasMeaningfulData(retreatPerformanceData, 'revenue') 
      ? retreatPerformanceData.map(e => [
          e.event, `$${e.revenue.toLocaleString()}`, `${e.rate}%`, `$${e.price.toLocaleString()}`
        ]) 
      : [[noDataMsg, '', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [67, 24, 255] },
    styles: { fontSize: 9 }
  });

  doc.save(`Retreat_Report_${new Date().getTime()}.pdf`);
};

export const exportRetreatReportExcel = (payload: RetreatExportPayload) => {
  const { summaryData, retreatCountTrend, bookingRateTrend, revenueByEvent, topLocations, avgPriceTrend, durationBreakdown, retreatPerformanceData } = payload;
  const wb = XLSX.utils.book_new();

  // Helper to check for meaningful data (non-zero/non-empty)
  const hasMeaningfulData = (arr: any[], key?: string) => {
    if (!arr || arr.length === 0) return false;
    return arr.some(item => {
      const val = key ? item[key] : Object.values(item).find(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))));
      if (typeof val === 'number') return val > 0;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
        return !isNaN(num) && num > 0;
      }
      return false;
    });
  };

  const addSheetWithAutoWidth = (data: any[], sheetName: string, checkKey?: string) => {
    const isMeaningful = hasMeaningfulData(data, checkKey);
    const finalData = isMeaningful ? data : [{ 'Status': 'No data available for the selected period' }];
    const ws = XLSX.utils.json_to_sheet(finalData);
    
    // Auto-width helper
    const keys = Object.keys(finalData[0]);
    ws['!cols'] = keys.map((key) => {
        const maxLength = Math.max(
            key.length,
            ...finalData.map(d => String(d[key] || '').length)
        );
        return { wch: maxLength + 2 };
    });

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  addSheetWithAutoWidth(
    summaryData.map(s => ({ 'Metric': s.title, 'Value': s.value, 'Context': s.description || '-' })),
    "Market Summary"
  );

  addSheetWithAutoWidth(
    retreatCountTrend.map(t => ({ 'Period': t.name, 'ActiveListing': t.active })),
    "Active Listing Trend",
    "ActiveListing"
  );

  addSheetWithAutoWidth(
    bookingRateTrend.map(t => ({ 'Period': t.name, 'RatePercentage': t.rate })),
    "Booking Rate Trend",
    "RatePercentage"
  );

  addSheetWithAutoWidth(
    revenueByEvent.map(e => ({ 'Event': e.event, 'RevenueUSD': e.revenue })),
    "Revenue by Event",
    "RevenueUSD"
  );

  addSheetWithAutoWidth(
    topLocations.map(l => ({ 'Location': l.location, 'ListingCount': l.count })),
    "Top Destinations",
    "ListingCount"
  );

  addSheetWithAutoWidth(
    avgPriceTrend.map(t => ({ 'Period': t.name, 'PriceUSD': t.price })),
    "Price Trends",
    "PriceUSD"
  );

  addSheetWithAutoWidth(
    durationBreakdown.map(d => ({ 'Duration': d.name, 'ValuePercentage': d.value })),
    "Duration Breakdown",
    "ValuePercentage"
  );

  addSheetWithAutoWidth(
    retreatPerformanceData.map(e => ({
      'Event Name': e.event,
      'TotalRevenue': e.revenue,
      'BookedRate': e.rate,
      'AvgPrice': e.price
    })),
    "Performance Overview",
    "TotalRevenue"
  );

  XLSX.writeFile(wb, `Retreat_Report_${new Date().getTime()}.xlsx`);
};

