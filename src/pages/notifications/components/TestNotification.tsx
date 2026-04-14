import { useMemo, useState } from "react";
import { Send, Search, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { testUserNotifications } from "@/lib/notifications";

export function TestNotification() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState<"healer" | "seeker">("healer");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ emailsSent: number; unreadCount: number; message: string } | null>(null);

  const normalizedQuery = searchQuery.trim();

  const helperText = useMemo(() => {
    if (!normalizedQuery) return "Enter a real user ID to test unread-message notifications.";
    return `Ready to test ${userType} notifications for ${normalizedQuery}.`;
  }, [normalizedQuery, userType]);

  const handleSubmit = async () => {
    if (!normalizedQuery || submitting) return;

    setSubmitting(true);
    try {
      const response = await testUserNotifications({ userId: normalizedQuery, userType });
      const unreadCount = response.data?.totalUnread ?? 0;
      const emailsSent = response.data?.emailSent ? 1 : 0;
      setResult({
        emailsSent,
        unreadCount,
        message: response.message || "Notification test completed."
      });
      toast.success(response.message || "Notification test completed.");
    } catch (error) {
      console.error("Failed to test notification", error);
      toast.error("Failed to send test notification.");
      setResult({
        emailsSent: 0,
        unreadCount: 0,
        message: "Request failed. Check the user ID and backend logs."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-10 h-10 rounded-xl bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#4318FF] dark:text-[#01A3B4]">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">Test Notification</h3>
          <p className="text-sm text-[#A3AED0] font-medium">Send a real unread-message notification for one user</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm font-bold text-[#1b254b] dark:text-white cursor-pointer">
            <input
              type="radio"
              name="userType"
              checked={userType === "healer"}
              onChange={() => setUserType("healer")}
              className="text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
            /> Healer
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-[#1b254b] dark:text-white cursor-pointer">
            <input
              type="radio"
              name="userType"
              checked={userType === "seeker"}
              onChange={() => setUserType("seeker")}
              className="text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
            /> Seeker
          </label>
        </div>

        <div className="relative">
          <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Target User ID</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Firebase user ID"
              className="w-full pl-10 pr-10 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl text-sm font-medium text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF] dark:focus:ring-[#01A3B4] placeholder:text-[#A3AED0]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setResult(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-red-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{helperText}</p>
        </div>

        <button
          onClick={() => void handleSubmit()}
          className="w-full flex justify-center items-center gap-2 bg-[#1b254b] dark:bg-white/10 text-white px-5 py-3 rounded-xl font-bold hover:bg-[#2B3674] dark:hover:bg-white/20 transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!normalizedQuery || submitting}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Test Email
        </button>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
          <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Result</span>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-[#A3AED0]">Emails Sent:</span>
            <span className="font-bold text-green-500">{result?.emailsSent ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-[#A3AED0]">Unread Count:</span>
            <span className="font-bold text-[#1b254b] dark:text-white">{result?.unreadCount ?? 0}</span>
          </div>
          <div className="mt-2 text-xs text-[#A3AED0] font-medium break-words">{result?.message ?? "No test has been run yet."}</div>
        </div>
      </div>
    </div>
  );
}
