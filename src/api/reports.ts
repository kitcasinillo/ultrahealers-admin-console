import api from "../lib/api";

export type DisputeReportData = {
  summaryData: any[];
  disputeRateTrend: Array<{ name: string; rate: number }>;
  disputesByType: Array<{ name: string; value: number }>;
  disputesBySeverity: Array<{ name: string; normal: number; safety: number }>;
  resolutionTimeTrend: Array<{ name: string; hours: number }>;
  outcomeBreakdown: Array<{ name: string; refund: number; partial: number; credit: number; deny: number }>;
  modalityDisputeRate: Array<{ name: string; value: number }>;
  healerRepeatDisputes: Array<{ name: string; disputes: number; status: string }>;
};

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
    m4: number | null;
  }>;
}

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

export interface FinancialReportData {
  summary: Array<{
    title: string;
    value: string;
    description: string;
  }>;
  revenueBySource: Array<{ name: string; value: number; color: string }>;
  revenueTrend: Array<{ month: string; sessions: number; retreats: number; subs: number }>;
  monthlyComparison: Array<{ month: string; revenue: number; prior: number }>;
  stripeFeeImpact: Array<{ name: string; gross: number; fees: number }>;
  topHealers: Array<{ name: string; revenue: number }>;
  topRetreats: Array<{ name: string; revenue: number }>;
  bookingAudit: Array<{
    date: string;
    bookingId: string;
    listing: string;
    healer: string;
    seeker: string;
    grossAmount: number;
    healerCommission: number;
    seekerFee: number;
    processingFee: number;
    netRevenue: number;
    stripePi: string;
  }>;
  premiumLog: Array<{
    healer: string;
    activationDate: string;
    amount: number;
    stripeSessionId: string;
  }>;
}

export interface PlatformOverviewData {
  summary: Array<{ title: string; value: string; description: string }>;
  userGrowth: Array<{ name: string; healers: number; seekers: number }>;
  bookingVolume: Array<{ name: string; sessions: number; retreats: number }>;
  revenue: Array<{ name: string; commission: number; fees: number; premium: number }>;
  healthScore: number;
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
    const response = await api.get("/api/admin/reports/users", {
      params: { startDate, endDate, granularity, range }
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to fetch user report data");
  } catch (error) {
    console.error("Error fetching user report:", error);
    throw error;
  }
};

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
    const response = await api.get("/api/admin/reports/retreats", {
      params: { startDate, endDate, granularity, range }
    });
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
export const getFinancialReport = async (
  startDate?: string,
  endDate?: string,
  granularity?: string,
  range?: string
): Promise<FinancialReportData> => {
  try {
    const response = await api.get("/api/admin/reports/financial", {
      params: { startDate, endDate, granularity, range }
    });

    if (response.data.success) {
      const data = response.data.data;

      // Ensure healer names are populated from various possible fields
      if (data.topHealers) {
        data.topHealers = data.topHealers.map((h: any) => ({
          ...h,
          name: h.name || h.healerName || h.practitionerName || (h.healer as any)?.name || 'Unknown healer'
        }));
      }

      if (data.bookingAudit) {
        data.bookingAudit = data.bookingAudit.map((b: any) => ({
          ...b,
          healer: b.healer || b.healerName || (b.healer as any)?.name || 'Unknown healer',
          seeker: b.seeker || b.seekerName || (b.seeker as any)?.name || 'Unknown seeker'
        }));
      }

      if (data.premiumLog) {
        data.premiumLog = data.premiumLog.map((p: any) => ({
          ...p,
          healer: p.healer || p.healerName || (p.healer as any)?.name || 'Unknown healer'
        }));
      }

      return data;
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
export const getPlatformOverview = async (
  startDate?: string,
  endDate?: string,
  granularity?: string,
  range?: string
): Promise<PlatformOverviewData> => {
  try {
    const response = await api.get("/api/admin/reports/overview", {
      params: { startDate, endDate, granularity, range }
    });

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
export const getDisputeReport = async (
  startDate?: string,
  endDate?: string,
  granularity?: string,
  range?: string
): Promise<DisputeReportData> => {
  try {
    const response = await api.get("/api/admin/reports/disputes", {
      params: { startDate, endDate, granularity, range }
    });

    if (response.data.success) {
      const data = response.data.data;

      // Handle missing healer names in the repeat disputes watchlist
      if (data.healerRepeatDisputes) {
        data.healerRepeatDisputes = data.healerRepeatDisputes.map((h: any) => {
          const rawName = h.name || h.healerName || h.practitionerName || (h.healer as any)?.name || h.healer_name || h.practitioner;
          const idFallback = h.id || h.healerId || h.healer_id || '';

          return {
            ...h,
            name: (rawName && rawName !== 'Unknown' && rawName !== 'Unknown Healer')
              ? rawName
              : (idFallback ? `ID: ${idFallback}` : 'Unknown Healer')
          };
        });
      }

      // Handle missing modality names
      if (data.modalityDisputeRate) {
        data.modalityDisputeRate = data.modalityDisputeRate.map((m: any) => {
          const rawName = m.name || m.modality || m.modalityName || m.serviceType;
          return {
            ...m,
            name: rawName || 'Other'
          };
        });
      }

      // Handle missing dispute type names
      if (data.disputesByType) {
        data.disputesByType = data.disputesByType.map((t: any) => ({
          ...t,
          name: (t.name && t.name !== 'Unknown') ? (t.name || t.type || t.category || t.label) : (t.type || t.category || 'Other')
        }));
      }

      return data;
    }
    throw new Error(response.data.error || "Failed to fetch dispute report data");
  } catch (error) {
    console.error("Error fetching dispute report:", error);
    throw error;
  }
};

export interface BookingReportData {
  summaryData: { title: string; value: string; description: string }[];
  bookingVolume: { name: string; bookings: number }[];
  avgBookingValue: { name: string; value: number }[];
  modalityPopularity: { modality: string; sessions: number }[];
  durationDistribution: { length: string; count: number }[];
  formatBreakdown: { name: string; value: number; color: string }[];
  completionRate: { status: string; rate: number }[];
  topHealersByCount: { name: string; count: number; revenue: number; rating: number }[];
  topHealersByRevenue: { name: string; count: number; revenue: number; rating: number }[];
}

/**
 * Fetch booking report data from the backend
 */
export const getBookingReport = async (
  startDate?: string,
  endDate?: string,
  granularity?: string,
  range?: string
): Promise<BookingReportData> => {
  try {
    const response = await api.get("/api/admin/reports/bookings", {
      params: { startDate, endDate, granularity, range }
    });

    if (response.data.success) {
      const data = response.data.data;

      // Ensure top healers have names
      const fixHealerName = (h: any) => ({
        ...h,
        name: h.name || h.healerName || h.practitionerName || (h.healer as any)?.name || 'Unknown healer'
      });

      if (data.topHealersByCount) data.topHealersByCount = data.topHealersByCount.map(fixHealerName);
      if (data.topHealersByRevenue) data.topHealersByRevenue = data.topHealersByRevenue.map(fixHealerName);

      return data;
    }
    throw new Error(response.data.error || "Failed to fetch booking report data");
  } catch (error) {
    console.error("Error fetching booking report:", error);
    throw error;
  }
};
