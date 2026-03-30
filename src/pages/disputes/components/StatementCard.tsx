import type { Evidence } from "@/lib/disputes";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { FileText, Download } from "lucide-react";
import { useState } from "react";

interface StatementCardProps {
  party: 'seeker' | 'healer';
  name: string;
  userId: string;
  statement: string | null;
  evidence: Evidence[];
  submittedAt?: string | null;
  responseDueAt?: string;
}

export default function StatementCard({ 
  party, name, userId, statement, evidence, submittedAt, responseDueAt 
}: StatementCardProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isSeeker = party === 'seeker';
  const roleLabel = isSeeker ? "Seeker" : "Healer";
  const userPath = isSeeker ? `/users/seekers/${userId}` : `/users/healers/${userId}`;

  // "No Response Yet" State
  if (party === 'healer' && !statement) {
    return (
      <div className="bg-slate-50/50 border border-slate-200 border-dashed rounded-xl p-6 mb-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Healer Statement</h3>
        <p className="text-slate-600 font-medium">Healer has not submitted a response yet.</p>
        <p className="text-sm text-slate-500 mt-1">
          {responseDueAt ? `Response due by: ${format(new Date(responseDueAt), "MMM d, yyyy h:mm a")}` : "Response due date unknown."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm overflow-hidden">
        <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{roleLabel} Statement</h3>
            <Link to={userPath} className="text-lg font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              {name}
            </Link>
          </div>
          {submittedAt && (
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Submitted</span>
              <span className="text-sm text-slate-600 font-medium">
                {format(new Date(submittedAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          )}
        </div>

        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap mb-6 leading-relaxed">
          {statement}
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            Attached Evidence
            <span className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-xs font-semibold">{evidence.length}</span>
          </h4>
          
          {evidence.length === 0 ? (
            <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100 border-dashed">No evidence submitted with this statement.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {evidence.map(ev => {
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
