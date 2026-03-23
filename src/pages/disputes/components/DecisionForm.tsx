import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { renderDecision } from "@/lib/disputes";
import type { DisputeDetail } from "@/lib/disputes";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Loader2, Gavel, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const decisionSchema = z.object({
  outcome: z.enum(['full_refund', 'partial_refund', 'credit', 'deny']),
  refundAmount: z.number().optional(),
  creditAmount: z.number().optional(),
  adminNotes: z.string().optional(),
}).refine(data => {
  if (data.outcome === 'partial_refund') return data.refundAmount !== undefined && data.refundAmount > 0;
  if (data.outcome === 'credit') return data.creditAmount !== undefined && data.creditAmount > 0;
  return true;
}, { message: "Valid amount constraint violated for outcome.", path: ["refundAmount"] }); 

export default function DecisionForm({ dispute, onUpdate }: { dispute: DisputeDetail, onUpdate: (d: DisputeDetail) => void }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof decisionSchema>>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      outcome: 'full_refund',
      adminNotes: ''
    }
  });

  const selectedOutcome = form.watch('outcome');

  const onSubmit = async () => {
    setIsConfirmOpen(false);
    setSubmitting(true);
    try {
      const payload = form.getValues();
      const updated = await renderDecision(dispute.id, payload);
      onUpdate(updated);
      alert("Decision rendered. Both parties have been notified.");
    } catch (err) {
      console.error(err);
      alert("Failed to render decision.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Read-only terminal state (once complete, it locks out)
  if (dispute.decision) {
    return (
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm mb-6 overflow-hidden">
        <div className="bg-emerald-100/70 border-b border-emerald-200 p-4 flex items-center justify-between">
           <h3 className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
             <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Decision Rendered
           </h3>
           <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded shadow-sm border border-emerald-100">
             {format(new Date(dispute.decision.renderedAt), "MMM d, yyyy")}
           </span>
        </div>
        <div className="p-5 space-y-5">
           <div>
             <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700/60 block mb-1">Final Outcome</span>
             <span className="text-emerald-950 font-black tracking-tight text-xl flex items-center gap-2 capitalize">
               {dispute.decision.outcome.replace('_', ' ')}
               {(dispute.decision.outcome === 'partial_refund' || dispute.decision.outcome === 'full_refund') && dispute.decision.refundAmount !== undefined && (
                 <span className="text-emerald-700 font-bold bg-emerald-200/50 px-2 py-0.5 rounded text-lg border border-emerald-200/50">${dispute.decision.refundAmount.toFixed(2)}</span>
               )}
               {dispute.decision.outcome === 'credit' && dispute.decision.creditAmount !== undefined && (
                 <span className="text-emerald-700 font-bold bg-emerald-200/50 px-2 py-0.5 rounded text-lg border border-emerald-200/50">${dispute.decision.creditAmount.toFixed(2)}</span>
               )}
             </span>
           </div>

           {dispute.decision.adminNotes && (
             <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 flex items-center gap-1.5">
                   Internal Rationale <LockIcon />
               </span>
               <p className="text-sm font-medium text-slate-600 italic whitespace-pre-wrap leading-relaxed">{dispute.decision.adminNotes}</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border-[3px] border-orange-300 shadow-md mb-6 overflow-hidden relative">
        <div className="bg-orange-50 border-b border-orange-200 p-4.5 py-3.5 flex items-center gap-2.5">
           <Gavel className="w-5 h-5 text-orange-600" />
           <h3 className="text-base font-bold text-orange-950 tracking-tight">Admin Final Decision</h3>
        </div>

        <form onSubmit={form.handleSubmit(() => setIsConfirmOpen(true))} className="p-5 space-y-6">
           
           <div className="space-y-3">
             <label className="text-[11.5px] uppercase tracking-widest font-bold text-slate-600">Resolution Outcome <span className="text-red-500">*</span></label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['full_refund', 'partial_refund', 'credit', 'deny'].map(opt => (
                  <label key={opt} className={`flex items-center gap-3 p-3.5 border hover:border-orange-400 rounded-xl cursor-pointer transition-all shadow-sm ${selectedOutcome === opt ? 'bg-orange-50/80 border-orange-400 ring-2 ring-orange-400/20' : 'border-slate-200 bg-white'}`}>
                    <input type="radio" value={opt} {...form.register("outcome")} className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300" />
                    <span className="text-sm font-bold text-slate-800 capitalize select-none tracking-tight">{opt.replace('_', ' ')}</span>
                  </label>
                ))}
             </div>
           </div>

           {selectedOutcome === 'partial_refund' && (
             <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
               <label className="text-[11.5px] uppercase tracking-widest font-bold text-slate-600">Refund Amount <span className="text-red-500">*</span></label>
               <div className="relative">
                 <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold">$</span>
                 <input type="number" step="0.01" min="0" max={dispute.requestedAmount || 9999} {...form.register("refundAmount", { valueAsNumber: true })} className="w-full pl-8 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm" placeholder="0.00" />
               </div>
               {form.formState.errors.refundAmount && <p className="text-xs text-red-500 font-bold mt-1.5">{form.formState.errors.refundAmount.message}</p>}
             </div>
           )}

           {selectedOutcome === 'credit' && (
             <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
               <label className="text-[11.5px] uppercase tracking-widest font-bold text-slate-600">Credit Amount <span className="text-red-500">*</span></label>
               <div className="relative">
                 <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold">$</span>
                 <input type="number" step="0.01" min="0" {...form.register("creditAmount", { valueAsNumber: true })} className="w-full pl-8 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm" placeholder="0.00" />
               </div>
               {form.formState.errors.creditAmount && <p className="text-xs text-red-500 font-bold mt-1.5">{form.formState.errors.creditAmount.message}</p>}
             </div>
           )}

           <div className="space-y-2">
             <label className="text-[11.5px] uppercase tracking-widest font-bold text-slate-600 flex justify-between">
               Admin Notes
               <span className="text-[9px] font-black tracking-widest text-[#B36200] bg-orange-100/50 border border-orange-200/50 px-2 py-0.5 rounded shadow-sm">Internal Only</span>
             </label>
             <textarea {...form.register("adminNotes")} placeholder="Document justification for this decision..." className="w-full text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl p-3.5 min-h-[100px] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none shadow-sm placeholder:font-medium" />
           </div>

           <div className="pt-2">
             <button type="submit" disabled={!form.formState.isValid || submitting} className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold tracking-wide text-sm py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_10px_rgba(234,88,12,0.3)] shadow-orange-600/30">
               {submitting ? <><Loader2 className="w-5 h-5 animate-spin"/> Binding Action...</> : "Render Final Decision"}
             </button>
           </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onSubmit}
        title="Confirm Administrative Decision"
        description="Are you sure you want to render this decision? This action is legally binding, will instantly notify both parties via email, and cannot be undone."
        confirmText="Yes, Render Decision"
        variant="destructive"
      />
    </>
  );
}

const LockIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
