import { generatePdf, addDataTable } from '../core/pdfGenerator';
import { ExcelGenerator } from '../core/excelGenerator';

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
  generatePdf(
    payload.title,
    undefined,
    payload.dateRangeLabel,
    'l', // Landscape
    `Financial_Report_${new Date().getTime()}.pdf`,
    (doc, autoTable, gen) => {
      addDataTable(doc, autoTable, gen, {
        title: "1. Financial Summary Metrics",
        head: [['Metric', 'Value', 'Context']],
        data: payload.summary,
        theme: 'grid',
        mapFn: s => [s.title, s.value, s.description || '-']
      });

      const totalRevBySource = (payload.revenueBySource && payload.revenueBySource.length > 0) ? payload.revenueBySource.reduce((s, r) => s + r.value, 0) : 1;
      addDataTable(doc, autoTable, gen, {
        title: "2. Revenue by Source",
        head: [['Source', 'Revenue ($)', '% of Total']],
        data: payload.revenueBySource,
        checkKey: 'value',
        headColor: [1, 163, 180],
        theme: 'grid',
        mapFn: r => [
          r.name,
          `$${r.value.toLocaleString()}`,
          `${((r.value / totalRevBySource) * 100).toFixed(1)}%`
        ]
      });

      addDataTable(doc, autoTable, gen, {
        title: "3. Revenue Trend Analytics",
        head: [['Period', 'Sessions ($)', 'Retreats ($)', 'Subscriptions ($)', 'Total ($)']],
        data: payload.revenueTrend,
        mapFn: d => [
          d.month,
          `$${d.sessions.toLocaleString()}`,
          `$${d.retreats.toLocaleString()}`,
          `$${d.subs.toLocaleString()}`,
          `$${(d.sessions + d.retreats + d.subs).toLocaleString()}`
        ]
      });

      addDataTable(doc, autoTable, gen, {
        title: "4. Revenue Growth Performance",
        head: [['Period', 'Current Revenue ($)', 'Prior Period ($)', 'Change ($)', 'Change (%)']],
        data: payload.monthlyComparison,
        checkKey: 'revenue',
        headColor: [1, 163, 180],
        mapFn: d => {
          const change = d.revenue - d.prior;
          const pctChange = d.prior > 0 ? ((change / d.prior) * 100).toFixed(1) : 'N/A';
          return [
            d.month,
            `$${d.revenue.toLocaleString()}`,
            `$${d.prior.toLocaleString()}`,
            `$${change.toLocaleString()}`,
            `${pctChange}%`
          ];
        }
      });

      gen.checkPageBreak();
      addDataTable(doc, autoTable, gen, {
        title: "5. Stripe Processing Fee Impact",
        head: [['Day/Period', 'Gross Value ($)', 'Stripe Fees ($)', 'Net After Fees ($)', 'Fee Rate (%)']],
        data: payload.stripeFeeImpact,
        checkKey: 'gross',
        mapFn: d => [
          d.name,
          `$${d.gross.toLocaleString()}`,
          `$${d.fees.toLocaleString()}`,
          `$${(d.gross - d.fees).toLocaleString()}`,
          d.gross > 0 ? `${((d.fees / d.gross) * 100).toFixed(2)}%` : '0%'
        ]
      });

      gen.addSectionTitle("6. Healer and Retreat Rankings (Top 10)");
      const rankingY = gen.currentY;

      // Table 1: Top Healers (Left Side)
      addDataTable(doc, autoTable, gen, {
        head: [['Rank', 'Healer Name', 'Revenue ($)']],
        data: payload.topHealers,
        checkKey: 'revenue',
        headColor: [1, 163, 180],
        theme: 'grid',
        fontSize: 8,
        colSpan: 3,
        startY: rankingY,
        columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 25, halign: 'right' } },
        margin: { left: 14, right: 155 },
        mapFn: (h, i) => [String(i + 1), h.name, `$${h.revenue.toLocaleString()}`]
      });

      // Table 2: Top Retreats (Right Side)
      addDataTable(doc, autoTable, gen, {
        head: [['Rank', 'Retreat Name', 'Revenue ($)']],
        data: payload.topRetreats,
        checkKey: 'revenue',
        theme: 'grid',
        fontSize: 8,
        colSpan: 3,
        startY: rankingY,
        columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 25, halign: 'right' } },
        margin: { left: 155, right: 14 },
        mapFn: (r, i) => [String(i + 1), r.name, `$${r.revenue.toLocaleString()}`]
      });
      gen.currentY = (doc as any).lastAutoTable.finalY + 15;

      gen.checkPageBreak();
      addDataTable(doc, autoTable, gen, {
        title: "7. Booking Financial Audit Registry",
        head: [['Date', 'Booking ID', 'Listing', 'Healer', 'Seeker', 'Gross ($)', 'Comm. ($)', 'S.Fee ($)', 'P.Fee ($)', 'Net ($)', 'Stripe PI']],
        data: payload.bookingAudit,
        checkKey: 'grossAmount',
        theme: 'grid',
        fontSize: 7,
        mapFn: b => [
          b.date, b.bookingId, b.listing, b.healer, b.seeker,
          `$${b.grossAmount.toLocaleString()}`, `$${b.healerCommission.toLocaleString()}`,
          `$${b.seekerFee.toLocaleString()}`, `$${b.processingFee.toFixed(2)}`, `$${b.netRevenue.toLocaleString()}`,
          b.stripePi
        ]
      });

      addDataTable(doc, autoTable, gen, {
        title: "8. Premium Activation Audit Log",
        head: [['Healer Name', 'Activation Date', 'Amount Paid ($)', 'Stripe Session ID']],
        data: payload.premiumLog,
        checkKey: 'amount',
        headColor: [1, 163, 180],
        mapFn: p => [p.healer, p.activationDate, `$${p.amount.toLocaleString()}`, p.stripeSessionId]
      });
    }
  );
};

export const exportFinancialExcel = (payload: FinancialExportPayload) => {
  const excel = new ExcelGenerator(`Financial_Report_${new Date().getTime()}.xlsx`);

  const commonArgs = {
    title: payload.title,
    dateRangeLabel: payload.dateRangeLabel,
  };

  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.summary,
    sheetName: "Financial Summary",
    subTitle: "Key Metrics Overview",
    mapFn: s => ({ 'Metric': s.title, 'Value': s.value, 'Context': s.description || '-' })
  });

  const totalRevBySource = (payload.revenueBySource && payload.revenueBySource.length > 0) ? payload.revenueBySource.reduce((s, r) => s + r.value, 0) : 1;
  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.revenueBySource,
    sheetName: "Revenue Mix",
    subTitle: "Income Distribution",
    checkKey: "value",
    mapFn: r => ({
      'Source': r.name,
      'Revenue ($)': r.value,
      '% of Total': `${((r.value / totalRevBySource) * 100).toFixed(1)}%`
    })
  });

  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.revenueTrend,
    sheetName: "Historical Trends",
    subTitle: "Historical Growth Analytics",
    mapFn: d => ({
      'Period': d.month,
      'Sessions ($)': d.sessions,
      'Retreats ($)': d.retreats,
      'Subscriptions ($)': d.subs,
      'Total ($)': d.sessions + d.retreats + d.subs
    })
  });

  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.monthlyComparison,
    sheetName: "Growth Metrics",
    subTitle: "Period-over-Period Performance",
    checkKey: "revenue",
    mapFn: d => {
      const change = d.revenue - d.prior;
      return {
        'Period': d.month,
        'Current Revenue ($)': d.revenue,
        'Prior Period ($)': d.prior,
        'Growth ($)': change,
        'Growth (%)': d.prior > 0 ? `${((change / d.prior) * 100).toFixed(1)}%` : 'N/A'
      };
    }
  });

  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.stripeFeeImpact,
    sheetName: "Stripe Fee Impact",
    subTitle: "Processing Efficiency",
    checkKey: "gross",
    mapFn: d => ({
      'Period': d.name,
      'Gross Value ($)': d.gross,
      'Stripe Fees ($)': d.fees,
      'Net After Fees ($)': d.gross - d.fees,
      'Fee Rate (%)': d.gross > 0 ? `${((d.fees / d.gross) * 100).toFixed(2)}%` : '0%'
    })
  });

  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.topHealers,
    sheetName: "Top Healers",
    subTitle: "Healer Rankings",
    checkKey: "revenue",
    mapFn: (h, i) => ({ 'Rank': i + 1, 'Healer Name': h.name, 'Revenue ($)': h.revenue })
  });

  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.topRetreats,
    sheetName: "Top Retreats",
    subTitle: "Event Performance",
    checkKey: "revenue",
    mapFn: (r, i) => ({ 'Rank': i + 1, 'Retreat Name': r.name, 'Revenue ($)': r.revenue })
  });

  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.bookingAudit,
    sheetName: "Booking Audit Ledger",
    subTitle: "Transactional Audit Registry",
    checkKey: "grossAmount",
    mapFn: b => ({
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
    })
  });

  excel.addSheetWithHeader({
    ...commonArgs,
    data: payload.premiumLog,
    sheetName: "Premium Activations",
    subTitle: "Subscription Audit Log",
    checkKey: "amount",
    mapFn: p => ({
      'Healer': p.healer,
      'Activation Date': p.activationDate,
      'Amount Paid ($)': p.amount,
      'Stripe Session ID': p.stripeSessionId
    })
  });

  excel.save();
};
