import { useState } from "react";
import { Mail, Loader2, Send } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/contexts/ToastContext";
import { sendFeedbackPrompt } from "@/lib/feedback";
import { logAdminAction } from "@/lib/audit";

interface SendFeedbackPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendFeedbackPromptModal({ isOpen, onClose }: SendFeedbackPromptModalProps) {
  const { user } = useAdminAuth();
  const { showToast } = useToast();

  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [userRole, setUserRole] = useState<"seeker" | "healer" | "retreat">("seeker");
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleClose = () => {
    setRecipientEmail("");
    setRecipientName("");
    setUserRole("seeker");
    setCustomMessage("");
    onClose();
  };

  const handleSend = async () => {
    if (!recipientEmail.trim()) {
      showToast("Please enter a recipient email address", "error");
      return;
    }

    try {
      setIsSending(true);
      const res = await sendFeedbackPrompt({
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim() || undefined,
        userRole,
        customMessage: customMessage.trim() || undefined,
        sentBy: user?.email || user?.uid || "Admin",
      });

      await logAdminAction({
        adminId: user?.uid || "unknown",
        adminEmail: user?.email || "unknown",
        action: "feedback_prompt_sent",
        module: "Feedback",
        targetName: recipientEmail.trim(),
        metadata: { userRole },
      });

      showToast(res.message || "Feedback prompt email sent", "success");
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || "Failed to send feedback prompt email";
      showToast(msg, "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Feature Request Email Prompt"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending}
            className="bg-[#01A3B4] hover:bg-[#0891b2] text-white gap-1.5"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Email Prompt
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-800/50 text-xs text-cyan-900 dark:text-cyan-200">
          <Mail className="w-4 h-4 shrink-0 mt-0.5 text-[#01A3B4]" />
          <p>
            Sends an email with a direct link that opens the Feedback &amp; Feature Request modal.
            A 30-day per-user cooldown is enforced automatically.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#A3AED0] mb-1">
            Recipient Email *
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-[#A3AED0] mb-1">
              Recipient Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#A3AED0] mb-1">
              Target App
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as "seeker" | "healer" | "retreat")}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
            >
              <option value="seeker">Seeker App</option>
              <option value="healer">Healer App</option>
              <option value="retreat">Retreats App</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#A3AED0] mb-1">
            Custom Note (optional)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            placeholder="e.g., Thanks for your recent booking! What feature would make your next session even better?"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
          />
        </div>
      </div>
    </Modal>
  );
}
