import { Play, Square, Zap, Mail, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export function SchedulerPanel() {
    const [schedulerStatus, setSchedulerStatus] = useState<"running" | "stopped">("running");

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
                        <div className="flex items-center gap-2">
                            {schedulerStatus === "running" ? (
                                <><CheckCircle2 className="h-5 w-5 text-green-500" /><span className="text-[#1b254b] dark:text-white font-bold">Running</span></>
                            ) : (
                                <><XCircle className="h-5 w-5 text-red-500" /><span className="text-[#1b254b] dark:text-white font-bold">Stopped</span></>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-sm font-bold text-[#A3AED0] mb-1">Next Run</span>
                        <span className="text-[#1b254b] dark:text-white font-bold">In 4 hours (20:00 UTC)</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-100 dark:border-white/5 rounded-2xl">
                        <span className="block text-xs font-bold text-[#A3AED0] mb-1">Last Run</span>
                        <span className="text-sm text-[#1b254b] dark:text-white font-bold">Today, 14:00 UTC</span>
                    </div>
                    <div className="p-4 border border-gray-100 dark:border-white/5 rounded-2xl">
                        <span className="block text-xs font-bold text-[#A3AED0] mb-1">Emails Sent (Last Run)</span>
                        <span className="text-sm text-[#1b254b] dark:text-white font-bold">42 (12 Healers, 30 Seekers)</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {schedulerStatus === "stopped" ? (
                        <button 
                            onClick={() => setSchedulerStatus("running")}
                            className="flex items-center gap-2 bg-[#4318FF] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-opacity-90 transition-all text-sm"
                        >
                            <Play className="h-4 w-4" /> Start Scheduler
                        </button>
                    ) : (
                        <button 
                            onClick={() => setSchedulerStatus("stopped")}
                            className="flex items-center gap-2 bg-red-50 text-red-500 dark:bg-red-500/10 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all text-sm"
                        >
                            <Square className="h-4 w-4" /> Stop Scheduler
                        </button>
                    )}
                    <button className="flex items-center gap-2 bg-[#F4F7FE] dark:bg-white/5 text-[#4318FF] dark:text-[#01A3B4] px-5 py-2.5 rounded-xl font-semibold hover:bg-[#E2E8F0] dark:hover:bg-white/10 transition-all text-sm ml-auto">
                        <Zap className="h-4 w-4" /> Trigger Now
                    </button>
                </div>
            </div>
        </div>
    );
}
