import { useState } from "react";
import type { InternalNote } from "@/lib/disputes";
import { format } from "date-fns";
import { Lock, AlertTriangle } from "lucide-react";

export default function InternalNotes({ disputeId: _disputeId, initialNotes }: { disputeId: string, initialNotes: InternalNote[] }) {
  const [notes] = useState<InternalNote[]>(initialNotes);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col overflow-hidden">
      <div className="bg-amber-50/80 border-b border-amber-100 p-4 flex items-center justify-between">
        <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-700" /> Internal Notes
        </h3>
        <span className="bg-amber-100 text-amber-800 text-[9px] uppercase tracking-wider font-extrabold px-2 py-1 rounded shadow-sm border border-amber-200/50">Admins Only</span>
      </div>

      <div className="p-4 bg-slate-50 border-b border-slate-100 flex-1 h-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-500 font-medium italic text-center mt-6 mb-8 bg-white border border-slate-100 rounded-lg p-4 mx-2 border-dashed shadow-sm">No administrative notes yet.</p>
        ) : (
          <div className="space-y-4">
            {notes.map(n => (
              <div key={n.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm relative group hover:border-amber-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-800">{n.adminName}</span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wide">{format(new Date(n.createdAt), "MMM d, h:mm a")}</span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed break-words whitespace-pre-wrap">{n.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-700" />
          <div>
            <div className="font-bold">Internal notes are read-only right now.</div>
            <div className="mt-1 text-amber-800">The current backend does not expose an endpoint for creating dispute notes yet.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
