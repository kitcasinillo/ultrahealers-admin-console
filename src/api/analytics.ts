import api from "../lib/api";

export interface AnalyticsTrends {
  pageviewsLabel?: string;
  pageviewsTrend?: "up" | "down" | "neutral";
  sessionsLabel?: string;
  sessionsTrend?: "up" | "down" | "neutral";
  durationLabel?: string;
  durationTrend?: "up" | "down" | "neutral";
  bounceRateLabel?: string;
  bounceRateTrend?: "up" | "down" | "neutral";
}

export interface AnalyticsSummary {
  totalPageviews: number;
  totalSessions: number;
  avgDurationSeconds: number;
  bounceRatePercent: number;
  trends?: AnalyticsTrends;
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
  domain?: string;
  views: number;
  avgTimeSeconds: number;
}

export interface ClickStat {
  element: string;
  domain?: string;
  count: number;
}

export interface ExitStat {
  path: string;
  domain?: string;
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
  subdomain: string | string[] = 'all',
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData> => {
  const subdomainParam = Array.isArray(subdomain) ? subdomain.join(',') : subdomain;
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
        params: { range, subdomain: subdomainParam, startDate, endDate }
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

export interface ResetAnalyticsResponse {
  success: boolean;
  target: string;
  deletedCount: number;
  message?: string;
  error?: string;
}

export const resetAnalyticsTrackers = async (
  target: string = 'all'
): Promise<ResetAnalyticsResponse> => {
  const endpoints = [
    '/api/v1/analytics/reset',
    '/api/admin/analytics/reset',
    '/api/analytics/reset',
    '/v1/analytics/reset',
    '/analytics/reset'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await api.post<ResetAnalyticsResponse>(endpoint, { target });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (error: any) {
      console.warn(`Analytics reset endpoint ${endpoint} failed:`, error?.message);
    }
  }

  throw new Error('Failed to reset analytics trackers');
};
