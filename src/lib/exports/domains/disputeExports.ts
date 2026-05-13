import { generatePdf, addDataTable } from '../core/pdfGenerator';
import { ExcelGenerator } from '../core/excelGenerator';

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
  generatePdf(
    "Dispute Analysis Report",
    undefined,
    payload.dateRange,
    'l',
    `Dispute_Analysis_Report_${new Date().getTime()}.pdf`,
    (doc, autoTable, gen) => {
      addDataTable(doc, autoTable, gen, {
        title: "1. Summary Metrics",
        head: [['Metric', 'Value', 'Details']],
        data: payload.summaryData,
        theme: 'grid',
        mapFn: s => [s.title, s.value, s.description || '-']
      });

      addDataTable(doc, autoTable, gen, {
        title: "2. Dispute Rate Trend",
        head: [['Period', 'Dispute Rate (%)']],
        data: payload.disputeRateTrend,
        mapFn: d => [d.name, `${d.rate}%`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "3. Disputes by Type",
        head: [['Dispute Type', 'Total Count']],
        data: payload.disputesByType,
        mapFn: d => [d.name, String(d.value)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "4. Resolution Outcomes",
        head: [['Period', 'Refunded', 'Partial Refund', 'Platform Credit', 'Denied/Rejected']],
        data: payload.outcomeBreakdown,
        colSpan: 5,
        mapFn: o => [o.name, String(o.refund), String(o.partial), String(o.credit), String(o.deny)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "5. Dispute Rate by Modality",
        head: [['Modality', 'Dispute Rate (%)']],
        data: payload.modalityDisputeRate,
        headColor: [1, 163, 180],
        mapFn: m => [m.name, `${m.value}%`]
      });

      const flaggedHealers = payload.healerRepeatDisputes.filter(h => h.disputes >= 2);
      addDataTable(doc, autoTable, gen, {
        title: "6. Practitioner Risk Watchlist",
        head: [['Healer Name', 'Total Disputes', 'Risk Status']],
        data: flaggedHealers,
        headColor: [255, 91, 91],
        theme: 'grid',
        mapFn: h => [h.name, String(h.disputes), h.status.toUpperCase()]
      });
    }
  );
};

export const exportDisputeExcel = (payload: DisputeExportPayload) => {
  const excel = new ExcelGenerator(`Dispute_Report_${new Date().getTime()}.xlsx`);

  excel.addSheet({
    data: payload.summaryData,
    sheetName: "Summary Metrics",
    mapFn: s => ({ 'Metric': s.title, 'Value': s.value, 'Details': s.description || '-' })
  });

  excel.addSheet({
    data: payload.disputeRateTrend,
    sheetName: "Dispute Trends",
    mapFn: d => ({ 'Period': d.name, 'Dispute Rate (%)': d.rate })
  });

  excel.addSheet({
    data: payload.disputesByType,
    sheetName: "Disputes by Type",
    mapFn: d => ({ 'Dispute Type': d.name, 'Count': d.value })
  });

  excel.addSheet({
    data: payload.disputesBySeverity,
    sheetName: "Severity Distribution",
    mapFn: d => ({ 'Period': d.name, 'Normal': d.normal, 'Safety': d.safety })
  });

  excel.addSheet({
    data: payload.resolutionTimeTrend,
    sheetName: "Resolution Times",
    mapFn: r => ({ 'Period': r.name, 'Hours': r.hours })
  });

  excel.addSheet({
    data: payload.outcomeBreakdown,
    sheetName: "Resolution Outcomes",
    mapFn: o => ({ 
      'Period': o.name, 
      'Refunded': o.refund, 
      'Partial Refund': o.partial, 
      'Platform Credit': o.credit, 
      'Denied': o.deny 
    })
  });

  excel.addSheet({
    data: payload.modalityDisputeRate,
    sheetName: "Modality Density",
    mapFn: m => ({ 'Modality': m.name, 'Dispute Rate (%)': m.value })
  });

  excel.addSheet({
    data: payload.healerRepeatDisputes.filter(h => h.disputes >= 2),
    sheetName: "Risk Watchlist",
    mapFn: h => ({ 
      'Healer Name': h.name, 
      'Total Disputes': h.disputes, 
      'Status': h.status.toUpperCase() 
    })
  });

  excel.save();
};
