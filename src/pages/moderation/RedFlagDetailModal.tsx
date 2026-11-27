import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import {
  type RedFlagAlert,
  type RedFlagStatus,
  RED_FLAG_CATEGORY_LABELS,
  RED_FLAG_STATUS_LABELS,
  updateRedFlag,
} from "@/lib/redFlags";
import { getChatTranscript } from "@/lib/disputes";
import { logAdminAction } from "@/lib/audit";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Loader2,
} from "lucide-react";

interface RedFlagDetailModalProps {
  alert: RedFlagAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: RedFlagAlert) => void;
}

function renderHighlightedText(text: string, matches: { match: string }[]) {
  if (!matches || matches.length === 0) return text;
  const escaped = matches
    .map((m) => m.match)
    .filter(Boolean)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (escaped.length === 0) return text;

  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    regex.test(part) ? (
      <mark
        key={idx}
        className="bg-amber-200 dark:bg-amber-500/40 text-amber-950 dark:text-amber-100 px-1 rounded font-semibold"
      >
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export function RedFlagDetailModal({
  alert,
  isOpen,
  onClose,
  onUpdated,
}: RedFlagDetailModalProps) {
  const { user } = useAdminAuth();
  const { showToast } = useToast();
  const [adminNotes, setAdminNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [transcript, setTranscript] = useState<Array<Record<string, any>>>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  useEffect(() => {
    if (!alert || !isOpen) return;
    setAdminNotes(alert.adminNotes || "");

    let active = true;
    const loadTranscript = async () => {
      if (!alert.bookingId) return;
      setLoadingTranscript(true);
      try {
        const msgs = await getChatTranscript(alert.bookingId);
        if (active) {
          // Sort by timestamp ascending
          const sorted = [...msgs].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          setTranscript(sorted);
        }
      } catch (err) {
        console.error("Failed to load chat transcript:", err);
        if (active) setTranscript([]);
      } finally {
        if (active) setLoadingTranscript(false);
      }
    };

    loadTranscript();
    return () => {
      active = false;
    };
  }, [alert, isOpen]);

  if (!alert) return null;

  const senderProfilePath =
    alert.senderType === "healer"
      ? `/users/healers/${alert.senderId}`
      : `/users/seekers/${alert.senderId}`;

  const handleStatusUpdate = async (
    nextStatus: RedFlagStatus,
    actionTaken: "none" | "warned_user" | "suspended_user" | "dismissed_false_positive"
  ) => {
    try {
      setIsSaving(true);
      const updated = await updateRedFlag(alert.id, {
        status: nextStatus,
        adminNotes,
        actionTaken,
        reviewedBy: user?.email || user?.uid || "Admin",
      });

      await logAdminAction({
        adminId: user?.uid || "unknown",
        adminEmail: user?.email || "unknown",
        action: `red_flag_${nextStatus}`,
        module: "Moderation",
        targetId: alert.id,
        targetName: `${alert.senderName} (${alert.bookingId})`,
        changes: {
          previousStatus: alert.status,
          newStatus: nextStatus,
          actionTaken,
          adminNotes,
        },
      });

      showToast(`Alert marked as ${RED_FLAG_STATUS_LABELS[nextStatus]}`, "success");
      onUpdated(updated);
      onClose();
    } catch (error) {
      console.error("Failed to update red flag:", error);
      showToast("Failed to update red flag alert", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const severityStyles: Record<string, string> = {
    high: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    low: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Red Flag Alert Review"
      maxWidth="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => handleStatusUpdate("dismissed", "dismissed_false_positive")}
              className="gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Dismiss (False Positive)
            </Button>
            <Button
              variant="secondary"
              disabled={isSaving}
              onClick={() => handleStatusUpdate("reviewed", "none")}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Reviewed
            </Button>
            <Button
              disabled={isSaving}
              onClick={() => handleStatusUpdate("action_taken", "warned_user")}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              Mark Action Taken
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Metadata Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm">
          <div>
            <p className="text-xs text-[#A3AED0] font-semibold uppercase">Sender</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-[#1b254b] dark:text-white">
                {alert.senderName}
              </span>
              <span className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-semibold">
                {alert.senderType}
              </span>
              {alert.senderId && (
                <Link
                  to={senderProfilePath}
                  onClick={onClose}
                  className="text-xs text-[#4318FF] dark:text-[#01A3B4] hover:underline inline-flex items-center gap-0.5"
                >
                  Profile <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-[#A3AED0] font-semibold uppercase">Booking &amp; Severity</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Link
                to={`/bookings/sessions/${alert.bookingId}`}
                onClick={onClose}
                className="font-mono text-xs text-[#4318FF] dark:text-[#01A3B4] hover:underline inline-flex items-center gap-1"
              >
                {alert.bookingId} <ExternalLink className="w-3 h-3" />
              </Link>
              <span
                className={`text-[11px] uppercase px-2 py-0.5 rounded-full font-bold ${
                  severityStyles[alert.severity] || severityStyles.low
                }`}
              >
                {alert.severity}
              </span>
            </div>
          </div>
        </div>

        {/* Flagged Message Box */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Flagged Message</span>
            </div>
            <span className="text-xs text-[#A3AED0]">
              {new Date(alert.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-sm text-[#1b254b] dark:text-white whitespace-pre-wrap leading-relaxed">
            {renderHighlightedText(alert.text, alert.matches)}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {alert.categories.map((cat) => (
              <span
                key={cat}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
              >
                {RED_FLAG_CATEGORY_LABELS[cat] || cat}
              </span>
            ))}
          </div>
        </div>

        {/* Surrounding Chat Transcript */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A3AED0]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Booking Chat Transcript ({transcript.length})</span>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02] p-3 space-y-2">
            {loadingTranscript ? (
              <div className="flex items-center justify-center py-6 text-xs text-[#A3AED0] gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading chat history...
              </div>
            ) : transcript.length === 0 ? (
              <p className="text-xs text-[#A3AED0] text-center py-4">
                No chat messages found in Realtime Database for this booking.
              </p>
            ) : (
              transcript.map((msg) => {
                const isTarget =
                  (alert.messageId && msg.id === alert.messageId) ||
                  (msg.text === alert.text && msg.senderId === alert.senderId);
                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-lg text-xs ${
                      isTarget
                        ? "bg-amber-100/90 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40"
                        : "bg-white dark:bg-[#0B1437]/60 border border-gray-100 dark:border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-[#1b254b] dark:text-white">
                        {msg.senderName || "User"}{" "}
                        <span className="font-normal text-[#A3AED0]">({msg.senderType || "user"})</span>
                      </span>
                      {msg.timestamp && (
                        <span className="text-[10px] text-[#A3AED0]">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                      {msg.messageType === "image" ? "[Image Attachment]" : msg.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Admin Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A3AED0]">
            Admin Review Notes
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Record investigation notes, warning sent, or reason for dismissal..."
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] px-3 py-2 text-sm text-[#1b254b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/40"
          />
        </div>
      </div>
    </Modal>
  );
}
