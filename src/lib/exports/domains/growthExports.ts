import { generatePdf, addDataTable } from '../core/pdfGenerator';
import { ExcelGenerator } from '../core/excelGenerator';

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
  generatePdf(
    "Growth & Retention Report",
    `Data Granularity: ${payload.granularity}`,
    undefined,
    'p',
    `Growth_Report_${payload.granularity}_${new Date().getTime()}.pdf`,
    (doc, autoTable, gen) => {
      addDataTable(doc, autoTable, gen, {
        title: "1. Key Performance Summary",
        head: [['Metric', 'Value', 'Context']],
        data: payload.summaryData,
        theme: 'grid',
        mapFn: s => [s.title, s.value, s.description || '-']
      });

      addDataTable(doc, autoTable, gen, {
        title: `2. Registration Trend (${payload.granularity})`,
        head: [['Period', 'Seekers', 'Healers', 'Total']],
        data: payload.registrationTrend,
        mapFn: r => [r.name, String(r.seekers), String(r.healers), String(r.seekers + r.healers)]
      });

      addDataTable(doc, autoTable, gen, {
        title: `3. Churn Indicators (${payload.granularity})`,
        head: [['Period', 'Seekers', 'Healers']],
        data: payload.churnIndicators,
        headColor: [255, 91, 91],
        mapFn: c => [c.name, String(c.seekers), String(c.healers)]
      });

      addDataTable(doc, autoTable, gen, {
        title: "4. Conversion Funnels Summary",
        head: [['Funnel Step', 'Healers', 'Seeker Step', 'Seekers']],
        data: payload.healerFunnel,
        headColor: [1, 163, 180],
        fontSize: 8,
        mapFn: (h, i) => [
          h.step, String(h.value),
          payload.seekerFunnel[i]?.step || '-', 
          payload.seekerFunnel[i] ? String(payload.seekerFunnel[i].value) : '-'
        ]
      });

      gen.checkPageBreak();
      
      addDataTable(doc, autoTable, gen, {
        title: "5. Subscription & Retention Metrics", // Title used for the whole section
        head: [['Cohort', 'Premium Upgrade Rate (%)']],
        data: payload.subscriptionCohort,
        headColor: [124, 58, 237],
        mapFn: s => [s.name, `${s.rate}%`]
      });

      addDataTable(doc, autoTable, gen, {
        title: "6. Monthly Retention Cohorts",
        head: [['Cohort', 'Size', 'M0', 'M1', 'M2', 'M3']],
        data: payload.retentionData,
        theme: 'grid',
        headColor: [1, 163, 180],
        mapFn: r => [
          r.cohort, r.users.toLocaleString(),
          `${r.m0}%`, r.m1 ? `${r.m1}%` : '-', r.m2 ? `${r.m2}%` : '-', r.m3 ? `${r.m3}%` : '-'
        ]
      });
    }
  );
};

export const exportGrowthExcel = (payload: GrowthExportPayload) => {
  const excel = new ExcelGenerator(`Growth_Report_${payload.granularity}_${new Date().getTime()}.xlsx`);

  excel.addSheet({
    data: payload.summaryData,
    sheetName: "Summary Metrics",
    mapFn: s => ({
      "Metric": s.title,
      "Current Value": s.value,
      "Context/Trend": s.description || "-",
      "Granularity": payload.granularity
    })
  });

  excel.addSheet({
    data: payload.registrationTrend,
    sheetName: "Registration Trend",
    mapFn: r => ({
      "Period": r.name,
      "Seekers Added": r.seekers,
      "Healers Added": r.healers,
      "Total Registrations": r.seekers + r.healers
    })
  });

  excel.addSheet({
    data: payload.churnIndicators,
    sheetName: "Churn Indicators",
    mapFn: c => ({
      "Period": c.name,
      "Inactive Seekers (30d)": c.seekers,
      "Inactive Healers (30d)": c.healers,
      "Total Inactive": c.seekers + c.healers
    })
  });

  excel.addSheet({
    data: payload.healerFunnel,
    sheetName: "Healer Funnel",
    mapFn: h => ({ "Funnel Step": h.step, "Healer Count": h.value })
  });

  excel.addSheet({
    data: payload.seekerFunnel,
    sheetName: "Seeker Funnel",
    mapFn: s => ({ "Funnel Step": s.step, "Seeker Count": s.value })
  });

  excel.addSheet({
    data: payload.subscriptionCohort,
    sheetName: "Subscription Upgrades",
    mapFn: s => ({ "Cohort Period": s.name, "Premium Upgrade Rate (%)": s.rate })
  });

  excel.addSheet({
    data: payload.retentionData,
    sheetName: "Retention Cohorts",
    mapFn: r => ({
      "Cohort": r.cohort,
      "Size": r.users,
      "Month 0 (%)": r.m0,
      "Month 1 (%)": r.m1 || "-",
      "Month 2 (%)": r.m2 || "-",
      "Month 3 (%)": r.m3 || "-"
    })
  });

  excel.save();
};

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

  csvContent += "REPORT SUMMARY (KEY METRICS)\n";
  csvContent += "Metric,Value,Context\n";
  summaryData.forEach(s => csvContent += `"${s.title}","${s.value}","${s.description || '-'}"\n`);
  csvContent += "\n";

  csvContent += "REGISTRATION TREND\n";
  csvContent += "Period,Seekers,Healers,Total Added\n";
  registrationTrend.forEach(r => csvContent += `"${r.name}",${r.seekers},${r.healers},${r.seekers + r.healers}\n`);
  csvContent += "\n";

  csvContent += "CHURN INDICATORS (INACTIVE)\n";
  csvContent += "Period,Seekers,Healers\n";
  churnIndicators.forEach(c => csvContent += `"${c.name}",${c.seekers},${c.healers}\n`);
  csvContent += "\n";

  csvContent += "CONVERSION FUNNELS SUMMARY\n";
  csvContent += "Step (Healer),Count (Healer),Step (Seeker),Count (Seeker)\n";
  healerFunnel.forEach((h, i) => {
    const sStep = seekerFunnel[i] ? seekerFunnel[i].step : "-";
    const sVal = seekerFunnel[i] ? seekerFunnel[i].value : "-";
    csvContent += `"${h.step}",${h.value},"${sStep}",${sVal}\n`;
  });
  csvContent += "\n";

  csvContent += "SUBSCRIPTION UPGRADE RATE\n";
  csvContent += "Cohort,Upgrade Rate (%)\n";
  subscriptionCohort.forEach(s => csvContent += `"${s.name}",${s.rate}%\n`);
  csvContent += "\n";

  csvContent += "RETENTION COHORTS (MONTHLY)\n";
  csvContent += "Cohort,Size,M0,M1,M2,M3\n";
  retentionData.forEach(r => csvContent += `"${r.cohort}",${r.users},${r.m0}%,${r.m1 || '-'}%,${r.m2 || '-'}%,${r.m3 || '-'}%\n`);

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
