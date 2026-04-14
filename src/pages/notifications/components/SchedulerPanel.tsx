import { Play, Square, Zap, Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { controlScheduler, getSchedulerStatus, triggerUnreadNotifications, type SchedulerStatus } from "@/lib/notifications";

const formatDateTime = (value: string | null) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString();
};

export function SchedulerPanel() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"start" | "stop" | "trigger" | null>(null);

  const loadStatus = async () => {
    try {
      const nextStatus = await getSchedulerStatus();
      setStatus(nextStatus);
    } catch (error) {
      console.error("Failed to load scheduler status", error);
      toast.error("Failed to load scheduler status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleSchedulerControl = async (action: "start" | "stop") => {
    setBusyAction(action);
    try {
      const response = await controlScheduler(action);
      toast.success(response.message);
      await loadStatus();
    } catch (error) {
      console.error(`Failed to ${action} scheduler`, error);
      toast.error(`Failed to ${action} scheduler.`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleTriggerNow = async () => {
    setBusyAction("trigger");
    try {
      const response = await triggerUnreadNotifications();
      const totalEmailsSent = response.data?.totalEmailsSent ?? 0;
      toast.success(response.message || `Triggered notifications, ${totalEmailsSent} email(s) sent.`);
      await loadStatus();
    } catch (error) {
      console.error("Failed to trigger notifications", error);
      toast.error("Failed to trigger unread message notifications.");
    } finally {
      setBusyAction(null);
    }
  };

  const isRunning = status?.isRunning ?? false;

  return (
    <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-10 h-10 rounded-xl bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#4318FF] dark:text-[#01A3B4]">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">Scheduler Control Panel</h3>
          <p className="text-sm text-[#A3AED0] font-medium">Automated unread message dispatcher</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-[#F4F7FE] dark:bg-white/5 rounded-2xl">
          <div>
            <span className="block text-sm font-bold text-[#A3AED0] mb-1">Status</span>
            {loading ? (
              <div className="flex items-center gap-2 text-[#1b254b] dark:text-white font-bold">
                <Loader2 className="h-5 w-5 animate-spin text-[#4318FF]" /> Loading...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <><CheckCircle2 className="h-5 w-5 text-green-500" /><span className="text-[#1b254b] dark:text-white font-bold">Running</span></>
                ) : (
                  <><XCircle className="h-5 w-5 text-red-500" /><span className="text-[#1b254b] dark:text-white font-bold">Stopped</span></>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="block text-sm font-bold text-[#A3AED0] mb-1">Next Run</span>
            <span className="text-[#1b254b] dark:text-white font-bold">{loading ? "Loading..." : formatDateTime(status?.nextRunTime ?? null)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-100 dark:border-white/5 rounded-2xl">
            <span className="block text-xs font-bold text-[#A3AED0] mb-1">Last Run</span>
            <span className="text-sm text-[#1b254b] dark:text-white font-bold">{loading ? "Loading..." : formatDateTime(status?.lastRunTime ?? null)}</span>
          </div>
          <div className="p-4 border border-gray-100 dark:border-white/5 rounded-2xl">
            <span className="block text-xs font-bold text-[#A3AED0] mb-1">Schedule</span>
            <span className="text-sm text-[#1b254b] dark:text-white font-bold">{loading ? "Loading..." : status?.schedule || "Not available"}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {isRunning ? (
            <button
              onClick={() => void handleSchedulerControl("stop")}
              disabled={busyAction !== null}
              className="flex items-center gap-2 bg-red-50 text-red-500 dark:bg-red-500/10 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busyAction === "stop" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />} Stop Scheduler
            </button>
          ) : (
            <button
              onClick={() => void handleSchedulerControl("start")}
              disabled={busyAction !== null}
              className="flex items-center gap-2 bg-[#4318FF] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-opacity-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busyAction === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start Scheduler
            </button>
          )}
          <button
            onClick={() => void handleTriggerNow()}
            disabled={busyAction !== null}
            className="flex items-center gap-2 bg-[#F4F7FE] dark:bg-white/5 text-[#4318FF] dark:text-[#01A3B4] px-5 py-2.5 rounded-xl font-semibold hover:bg-[#E2E8F0] dark:hover:bg-white/10 transition-all text-sm ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busyAction === "trigger" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Trigger Now
          </button>
        </div>
      </div>
    </div>
  );
}
