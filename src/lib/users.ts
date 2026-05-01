import api from './api';

export type AdminHealer = {
  id: string;
  name: string;
  email: string;
  subscription: 'Free' | 'Premium';
  status: 'Active' | 'Suspended' | 'Pending';
  totalEarned: number;
  joinedDate: string | null;
  avatarUrl?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
};

export type AdminSeeker = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Suspended' | 'Pending';
  totalSpent: number;
  joinedDate: string | null;
  avatarUrl?: string;
  location?: string;
};

export type AdminBookingSummary = {
  id: string;
  listingId: string | null;
  title: string;
  status: string;
  amount: number;
  currency: string;
  sessionDate: string | null;
  createdAt: string | null;
  healerId: string | null;
  healerName: string | null;
  seekerId: string | null;
  seekerName: string | null;
};

export type AdminHealerDetail = AdminHealer & {
  role: 'healer';
  pendingPayout: number;
  bio: string;
  modalities: string[];
  languages: string[];
  stripeAccountId: string;
  stripeStatus: string;
  recentBookings: AdminBookingSummary[];
  rawProfile?: Record<string, unknown>;
};

export type AdminSeekerDetail = AdminSeeker & {
  role: 'seeker';
  sessionsBooked: number;
  retreatsAttended: number;
  bio: string;
  recentBookings: AdminBookingSummary[];
  rawProfile?: Record<string, unknown>;
};

export type UserListFilters = {
  q?: string;
  status?: '' | 'Active' | 'Suspended' | 'Pending';
  subscription?: '' | 'Free' | 'Premium';
};

export async function fetchHealers(filters: UserListFilters = {}) {
  const { data } = await api.get<{ success: boolean; results: AdminHealer[] }>('/api/users/healers', {
    params: {
      q: filters.q || undefined,
      status: filters.status || undefined,
      subscription: filters.subscription || undefined,
    },
  });
  return data.results || [];
}

export async function fetchHealerDetail(id: string) {
  const { data } = await api.get<{ success: boolean; data: AdminHealerDetail }>(`/api/users/healers/${id}`);
  return data.data;
}

export async function fetchSeekers(filters: UserListFilters = {}) {
  const { data } = await api.get<{ success: boolean; results: AdminSeeker[] }>('/api/users/seekers', {
    params: {
      q: filters.q || undefined,
      status: filters.status || undefined,
    },
  });
  return data.results || [];
}

export async function fetchSeekerDetail(id: string) {
  const { data } = await api.get<{ success: boolean; data: AdminSeekerDetail }>(`/api/users/seekers/${id}`);
  return data.data;
}

export async function updateHealerSuspension(id: string, suspended: boolean, reason?: string) {
  const { data } = await api.patch<{ success: boolean; data: { status: string; suspended: boolean; updatedAt: string; reason?: string | null } }>(`/api/users/healers/${id}/suspension`, {
    suspended,
    reason: reason || null,
  });
  return data.data;
}

export async function updateSeekerSuspension(id: string, suspended: boolean, reason?: string) {
  const { data } = await api.patch<{ success: boolean; data: { status: string; suspended: boolean; updatedAt: string; reason?: string | null } }>(`/api/users/seekers/${id}/suspension`, {
    suspended,
    reason: reason || null,
  });
  return data.data;
}
