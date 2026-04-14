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
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') {
      const statuses = filters.status.split(',').filter(Boolean);
      if (statuses.length === 1) params.set('status', statuses[0]);
    }
    if (filters.type && filters.type !== 'all') {
      const types = filters.type.split(',').filter(Boolean);
      if (types.length === 1) params.set('type', types[0]);
    }
    if (filters.healerId) params.set('healerId', filters.healerId);
    if (filters.seekerId) params.set('seekerId', filters.seekerId);

    const endpoint = params.toString() ? `/api/disputes?${params.toString()}` : '/api/disputes';
    const response = await api.get<{ success: boolean; disputes: Array<Record<string, unknown>> }>(endpoint);
    let items: Dispute[] = (response.data.disputes || []).map((item) => {
      const submittedAt = typeof item.submittedAt === 'string' ? item.submittedAt : new Date().toISOString();
      const responseDueAt = typeof item.responseDueAt === 'string' ? item.responseDueAt : submittedAt;
      const status = (item.status as DisputeStatus) || 'open';
      const type = (item.type as DisputeType) || 'other';
      const severity = (item.severity as DisputeSeverity) || (type === 'safety' ? 'safety' : 'normal');
      const seekerName = typeof item.seekerName === 'string' ? item.seekerName : '';
      const healerName = typeof item.healerName === 'string' ? item.healerName : '';
      const isOverdue = (status === 'open' || status === 'in_review') && new Date(responseDueAt).getTime() < Date.now();

      return {
        id: String(item.id || ''),
        bookingId: String(item.bookingId || ''),
        seekerId: String(item.seekerId || ''),
        seekerName,
        healerId: String(item.healerId || ''),
        healerName,
        type,
        severity,
        status,
        requestedAmount: Number(item.requestedAmount || 0),
        currency: String(item.currency || 'USD'),
        submittedAt,
        responseDueAt,
        isOverdue,
        description: typeof item.description === 'string' ? item.description : undefined,
      };
    });

    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(d =>
        (d.id || '').toLowerCase().includes(s) ||
        (d.seekerName || '').toLowerCase().includes(s) ||
        (d.healerName || '').toLowerCase().includes(s) ||
        (d.description || '').toLowerCase().includes(s)
      );
    }

    if (filters.status && filters.status !== 'all') {
      const statuses = filters.status.split(',').filter(Boolean);
      if (statuses.length > 1) items = items.filter(d => statuses.includes(d.status));
    }

    if (filters.type && filters.type !== 'all') {
      const types = filters.type.split(',').filter(Boolean);
      if (types.length > 1) items = items.filter(d => types.includes(d.type));
    }

    if (filters.severity && filters.severity !== 'all') {
      items = items.filter(d => d.severity === filters.severity);
    }

    if (filters.overdue) {
      items = items.filter(d => d.isOverdue);
    }

    if (filters.dateFrom && filters.dateTo) {
      const from = new Date(filters.dateFrom);
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      items = items.filter(d => {
        const submittedDate = new Date(d.submittedAt);
        return submittedDate >= from && submittedDate <= to;
      });
    }

    const summary = {
      open: items.filter(d => d.status === 'open').length,
      safety: items.filter(d => d.severity === 'safety').length,
      overdue: items.filter(d => d.isOverdue).length,
      inReview: items.filter(d => d.status === 'in_review').length,
    };

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return { data: paginatedItems, total, page, limit, summary };
  } catch (error) {
    console.error('Failed to load disputes from backend:', error);
    return { data: [], total: 0, page: 1, limit: 50, summary: { open: 0, safety: 0, overdue: 0, inReview: 0 } };
  }
};

export const updateDisputeStatus = async (_id: string, _status: DisputeStatus): Promise<Dispute> => {
  throw new Error('Generic dispute status updates are not supported by the current backend.');
};

export const escalateDispute = async (_id: string): Promise<Dispute> => {
  throw new Error('Dispute escalation is not supported by the current backend.');
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
  const response = await api.get<{ success: boolean; dispute: Record<string, any> }>(`/api/disputes/${id}`);
  const d = response.data.dispute || {};

  const submittedAt = typeof d.submittedAt === 'string' ? d.submittedAt : new Date().toISOString();
  const responseDueAt = typeof d.responseDueAt === 'string' ? d.responseDueAt : submittedAt;
  const status = (d.status as DisputeStatus) || 'open';
  const type = (d.type as DisputeType) || 'other';
  const severity = (d.severity as DisputeSeverity) || (type === 'safety' ? 'safety' : 'normal');
  const isOverdue = (status === 'open' || status === 'in_review') && new Date(responseDueAt).getTime() < Date.now();

  const allEvidence: Evidence[] = Array.isArray(d.evidence)
    ? d.evidence.map((ev: any, idx: number) => ({
        id: String(ev.id || `ev-${idx}`),
        url: ev.url || '',
        filename: ev.filename || `evidence-${idx}`,
        fileType: ev.fileType || 'other',
        fileSize: Number(ev.fileSize || 0),
        uploadedBy: ev.party === 'healer' ? 'healer' : 'seeker',
        uploadedAt: ev.createdAt || submittedAt,
      }))
    : [];

  const seekerEvidence = allEvidence.filter((ev) => ev.uploadedBy === 'seeker');
  const healerEvidence = allEvidence.filter((ev) => ev.uploadedBy === 'healer');

  const timeline: TimelineEvent[] = [
    { step: 'submitted', completedAt: submittedAt, label: 'Dispute Submitted' },
    { step: 'healer_responded', completedAt: d.healerStatement ? d.updatedAt || submittedAt : null, label: 'Healer Responded' },
    { step: 'in_review', completedAt: status === 'in_review' || String(status).startsWith('resolved_') || status === 'denied' ? d.updatedAt || submittedAt : null, label: 'Moved to In Review' },
    { step: 'decision_rendered', completedAt: d.decision?.decidedAt || null, label: 'Decision Rendered' }
  ];

  return {
    id,
    bookingId: String(d.bookingId || ''),
    seekerId: String(d.seekerId || ''),
    seekerName: String(d.seekerName || d.seekerId || 'Unknown seeker'),
    healerId: String(d.healerId || ''),
    healerName: String(d.healerName || d.healerId || 'Unknown healer'),
    type,
    severity,
    status,
    requestedAmount: Number(d.requestedAmount || 0),
    currency: String(d.currency || 'USD'),
    submittedAt,
    responseDueAt,
    isOverdue,
    description: typeof d.description === 'string' ? d.description : undefined,
    seekerStatement: typeof d.description === 'string' && d.description.trim() ? d.description : 'No seeker statement was provided.',
    seekerEvidence,
    healerStatement: typeof d.healerStatement === 'string' && d.healerStatement.trim() ? d.healerStatement : null,
    healerEvidence,
    timeline,
    internalNotes: [],
    booking: {
      id: String(d.bookingId || 'Unknown booking'),
      listingId: String(d.bookingId || ''),
      listingTitle: 'Booking record lookup not yet available from backend',
      sessionDate: submittedAt,
      baseAmount: Number(d.requestedAmount || 0),
      currency: String(d.currency || 'USD'),
      paymentIntentId: d.payments?.paymentIntentId || null,
    },
    decision: d.decision ? {
      outcome: d.decision.outcome === 'refund' ? 'full_refund' : d.decision.outcome,
      refundAmount: d.decision.refundAmount,
      creditAmount: d.decision.creditAmount,
      adminNotes: d.decision.notes,
      renderedAt: d.decision.decidedAt || submittedAt,
      renderedBy: 'Admin',
    } : null,
  };
};

export const renderDecision = async (id: string, payload: DecisionPayload): Promise<DisputeDetail> => {
  await api.post(`/api/disputes/${id}/decision`, {
     outcome: payload.outcome,
     refundAmount: payload.refundAmount,
     creditAmount: payload.creditAmount,
     notes: payload.adminNotes
  });
  return await getDisputeById(id);
};

export const addInternalNote = async (_id: string, _note: string): Promise<InternalNote> => {
  throw new Error('Internal notes are not supported by the current backend.');
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
