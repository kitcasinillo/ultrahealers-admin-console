import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface AuditLogEntry {
  adminId: string;
  adminEmail: string;
  action: string;
  module: "Healers" | "Seekers" | "Users" | "Listings" | "Disputes" | "Bookings" | "Payments" | "Settings" | "Media";
  targetId?: string;
  targetName?: string;
  changes?: any;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Strips undefined values from an object.
 * Firestore rejects documents containing undefined fields.
 */
function stripUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

/**
 * Logs an administrative action to the database for auditing purposes.
 */
export async function logAdminAction(entry: AuditLogEntry) {
  try {
    await addDoc(collection(db, "admin_audit_logs"), {
      ...stripUndefined(entry as Record<string, any>),
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Critical: Failed to record audit log:", error);
  }
}
