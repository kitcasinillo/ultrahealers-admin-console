import api from './api';
import type { StatusType } from '../components/StatusBadge';

export interface RetreatFilters {
    status?: string[];
    search?: string;
    location?: string;
    startDateFrom?: string;
    startDateTo?: string;
    priceMin?: number;
    priceMax?: number;
    healerId?: string;
    page?: number;
    limit?: number;
}

export interface RetreatEnrollment {
    id: string;
    name: string;
    email: string;
    amount: number;
    date: string | null;
    status: string;
    bookingStatus: string;
}

export interface Retreat {
    id: string;
    hostId: string;
    hostName: string;
    hostAvatar?: string;
    hostEmail?: string;
    title: string;
    location: string;
    startDate: string | null;
    endDate: string | null;
    price: number;
    currency?: string;
    capacity: number;
    bookedSpots: number;
    status: StatusType | 'finished';
    revenue: number;
    imageUrl?: string;
    shortDescription?: string;
    longDescription?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    enrollments?: RetreatEnrollment[];
}

export interface UpdateRetreatFieldsPayload {
    title: string;
    location: string;
    price: number;
    capacity: number;
    startDate: string;
    endDate: string;
    shortDescription: string;
    longDescription: string;
}

export interface RetreatMessageAllPayload {
    subject: string;
    message: string;
}

export const getRetreats = async (filters: RetreatFilters) => {
    const response = await api.get('/api/retreats', {
        params: {
            status: filters.status?.join(',') || undefined,
            search: filters.search || undefined,
            location: filters.location || undefined,
            startDateFrom: filters.startDateFrom || undefined,
            startDateTo: filters.startDateTo || undefined,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            page: filters.page,
            limit: filters.limit,
        }
    });

    return {
        retreats: (response.data?.retreats || []) as Retreat[],
        summary: response.data?.summary || { total: 0, pending: 0, active: 0, finished: 0 },
    };
};

export const getRetreatById = async (id: string) => {
    const response = await api.get(`/api/retreats/${id}`);
    return response.data?.retreat as Retreat;
};

export const getRetreatEnrollments = async (id: string) => {
    const retreat = await getRetreatById(id);
    return retreat?.enrollments || [];
};

export const updateRetreatStatus = async (id: string, status: string) => {
    const response = await api.patch(`/api/retreats/${id}/status`, { status });
    return response.data;
};

export const approveRetreat = async (id: string) => {
    const response = await api.patch(`/api/retreats/${id}/approve`);
    return response.data;
};

export const updateRetreatFields = async (id: string, payload: UpdateRetreatFieldsPayload) => {
    const response = await api.patch(`/api/retreats/${id}`, payload);
    return response.data;
};

export const buildRetreatMessageAll = async (id: string, payload: RetreatMessageAllPayload) => {
    const response = await api.post(`/api/retreats/${id}/message-all`, payload);
    return response.data?.data;
};

export const deleteRetreat = async (id: string) => {
    const response = await api.delete(`/api/retreats/${id}`);
    return response.data;
};

export const exportRetreats = async (filters: RetreatFilters): Promise<Blob> => {
    const { retreats } = await getRetreats(filters);

    const statusLabels: Record<string, string> = {
        active: 'Active',
        inactive: 'Inactive',
        draft: 'Draft',
        full: 'Full',
        finished: 'Finished',
        pending_review: 'Pending Review'
    };

    const headers = [
        'Host/Healer', 'Title', 'Location', 'Dates', 'Price', 'Cap.', 'Booked Spots', 'Status', 'Revenue'
    ];

    const csvRows = [headers.join(',')];

    retreats.forEach((r) => {
        const start = r.startDate ? new Date(r.startDate) : null;
        const end = r.endDate ? new Date(r.endDate) : null;
        const formatDate = (date: Date | null) => date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
        const year = end && !Number.isNaN(end.getTime()) ? end.getFullYear() : '';
        const dateRange = `${formatDate(start)} - ${formatDate(end)}${year ? `, ${year}` : ''}`;
        const safePrice = Number.isFinite(Number(r.price)) ? Number(r.price) : 0;
        const safeCapacity = Number.isFinite(Number(r.capacity)) ? Number(r.capacity) : 0;
        const safeBooked = Number.isFinite(Number(r.bookedSpots)) ? Number(r.bookedSpots) : 0;
        const safeRevenue = Number.isFinite(Number(r.revenue)) ? Number(r.revenue) : 0;

        const row = [
            `"${r.hostName || ''}"`,
            `"${r.title || ''}"`,
            `"${r.location || ''}"`,
            `"${dateRange}"`,
            `"${new Intl.NumberFormat('en-US', { style: 'currency', currency: r.currency || 'USD', maximumFractionDigits: 0 }).format(safePrice)}"`,
            `"${safeCapacity}"`,
            `"${safeBooked} / ${safeCapacity}"`,
            `"${statusLabels[r.status] || r.status}"`,
            `"${new Intl.NumberFormat('en-US', { style: 'currency', currency: r.currency || 'USD', maximumFractionDigits: 0 }).format(safeRevenue)}"`,
        ];
        csvRows.push(row.join(','));
    });

    return new Blob([csvRows.join('\n')], { type: 'text/csv' });
};
