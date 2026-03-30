import api from "./api";

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

export const getRetreats = async (filters: RetreatFilters) => {
    try {
        // Fetch from the mock JSON file in the public folder
        const response = await fetch("/data/retreat.json");
        const mockRetreats = await response.json();
        
        const fullDataset = [...mockRetreats];

        // Calculate summary from FULL dataset
        const summary = {
            total: fullDataset.length,
            pending: fullDataset.filter(r => r.status === 'pending_review').length,
            active: fullDataset.filter(r => r.status === 'active').length,
        };

        let retreats = [...fullDataset];

        // Apply filters locally on the mock data
        if (filters.status && filters.status.length > 0) {
            retreats = retreats.filter(r => filters.status?.includes(r.status));
        }

        if (filters.search) {
            const s = filters.search.toLowerCase();
            retreats = retreats.filter(r => 
                r.title.toLowerCase().includes(s) || 
                r.location.toLowerCase().includes(s) ||
                r.hostName.toLowerCase().includes(s)
            );
        }

        if (filters.location) {
            const loc = filters.location.toLowerCase();
            retreats = retreats.filter(r => r.location.toLowerCase().includes(loc));
        }

        if (filters.priceMin !== undefined) {
            retreats = retreats.filter(r => (r.price || 0) >= filters.priceMin!);
        }

        if (filters.priceMax !== undefined) {
            retreats = retreats.filter(r => (r.price || 0) <= filters.priceMax!);
        }

        if (filters.startDateFrom) {
            retreats = retreats.filter(r => new Date(r.startDate) >= new Date(filters.startDateFrom!));
        }

        if (filters.startDateTo) {
            retreats = retreats.filter(r => new Date(r.startDate) <= new Date(filters.startDateTo!));
        }

        return { retreats, summary };
    } catch (error) {
        console.error("Failed to load mock data from retreat.json:", error);
        return { retreats: [], summary: { total: 0, pending: 0, active: 0 } };
    }
};

export const getRetreatById = async (id: string) => {
    const { retreats } = await getRetreats({});
    const retreat = retreats.find((r: any) => r.id === id);
    if (!retreat) throw new Error("Mock retreat not found");
    return retreat;
};

export const getRetreatEnrollments = async (id: string) => {
    const response = await api.get(`/api/retreats/${id}/enrollments`);
    return response.data.enrollments || [];
};

export const updateRetreatStatus = async (id: string, status: string) => {
    const response = await api.patch(`/api/retreats/${id}/status`, { status });
    return response.data;
};

export const approveRetreat = async (id: string) => {
    const response = await api.patch(`/api/retreats/${id}/approve`);
    return response.data;
};

export const deleteRetreat = async (id: string) => {
    const response = await api.delete(`/api/retreats/${id}`);
    return response.data;
};

export const exportRetreats = async (filters: RetreatFilters): Promise<Blob> => {
    const { retreats } = await getRetreats(filters);
    
    const statusLabels: Record<string, string> = {
        active: "Active",
        inactive: "Inactive",
        draft: "Draft",
        full: "Full",
        pending_review: "Pending Review"
    };

    const headers = [
        'Host/Healer', 'Title', 'Location', 'Dates', 'Price', 'Cap.', 'Booked Spots', 'Status', 'Revenue'
    ];
    
    const csvRows = [headers.join(',')];
    
    retreats.forEach((r: any) => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dateRange = `${formatDate(start)} - ${formatDate(end)}, ${end.getFullYear()}`;

        const row = [
            `"${r.hostName}"`,
            `"${r.title}"`,
            `"${r.location}"`,
            `"${dateRange}"`,
            `"${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(r.price || 0)}"`,
            `"${r.capacity || 0}"`,
            `" ${r.bookedSpots || 0} / ${r.capacity || 0}"`,
            `"${statusLabels[r.status] || r.status}"`,
            `"${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(r.revenue || 0)}"`,
        ];
        csvRows.push(row.join(','));
    });
    
    return new Blob([csvRows.join('\n')], { type: 'text/csv' });
};
