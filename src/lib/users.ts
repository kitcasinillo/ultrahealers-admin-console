import api from './api';

export type AdminHealer = {
  id: string;
  name: string;
  email: string;
  subscription: 'Free' | 'Premium';
  status: 'Active' | 'Suspended' | 'Pending' | 'Deleted';
  verified?: boolean;
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
  status: 'Active' | 'Suspended' | 'Pending' | 'Deleted';
  verified?: boolean;
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

export type HealerCredential = {
  type?: string;
  title?: string;
  name?: string;
  organization?: string;
  issuer?: string;
  credentialId?: string;
  licenseNumber?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  noExpiration?: boolean;
  file?: string | null;
  url?: string | null;
  documentUrl?: string | null;
  fileName?: string | null;
};

export type HealerExperience = {
  yearsOfExperience?: string | number;
  recentWorkshops?: string;
  cpdHours?: string | number;
  [key: string]: unknown;
};

export type AdminHealerDetail = AdminHealer & {
  role: 'healer';
  pendingPayout: number;
  bio: string;
  modalities: string[];
  languages: string[];
  credentials?: HealerCredential[];
  licenses?: HealerCredential[];
  education?: Array<Record<string, unknown>>;
  experience?: HealerExperience | Array<Record<string, unknown>> | null;
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
  status?: '' | 'Active' | 'Suspended' | 'Pending' | 'Deleted';
  subscription?: '' | 'Free' | 'Premium';
  startDate?: string;
  endDate?: string;
};

export type UsersResponse<T> = {
  results: T[];
  totalCountInRange: number;
  newSignupsInRange: number;
};

export async function fetchHealers(filters: UserListFilters = {}): Promise<UsersResponse<AdminHealer>> {
  const { data } = await api.get<{ success: boolean; results: AdminHealer[]; totalCountInRange: number; newSignupsInRange: number }>('/api/users/healers', {
    params: {
      q: filters.q || undefined,
      status: filters.status || undefined,
      subscription: filters.subscription || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    },
  });
  return {
    results: data.results || [],
    totalCountInRange: data.totalCountInRange || 0,
    newSignupsInRange: data.newSignupsInRange || 0,
  };
}

export async function fetchHealerDetail(id: string) {
  const { data } = await api.get<{ success: boolean; data: AdminHealerDetail }>(`/api/users/healers/${id}`);
  return data.data;
}

export async function fetchSeekers(filters: UserListFilters = {}): Promise<UsersResponse<AdminSeeker>> {
  const { data } = await api.get<{ success: boolean; results: AdminSeeker[]; totalCountInRange: number; newSignupsInRange: number }>('/api/users/seekers', {
    params: {
      q: filters.q || undefined,
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    },
  });
  return {
    results: data.results || [],
    totalCountInRange: data.totalCountInRange || 0,
    newSignupsInRange: data.newSignupsInRange || 0,
  };
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

export async function updateHealerSoftDelete(id: string, deleted: boolean, reason?: string) {
  const { data } = await api.patch<{ success: boolean; data: { status: string; deleted: boolean; updatedAt: string; reason?: string | null } }>(`/api/users/healers/${id}/soft-delete`, {
    deleted,
    reason: reason || null,
  });
  return data.data;
}

export async function updateSeekerSoftDelete(id: string, deleted: boolean, reason?: string) {
  const { data } = await api.patch<{ success: boolean; data: { status: string; deleted: boolean; updatedAt: string; reason?: string | null } }>(`/api/users/seekers/${id}/soft-delete`, {
    deleted,
    reason: reason || null,
  });
  return data.data;
}

export type VerificationUpdateResult = {
  id: string;
  role: 'healer' | 'seeker';
  verified: boolean;
  verificationStatus: 'verified' | 'unverified';
  reason?: string | null;
  authSynced: boolean;
  updatedAt: string;
};

export async function updateHealerVerification(id: string, verified: boolean, reason?: string) {
  const { data } = await api.patch<{ success: boolean; data: VerificationUpdateResult }>(`/api/users/healers/${id}/verification`, {
    verified,
    reason: reason || null,
  });
  return data.data;
}

export async function updateSeekerVerification(id: string, verified: boolean, reason?: string) {
  const { data } = await api.patch<{ success: boolean; data: VerificationUpdateResult }>(`/api/users/seekers/${id}/verification`, {
    verified,
    reason: reason || null,
  });
  return data.data;
}

export type PermanentDeleteResult = {
  id: string;
  role: 'healer' | 'seeker';
  accountDeleted?: boolean;
  remainingRoles?: string[];
  deletedListings: number;
  deletedRetreats: number;
  authDeleted: boolean;
  deletedAt: string;
};

export async function permanentDeleteHealer(id: string) {
  const { data } = await api.delete<{ success: boolean; data: PermanentDeleteResult }>(`/api/users/healers/${id}/permanent`);
  return data.data;
}

export async function permanentDeleteSeeker(id: string) {
  const { data } = await api.delete<{ success: boolean; data: PermanentDeleteResult }>(`/api/users/seekers/${id}/permanent`);
  return data.data;
}
