import { useState, useMemo } from "react";
import { Code, Zap, CheckCircle2, X, XCircle, Search, ChevronDown, Copy } from "lucide-react";

export function EventDispatcher() {
    const [eventType, setEventType] = useState("booking.created");
    const [customEvent, setCustomEvent] = useState("");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    
    // History State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "success" | "error">("all");
    const [expandedItem, setExpandedItem] = useState<number | null>(null);

    // Mock History Data (Memoized for performance)
    const historyData = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            type: i % 3 === 0 ? "booking.created" : (i % 5 === 0 ? "healer.premium.activated" : "system.ping"),
            status: i % 4 === 0 ? "error" : "success",
            statusCode: i % 4 === 0 ? "500 Internal Error" : "200 OK",
            timestamp: new Date(Date.now() - i * 3600000),
            payload: i % 3 === 0 
                ? { bookingId: `bk_${12345 + i}`, amount: 10000 + (i * 100), currency: "usd" }
                : { status: "ok", latency: `${10 + i}ms`, region: "us-east-1" }
        }));
    }, []);

    const filteredHistory = useMemo(() => {
        return historyData.filter(item => {
            const matchesSearch = item.type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === "all" || item.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [historyData, searchTerm, filterStatus]);

    return (
        <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 lg:col-span-2 relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#4318FF] dark:text-[#01A3B4]">
                        <Code className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">Event Dispatcher</h3>
                        <p className="text-sm text-[#A3AED0] font-medium">Manually dispatch system events via webhook</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowHistoryModal(true)}
                    className="flex items-center gap-2 text-sm font-bold text-[#4318FF] dark:text-[#01A3B4] bg-[#F4F7FE] dark:bg-white/5 px-4 py-2 rounded-xl hover:bg-[#E2E8F0] dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                    View History (Last 50)
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Event Type</label>
                            <div className="relative">
                                <select 
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl text-sm font-medium text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF] appearance-none pr-10 cursor-pointer"
                                >
                                    <option value="booking.created">booking.created</option>
                                    <option value="dispute.created">dispute.created</option>
                                    <option value="dispute.resolved">dispute.resolved</option>
                                    <option value="dispute.updated">dispute.updated</option>
                                    <option value="healer.premium.activated">healer.premium.activated</option>
                                    <option value="retreat.booking">retreat.booking</option>
                                    <option value="system.ping">system.ping</option>
                                    <option value="custom">Custom (free-text)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0] pointer-events-none" />
                            </div>
                        </div>
                        {eventType === "custom" && (
                            <div>
                                <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Custom Name</label>
                                <input 
                                    type="text"
                                    value={customEvent}
                                    onChange={(e) => setCustomEvent(e.target.value)}
                                    placeholder="Enter event name..."
                                    className="w-full px-4 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl text-sm font-medium text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF]"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">JSON Payload</label>
                        <textarea 
                            rows={6}
                            className="w-full px-4 py-3 bg-[#1b254b] text-green-400 font-mono text-xs rounded-xl border-none focus:ring-2 focus:ring-[#01A3B4]"
                            defaultValue={`{\n  "bookingId": "bk_12345",\n  "amount": 10000,\n  "currency": "usd"\n}`}
                        />
                    </div>
                    
                    <button className="flex items-center justify-center gap-2 bg-[#4318FF] text-white w-full py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm shadow-md shadow-[#4318FF]/20 cursor-pointer">
                        <Zap className="h-4 w-4" /> Dispatch Event
                    </button>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#A3AED0] uppercase">Last Response</span>
                            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">200 OK</span>
                        </div>
                        <p className="text-xs text-[#1b254b] dark:text-white font-mono truncate">Success: Event "booking.created" dispatched to n8n.</p>
                    </div>
                </div>
                
                <div className="bg-[#F4F7FE] dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5 h-full overflow-hidden flex flex-col">
                    <h4 className="text-sm font-bold text-[#1b254b] dark:text-white mb-4">Event History Log</h4>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                        {historyData.slice(0, 5).map(item => (
                            <div key={item.id} className="flex items-start gap-3 p-3 bg-white dark:bg-[#111C44] rounded-xl text-xs shadow-sm shadow-black/5">
                                {item.status === "success" ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-[#1b254b] dark:text-white truncate mr-2">{item.type}</span>
                                        <span className="text-[10px] text-[#A3AED0] shrink-0">
                                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-[#A3AED0] block truncate">
                                        {JSON.stringify(item.payload)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowHistoryModal(true)}
                        className="mt-4 text-xs font-bold text-[#4318FF] dark:text-[#01A3B4] text-center w-full hover:underline cursor-pointer"
                    >
                        View Full History
                    </button>
                </div>
            </div>

            {/* History Modal Overlay */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
                    <div className="absolute inset-0 bg-[#0b1437]/80 dark:bg-black/90 backdrop-blur-md cursor-pointer" onClick={() => setShowHistoryModal(false)} />
                    
                    <div className="relative w-full max-w-4xl bg-white dark:bg-[#111C44] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col max-h-[85vh] border border-gray-100 dark:border-white/5 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-8 pt-8 pb-6 bg-white dark:bg-[#111C44] z-10 shrink-0">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1b254b] dark:text-white tracking-tight flex items-center gap-3">
                                        Event Dispatch History
                                        <span className="px-3 py-1 bg-[#F4F7FE] dark:bg-white/5 rounded-full text-xs font-bold text-[#4318FF] dark:text-[#01A3B4]">
                                            Last 50
                                        </span>
                                    </h3>
                                    <p className="text-[#A3AED0] text-sm font-medium mt-1">Audit log for manual system notifications and n8n webhooks</p>
                                </div>
                                <button 
                                    onClick={() => setShowHistoryModal(false)}
                                    className="w-12 h-12 rounded-2xl bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#A3AED0] hover:text-white hover:bg-red-500 transition-all duration-200 cursor-pointer"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Search & Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by event type..."
                                        className="w-full pl-11 pr-4 py-3 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF] dark:focus:ring-[#01A3B4] placeholder:text-[#A3AED0]"
                                    />
                                </div>
                                <div className="flex gap-2 p-1.5 bg-[#F4F7FE] dark:bg-white/5 rounded-2xl">
                                    {[
                                        { id: 'all', label: 'All Events' },
                                        { id: 'success', label: 'Success', icon: CheckCircle2, color: 'text-green-500' },
                                        { id: 'error', label: 'Failed', icon: XCircle, color: 'text-red-500' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setFilterStatus(tab.id as any)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                filterStatus === tab.id 
                                                ? 'bg-white dark:bg-white/10 text-[#1b254b] dark:text-white shadow-sm' 
                                                : 'text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white'
                                            }`}
                                        >
                                            {tab.icon && <tab.icon className={`h-3.5 w-3.5 ${tab.color}`} />}
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Content - Scrollable List */}
                        <div className="px-8 pb-8 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="space-y-3">
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className={`group border rounded-[22px] transition-all duration-200 ${
                                                expandedItem === item.id 
                                                ? 'bg-white dark:bg-[#111C44] border-[#4318FF]/20 dark:border-white/10 shadow-[0_10px_30px_rgba(67,24,255,0.05)]' 
                                                : 'bg-[#F4F7FE]/30 dark:bg-white/[0.02] border-transparent hover:bg-white dark:hover:bg-white/[0.04] hover:shadow-md'
                                            }`}
                                        >
                                            <div 
                                                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                                className="flex items-center justify-between p-4 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                        item.status === 'success' 
                                                        ? 'bg-green-500/10 text-green-500' 
                                                        : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                        {item.status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-[#1b254b] dark:text-white text-sm truncate">{item.type}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-black uppercase text-[#A3AED0] tracking-wider">
                                                                {item.statusCode}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-[#A3AED0] opacity-30" />
                                                            <span className="text-[10px] font-bold text-[#A3AED0]">
                                                                {item.timestamp.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(JSON.stringify(item.payload, null, 2));
                                                        }}
                                                        className="hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 bg-[#4318FF]/5 text-[#4318FF] dark:text-[#01A3B4] rounded-lg text-xs font-bold hover:bg-[#4318FF]/10 cursor-pointer"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                        Copy
                                                    </button>
                                                    <div className={`text-[#A3AED0] transition-transform duration-200 ${expandedItem === item.id ? 'rotate-180' : ''}`}>
                                                        <ChevronDown className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedItem === item.id && (
                                                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="bg-[#1b254b] dark:bg-black/40 rounded-xl p-4 overflow-x-auto border border-[#4318FF]/10">
                                                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                                                            <span className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">Payload Data</span>
                                                        </div>
                                                        <pre className="text-xs font-mono text-green-400">
                                                            {JSON.stringify(item.payload, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-[#F4F7FE]/30 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-[#A3AED0]/30">
                                        <div className="w-20 h-20 bg-[#F4F7FE] dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <Search className="h-8 w-8 text-[#A3AED0]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">No matching events</h3>
                                        <p className="text-[#A3AED0] text-sm">Try adjusting your search or filter settings</p>
                                        <button 
                                            onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
                                            className="mt-4 text-[#4318FF] dark:text-[#01A3B4] font-bold hover:underline py-2 cursor-pointer"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

