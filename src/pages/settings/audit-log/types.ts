export type ActionType =
  | "Created"
  | "Updated"
  | "Deleted"
  | "Campaign_sent"
  | "Dispute_decided"
  | "Login"
  | "Settings_changed";

export type ResourceType =
  | "User"
  | "Listing"
  | "Retreat"
  | "Booking"
  | "Dispute"
  | "Campaign"
  | "Settings";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  changes: string | Record<string, any> | null;
  ipAddress: string;
}

export interface AuditLogFilters {
  searchQuery: string;
  adminFilter: string;
  actionFilter: string;
  resourceFilter: string;
  startDate: string;
  endDate: string;
}
