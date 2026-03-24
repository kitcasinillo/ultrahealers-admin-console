import { Send, Search } from "lucide-react";

export function TestNotification() {
    return (
        <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#4318FF] dark:text-[#01A3B4]">
                    <Send className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">Test Notification</h3>
                    <p className="text-sm text-[#A3AED0] font-medium">Send test email for unread messages</p>
                </div>
            </div>

            <div className="space-y-5">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#1b254b] dark:text-white cursor-pointer">
                        <input type="radio" name="userType" defaultChecked className="text-[#4318FF] focus:ring-[#4318FF]" /> Healer
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-[#1b254b] dark:text-white cursor-pointer">
                        <input type="radio" name="userType" className="text-[#4318FF] focus:ring-[#4318FF]" /> Seeker
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Target User</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
                        <input 
                            type="text" 
                            placeholder="Enter User ID, Email or Name..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl text-sm font-medium text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF] dark:focus:ring-[#01A3B4] placeholder:text-[#A3AED0]"
                        />
                    </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Preview: User has 3 unread messages.</p>
                </div>

                <button className="w-full flex justify-center items-center gap-2 bg-[#1b254b] dark:bg-white/10 text-white px-5 py-3 rounded-xl font-bold hover:bg-[#2B3674] dark:hover:bg-white/20 transition-all text-sm">
                    <Send className="h-4 w-4" /> Send Test Email
                </button>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                    <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Result</span>
                    <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-[#A3AED0]">Emails Sent:</span>
                        <span className="font-bold text-green-500">1</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-[#A3AED0]">Unread Count:</span>
                        <span className="font-bold text-[#1b254b] dark:text-white">3</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
