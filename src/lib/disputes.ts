import api from "./api";
import { rtdb } from "./firebase";
import { ref, get, query } from "firebase/database";

export type DisputeType = 
  'no_show' | 'quality' | 'safety' | 'refund_request' | 'other';

export type DisputeSeverity = 'normal' | 'safety';

export type DisputeStatus = 
  'open' | 'in_review' | 'resolved_refunded' | 
  'resolved_partial_refund' | 'resolved_credit' | 'denied';

export interface Dispute {
  id: string;
  bookingId: string;
  seekerId: string;
  seekerName: string;
  healerId: string;
  healerName: string;
  type: DisputeType;
  severity: DisputeSeverity;
  status: DisputeStatus;
  requestedAmount: number;
  currency: string;
  submittedAt: string;       // ISO date string
  responseDueAt: string;     // ISO date string
  isOverdue: boolean;        // computed or returned by API
  description?: string;
}

export interface Evidence {
  id: string;
  url: string;
  filename: string;
  fileType: string;   // 'image' | 'pdf' | 'doc' | 'other'
  fileSize: number;   // bytes
  uploadedBy: 'seeker' | 'healer';
  uploadedAt: string;
}

export interface TimelineEvent {
  step: 'submitted' | 'healer_responded' | 
        'in_review' | 'decision_rendered';
  completedAt: string | null;
  label: string;
}

export interface InternalNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: string;
}

export interface DecisionPayload {
  outcome: 'full_refund' | 'partial_refund' | 'credit' | 'deny';
  refundAmount?: number;
  creditAmount?: number;
  adminNotes?: string;
}

export interface DisputeDetail extends Dispute {
  seekerStatement: string;
  seekerEvidence: Evidence[];
  healerStatement: string | null;
  healerEvidence: Evidence[];
  timeline: TimelineEvent[];
  internalNotes: InternalNote[];
  booking: {
    id: string;
    listingId: string;
    listingTitle: string;
    sessionDate: string;
    baseAmount: number;
    currency: string;
    paymentIntentId: string | null;
  };
  decision: (DecisionPayload & { renderedAt: string; renderedBy: string; }) | null;
}

export interface GetDisputesFilters {
  status?: string;
  type?: string;
  severity?: string;
  overdue?: boolean;
  healerId?: string;
  seekerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetDisputesResponse {
  data: Dispute[];
  total: number;
  page: number;
  limit: number;
  summary?: {
    open: number;
    safety: number;
    overdue: number;
    inReview: number;
  }
}

export const getDisputes = async (filters: GetDisputesFilters): Promise<GetDisputesResponse> => {
  try {
    // Fetch from the mock JSON file in the public folder
    const response = await fetch("/data/dispute.json");
    const mockDisputes = await response.json();
    
    let items: Dispute[] = [...mockDisputes];

    // Apply Overdue logic to ALL items before filtering (for correct sumary counts)
    items = items.map(d => {
      let isOverdue = false;
      if (d.responseDueAt && (d.status === 'open' || d.status === 'in_review')) {
        isOverdue = new Date(d.responseDueAt).getTime() < Date.now();
      }
      return { ...d, isOverdue };
    });

    // Summary logic for dashboard badges (Calculated from FULL dataset)
    const summary = {
      open: items.filter(d => d.status === 'open').length,
      safety: items.filter(d => d.severity === 'safety').length,
      overdue: items.filter(d => d.isOverdue).length,
      inReview: items.filter(d => d.status === 'in_review').length,
    };

    // --- APPLY FILTERS ---
    if (filters.status && filters.status !== 'all') {
      const statuses = filters.status.split(',').filter(Boolean);
      items = items.filter(d => statuses.includes(d.status));
    }

    if (filters.type && filters.type !== 'all') {
      const types = filters.type.split(',').filter(Boolean);
      items = items.filter(d => types.includes(d.type));
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(d => 
        (d.id || '').toLowerCase().includes(s) || 
        (d.seekerName || '').toLowerCase().includes(s) || 
        (d.healerName || '').toLowerCase().includes(s) ||
        (d.description || '').toLowerCase().includes(s)
      );
    }

    if (filters.severity && filters.severity !== 'all') {
      items = items.filter(d => d.severity === filters.severity);
    }

    if (filters.overdue) {
      items = items.filter(d => d.isOverdue);
    }

    if (filters.healerId) {
      const s = filters.healerId.toLowerCase();
      items = items.filter(d => 
        (d.healerId || '').toLowerCase().includes(s) || 
        (d.healerName || '').toLowerCase().includes(s)
      );
    }

    if (filters.seekerId) {
      const s = filters.seekerId.toLowerCase();
      items = items.filter(d => 
        (d.seekerId || '').toLowerCase().includes(s) || 
        (d.seekerName || '').toLowerCase().includes(s)
      );
    }

    // Apply Date Range (Only if BOTH are provided)
    if (filters.dateFrom && filters.dateTo) {
      const from = new Date(filters.dateFrom);
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      items = items.filter(d => {
        const submittedDate = new Date(d.submittedAt);
        return submittedDate >= from && submittedDate <= to;
      });
    }

    // Pagination (Simple local implementation)
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      total,
      page,
      limit,
      summary
    };
  } catch (error) {
    console.error("Failed to load mock disputes from dispute.json:", error);
    return { data: [], total: 0, page: 1, limit: 50, summary: { open: 0, safety: 0, overdue: 0, inReview: 0 } };
  }
};

export const updateDisputeStatus = async (id: string, status: DisputeStatus): Promise<Dispute> => {
  // backend currently handles responses/decisions via specific endpoints (decide, respond)
  // this generic status update is a placeholder for admin use
  console.warn("Status update is local-only as backend doesn't have a generic patch endpoint.");
  return { id, status } as Dispute;
};

export const escalateDispute = async (id: string): Promise<Dispute> => {
  console.warn("Mocking escalateDispute: Updating local state to safety.");
  const detail = await getDisputeById(id);
  return { ...detail, severity: 'safety' };
};

export const sendDisputeEmail = async (id: string): Promise<void> => {
  // Use existing notify-email route
  await api.post(`/api/disputes/${id}/notify-email`);
};

const typeLabels: Record<string, string> = {
  no_show: "No Show",
  quality: "Quality",
  safety: "Safety",
  refund_request: "Refund Request",
  other: "Other"
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_review: "In Review",
  resolved_refunded: "Resolved (Refunded)",
  resolved_partial_refund: "Resolved (Partial)",
  resolved_credit: "Resolved (Credit)",
  denied: "Denied",
};

export const exportDisputes = async (filters: GetDisputesFilters): Promise<Blob> => {
  const res = await getDisputes({ ...filters, limit: 10000, page: 1 });
  const disputes = res.data;
  const headers = [
    'Dispute ID', 'Type', 'Severity', 'Booking', 'Seeker', 'Healer', 'Amount', 'Status', 'Submitted At', 'Response Due'
  ];
  
  const csvRows = [headers.join(',')];
  
  disputes.forEach(d => {
    // Format amount
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: d.currency || "USD",
    }).format(d.requestedAmount || 0);

    // Format dates
    const formatDate = (isoStr: string) => {
      if (!isoStr) return '';
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const row = [
      d.id,
      typeLabels[d.type] || d.type,
      d.severity === 'safety' ? 'Safety' : 'Normal',
      d.bookingId,
      `"${d.seekerName || ''}"`,
      `"${d.healerName || ''}"`,
      `"${formattedAmount}"`,
      statusLabels[d.status] || d.status,
      `"${formatDate(d.submittedAt)}"`,
      `"${formatDate(d.responseDueAt)}"`
    ];
    csvRows.push(row.join(','));
  });
  
  return new Blob([csvRows.join('\n')], { type: 'text/csv' });
};

export const getDisputeById = async (id: string): Promise<DisputeDetail> => {
  const res = await getDisputes({ limit: 1000 });
  const baseDispute = res.data.find(d => d.id === id);
  if (!baseDispute) throw new Error("Mock dispute not found");
  const d = { ...baseDispute } as any;

  d.isOverdue = false;
  if (d.responseDueAt && (d.status === 'open' || d.status === 'in_review')) {
    d.isOverdue = new Date(d.responseDueAt).getTime() < Date.now();
  }

  // --- MOCKING EXTENDED FIELDS for UI (as backend schema lacks relations) ---
  const bookingData = {
    id: d.bookingId || "B-UNKNOWN",
    listingId: "L-101",
    listingTitle: "Spiritual Healing Session",
    sessionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    baseAmount: d.requestedAmount || 150,
    currency: d.currency || "USD",
    paymentIntentId: "pi_1234567890"
  };

  const timeline: TimelineEvent[] = [
    { step: 'submitted', completedAt: d.submittedAt || new Date().toISOString(), label: 'Dispute Submitted' },
    { step: 'healer_responded', completedAt: d.healerStatement ? new Date().toISOString() : null, label: 'Healer Responded' },
    { step: 'in_review', completedAt: d.status === 'in_review' ? new Date().toISOString() : null, label: 'Moved to In Review' },
    { step: 'decision_rendered', completedAt: d.decision ? (d.decision.decidedAt || new Date().toISOString()) : null, label: 'Decision Rendered' }
  ];

  let seekerEvidence: Evidence[] = [];
  let healerEvidence: Evidence[] = [];
  
  if (Array.isArray(d.evidence) && d.evidence.length > 0) {
     d.evidence.forEach((ev: any, idx: number) => {
         const e = {
             id: `ev-${idx}`,
             url: ev.url || 'https://placehold.co/400',
             filename: ev.filename || `evidence-${idx}.jpg`,
             fileType: ev.fileType || 'image',
             fileSize: ev.fileSize || 102400,
             uploadedBy: ev.party || 'seeker',
             uploadedAt: ev.createdAt || new Date().toISOString()
         } as Evidence;
         if (e.uploadedBy === 'seeker') seekerEvidence.push(e);
         else healerEvidence.push(e);
     });
  } else {
      // Mock Seeker Evidence if empty to demonstrate functionality natively
      seekerEvidence.push({
        id: "mock-ev-1", url: "https://placehold.co/600x400/FF5733/FFF?text=Evidence+A",
        filename: "screenshot_chat.jpg", fileType: "image", fileSize: 450000, 
        uploadedBy: "seeker", uploadedAt: d.submittedAt
      });
  }

  const detail: DisputeDetail = {
    ...d,
    id: id,
    seekerStatement: d.description || "I was very unhappy with the session. The healer did not show up on time and the connection was poor.",
    seekerEvidence,
    healerStatement: d.healerStatement || null,
    healerEvidence,
    timeline,
    internalNotes: [
      {
         id: "n1",
         adminId: "A-001",
         adminName: "System Admin",
         note: "Reviewing the attached evidence. Will reach out to healer today.",
         createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    booking: bookingData,
    decision: d.decision ? {
        outcome: d.decision.outcome || 'full_refund',
        refundAmount: d.decision.refundAmount,
        creditAmount: d.decision.creditAmount,
        adminNotes: d.decision.notes,
        renderedAt: d.decision.decidedAt || new Date().toISOString(),
        renderedBy: "Admin User",
    } : null
  };

  return detail;
};

export const renderDecision = async (id: string, payload: DecisionPayload): Promise<DisputeDetail> => {
  // In a real app, this is the trigger that fires the n8n event and emails both parties
  await api.post(`/api/disputes/${id}/decision`, {
     outcome: payload.outcome,
     refundAmount: payload.refundAmount,
     creditAmount: payload.creditAmount,
     notes: payload.adminNotes
  }).catch(() => {
     console.warn("Backend decision endpoint failed or not present. Simulating success in mock mode.");
  });

  const base = await getDisputeById(id);
  return {
      ...base,
      status: payload.outcome === 'deny' ? 'denied' : (payload.outcome === 'credit' ? 'resolved_credit' : (payload.outcome === 'partial_refund' ? 'resolved_partial_refund' : 'resolved_refunded')),
      decision: {
          ...payload,
          renderedAt: new Date().toISOString(),
          renderedBy: "Admin Investigator",
      }
  };
};

export const addInternalNote = async (_id: string, note: string): Promise<InternalNote> => {
  console.warn("Mocking addInternalNote: Route does not exist to adhere to user constraints.");
  await new Promise(r => setTimeout(r, 600));
  return {
    id: "n-" + Math.random().toString(36).substring(7),
    adminId: "A-CURRENT",
    adminName: "Current Admin",
    note,
    createdAt: new Date().toISOString()
  };
};

export const getChatTranscript = async (bookingId: string) => {
  const chatRef = ref(rtdb, `chats/${bookingId}/messages`);
  const snapshot = await get(query(chatRef));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const messages = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })).sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
    return messages;
  }
  return []; 
};
