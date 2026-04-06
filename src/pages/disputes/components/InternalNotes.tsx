import { useState } from "react";
import { addInternalNote, type InternalNote } from "@/lib/disputes";
import { format } from "date-fns";
import { Lock, Loader2 } from "lucide-react";

export default function InternalNotes({ disputeId, initialNotes }: { disputeId: string, initialNotes: InternalNote[] }) {
  const [notes, setNotes] = useState<InternalNote[]>(initialNotes);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const newNote = await addInternalNote(disputeId, text);
      setNotes(prev => [...prev, newNote]);
      setText("");
    } catch (err) {
      console.error(err);
      alert("Failed to add note.");
    } finally {
      setSaving(false);
    }
  };

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

      <div className="p-4 bg-white">
        <form onSubmit={handleSubmit}>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Document internal investigation..."
            className="w-full text-sm font-medium border border-slate-200 rounded-lg p-3 min-h-[90px] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none shadow-sm placeholder:text-slate-400 transition-all outline-none"
            disabled={saving}
          />
          <button 
            type="submit" 
            disabled={!text.trim() || saving}
            className="mt-3 w-full bg-slate-900 hover:bg-black text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-slate-900/10"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving...</> : "Add Internal Note"}
          </button>
        </form>
      </div>
    </div>
  );
}
