import { useState } from "react";
import { Send, Search, X } from "lucide-react";

export function TestNotification() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [userType, setUserType] = useState<"healer" | "seeker">("healer");

    const mockData = {
        healer: ["Robert Fox", "Jane Cooper", "Cameron Williamson", "Leslie Alexander"],
        seeker: ["Emma Wilson", "Liam Smith", "Olivia Brown", "Noah Jones"]
    };

    const filteredUsers = searchQuery.length > 0 
        ? mockData[userType].filter(u => u.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

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
                        <input 
                            type="radio" 
                            name="userType" 
                            checked={userType === "healer"}
                            onChange={() => {
                                setUserType("healer");
                                setSearchQuery("");
                                setSelectedUser(null);
                            }}
                            className="text-[#4318FF] focus:ring-[#4318FF] cursor-pointer" 
                        /> Healer
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-[#1b254b] dark:text-white cursor-pointer">
                        <input 
                            type="radio" 
                            name="userType" 
                            checked={userType === "seeker"}
                            onChange={() => {
                                setUserType("seeker");
                                setSearchQuery("");
                                setSelectedUser(null);
                            }}
                            className="text-[#4318FF] focus:ring-[#4318FF] cursor-pointer" 
                        /> Seeker
                    </label>
                </div>

                <div className="relative">
                    <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Target User</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (selectedUser) setSelectedUser(null);
                            }}
                            placeholder="Enter User ID, Email or Name" 
                            className="w-full pl-10 pr-10 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl text-sm font-medium text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF] dark:focus:ring-[#01A3B4] placeholder:text-[#A3AED0]"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => { setSearchQuery(""); setSelectedUser(null); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-red-500 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {filteredUsers.length > 0 && !selectedUser && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#111C44] border border-gray-100 dark:border-white/10 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                            {filteredUsers.map(user => (
                                <button
                                    key={user}
                                    onClick={() => { setSelectedUser(user); setSearchQuery(user); }}
                                    className="w-full text-left px-4 py-2 text-sm font-medium text-[#1b254b] dark:text-white hover:bg-[#F4F7FE] dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    {user}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        {selectedUser ? `Preview: ${selectedUser} has 3 unread messages.` : "Preview: Select a user to see message count."}
                    </p>
                </div>

                <button className="w-full flex justify-center items-center gap-2 bg-[#1b254b] dark:bg-white/10 text-white px-5 py-3 rounded-xl font-bold hover:bg-[#2B3674] dark:hover:bg-white/20 transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={!selectedUser}>
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
