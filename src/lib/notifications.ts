import api from "@/lib/api";

export type SchedulerStatus = {
  isRunning: boolean;
  schedule: string;
  timezone?: string;
  nextRunTime: string | null;
  lastRunTime: string | null;
};

export type SchedulerStatusResponse = {
  success: boolean;
  status: SchedulerStatus;
};

export type TriggerNotificationsResponse = {
  success: boolean;
  message?: string;
  data?: {
    totalEmailsSent: number;
    healerNotifications: number;
    seekerNotifications: number;
  };
};

export type TestUserNotificationsResponse = {
  success: boolean;
  message?: string;
  data?: {
    unreadMessages: Array<{
      bookingId?: string;
      unreadCount?: number;
      [key: string]: unknown;
    }>;
    emailSent: boolean;
    totalUnread: number;
  };
};

export type ControlSchedulerResponse = {
  success: boolean;
  message: string;
};

export type N8nDispatchResponse = {
  success: boolean;
  result?: {
    sent?: boolean;
    status?: number;
    reason?: string;
    [key: string]: unknown;
  };
  error?: string;
};

export const getSchedulerStatus = async (): Promise<SchedulerStatus> => {
  const { data } = await api.get<SchedulerStatusResponse>("/api/notifications/scheduler-status");
  return data.status;
};

export const triggerUnreadNotifications = async () => {
  const { data } = await api.post<TriggerNotificationsResponse>("/api/notifications/trigger-notifications");
  return data;
};

export const testUserNotifications = async (payload: { userId: string; userType: "healer" | "seeker" }) => {
  const { data } = await api.post<TestUserNotificationsResponse>("/api/notifications/test-user-notifications", payload);
  return data;
};

export const controlScheduler = async (action: "start" | "stop") => {
  const { data } = await api.post<ControlSchedulerResponse>("/api/notifications/control-scheduler", { action });
  return data;
};

export const dispatchN8nEvent = async (payload: { eventType: string; payload: Record<string, unknown> }) => {
  const { data } = await api.post<N8nDispatchResponse>("/api/notifications/n8n-event", payload);
  return data;
};
