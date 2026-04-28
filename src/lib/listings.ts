import api from './api';

export type AdminListing = {
  id: string;
  source: 'session' | 'retreat';
  title: string;
  healerId: string | null;
  healerName: string;
  category: string;
  price: number;
  currency: string;
  status: 'Active' | 'Pending' | 'Rejected' | 'Hidden';
  rating: number;
  createdAt: string | null;
  featured: boolean;
  location?: string;
};

export type ListingFilters = {
  q?: string;
  status?: '' | 'Active' | 'Pending' | 'Rejected' | 'Hidden';
  source?: '' | 'session' | 'retreat';
};

export type AdminListingDetail = AdminListing & {
  healerEmail: string;
  description: string;
  durationMinutes: number;
  requiredInformation: string[];
  images: string[];
  revisionHistory: Array<Record<string, unknown>>;
  performance: {
    totalBookings: number;
    completionRate: number;
    totalRevenue: number;
  };
  recentBookings: Array<{
    id: string;
    amount: number;
    createdAt: string | null;
    sessionDate: string | null;
    status: string;
    seekerName: string | null;
    healerName: string | null;
  }>;
  rawListing?: Record<string, unknown>;
};

export async function fetchListings(filters: ListingFilters = {}) {
  const { data } = await api.get<{ success: boolean; results: AdminListing[] }>('/api/listings', {
    params: {
      q: filters.q || undefined,
      status: filters.status || undefined,
      source: filters.source || undefined,
    },
  });
  return data.results || [];
}

export async function fetchListingDetail(id: string, source: 'session' | 'retreat') {
  const { data } = await api.get<{ success: boolean; data: AdminListingDetail }>(`/api/listings/${id}`, {
    params: { source },
  });
  return data.data;
}

export async function updateListingStatus(id: string, source: 'session' | 'retreat', status: AdminListing['status']) {
  const { data } = await api.patch<{ success: boolean; data: { id: string; source: string; status: AdminListing['status']; updatedAt: string } }>(`/api/listings/${id}/status`, {
    source,
    status,
  });
  return data.data;
}
