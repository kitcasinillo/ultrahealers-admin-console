import { MessageCircle } from "lucide-react"
import { Badge } from "../../../../components/ui/badge"
import { cn } from "../../../../lib/utils"

interface ChatMessage {
    text: string
    senderId: string
    senderName: string
    timestamp: number
    type: string
}

interface ChatTranscriptProps {
    messages: ChatMessage[]
    healerName: string
}

export function ChatTranscript({ messages, healerName }: ChatTranscriptProps) {
    return (
        <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-[#4318FF]" /> Transcript Viewer
                </h3>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold text-[#A3AED0] border-gray-100 uppercase tracking-widest px-2">
                        {messages.length} Messages
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#A3AED0] border-gray-100 uppercase tracking-widest px-2">Read Only</Badge>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-black/20 rounded-2xl h-[450px] overflow-y-auto p-6 flex flex-col gap-4 border border-gray-100 dark:border-white/5 scrollbar-hide">
                {messages.length > 0 ? (
                    messages.map((msg, index) => {
                        const isHealer = msg.senderId.includes('healer') || msg.senderName === healerName
                        return (
                            <div 
                                key={index} 
                                className={cn(
                                    "flex flex-col max-w-[80%]",
                                    isHealer ? "self-end items-end" : "self-start items-start"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-bold text-[#A3AED0]">{msg.senderName}</span>
                                    <span className="text-[10px] text-[#A3AED0]/70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div 
                                    className={cn(
                                        "px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm",
                                        isHealer 
                                            ? "bg-[#4318FF] text-white rounded-tr-none" 
                                            : "bg-white dark:bg-white/10 text-[#1b254b] dark:text-white rounded-tl-none border border-gray-100 dark:border-none"
                                    )}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                        <div className="h-16 w-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <MessageCircle className="h-8 w-8 text-[#A3AED0] opacity-20" />
                        </div>
                        <h4 className="text-sm font-bold text-[#1b254b] dark:text-white mb-1">No conversation yet</h4>
                        <p className="text-xs font-medium text-[#A3AED0]">Safe and secure chat logs will appear here once the session starts.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
