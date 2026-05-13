import { generatePdf, addDataTable } from '../core/pdfGenerator';
import { ExcelGenerator } from '../core/excelGenerator';

export interface ReportDataPayload {
  dateRange: string;
  summaryData: Array<{ title: string; value: string; description?: string }>;
  userGrowthData: Array<{ name: string; healers: number; seekers: number }>;
  bookingVolumeData: Array<{ name: string; sessions: number; retreats: number }>;
  revenueData: Array<{ name: string; commission: number; fees: number; premium: number }>;
}

export const exportPlatformOverviewPdf = (data: ReportDataPayload) => {
  generatePdf(
    "Platform Overview Report",
    undefined,
    data.dateRange,
    'p',
    `Platform-Overview-Report_${new Date().getTime()}.pdf`,
    (doc, autoTable, gen) => {
      addDataTable(doc, autoTable, gen, {
        title: "1. Key Performance Metrics",
        head: [['Metric', 'Value', 'Details']],
        data: data.summaryData,
        mapFn: card => [card.title, String(card.value), card.description || '-']
      });

      addDataTable(doc, autoTable, gen, {
        title: "2. User Growth Trends",
        head: [['Period', 'Healers', 'Seekers', 'Total Added']],
        data: data.userGrowthData,
        mapFn: d => [d.name, String(d.healers), String(d.seekers), String(d.healers + d.seekers)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "3. Booking Volumes",
        head: [['Period', 'Sessions', 'Retreats', 'Total Volume']],
        data: data.bookingVolumeData,
        mapFn: d => [d.name, String(d.sessions), String(d.retreats), String(d.sessions + d.retreats)]
      });

      gen.checkPageBreak();
      addDataTable(doc, autoTable, gen, {
        title: "4. Revenue Composition",
        head: [['Period', 'Session Commission', 'Seeker Fees', 'Premium Subscriptions', 'Total Context Revenue']],
        data: data.revenueData,
        mapFn: d => [
          d.name,
          `$${d.commission.toLocaleString()}`,
          `$${d.fees.toLocaleString()}`,
          `$${(d.premium || 0).toLocaleString()}`,
          `$${(d.commission + d.fees + (d.premium || 0)).toLocaleString()}`
        ]
      });
    }
  );
};

export const exportPlatformOverviewExcel = (data: ReportDataPayload) => {
  const excel = new ExcelGenerator(`Platform-Overview-Data_${new Date().getTime()}.xlsx`);

  excel.addSheet({
    data: data.userGrowthData,
    sheetName: "User Growth",
    mapFn: d => ({
      'Period': d.name,
      'Healers': d.healers,
      'Seekers': d.seekers,
      'Total Added': d.healers + d.seekers
    })
  });

  excel.addSheet({
    data: data.bookingVolumeData,
    sheetName: "Booking Volume",
    mapFn: d => ({
      'Period': d.name,
      'Sessions': d.sessions,
      'Retreats': d.retreats,
      'Total Volume': d.sessions + d.retreats
    })
  });

  excel.addSheet({
    data: data.revenueData,
    sheetName: "Revenue Composition",
    mapFn: d => ({
      'Period': d.name,
      'Session Commission ($)': d.commission,
      'Seeker Fees ($)': d.fees,
      'Premium Subscriptions ($)': d.premium || 0,
      'Total Revenue ($)': d.commission + d.fees + (d.premium || 0)
    })
  });

  excel.addSheet({
    data: data.summaryData,
    sheetName: "Summary Metrics",
    mapFn: card => ({
      'Metric': card.title,
      'Value': card.value,
      'Details': card.description || '-'
    })
  });

  excel.save();
};
