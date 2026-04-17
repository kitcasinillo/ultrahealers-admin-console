import api from "@/lib/api";

export interface AdminHealerSearchResult {
  id: string;
  name: string;
  email: string;
  stripeStatus: "active" | "pending" | "restricted";
  stripeAccountId: string;
}

export interface PayoutBalanceResponse {
  accountId: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  available: Record<string, number>;
  pending: Record<string, number>;
}

export interface StripePayoutHistoryItem {
  id: string;
  amount: number;
  currency: string;
  arrival_date?: number;
  created?: number;
  status: "paid" | "pending" | "in_transit" | "canceled" | "failed";
}

export interface CreatePayoutPayload {
  healerId: string;
  amountCents: number;
  currency?: string;
}

export interface CreatePayoutResponse {
  payoutId: string;
  status: string;
}

export const searchAdminHealers = async (query: string): Promise<AdminHealerSearchResult[]> => {
  const response = await api.get<{ success: boolean; results: AdminHealerSearchResult[] }>("/api/healers/admin-search", {
    params: { q: query },
  });

  return response.data.results || [];
};

export const getHealerPayoutBalance = async (healerId: string): Promise<PayoutBalanceResponse> => {
  const response = await api.get<{ success: boolean } & PayoutBalanceResponse>(`/api/payouts/balance/${healerId}`);
  return response.data;
};

export const getHealerPayoutHistory = async (healerId: string): Promise<StripePayoutHistoryItem[]> => {
  const response = await api.get<{ success: boolean; payouts: StripePayoutHistoryItem[] }>(`/api/payouts/history/${healerId}`);
  return response.data.payouts || [];
};

export const createPayout = async (payload: CreatePayoutPayload): Promise<CreatePayoutResponse> => {
  const response = await api.post<{ success: boolean } & CreatePayoutResponse>("/api/payouts/create", payload);
  return response.data;
};
