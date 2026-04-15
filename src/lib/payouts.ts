import api from "@/lib/api";

export interface AdminHealerSearchResult {
  id: string;
  name: string;
  email: string;
  stripeStatus: "active" | "pending" | "restricted";
  stripeAccountId: string;
}

export const searchAdminHealers = async (query: string): Promise<AdminHealerSearchResult[]> => {
  const response = await api.get<{ success: boolean; results: AdminHealerSearchResult[] }>("/api/healers/admin-search", {
    params: { q: query },
  });

  return response.data.results || [];
};
