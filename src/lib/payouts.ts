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
