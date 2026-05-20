import { generatePdf, addDataTable } from '../core/pdfGenerator';
import { ExcelGenerator } from '../core/excelGenerator';

export interface CampaignExportPayload {
  kpiData: Array<{ title: string; value: string; description: string }>;
  summaryData: any[];
  reachData: any[];
  unsubscribeTrend: any[];
  segmentPerformance: any[];
}

export const exportCampaignPdf = (payload: CampaignExportPayload) => {
  generatePdf(
    "Campaign Performance Report",
    undefined,
    undefined,
    'l',
    `Campaign_Report_${new Date().getTime()}.pdf`,
    (doc, autoTable, gen) => {
      let sectionIdx = 1;

      if (payload.kpiData && payload.kpiData.length > 0) {
        addDataTable(doc, autoTable, gen, {
          title: `${sectionIdx++}. Key Performance Metrics`,
          head: [['Metric', 'Value', 'Details']],
          data: payload.kpiData,
          theme: 'grid',
          mapFn: kpi => [kpi.title, kpi.value, kpi.description]
        });
      }

      if (payload.summaryData && payload.summaryData.length > 0) {
        addDataTable(doc, autoTable, gen, {
          title: `${sectionIdx++}. Campaign Summary`,
          head: [['Campaign Name', 'Sent', 'Open Rate', 'CTR', 'Bounce Rate', 'Status']],
          data: payload.summaryData,
          mapFn: c => [c.name, c.sent.toLocaleString(), `${c.openRate}%`, `${c.ctr}%`, `${c.bounceRate}%`, c.status]
        });
      }

      if (payload.reachData && payload.reachData.length > 0) {
        addDataTable(doc, autoTable, gen, {
          title: `${sectionIdx++}. Reach & Deliverability`,
          head: [['Period', 'Sent', 'Delivered', 'Delivery Rate']],
          data: payload.reachData,
          mapFn: r => [r.name, r.sent.toLocaleString(), r.delivered.toLocaleString(), `${((r.delivered / r.sent) * 100).toFixed(1)}%`]
        });
      }

      if (payload.unsubscribeTrend && payload.unsubscribeTrend.length > 0) {
        addDataTable(doc, autoTable, gen, {
          title: `${sectionIdx++}. Unsubscribe Rate Trend`,
          head: [['Period', 'Unsubscribe Rate (%)']],
          data: payload.unsubscribeTrend,
          headColor: [255, 91, 91],
          mapFn: u => [u.name, `${u.rate}%`]
        });
      }

      if (payload.segmentPerformance && payload.segmentPerformance.length > 0) {
        addDataTable(doc, autoTable, gen, {
          title: `${sectionIdx++}. Audience Segment Performance`,
          head: [['Segment', 'Engagement (%)']],
          data: payload.segmentPerformance,
          mapFn: s => [s.name, `${s.value}%`]
        });
      }
    }
  );
};

export const exportCampaignExcel = (payload: CampaignExportPayload) => {
  const excel = new ExcelGenerator(`Campaign_Report_${new Date().getTime()}.xlsx`);

  if (payload.kpiData && payload.kpiData.length > 0) {
    excel.addSheet({
      data: payload.kpiData,
      sheetName: "Key Metrics",
      mapFn: kpi => ({ 'Metric': kpi.title, 'Value': kpi.value, 'Details': kpi.description })
    });
  }

  if (payload.summaryData && payload.summaryData.length > 0) {
    excel.addSheet({
      data: payload.summaryData,
      sheetName: "Campaign Summary",
      mapFn: c => ({ 'Campaign Name': c.name, 'Sent': c.sent, 'Open Rate (%)': c.openRate, 'CTR (%)': c.ctr, 'Bounce Rate (%)': c.bounceRate, 'Status': c.status })
    });
  }

  if (payload.reachData && payload.reachData.length > 0) {
    excel.addSheet({
      data: payload.reachData,
      sheetName: "Reach & Deliverability",
      mapFn: r => ({ 'Period': r.name, 'Sent': r.sent, 'Delivered': r.delivered, 'Delivery Rate (%)': Number(((r.delivered / r.sent) * 100).toFixed(1)) })
    });
  }

  if (payload.unsubscribeTrend && payload.unsubscribeTrend.length > 0) {
    excel.addSheet({
      data: payload.unsubscribeTrend,
      sheetName: "Unsubscribe Trend",
      mapFn: u => ({ 'Period': u.name, 'Unsubscribe Rate (%)': u.rate })
    });
  }

  if (payload.segmentPerformance && payload.segmentPerformance.length > 0) {
    excel.addSheet({
      data: payload.segmentPerformance,
      sheetName: "Segment Performance",
      mapFn: s => ({ 'Segment': s.name, 'Engagement (%)': s.value })
    });
  }

  excel.save();
};
