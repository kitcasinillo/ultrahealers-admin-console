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

export const exportFinancialPdf = (bookings: any[], premium: any[], title: string) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  import('jspdf-autotable').then(({ default: autoTable }) => {
    // 1. Bookings Table
    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text("1. Booking Financial Audit", 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Booking ID', 'Listing', 'Healer', 'Seeker', 'Gross', 'Comm.', 'S.Fee', 'P.Fee', 'Net']],
      body: bookings.map(b => [
        b.date, b.bookingId, b.listing, b.healer, b.seeker,
        `$${b.grossAmount.toFixed(2)}`, `$${b.healerCommission.toFixed(2)}`,
        `$${b.seekerFee.toFixed(2)}`, `$${b.processingFee.toFixed(2)}`, `$${b.netRevenue.toFixed(2)}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 8 }
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
  });
};

export const exportFinancialExcel = (bookings: any[], premium: any[]) => {
  const wb = XLSX.utils.book_new();

  // Format Bookings for Excel
  const formattedBookings = bookings.map(b => ({
    'Date': b.date,
    'Booking ID': b.bookingId,
    'Listing': b.listing,
    'Healer': b.healer,
    'Seeker': b.seeker,
    'Gross Amount ($)': b.grossAmount,
    'Healer Commission ($)': b.healerCommission,
    'Seeker Fee ($)': b.seekerFee,
    'Processing Fee ($)': b.processingFee,
    'Net Revenue ($)': b.netRevenue,
    'Stripe PI': b.stripePi
  }));

  const ws1 = XLSX.utils.json_to_sheet(formattedBookings);
  XLSX.utils.book_append_sheet(wb, ws1, "Bookings Audit");

  // Format Premium for Excel
  const formattedPremium = premium.map(p => ({
    'Healer': p.healer,
    'Activation Date': p.activationDate,
    'Amount ($)': p.amount,
    'Stripe Session ID': p.stripeSessionId
  }));

  const ws2 = XLSX.utils.json_to_sheet(formattedPremium);
  XLSX.utils.book_append_sheet(wb, ws2, "Premium Activations");

  XLSX.writeFile(wb, `Financial_Report_${new Date().getTime()}.xlsx`);
};

/**
 * Campaign Report Exports
 */

export interface CampaignExportPayload {
  summaryData: any[];
  reachData: any[];
  unsubscribeTrend: any[];
  segmentPerformance: any[];
}

export const exportCampaignPdf = (payload: CampaignExportPayload) => {
  const { summaryData, reachData, unsubscribeTrend, segmentPerformance } = payload;
  const doc = new jsPDF('l', 'mm', 'a4');

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Campaign Performance Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  doc.setFontSize(14);
  doc.setTextColor(27, 37, 75);
  doc.text("1. Campaign Summary", 14, 40);

  import('jspdf-autotable').then(({ default: autoTable }) => {
    autoTable(doc, {
      startY: 45,
      head: [['Campaign Name', 'Sent', 'Open Rate', 'CTR', 'Bounce Rate', 'Status']],
      body: summaryData.map(c => [
        c.name, c.sent.toLocaleString(), `${c.openRate}%`, `${c.ctr}%`, `${c.bounceRate}%`, c.status
      ]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // 2. Reach & Deliverability
    doc.setFontSize(14);
    doc.setTextColor(27, 37, 75);
    doc.text("2. Reach & Deliverability", 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Sent', 'Delivered', 'Delivery Rate']],
      body: reachData.map(r => [
        r.name, r.sent.toLocaleString(), r.delivered.toLocaleString(), `${((r.delivered / r.sent) * 100).toFixed(1)}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 3. Unsubscribe Rate Trend
    doc.setFontSize(14);
    doc.text("3. Unsubscribe Rate Trend", 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Period', 'Unsubscribe Rate (%)']],
      body: unsubscribeTrend.map(u => [
        u.name, `${u.rate}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [255, 91, 91] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (currentY > 160) {
      doc.addPage();
      currentY = 22;
    }

    // 4. Audience Segment Performance
    doc.setFontSize(14);
    doc.text("4. Audience Segment Performance", 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Segment', 'Engagement (%)']],
      body: segmentPerformance.map(s => [
        s.name, `${s.value}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [67, 24, 255] },
      styles: { fontSize: 9 }
    });

    doc.save(`Campaign_Report_${new Date().getTime()}.pdf`);
  });
};

export const exportCampaignExcel = (payload: CampaignExportPayload) => {
  const { summaryData, reachData, unsubscribeTrend, segmentPerformance } = payload;
  const wb = XLSX.utils.book_new();

  // Sheet 1: Campaign Summary
  const formattedSummary = summaryData.map(c => ({
    'Campaign Name': c.name,
    'Sent': c.sent,
    'Open Rate (%)': c.openRate,
    'CTR (%)': c.ctr,
    'Bounce Rate (%)': c.bounceRate,
    'Status': c.status
  }));
  const ws1 = XLSX.utils.json_to_sheet(formattedSummary);
  XLSX.utils.book_append_sheet(wb, ws1, "Campaign Summary");

  // Sheet 2: Reach & Deliverability
  const formattedReach = reachData.map(r => ({
    'Period': r.name,
    'Sent': r.sent,
    'Delivered': r.delivered,
    'Delivery Rate (%)': Number(((r.delivered / r.sent) * 100).toFixed(1))
  }));
  const ws2 = XLSX.utils.json_to_sheet(formattedReach);
  XLSX.utils.book_append_sheet(wb, ws2, "Reach & Deliverability");

  // Sheet 3: Unsubscribe Rate Trend
  const formattedUnsub = unsubscribeTrend.map(u => ({
    'Period': u.name,
    'Unsubscribe Rate (%)': u.rate
  }));
  const ws3 = XLSX.utils.json_to_sheet(formattedUnsub);
  XLSX.utils.book_append_sheet(wb, ws3, "Unsubscribe Trend");

  // Sheet 4: Audience Segment Performance
  const formattedSegments = segmentPerformance.map(s => ({
    'Segment': s.name,
    'Engagement (%)': s.value
  }));
  const ws4 = XLSX.utils.json_to_sheet(formattedSegments);
  XLSX.utils.book_append_sheet(wb, ws4, "Segment Performance");

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
}

export const exportGrowthPdf = (payload: GrowthExportPayload) => {
  const { 
    summaryData,
    registrationTrend, 
    churnIndicators, 
    healerFunnel, 
    seekerFunnel, 
    subscriptionCohort, 
    retentionData 
  } = payload;
  
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(22);
  doc.setTextColor(27, 37, 75);
  doc.text("Growth & Retention Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(163, 174, 208);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

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
    doc.text("2. Registration Trend", 14, currentY);

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
    doc.text("3. Churn Indicators (Inactive)", 14, currentY);
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

    doc.save(`Growth_Report_${new Date().getTime()}.pdf`);
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
    retentionData 
  } = payload;
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary Metrics");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(registrationTrend), "Registration Trend");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(churnIndicators), "Churn Indicators");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(healerFunnel), "Healer Funnel");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(seekerFunnel), "Seeker Funnel");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subscriptionCohort), "Subscription Upgrades");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(retentionData), "Retention Cohorts");

  XLSX.writeFile(wb, `Growth_Report_${new Date().getTime()}.xlsx`);
};
