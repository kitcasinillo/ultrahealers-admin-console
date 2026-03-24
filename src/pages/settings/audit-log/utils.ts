import type { ActionType, ResourceType } from "./types";

export const ACTION_OPTIONS: (ActionType | "All")[] = [
  "All",
  "created",
  "updated",
  "deleted",
  "campaign_sent",
  "dispute_decided",
  "login",
  "settings_changed"
];

export const RESOURCE_OPTIONS: (ResourceType | "All")[] = [
  "All",
  "user",
  "listing",
  "retreat",
  "booking",
  "dispute",
  "campaign",
  "settings"
];

export const formatActionLabel = (action: ActionType): string => {
  return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const formatResourceLabel = (resource: ResourceType): string => {
  return resource.charAt(0).toUpperCase() + resource.slice(1);
};
