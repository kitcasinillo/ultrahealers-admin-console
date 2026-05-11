import api from "../lib/api";

export interface UserReportData {
  summary: Array<{
    title: string;
    value: string;
    description: string;
  }>;
  registration: Array<{
    name: string;
    seekers: number;
    healers: number;
  }>;
  churn: Array<{
    name: string;
    healers: number;
    seekers: number;
  }>;
  healerFunnel: Array<{
    step: string;
    value: number;
  }>;
  seekerFunnel: Array<{
    step: string;
    value: number;
  }>;
  subscriptionCohort: Array<{
    name: string;
    rate: number;
  }>;
  retentionData: Array<{
    cohort: string;
    users: number;
    m0: number;
    m1: number | null;
    m2: number | null;
    m3: number | null;
  }>;
}

/**
 * Fetch user report data from the backend
 */
export const getUserReport = async (
  startDate?: string,
  endDate?: string,
  granularity?: string,
  range?: string
): Promise<UserReportData> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (granularity) params.append("granularity", granularity);
    if (range) params.append("range", range);

    const response = await api.get(`/api/admin/reports/users${params.toString() ? `?${params}` : ""}`);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to fetch user report data");
  } catch (error) {
    console.error("Error fetching user report:", error);
    throw error;
  }
};

export interface RetreatReportData {
  summary: Array<{
    title: string;
    value: string;
    description: string;
  }>;
  retreatCountTrend: Array<{ name: string; active: number }>;
  bookingRateTrend: Array<{ name: string; rate: number }>;
  revenueByEvent: Array<{ event: string; revenue: number }>;
  topLocations: Array<{ location: string; count: number }>;
  avgPriceTrend: Array<{ name: string; price: number }>;
  durationBreakdown: Array<{ name: string; value: number; color: string }>;
  retreatPerformanceData: Array<{
    event: string;
    revenue: number;
    rate: number;
    price: number;
  }>;
}

/**
 * Fetch retreat report data from the backend
 */
export const getRetreatsReport = async (
  startDate?: string,
  endDate?: string,
  granularity?: string,
  range?: string
): Promise<RetreatReportData> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (granularity) params.append("granularity", granularity);
    if (range) params.append("range", range);

    const response = await api.get(
      `/api/admin/reports/retreats${params.toString() ? `?${params}` : ""}`
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to fetch retreat report data");
  } catch (error) {
    console.error("Error fetching retreat report:", error);
    throw error;
  }
};

/**
 * Fetch financial report data from the backend
 */
export const getFinancialReport = async (startDate?: string, endDate?: string) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/api/admin/reports/financial${params.toString() ? `?${params}` : ""}`
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to fetch financial report data");
  } catch (error) {
    console.error("Error fetching financial report:", error);
    throw error;
  }
};

/**
 * Fetch platform overview data from the backend
 */
export const getPlatformOverview = async () => {
  try {
    const response = await api.get(`/api/admin/reports/overview`);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to fetch platform overview data");
  } catch (error) {
    console.error("Error fetching platform overview:", error);
    throw error;
  }
};

/**
 * Fetch dispute report data from the backend
 */
export const getDisputeReport = async (startDate?: string, endDate?: string) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/api/admin/reports/disputes${params.toString() ? `?${params}` : ""}`
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to fetch dispute report data");
  } catch (error) {
    console.error("Error fetching dispute report:", error);
    throw error;
  }
};
