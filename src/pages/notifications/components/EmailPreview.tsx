import { Search, ChevronDown } from "lucide-react";

export function EmailPreview() {
    return (
        <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 lg:col-span-2">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#4318FF] dark:text-[#01A3B4]">
                        <Search className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">Email Template Preview</h3>
                        <p className="text-sm text-[#A3AED0] font-medium">Verify HTML rendering with mock data</p>
                    </div>
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Template</label>
                        <div className="relative">
                            <select className="w-full px-4 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl text-sm font-medium text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF] appearance-none pr-10 cursor-pointer">
                                <option value="healerEmail">healerEmail (Unread Messages)</option>
                                <option value="seekerEmail">seekerEmail (Unread Messages)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0] pointer-events-none" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Mock Data (JSON)</label>
                        <textarea 
                            rows={8}
                            className="w-full px-4 py-3 bg-[#1b254b] text-green-400 font-mono text-xs rounded-xl border-none focus:ring-2 focus:ring-[#01A3B4]"
                            defaultValue={`{\n  "firstName": "Jane",\n  "unreadCount": 3,\n  "senderNames": ["John D.", "Alice M."],\n  "actionUrl": "https://url"\n}`}
                        />
                    </div>
                    
                    <button className="flex items-center justify-center gap-2 bg-[#F4F7FE] dark:bg-white/10 text-[#4318FF] dark:text-white w-full py-3 rounded-xl font-bold hover:bg-[#E2E8F0] dark:hover:bg-white/20 transition-all text-sm cursor-pointer">
                        Render Preview
                    </button>
                </div>
                
                <div className="md:col-span-2">
                     <div className="h-full min-h-[300px] border border-gray-200 dark:border-white/10 rounded-2xl bg-white flex flex-col overflow-hidden text-black">
                        <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-white/10 px-4 py-2 text-xs text-gray-500 font-mono flex gap-2">
                            <span>Subject:</span>
                            <span className="text-black dark:text-white font-bold">You have 3 unread messages on UltraHealers</span>
                        </div>
                        <div className="flex-1 p-8 text-black bg-white overflow-y-auto">
                            <div className="max-w-md mx-auto font-sans">
                                <div className="mb-6">
                                    <h1 className="text-[#4318FF] font-black text-2xl tracking-tighter">UltraHealers</h1>
                                </div>
                                <p className="mb-4">Hi Jane,</p>
                                <p className="mb-6">You have <strong className="text-black">3 unread messages</strong> from your clients, including John D. and Alice M.</p>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6 text-center">
                                    <a href="#" className="inline-block bg-[#4318FF] text-white px-6 py-3 rounded-lg font-bold no-underline">View Messages</a>
                                </div>
                                <p className="text-xs text-gray-400 mt-8">© 2026 UltraHealers. All rights reserved.</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
}
