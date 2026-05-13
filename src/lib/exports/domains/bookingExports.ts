import { generatePdf, addDataTable } from '../core/pdfGenerator';
import { ExcelGenerator } from '../core/excelGenerator';

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
  generatePdf(
    "Booking & Session Report",
    undefined,
    payload.dateRange,
    'p',
    `Booking_Report_${new Date().getTime()}.pdf`,
    (doc, autoTable, gen) => {
      // Offset starting Y because the original logic has a conditional
      if (payload.dateRange) {
        gen.currentY = 44;
      } else {
        gen.currentY = 38;
      }

      addDataTable(doc, autoTable, gen, {
        title: "1. Key Performance Summary",
        head: [['Metric', 'Value', 'Context']],
        data: payload.summaryData,
        theme: 'grid',
        mapFn: s => [s.title, s.value, s.description || '-']
      });

      addDataTable(doc, autoTable, gen, {
        title: "2. Booking Volume",
        head: [['Period', 'Total Bookings']],
        data: payload.bookingVolume,
        mapFn: v => [v.name, String(v.bookings)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "3. Average Booking Value ($)",
        head: [['Period', 'Value ($)']],
        data: payload.avgBookingValue,
        headColor: [1, 163, 180],
        mapFn: v => [v.name, `$${v.value}`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "4. Modality Popularity",
        head: [['Modality', 'Sessions Count']],
        data: payload.modalityPopularity,
        mapFn: m => [m.modality, String(m.sessions)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "5. Session Length Distribution",
        head: [['Length', 'Count']],
        data: payload.durationDistribution,
        headColor: [1, 163, 180],
        mapFn: d => [d.length, String(d.count)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "6. Booking Lifecycle Completion Rate (%)",
        head: [['Status', 'Rate (%)']],
        data: payload.completionRate,
        headColor: [124, 58, 237],
        mapFn: c => [c.status, `${c.rate}%`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "7. Format Breakdown (Remote vs In-Person)",
        head: [['Format', 'Value (%)']],
        data: payload.formatBreakdown,
        headColor: [1, 163, 180],
        mapFn: f => [f.name, `${f.value}%`]
      });

      gen.checkPageBreak();

      addDataTable(doc, autoTable, gen, {
        title: "8. Top 10 Practitioners by Booking Count",
        head: [['Practitioner', 'Bookings', 'Rating']],
        data: payload.topHealersByCount,
        colSpan: 3,
        mapFn: h => [h.name, String(h.count), `${h.rating}`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "9. Top 10 Practitioners by Revenue ($)",
        head: [['Practitioner', 'Revenue ($)', 'Rating']],
        data: payload.topHealersByRevenue,
        headColor: [1, 163, 180],
        colSpan: 3,
        mapFn: h => [h.name, `$${h.revenue.toLocaleString()}`, `${h.rating}`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "10. Practitioner Performance Summary",
        head: [['Practitioner', 'Bookings', 'Revenue ($)', 'Avg Rating']],
        data: payload.topHealersByCount,
        theme: 'grid',
        mapFn: h => [h.name, String(h.count), `$${h.revenue.toLocaleString()}`, `${h.rating} ★`]
      });
    }
  );
};

export const exportBookingReportExcel = (payload: BookingExportPayload) => {
  const excel = new ExcelGenerator(`Booking_Report_${new Date().getTime()}.xlsx`);

  if (payload.dateRange) {
    const metaData = [
      ["Booking Report Metadata"],
      ["Generated On", new Date().toLocaleString()],
      ["Reporting Period", payload.dateRange]
    ];
    // Need raw XLSX here to manually add meta
    import('xlsx').then((XLSX) => {
      const wsMeta = XLSX.utils.aoa_to_sheet(metaData);
      wsMeta['!cols'] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(excel.wb, wsMeta, "Metadata");

      _buildBookingExcelSheets(excel, payload);
    });
  } else {
    _buildBookingExcelSheets(excel, payload);
  }
};

const _buildBookingExcelSheets = (excel: ExcelGenerator, payload: BookingExportPayload) => {
  excel.addSheet({
    data: payload.summaryData,
    sheetName: "Summary Metrics",
    mapFn: s => ({ 'Metric': s.title, 'Value': s.value, 'Context': s.description || '-' })
  });

  excel.addSheet({
    data: payload.bookingVolume,
    sheetName: "Booking Volume",
    mapFn: v => ({ 'Period': v.name, 'Total Bookings': v.bookings })
  });

  excel.addSheet({
    data: payload.avgBookingValue,
    sheetName: "Avg Booking Value",
    mapFn: v => ({ 'Period': v.name, 'Value ($)': v.value })
  });

  excel.addSheet({
    data: payload.modalityPopularity,
    sheetName: "Modality Popularity",
    mapFn: m => ({ 'Modality': m.modality, 'Sessions Count': m.sessions })
  });

  excel.addSheet({
    data: payload.durationDistribution,
    sheetName: "Session Lengths",
    mapFn: d => ({ 'Length': d.length, 'Count': d.count })
  });

  excel.addSheet({
    data: payload.completionRate,
    sheetName: "Completion Rate",
    mapFn: c => ({ 'Status': c.status, 'Rate (%)': c.rate })
  });

  excel.addSheet({
    data: payload.formatBreakdown,
    sheetName: "Format Breakdown",
    mapFn: f => ({ 'Format': f.name, 'Sessions': f.value })
  });

  excel.addSheet({
    data: payload.topHealersByCount,
    sheetName: "Top Healers (Volume)",
    mapFn: h => ({ 'Name': h.name, 'Bookings': h.count, 'Revenue': `$${h.revenue}`, 'Rating': h.rating })
  });

  excel.addSheet({
    data: payload.topHealersByRevenue,
    sheetName: "Top Healers (Revenue)",
    mapFn: h => ({ 'Name': h.name, 'Revenue': `$${h.revenue}`, 'Bookings': h.count, 'Rating': h.rating })
  });

  excel.addSheet({
    data: payload.topHealersByCount,
    sheetName: "Practitioner Performance",
    mapFn: h => ({ 'Practitioner': h.name, 'Bookings': h.count, 'Revenue ($)': h.revenue, 'Avg Rating': h.rating })
  });

  excel.save();
};
