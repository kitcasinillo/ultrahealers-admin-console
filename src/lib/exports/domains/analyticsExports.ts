import { generatePdf, addDataTable } from '../core/pdfGenerator';
import { ExcelGenerator } from '../core/excelGenerator';
import type { AnalyticsData } from '../../../api/analytics';

export interface AnalyticsExportPayload {
  data: AnalyticsData;
  rangeLabel: string;
  subdomainLabel: string;
  granularityLabel: string;
}

const formatSeconds = (sec: number): string => {
  if (!sec || isNaN(sec)) return '0s';
  const mins = Math.floor(sec / 60);
  const remainder = sec % 60;
  if (mins === 0) return `${remainder}s`;
  return `${mins}m ${remainder}s`;
};

export const exportAnalyticsPdf = (payload: AnalyticsExportPayload) => {
  const { data, rangeLabel, subdomainLabel, granularityLabel } = payload;
  const summary = data.summary || { totalPageviews: 0, totalSessions: 0, avgDurationSeconds: 0, bounceRatePercent: 0 };

  const summaryData = [
    { title: "Total Pageviews", value: summary.totalPageviews.toLocaleString(), description: summary.trends?.pageviewsLabel || "Total views across selected scope" },
    { title: "Unique Sessions", value: summary.totalSessions.toLocaleString(), description: summary.trends?.sessionsLabel || "Unique visitor sessions" },
    { title: "Avg. Session Duration", value: formatSeconds(summary.avgDurationSeconds), description: summary.trends?.durationLabel || "Average active session time" },
    { title: "Bounce Rate", value: `${summary.bounceRatePercent}%`, description: summary.trends?.bounceRateLabel || "Single-page exit percentage" }
  ];

  generatePdf(
    "Web Analytics & Telemetry Report",
    `Range: ${rangeLabel} | Subdomains: ${subdomainLabel} | Aggregation: ${granularityLabel}`,
    undefined,
    'p',
    `Web_Analytics_Report_${new Date().getTime()}.pdf`,
    (doc, autoTable, gen) => {
      // 1. KPI Summary
      addDataTable(doc, autoTable, gen, {
        title: "1. Executive Summary & KPIs",
        head: [['Metric', 'Value', 'Context / Description']],
        data: summaryData,
        theme: 'grid',
        mapFn: s => [s.title, s.value, s.description]
      });

      // 2. Acquisition Trends
      addDataTable(doc, autoTable, gen, {
        title: `2. User Acquisition Trends (${granularityLabel})`,
        head: [['Period', 'Seeker Signups', 'Healer Signups', 'Total Registrations']],
        data: data.monthlyAcquisition || [],
        headColor: [67, 24, 255],
        mapFn: m => [m.label || m.monthKey, String(m.seekers), String(m.healers), String(m.total)]
      });

      // 3. Subdomain Breakdown
      addDataTable(doc, autoTable, gen, {
        title: "3. Subdomain Traffic Distribution",
        head: [['Subdomain', 'Active Sessions']],
        data: data.subdomainBreakdown || [],
        headColor: [1, 163, 180],
        mapFn: s => [s.name, s.count.toLocaleString()]
      });

      // 4. Top Referrers
      addDataTable(doc, autoTable, gen, {
        title: "4. Top Traffic Acquisition Sources",
        head: [['Referrer Source', 'Referred Sessions']],
        data: data.topReferrers || [],
        headColor: [124, 58, 237],
        mapFn: r => [r.name, r.count.toLocaleString()]
      });

      gen.checkPageBreak();

      // 5. Popular Pages
      addDataTable(doc, autoTable, gen, {
        title: "5. Top Pageviews & Duration",
        head: [['Domain', 'Page Path', 'Pageviews', 'Avg Time Spent']],
        data: (data.topPages || []).slice(0, 15),
        mapFn: p => [p.domain || 'All', p.path, p.views.toLocaleString(), formatSeconds(p.avgTimeSeconds)]
      });

      // 6. Click Interactions
      addDataTable(doc, autoTable, gen, {
        title: "6. Top Click Interactions",
        head: [['Domain', 'Interactive Element', 'Click Count']],
        data: (data.topClicks || []).slice(0, 15),
        headColor: [1, 163, 180],
        mapFn: c => [c.domain || 'All', c.element, c.count.toLocaleString()]
      });

      // 7. Drop-off Pages
      addDataTable(doc, autoTable, gen, {
        title: "7. Top Drop-off / Exit Pages",
        head: [['Domain', 'Exit Path', 'Exit Count']],
        data: (data.topExits || []).slice(0, 15),
        headColor: [245, 158, 11],
        mapFn: e => [e.domain || 'All', e.path, e.count.toLocaleString()]
      });
    }
  );
};

export const exportAnalyticsExcel = (payload: AnalyticsExportPayload) => {
  const { data, rangeLabel, subdomainLabel, granularityLabel } = payload;
  const summary = data.summary || { totalPageviews: 0, totalSessions: 0, avgDurationSeconds: 0, bounceRatePercent: 0 };
  const excel = new ExcelGenerator(`Web_Analytics_Report_${new Date().getTime()}.xlsx`);

  // Sheet 1: Executive Summary
  excel.addSheet({
    data: [
      { Metric: "Total Pageviews", Value: summary.totalPageviews, Context: summary.trends?.pageviewsLabel || "Total views" },
      { Metric: "Unique Sessions", Value: summary.totalSessions, Context: summary.trends?.sessionsLabel || "Unique visitor sessions" },
      { Metric: "Avg. Session Duration (sec)", Value: summary.avgDurationSeconds, Context: formatSeconds(summary.avgDurationSeconds) },
      { Metric: "Bounce Rate (%)", Value: `${summary.bounceRatePercent}%`, Context: summary.trends?.bounceRateLabel || "Bounce rate" },
      { Metric: "Date Range Filter", Value: rangeLabel, Context: "Applied time horizon" },
      { Metric: "Subdomain Filter", Value: subdomainLabel, Context: "Applied subdomain scope" },
      { Metric: "Aggregation Granularity", Value: granularityLabel, Context: "Grouping interval" }
    ],
    sheetName: "Executive Summary",
    mapFn: s => ({
      "Metric": s.Metric,
      "Value": s.Value,
      "Context": s.Context
    })
  });

  // Sheet 2: Acquisition Trends
  excel.addSheet({
    data: data.monthlyAcquisition || [],
    sheetName: "Acquisition Trends",
    mapFn: m => ({
      "Period": m.label || m.monthKey,
      "Seeker Signups": m.seekers,
      "Healer Signups": m.healers,
      "Total Registrations": m.total
    })
  });

  // Sheet 3: Subdomains
  excel.addSheet({
    data: data.subdomainBreakdown || [],
    sheetName: "Subdomain Breakdown",
    mapFn: s => ({
      "Subdomain": s.name,
      "Active Sessions": s.count
    })
  });

  // Sheet 4: Referrers
  excel.addSheet({
    data: data.topReferrers || [],
    sheetName: "Traffic Sources",
    mapFn: r => ({
      "Referrer Source": r.name,
      "Referred Sessions": r.count
    })
  });

  // Sheet 5: Top Pages
  excel.addSheet({
    data: data.topPages || [],
    sheetName: "Top Pageviews",
    mapFn: p => ({
      "Domain": p.domain || "All",
      "Page Path": p.path,
      "Total Views": p.views,
      "Avg Duration (sec)": p.avgTimeSeconds,
      "Formatted Duration": formatSeconds(p.avgTimeSeconds)
    })
  });

  // Sheet 6: Click Events
  excel.addSheet({
    data: data.topClicks || [],
    sheetName: "Click Interactions",
    mapFn: c => ({
      "Domain": c.domain || "All",
      "Interactive Element": c.element,
      "Click Count": c.count
    })
  });

  // Sheet 7: Exit Pages
  excel.addSheet({
    data: data.topExits || [],
    sheetName: "Exit Pages",
    mapFn: e => ({
      "Domain": e.domain || "All",
      "Exit Path": e.path,
      "Exit Count": e.count
    })
  });

  excel.save();
};

export const exportAnalyticsCsv = (payload: AnalyticsExportPayload) => {
  const { data, rangeLabel, subdomainLabel, granularityLabel } = payload;
  const summary = data.summary || { totalPageviews: 0, totalSessions: 0, avgDurationSeconds: 0, bounceRatePercent: 0 };

  let csvContent = "";

  csvContent += "WEB ANALYTICS REPORT\n";
  csvContent += `Date Range: "${rangeLabel}",Subdomains: "${subdomainLabel}",Granularity: "${granularityLabel}"\n\n`;

  csvContent += "EXECUTIVE SUMMARY\n";
  csvContent += "Metric,Value,Context\n";
  csvContent += `"Total Pageviews",${summary.totalPageviews},"${summary.trends?.pageviewsLabel || '-'}"\n`;
  csvContent += `"Unique Sessions",${summary.totalSessions},"${summary.trends?.sessionsLabel || '-'}"\n`;
  csvContent += `"Avg Session Duration (sec)",${summary.avgDurationSeconds},"${formatSeconds(summary.avgDurationSeconds)}"\n`;
  csvContent += `"Bounce Rate (%)",${summary.bounceRatePercent}%,"${summary.trends?.bounceRateLabel || '-'}"\n\n`;

  csvContent += "USER ACQUISITION TRENDS\n";
  csvContent += "Period,Seeker Signups,Healer Signups,Total Registrations\n";
  (data.monthlyAcquisition || []).forEach(m => {
    csvContent += `"${m.label || m.monthKey}",${m.seekers},${m.healers},${m.total}\n`;
  });
  csvContent += "\n";

  csvContent += "SUBDOMAIN TRAFFIC BREAKDOWN\n";
  csvContent += "Subdomain,Active Sessions\n";
  (data.subdomainBreakdown || []).forEach(s => {
    csvContent += `"${s.name}",${s.count}\n`;
  });
  csvContent += "\n";

  csvContent += "TOP TRAFFIC SOURCES (REFERRERS)\n";
  csvContent += "Referrer Source,Referred Sessions\n";
  (data.topReferrers || []).forEach(r => {
    csvContent += `"${r.name}",${r.count}\n`;
  });
  csvContent += "\n";

  csvContent += "TOP PAGEVIEWS & DURATION\n";
  csvContent += "Domain,Page Path,Total Views,Avg Time Seconds\n";
  (data.topPages || []).forEach(p => {
    csvContent += `"${p.domain || 'All'}","${p.path}",${p.views},${p.avgTimeSeconds}\n`;
  });
  csvContent += "\n";

  csvContent += "TOP CLICK INTERACTIONS\n";
  csvContent += "Domain,Interactive Element,Click Count\n";
  (data.topClicks || []).forEach(c => {
    csvContent += `"${c.domain || 'All'}","${c.element}",${c.count}\n`;
  });
  csvContent += "\n";

  csvContent += "TOP DROP-OFF / EXIT PAGES\n";
  csvContent += "Domain,Exit Path,Exit Count\n";
  (data.topExits || []).forEach(e => {
    csvContent += `"${e.domain || 'All'}","${e.path}",${e.count}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Web_Analytics_Report_${new Date().getTime()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
