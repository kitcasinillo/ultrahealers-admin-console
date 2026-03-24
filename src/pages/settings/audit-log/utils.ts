import type { ActionType, ResourceType } from "./types";

export const ACTION_OPTIONS: (ActionType | "All")[] = [
  "All",
  "Created",
  "Updated",
  "Deleted",
  "Campaign_sent",
  "Dispute_decided",
  "Login",
  "Settings_changed"
];

export const RESOURCE_OPTIONS: (ResourceType | "All")[] = [
  "All",
  "User",
  "Listing",
  "Retreat",
  "Booking",
  "Dispute",
  "Campaign",
  "Settings"
];

export const formatActionLabel = (action: ActionType): string => {
  return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const formatResourceLabel = (resource: ResourceType): string => {
  return resource.charAt(0).toUpperCase() + resource.slice(1);
};

export const formatChanges = (changes: any): string => {
  if (!changes) return "No detail";
  
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (typeof changes === 'string') return capitalize(changes);
  
  if (typeof changes === 'object' && !Array.isArray(changes)) {
    const keys = Object.keys(changes);
    if (keys.length === 1) {
      const field = capitalize(keys[0]);
      const val = (changes as any)[keys[0]];
      if (val && typeof val === 'object' && 'from' in val && 'to' in val) {
        return `${field}: ${val.from} to ${val.to}`;
      }
      if (typeof val === 'string' || typeof val === 'number') {
        return `${field}: ${val}`;
      }
    }
  }
  return JSON.stringify(changes);
};
