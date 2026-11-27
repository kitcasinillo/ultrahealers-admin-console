import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, Save, Mail } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/contexts/ToastContext";
import { logAdminAction } from "@/lib/audit";
import {
  type FeedbackItem,
  type FeedbackStatus,
  type FeedbackImpact,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_IMPACT_LABELS,
  FEEDBACK_STATUS_LABELS,
  updateFeedback,
} from "@/lib/feedback";

interface FeedbackDetailModalProps {
  item: FeedbackItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: FeedbackItem) => void;
}

const ALL_STATUSES: FeedbackStatus[] = [
  "new",
  "under_review",
  "planned",
  "in_progress",
  "completed",
  "declined",
];

const ALL_IMPACTS: FeedbackImpact[] = ["nice_to_have", "important", "critical"];

export function FeedbackDetailModal({
  item,
  isOpen,
  onClose,
  onUpdated,
}: FeedbackDetailModalProps) {
  const { user } = useAdminAuth();
  const { showToast } = useToast();

  const [status, setStatus] = useState<FeedbackStatus>("new");
  const [impact, setImpact] = useState<FeedbackImpact>("important");
  const [adminNotes, setAdminNotes] = useState("");
  const [notifyUser, setNotifyUser] = useState(false);
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!item || !isOpen) return;
    setStatus(item.status);
    setImpact(item.impact);
    setAdminNotes(item.adminNotes || "");
    setNotifyUser(false);
    setResolutionMessage("");
  }, [item, isOpen]);

  if (!item) return null;

  const profilePath =
    item.userId && item.userRole === "healer"
      ? `/users/healers/${item.userId}`
      : item.userId && item.userRole === "seeker"
        ? `/users/seekers/${item.userId}`
        : null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await updateFeedback(item.id, {
        status,
        impact,
        adminNotes,
        reviewedBy: user?.email || user?.uid || "Admin",
        notifyUser: Boolean(notifyUser && item.userEmail),
        resolutionMessage: notifyUser ? resolutionMessage.trim() : undefined,
      });

      await logAdminAction({
        adminId: user?.uid || "unknown",
        adminEmail: user?.email || "unknown",
        action: `feedback_${status}`,
        module: "Feedback",
        targetId: item.id,
        targetName: item.title,
        changes: {
          previousStatus: item.status,
          newStatus: status,
          previousImpact: item.impact,
          newImpact: impact,
          adminNotes,
          notifiedUser: Boolean(result.emailSent),
        },
      });

      if (notifyUser && item.userEmail) {
        if (result.emailSent) {
          showToast(`Feedback updated and email sent to ${item.userEmail}`, "success");
        } else {
          showToast(
            `Feedback updated, but email failed: ${result.emailError || "SMTP error"}`,
            "error"
          );
        }
      } else {
        showToast("Feedback updated successfully", "success");
      }

      onUpdated(result.feedback);
      onClose();
    } catch (error) {
      console.error("Failed to update feedback:", error);
      showToast("Failed to update feedback", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Feedback & Feature Request Details"
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#4318FF] hover:bg-[#3311cc] text-white gap-1.5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Title & Category */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {FEEDBACK_CATEGORY_LABELS[item.category] || item.category}
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300">
              {item.appSource} • {item.promptSource}
            </span>
            <span className="text-xs text-[#A3AED0] ml-auto">
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">{item.title}</h3>
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm text-[#1b254b] dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {item.description}
        </div>

        {/* Submitter Metadata */}
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 text-xs">
          <p className="text-[#A3AED0] font-semibold uppercase">Submitted By</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-[#1b254b] dark:text-white">{item.userName}</span>
            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300">
              {item.userRole}
            </span>
            {profilePath && (
              <Link
                to={profilePath}
                onClick={onClose}
                className="text-[#4318FF] dark:text-[#01A3B4] hover:underline inline-flex items-center gap-0.5"
              >
                Profile <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
          {item.userEmail && <p className="text-[#A3AED0] mt-0.5">{item.userEmail}</p>}
        </div>

        {/* Triage Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-[#A3AED0] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {FEEDBACK_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#A3AED0] mb-1">Impact</label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as FeedbackImpact)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
            >
              {ALL_IMPACTS.map((imp) => (
                <option key={imp} value={imp}>
                  {FEEDBACK_IMPACT_LABELS[imp]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#A3AED0] mb-1">
            Internal Admin Notes
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Internal roadmap notes, ticket link, etc. (never emailed to user)"
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] px-3 py-2 text-sm text-[#1b254b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/30"
          />
        </div>

        {/* Optional User Email Notification */}
        {item.userEmail ? (
          <div className="p-3.5 rounded-xl border border-cyan-200/80 dark:border-cyan-800/50 bg-cyan-50/50 dark:bg-cyan-950/20 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-[#1b254b] dark:text-white">
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#01A3B4] focus:ring-[#01A3B4]"
              />
              <Mail className="w-4 h-4 text-[#01A3B4]" />
              <span>Notify user via email ({item.userEmail})</span>
            </label>

            {notifyUser && (
              <div>
                <label className="block text-xs font-semibold text-[#A3AED0] mb-1">
                  Message to User (optional)
                </label>
                <textarea
                  value={resolutionMessage}
                  onChange={(e) => setResolutionMessage(e.target.value)}
                  rows={2}
                  placeholder="e.g., Good news! We've implemented this feature and it is now live."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] px-3 py-2 text-sm text-[#1b254b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#01A3B4]/40"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#A3AED0]">
            No email address on file for this submission (guest feedback without email).
          </p>
        )}
      </div>
    </Modal>
  );
}
