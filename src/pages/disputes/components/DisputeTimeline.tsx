import type { DisputeDetail } from "@/lib/disputes";
import { CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";

export default function DisputeTimeline({ dispute }: { dispute: DisputeDetail }) {
  const steps = dispute.timeline;
  
  let currentIndex = -1;
  steps.forEach((s, idx) => {
      if (s.completedAt) currentIndex = idx;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
        <Clock className="w-5 h-5 text-slate-400" />
        Resolution Timeline
      </h3>
      
      <div className="relative pl-3 mt-4">
        {/* Background connector line */}
        <div className="absolute top-2 left-[19px] bottom-6 w-0.5 bg-slate-100"></div>
        
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isCompleted = !!step.completedAt;
            // Highlight the most recent completed step, unless the dispute is entirely resolved
            const isResolvedStatus = dispute.status.startsWith("resolved_") || dispute.status === "denied";
            const isFinishedStep = idx === steps.length - 1;
            const isCurrent = (idx === currentIndex && !isResolvedStatus) || (isFinishedStep && isResolvedStatus);

            return (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="relative z-10 flex items-center justify-center bg-white h-7">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white" />
                  ) : (
                    <div className={clsx("w-3 h-3 rounded-full border-2 ml-1 bg-white", 
                      isCurrent ? "border-blue-500 bg-blue-100" : "border-slate-300"
                    )} />
                  )}
                </div>
                
                <div className="flex-1 pb-1">
                  <p className={clsx("font-semibold text-sm leading-tight", 
                    isCompleted ? "text-slate-800" : (isCurrent ? "text-blue-700" : "text-slate-400")
                  )}>
                    {step.label}
                  </p>
                  
                  {isCompleted && step.completedAt ? (
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {format(new Date(step.completedAt), "MMM d, yyyy h:mm a")}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">
                      {idx === 1 && !isCompleted && dispute.responseDueAt ? `Due by ${format(new Date(dispute.responseDueAt), "MMM d")}` : "Pending"}
                    </p>
                  )}
                  
                  {isFinishedStep && isCompleted && dispute.decision && (
                     <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 shadow-sm">
                        <span className="font-bold text-slate-800 capitalize block mb-1">Outcome: {dispute.decision.outcome.replace('_', ' ')}</span>
                        {dispute.decision.adminNotes && <span className="italic block mt-1 text-slate-500">"{dispute.decision.adminNotes}"</span>}
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
