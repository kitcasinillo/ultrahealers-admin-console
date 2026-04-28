import api from './api';

export type AdminBooking = {
  id: string;
  bookingType: 'session' | 'retreat';
  listingId: string | null;
  listingTitle: string;
  healerId: string | null;
  healerName: string;
  healerEmail: string;
  seekerId: string | null;
  seekerName: string;
  seekerEmail: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  status: 'created' | 'pending_confirmation' | 'confirmed' | 'completed' | string;
  sessionDate: string | null;
  sessionTime: string | null;
  format: string | null;
  modality: string | null;
  sessionLength: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type BookingFilters = {
  q?: string;
  status?: string;
  type?: '' | 'session' | 'retreat';
  paymentStatus?: string;
};

export type AdminBookingDetail = AdminBooking & {
  transcript: Array<Record<string, unknown>>;
  retreatRecord: Record<string, unknown> | null;
  rawBooking?: Record<string, unknown>;
};

export async function fetchBookings(filters: BookingFilters = {}) {
  const { data } = await api.get<{ success: boolean; results: AdminBooking[] }>('/api/admin/bookings', {
    params: {
      q: filters.q || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
      paymentStatus: filters.paymentStatus || undefined,
    },
  });
  return data.results || [];
}

export async function fetchBookingDetail(id: string) {
  const { data } = await api.get<{ success: boolean; data: AdminBookingDetail }>(`/api/admin/bookings/${id}`);
  return data.data;
}

export async function updateBookingStatus(id: string, status: string) {
  const { data } = await api.patch<{ success: boolean; data: { id: string; status: string; updatedAt: string } }>(`/api/admin/bookings/${id}/status`, {
    status,
  });
  return data.data;
}
