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
  startDate?: string;
  endDate?: string;
};

export const BOOKING_STATUS_OPTIONS = [
  { value: 'created', label: 'Created', dotClass: 'bg-slate-400' },
  { value: 'pending_confirmation', label: 'Pending Confirmation', dotClass: 'bg-amber-500' },
  { value: 'confirmed', label: 'Confirmed', dotClass: 'bg-[#4318FF]' },
  { value: 'completed', label: 'Completed', dotClass: 'bg-emerald-500' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'succeeded', label: 'Succeeded', dotClass: 'bg-emerald-500' },
  { value: 'pending', label: 'Pending', dotClass: 'bg-amber-500' },
  { value: 'failed', label: 'Failed', dotClass: 'bg-red-500' },
] as const;

const toTitleCase = (value: string) =>
  value
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

export function formatBookingStatus(status?: string | null): string {
  if (!status) return 'Unknown';
  const match = BOOKING_STATUS_OPTIONS.find((opt) => opt.value === status);
  if (match) return match.label;
  if (status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'canceled') return 'Cancelled';
  return toTitleCase(status);
}

export function formatPaymentStatus(paymentStatus?: string | null): string {
  if (!paymentStatus) return 'Unknown';
  const match = PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === paymentStatus);
  if (match) return match.label;
  return toTitleCase(paymentStatus);
}

export function formatBookingType(bookingType?: string | null): string {
  if (!bookingType) return 'Session';
  return bookingType.toLowerCase() === 'retreat' ? 'Retreat' : 'Session';
}

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
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
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

export async function deleteBooking(id: string) {
  const { data } = await api.delete<{ success: boolean; data: { id: string; deleted: boolean } }>(`/api/admin/bookings/${id}`);
  return data.data;
}
