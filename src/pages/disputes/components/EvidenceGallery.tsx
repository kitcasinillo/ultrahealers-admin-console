import { useState, useCallback, useEffect } from "react";
import type { DisputeDetail } from "@/lib/disputes";
import { FileText, Download, ImageIcon } from "lucide-react";
import { format } from "date-fns";

export default function EvidenceGallery({ dispute }: { dispute: DisputeDetail }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allEvidence = [...dispute.seekerEvidence, ...dispute.healerEvidence].sort(
    (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
  );

  const images = allEvidence.filter(e => e.fileType.includes('image'));
  const docs = allEvidence.filter(e => !e.fileType.includes('image'));

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === "Escape") setLightboxIndex(null);
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (allEvidence.length === 0) {
    return (
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 border-dashed p-8 shadow-sm mb-6 text-center">
         <div className="w-14 h-14 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
           <ImageIcon className="w-6 h-6 text-slate-400" />
         </div>
         <h3 className="text-sm font-bold text-slate-700">No evidence uploaded</h3>
         <p className="text-sm text-slate-500 mt-1">Neither party has submitted media for this dispute.</p>
      </div>
    );
  }

  const handlePrev = () => {
    setLightboxIndex(prev => prev !== null ? (prev - 1 + images.length) % images.length : null);
  };
  const handleNext = () => {
    setLightboxIndex(prev => prev !== null ? (prev + 1) % images.length : null);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3">Evidence Gallery</h3>
        
        {images.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {images.map((ev, idx) => (
                  <div 
                    key={ev.id} 
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-pointer group hover:ring-4 hover:border-slate-300 ring-slate-100 ring-offset-2 transition-all bg-slate-50"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img src={ev.url} alt={ev.filename} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 translate-y-2 group-hover:translate-y-0 transition-transform">
                       <p className="text-white text-xs font-semibold truncate capitalize">{ev.uploadedBy}</p>
                       <p className="text-white/60 text-[10px] font-medium truncate">{format(new Date(ev.uploadedAt), "MMM d")}</p>
                    </div>
                  </div>
               ))}
            </div>
          </div>
        )}

        {docs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Documents</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {docs.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors shadow-sm bg-white">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center shrink-0">
                       <FileText className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate" title={ev.filename}>{ev.filename}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-slate-500">
                           <span className={ev.uploadedBy === 'seeker' ? 'text-blue-600 font-semibold capitalize' : 'text-emerald-600 font-semibold capitalize'}>
                             {ev.uploadedBy}
                           </span>
                           <span>&bull;</span>
                           <span>{(ev.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                     </div>
                     <a href={ev.url} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-slate-500 rounded-md transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                     </a>
                  </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox UI strictly implemented in-memory without external libraries */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div 
          className="fixed inset-0 z-[100] bg-zinc-950/95 flex items-center justify-center p-4 sm:p-8 backdrop-blur"
          onClick={() => setLightboxIndex(null)}
        >
          <button 
            className="absolute left-4 p-4 text-white/50 hover:text-white transition-colors outline-none z-10"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div className="relative max-w-5xl max-h-full flex flex-col items-center justify-center outline-none" onClick={e => e.stopPropagation()}>
            <img 
               src={images[lightboxIndex].url} 
               alt={images[lightboxIndex].filename} 
               className="max-w-full max-h-[85vh] rounded object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            />
            <div className="mt-5 text-center bg-black/50 px-6 py-2 pb-2.5 rounded-full backdrop-blur-md border border-white/5">
              <p className="text-white/90 font-semibold text-sm max-w-[300px] truncate">{images[lightboxIndex].filename}</p>
              <p className="text-white/50 text-xs mt-0.5 font-medium tracking-wide">
                <span className="capitalize text-white/80">{images[lightboxIndex].uploadedBy}</span> • {format(new Date(images[lightboxIndex].uploadedAt), "PPP p")}
              </p>
            </div>
          </div>

          <button 
            className="absolute right-4 p-4 text-white/50 hover:text-white transition-colors outline-none z-10"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <button 
             className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10"
             onClick={() => setLightboxIndex(null)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}
    </>
  );
}
