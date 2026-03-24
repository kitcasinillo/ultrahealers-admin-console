import { useState } from "react";
import { Code, Zap, CheckCircle2 } from "lucide-react";

export function EventDispatcher() {
    const [eventType, setEventType] = useState("booking.created");
    const [customEvent, setCustomEvent] = useState("");

    return (
        <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 lg:col-span-2">
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
                <button className="text-sm font-bold text-[#4318FF] dark:text-[#01A3B4] hover:underline">View History (Last 50)</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Event Type</label>
                            <select 
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl text-sm font-medium text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF]"
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
                    
                    <button className="flex items-center justify-center gap-2 bg-[#4318FF] text-white w-full py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm shadow-md shadow-[#4318FF]/20">
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
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-[#111C44] rounded-xl text-xs shadow-sm shadow-black/5">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-[#1b254b] dark:text-white truncate mr-2">system.ping</span>
                                        <span className="text-[10px] text-[#A3AED0] shrink-0">{i * 10}m ago</span>
                                    </div>
                                    <span className="text-[10px] text-[#A3AED0] block truncate">{"{ \"status\": \"ok\", \"timestamp\": 1710400000 }"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
