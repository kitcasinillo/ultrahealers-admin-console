import api from "./api";

export type FeedbackCategory = "feature_request" | "improvement" | "bug_report" | "general";
export type FeedbackImpact = "nice_to_have" | "important" | "critical";
export type FeedbackStatus =
  | "new"
  | "under_review"
  | "planned"
  | "in_progress"
  | "completed"
  | "declined";

export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  impact: FeedbackImpact;
  appSource: string;
  promptSource: string;
  pageUrl: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  userRole: "seeker" | "healer" | "guest";
  status: FeedbackStatus;
  adminNotes: string;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSummary {
  new: number;
  underReview: number;
  planned: number;
  inProgress: number;
  completed: number;
  total: number;
}

export interface FeedbackFilters {
  status?: string;
  category?: string;
  appSource?: string;
  userRole?: string;
  impact?: string;
  search?: string;
}

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  feature_request: "Feature Request",
  improvement: "Improvement",
  bug_report: "Bug Report",
  general: "General",
};

export const FEEDBACK_IMPACT_LABELS: Record<FeedbackImpact, string> = {
  nice_to_have: "Nice to have",
  important: "Important",
  critical: "Critical",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "New",
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  declined: "Declined",
};

export const FEEDBACK_UPDATED_EVENT = "uh:feedback-updated";

export const notifyFeedbackUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FEEDBACK_UPDATED_EVENT));
  }
};

export async function getFeedbackList(filters: FeedbackFilters = {}): Promise<{
  items: FeedbackItem[];
  total: number;
  summary: FeedbackSummary;
}> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.appSource && filters.appSource !== "all") params.set("appSource", filters.appSource);
  if (filters.userRole && filters.userRole !== "all") params.set("userRole", filters.userRole);
  if (filters.impact && filters.impact !== "all") params.set("impact", filters.impact);
  if (filters.search && filters.search.trim()) params.set("search", filters.search.trim());

  const queryStr = params.toString();
  const endpoint = queryStr ? `/api/feedback?${queryStr}` : "/api/feedback";
  const response = await api.get<{
    success: boolean;
    items: FeedbackItem[];
    total: number;
    summary: FeedbackSummary;
  }>(endpoint);

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    summary: response.data?.summary || {
      new: 0,
      underReview: 0,
      planned: 0,
      inProgress: 0,
      completed: 0,
      total: 0,
    },
  };
}

export async function hasNewFeedback(): Promise<boolean> {
  try {
    const response = await api.get<{ success: boolean; hasNew: boolean; newCount: number }>(
      "/api/feedback/summary"
    );
    return Boolean(response.data?.hasNew);
  } catch (error) {
    console.error("Failed to check new feedback:", error);
    return false;
  }
}

export async function updateFeedback(
  id: string,
  payload: {
    status?: FeedbackStatus;
    impact?: FeedbackImpact;
    adminNotes?: string;
    reviewedBy?: string;
    notifyUser?: boolean;
    resolutionMessage?: string;
  }
): Promise<{ feedback: FeedbackItem; emailSent?: boolean; emailError?: string | null }> {
  const response = await api.patch<{
    success: boolean;
    feedback: FeedbackItem;
    emailSent?: boolean;
    emailError?: string | null;
  }>(
    `/api/feedback/${id}`,
    payload
  );
  notifyFeedbackUpdated();
  return {
    feedback: response.data.feedback,
    emailSent: response.data.emailSent,
    emailError: response.data.emailError,
  };
}

export async function deleteFeedback(id: string): Promise<void> {
  await api.delete(`/api/feedback/${id}`);
  notifyFeedbackUpdated();
}

export async function sendFeedbackPrompt(payload: {
  recipientEmail: string;
  recipientName?: string;
  userRole?: "seeker" | "healer" | "retreat";
  customMessage?: string;
  sentBy?: string;
  force?: boolean;
}): Promise<{ success: boolean; message: string; feedbackLink?: string }> {
  const response = await api.post<{ success: boolean; message: string; feedbackLink?: string }>(
    "/api/feedback/send-prompt",
    payload
  );
  return response.data;
}

export function exportFeedbackCsv(items: FeedbackItem[]): Blob {
  const headers = [
    "ID",
    "Date",
    "Category",
    "Impact",
    "Status",
    "Title",
    "Description",
    "User Name",
    "User Email",
    "Role",
    "App Source",
    "Prompt Source",
    "Page",
    "Admin Notes",
  ];

  const escapeCsv = (val: string | null | undefined) =>
    `"${String(val || "").replace(/"/g, '""')}"`;

  const rows = [headers.join(",")];
  for (const item of items) {
    rows.push(
      [
        escapeCsv(item.id),
        escapeCsv(new Date(item.createdAt).toLocaleString()),
        escapeCsv(FEEDBACK_CATEGORY_LABELS[item.category] || item.category),
        escapeCsv(FEEDBACK_IMPACT_LABELS[item.impact] || item.impact),
        escapeCsv(FEEDBACK_STATUS_LABELS[item.status] || item.status),
        escapeCsv(item.title),
        escapeCsv(item.description),
        escapeCsv(item.userName),
        escapeCsv(item.userEmail),
        escapeCsv(item.userRole),
        escapeCsv(item.appSource),
        escapeCsv(item.promptSource),
        escapeCsv(item.pageUrl),
        escapeCsv(item.adminNotes),
      ].join(",")
    );
  }

  return new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
}
