import { useEffect, useState } from "react";
import { getChatTranscript } from "@/lib/disputes";
import { MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function ChatTranscript({ bookingId }: { bookingId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getChatTranscript(bookingId)
      .then(data => {
        if (active) {
          setMessages(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to load transcript", err);
        if (active) setLoading(false);
      });
    return () => { active = false };
  }, [bookingId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col overflow-hidden max-h-[500px]">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
           <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Chat Transcript</h3>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">Booking #{bookingId} • Read Only</p>
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-400" />
            <p className="text-sm font-semibold tracking-wide">Fetching secure transcript...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-white border border-slate-200 border-dashed rounded-xl shadow-sm">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30 text-slate-600" />
            <p className="text-sm font-semibold text-slate-500">No chat history found for this booking.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m, i) => {
              // Derive party alignment. Healers standard align right in generic UI architectures.
              const isHealer = m.senderRole === 'healer' || String(m.senderId).startsWith('H-');
              
              return (
                <div key={m.id || i} className={`flex flex-col ${isHealer ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-xs font-bold text-slate-600 tracking-tight">
                      {m.senderName || (isHealer ? 'Healer' : 'Seeker')}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {m.createdAt ? format(new Date(m.createdAt), "MMM d, h:mm a") : ''}
                    </span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[13.5px] font-medium leading-relaxed shadow-sm ${
                    isHealer 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}>
                    {m.text || m.message || '...'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
