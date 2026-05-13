import { generatePdf, addDataTable } from '../core/pdfGenerator';
import { ExcelGenerator } from '../core/excelGenerator';

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
  generatePdf(
    "Retreat Analysis Report",
    undefined,
    undefined,
    'p',
    `Retreat_Report_${new Date().getTime()}.pdf`,
    (doc, autoTable, gen) => {
      addDataTable(doc, autoTable, gen, {
        title: "1. Retreat Market Summary",
        head: [['Metric', 'Value', 'Context']],
        data: payload.summaryData,
        theme: 'grid',
        mapFn: s => [s.title, s.value, s.description || '-']
      });

      addDataTable(doc, autoTable, gen, {
        title: "2. Active Retreats Count Trend",
        head: [['Period', 'Active']],
        data: payload.retreatCountTrend,
        checkKey: 'active',
        mapFn: t => [t.name, String(t.active)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "3. Booking Rate over time (%)",
        head: [['Period', 'Rate (%)']],
        data: payload.bookingRateTrend,
        checkKey: 'rate',
        headColor: [1, 163, 180],
        mapFn: t => [t.name, `${t.rate}%`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "4. Revenue by Retreat Event ($)",
        head: [['Event', 'Revenue ($)']],
        data: payload.revenueByEvent,
        checkKey: 'revenue',
        mapFn: e => [e.event, `$${e.revenue.toLocaleString()}`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "5. Top Destinations for Retreats",
        head: [['Location', 'Count']],
        data: payload.topLocations,
        checkKey: 'count',
        headColor: [1, 163, 180],
        mapFn: l => [l.location, String(l.count)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "6. Average Retreat Price per Person ($)",
        head: [['Period', 'Price ($)']],
        data: payload.avgPriceTrend,
        checkKey: 'price',
        headColor: [124, 58, 237],
        mapFn: t => [t.name, `$${t.price.toLocaleString()}`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "7. Retreats by Duration",
        head: [['Duration', 'Value (%)']],
        data: payload.durationBreakdown,
        checkKey: 'value',
        headColor: [1, 163, 180],
        mapFn: d => [d.name, `${d.value}%`]
      });

      gen.checkPageBreak();

      addDataTable(doc, autoTable, gen, {
        title: "8. Retreat Event Performance Overview",
        head: [['Event Name', 'Revenue', 'Booked Rate', 'Avg Price']],
        data: payload.retreatPerformanceData,
        checkKey: 'revenue',
        mapFn: e => [e.event, `$${e.revenue.toLocaleString()}`, `${e.rate}%`, `$${e.price.toLocaleString()}`]
      });
    }
  );
};

export const exportRetreatReportExcel = (payload: RetreatExportPayload) => {
  const excel = new ExcelGenerator(`Retreat_Report_${new Date().getTime()}.xlsx`);

  excel.addSheet({
    data: payload.summaryData,
    sheetName: "Market Summary",
    mapFn: s => ({ 'Metric': s.title, 'Value': s.value, 'Context': s.description || '-' })
  });

  excel.addSheet({
    data: payload.retreatCountTrend,
    sheetName: "Active Listing Trend",
    checkKey: "active",
    mapFn: t => ({ 'Period': t.name, 'ActiveListing': t.active })
  });

  excel.addSheet({
    data: payload.bookingRateTrend,
    sheetName: "Booking Rate Trend",
    checkKey: "rate",
    mapFn: t => ({ 'Period': t.name, 'RatePercentage': t.rate })
  });

  excel.addSheet({
    data: payload.revenueByEvent,
    sheetName: "Revenue by Event",
    checkKey: "revenue",
    mapFn: e => ({ 'Event': e.event, 'RevenueUSD': e.revenue })
  });

  excel.addSheet({
    data: payload.topLocations,
    sheetName: "Top Destinations",
    checkKey: "count",
    mapFn: l => ({ 'Location': l.location, 'ListingCount': l.count })
  });

  excel.addSheet({
    data: payload.avgPriceTrend,
    sheetName: "Price Trends",
    checkKey: "price",
    mapFn: t => ({ 'Period': t.name, 'PriceUSD': t.price })
  });

  excel.addSheet({
    data: payload.durationBreakdown,
    sheetName: "Duration Breakdown",
    checkKey: "value",
    mapFn: d => ({ 'Duration': d.name, 'ValuePercentage': d.value })
  });

  excel.addSheet({
    data: payload.retreatPerformanceData,
    sheetName: "Performance Overview",
    checkKey: "revenue",
    mapFn: e => ({
      'Event Name': e.event,
      'TotalRevenue': e.revenue,
      'BookedRate': e.rate,
      'AvgPrice': e.price
    })
  });

  excel.save();
};
