import api from "./api";

export type RedFlagSeverity = "low" | "medium" | "high";
export type RedFlagStatus = "open" | "reviewed" | "dismissed" | "action_taken";
export type RedFlagCategory =
  | "off_platform_payment"
  | "phone"
  | "email"
  | "url"
  | "social_handle";

export interface RedFlagMatch {
  category: RedFlagCategory | string;
  label: string;
  match: string;
}

export interface RedFlagAlert {
  id: string;
  bookingId: string;
  messageId: string | null;
  text: string;
  senderId: string;
  senderName: string;
  senderType: "seeker" | "healer";
  receiverId: string | null;
  receiverName: string | null;
  bookingPaymentStatus: string | null;
  severity: RedFlagSeverity;
  categories: string[];
  matches: RedFlagMatch[];
  status: RedFlagStatus;
  adminNotes: string;
  actionTaken: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RedFlagSummary {
  open: number;
  highSeverity: number;
  total: number;
  resolved: number;
}

export interface RedFlagFilters {
  status?: string;
  severity?: string;
  category?: string;
  senderType?: string;
  search?: string;
}

export const RED_FLAG_CATEGORY_LABELS: Record<string, string> = {
  off_platform_payment: "Off-Platform Payment",
  phone: "Phone Number",
  email: "Email Address",
  url: "External Link",
  social_handle: "Social / Off-Platform",
};

export const RED_FLAG_STATUS_LABELS: Record<RedFlagStatus, string> = {
  open: "Open",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
  action_taken: "Action Taken",
};

export const RED_FLAGS_UPDATED_EVENT = "uh:red-flags-updated";

export const notifyRedFlagsUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(RED_FLAGS_UPDATED_EVENT));
  }
};

export async function getRedFlags(filters: RedFlagFilters = {}): Promise<{
  alerts: RedFlagAlert[];
  total: number;
  summary: RedFlagSummary;
}> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.severity && filters.severity !== "all") params.set("severity", filters.severity);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.senderType && filters.senderType !== "all") params.set("senderType", filters.senderType);
  if (filters.search && filters.search.trim()) params.set("search", filters.search.trim());

  const queryStr = params.toString();
  const endpoint = queryStr ? `/api/moderation/red-flags?${queryStr}` : "/api/moderation/red-flags";
  const response = await api.get<{
    success: boolean;
    alerts: RedFlagAlert[];
    total: number;
    summary: RedFlagSummary;
  }>(endpoint);

  return {
    alerts: response.data?.alerts || [],
    total: response.data?.total || 0,
    summary: response.data?.summary || { open: 0, highSeverity: 0, total: 0, resolved: 0 },
  };
}

export async function hasOpenRedFlags(): Promise<boolean> {
  try {
    const response = await api.get<{ success: boolean; hasOpen: boolean; openCount: number }>(
      "/api/moderation/red-flags/summary"
    );
    return Boolean(response.data?.hasOpen);
  } catch (error) {
    console.error("Failed to check open red flags:", error);
    return false;
  }
}

export async function updateRedFlag(
  id: string,
  payload: {
    status?: RedFlagStatus;
    adminNotes?: string;
    actionTaken?: "none" | "warned_user" | "suspended_user" | "dismissed_false_positive";
    reviewedBy?: string;
  }
): Promise<RedFlagAlert> {
  const response = await api.patch<{ success: boolean; alert: RedFlagAlert }>(
    `/api/moderation/red-flags/${id}`,
    payload
  );
  notifyRedFlagsUpdated();
  return response.data.alert;
}

export async function deleteRedFlag(id: string): Promise<void> {
  await api.delete(`/api/moderation/red-flags/${id}`);
  notifyRedFlagsUpdated();
}

export function exportRedFlagsCsv(alerts: RedFlagAlert[]): Blob {
  const headers = [
    "Alert ID",
    "Date",
    "Sender Name",
    "Sender Role",
    "Booking ID",
    "Severity",
    "Categories",
    "Message",
    "Status",
    "Admin Notes",
  ];

  const escapeCsv = (val: string) => `"${String(val || "").replace(/"/g, '""')}"`;

  const rows = [headers.join(",")];
  for (const a of alerts) {
    rows.push(
      [
        escapeCsv(a.id),
        escapeCsv(new Date(a.createdAt).toLocaleString()),
        escapeCsv(a.senderName),
        escapeCsv(a.senderType),
        escapeCsv(a.bookingId),
        escapeCsv(a.severity),
        escapeCsv(a.categories.map((c) => RED_FLAG_CATEGORY_LABELS[c] || c).join("; ")),
        escapeCsv(a.text),
        escapeCsv(RED_FLAG_STATUS_LABELS[a.status] || a.status),
        escapeCsv(a.adminNotes || ""),
      ].join(",")
    );
  }

  return new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
}
