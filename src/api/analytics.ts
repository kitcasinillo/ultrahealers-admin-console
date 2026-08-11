import api from "../lib/api";

export interface AnalyticsSummary {
  totalPageviews: number;
  totalSessions: number;
  avgDurationSeconds: number;
  bounceRatePercent: number;
}

export interface MonthlyAcquisition {
  monthKey: string;
  label: string;
  healers: number;
  seekers: number;
  total: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface PageStat {
  path: string;
  views: number;
  avgTimeSeconds: number;
}

export interface ClickStat {
  element: string;
  count: number;
}

export interface ExitStat {
  path: string;
  count: number;
}

export interface WebVitalsSummary {
  avgLcpMs: number;
  avgCls: number;
  avgFidMs: number;
  sampleCount: number;
}

export interface ErrorStat {
  message: string;
  source: string;
  count: number;
}

export interface RageClickStat {
  element: string;
  count: number;
}

export interface ConversionStat {
  goalName: string;
  count: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  webVitals?: WebVitalsSummary;
  topErrors?: ErrorStat[];
  rageClicks?: RageClickStat[];
  conversions?: ConversionStat[];
  monthlyAcquisition: MonthlyAcquisition[];
  topReferrers: NamedCount[];
  topPages: PageStat[];
  topClicks: ClickStat[];
  topExits: ExitStat[];
  subdomainBreakdown: NamedCount[];
  utmCampaigns: NamedCount[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
  error?: string;
}

export const fetchAnalyticsStats = async (
  range: string = '30d',
  subdomain: string = 'all'
): Promise<AnalyticsData> => {
  const endpoints = [
    '/api/admin/reports/analytics',
    '/api/v1/analytics/stats',
    '/api/admin/analytics/stats',
    '/api/analytics/stats',
    '/v1/analytics/stats',
    '/analytics/stats'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<AnalyticsResponse>(endpoint, {
        params: { range, subdomain }
      });
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (error: any) {
      console.warn(`Analytics endpoint ${endpoint} failed:`, error?.message);
    }
  }

  // Return graceful default structure on offline / uninitialized state
  return {
    summary: {
      totalPageviews: 0,
      totalSessions: 0,
      avgDurationSeconds: 0,
      bounceRatePercent: 0
    },
    webVitals: { avgLcpMs: 0, avgCls: 0, avgFidMs: 0, sampleCount: 0 },
    topErrors: [],
    rageClicks: [],
    conversions: [],
    monthlyAcquisition: [],
    topReferrers: [],
    topPages: [],
    topClicks: [],
    topExits: [],
    subdomainBreakdown: [],
    utmCampaigns: []
  };
};
