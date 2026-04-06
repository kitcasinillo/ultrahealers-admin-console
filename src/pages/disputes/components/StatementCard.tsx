import type { Evidence } from "@/lib/disputes";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export interface StatementEntry {
  id?: string;
  statement: string | null;
  evidence: Evidence[];
  submittedAt?: string | null;
}

interface StatementCardProps {
  party: 'seeker' | 'healer';
  name: string;
  userId: string;
  entries: StatementEntry[];
}

export default function StatementCard({ 
  party, name, userId, entries 
}: StatementCardProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isSeeker = party === 'seeker';
  const roleLabel = isSeeker ? "Seeker" : "Healer";
  const userPath = isSeeker ? `/users/seekers/${userId}` : `/users/healers/${userId}`;

  if (entries.length === 0) return null;

  // Sorting newest first to ensure entries[0] is the latest
  const sortedEntries = [...entries].sort((a, b) => {
    const d1 = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const d2 = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return d2 - d1;
  });

  const displayEntries = isExpanded ? sortedEntries : [sortedEntries[0]];

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm overflow-hidden transition-all duration-300">
        <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-end">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{roleLabel} Statement</h3>
            <Link to={userPath} className="text-lg font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              {name}
            </Link>
          </div>
          
          {entries.length > 1 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-all ring-1 ring-blue-100"
            >
              {isExpanded ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Show Latest Only</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> View All {entries.length} Reports</>
              )}
            </button>
          )}
        </div>

        <div className="space-y-12">
          {displayEntries.map((entry, idx) => (
            <div key={idx} className={idx !== 0 ? "pt-10 border-t border-slate-100 border-dashed animate-in fade-in slide-in-from-top-2 duration-300" : ""}>
              {entry.submittedAt && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded shadow-sm border border-slate-200">
                    {idx === 0 ? 'LATEST REPORT' : `REPORT #${entries.length - idx}`}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {format(new Date(entry.submittedAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              )}
              
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap mb-6 leading-relaxed">
                {entry.statement}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  Attached Evidence
                  <span className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {entry.evidence.length}
                  </span>
                </h4>
                
                {entry.evidence.length === 0 ? (
                  <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100 border-dashed">No evidence submitted.</p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {entry.evidence.map(ev => {
                      const isImage = ev.fileType.includes('image');
                      if (isImage) {
                        return (
                          <div 
                            key={ev.id} 
                            className="aspect-video lg:aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 ring-blue-500 ring-offset-1 transition-all flex items-center justify-center bg-slate-50 group relative"
                            onClick={() => setLightboxImage(ev.url)}
                          >
                            <img src={ev.url} alt={ev.filename} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        );
                      }
                      return (
                        <div key={ev.id} className="col-span-2 flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 hover:border-blue-200 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center text-blue-600 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate" title={ev.filename}>{ev.filename}</p>
                            <p className="text-xs text-slate-500 font-medium">{(ev.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                          <a href={ev.url} target="_blank" rel="noreferrer" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Download Document">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightweight Local Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <img 
             src={lightboxImage} 
             alt="Evidence Fullscreen" 
             className="max-w-full max-h-full rounded-md shadow-2xl object-contain border border-slate-800"
             onClick={e => e.stopPropagation()} 
          />
          <button 
             className="absolute top-6 right-6 text-white hover:text-white/80 font-bold bg-white/10 hover:bg-white/20 transition-colors w-10 h-10 rounded-full flex items-center justify-center"
             onClick={() => setLightboxImage(null)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
