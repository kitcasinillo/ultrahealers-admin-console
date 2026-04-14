import type { DisputeDetail } from "@/lib/disputes";
import { Link } from "react-router-dom";
import { ExternalLink, Receipt } from "lucide-react";

export default function BookingDetailsCard({ dispute }: { dispute: DisputeDetail }) {
  const b = dispute.booking;
  
  const base = b.baseAmount;
  const healerCommission = base * 0.10;
  const healerPayout = base - healerCommission;
  
  const seekerFee = base * 0.05;
  const stripeFee = (base + seekerFee) * 0.029 + 0.30; 
  
  const platformRevenue = healerCommission + seekerFee - stripeFee;

  const fmt = (amt: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: b.currency }).format(amt);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
       <div className="bg-slate-50 border-b border-slate-200 flex items-center gap-2.5 p-4">
          <Receipt className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Booking Financials</h3>
       </div>
       
       <div className="p-5">
         <div className="space-y-4">
           
           <div className="grid grid-cols-2 text-sm">
             <span className="text-slate-500 font-medium tracking-wide">Booking ID</span>
             <span className="text-slate-900 font-mono tracking-tight text-right select-all">{b.id}</span>
           </div>
           
           <div className="grid grid-cols-2 text-sm">
             <span className="text-slate-500 font-medium">Session Date</span>
             <span className="text-slate-900 font-semibold text-right">{new Date(b.sessionDate).toLocaleDateString()}</span>
           </div>

           <div className="grid grid-cols-[1fr_2fr] text-sm">
             <span className="text-slate-500 font-medium">Listing</span>
             {b.listingId ? (
               <Link to={`/listings/${b.listingId}`} className="text-blue-600 hover:text-blue-800 hover:underline text-right font-medium truncate ml-auto inline-block max-w-[200px]" title={b.listingTitle}>
                 {b.listingTitle}
               </Link>
             ) : (
               <span className="text-slate-500 text-right font-medium">{b.listingTitle}</span>
             )}
           </div>
           
           <div className="grid grid-cols-2 text-sm border-b border-slate-100 pb-4">
             <span className="text-slate-500 font-medium">Seeker</span>
             <Link to={`/users/seekers/${dispute.seekerId}`} className="text-blue-600 hover:text-blue-800 hover:underline text-right font-medium">
               {dispute.seekerName}
             </Link>
           </div>

           {/* Financials block */}
           <div className="grid grid-cols-2 text-sm pt-2">
             <span className="text-slate-500 font-medium">Base Amount</span>
             <span className="text-slate-900 font-semibold text-right">{fmt(base)}</span>
           </div>
           
           <div className="grid grid-cols-2 text-sm">
             <span className="text-slate-500 font-medium">Seeker Fee (5%)</span>
             <span className="text-slate-600 text-right">+{fmt(seekerFee)}</span>
           </div>

           <div className="grid grid-cols-2 text-sm">
             <span className="text-slate-500 font-medium">Healer Commission (10%)</span>
             <span className="text-pink-600 font-medium text-right">-{fmt(healerCommission)}</span>
           </div>
           
           <div className="grid grid-cols-2 text-sm border-b border-slate-100 pb-4">
             <span className="text-slate-500 font-medium">Stripe Processing Fee</span>
             <span className="text-pink-600 font-medium text-right">-{fmt(stripeFee)}</span>
           </div>

           {/* Outcomes */}
           <div className="grid grid-cols-2 text-sm pt-1 pb-1">
             <span className="text-slate-700 font-bold uppercase tracking-wider text-xs flex items-center">Healer Payout</span>
             <span className="text-emerald-600 font-black text-right text-base">{fmt(healerPayout)}</span>
           </div>

           <div className="grid grid-cols-2 text-sm pb-5 border-b border-slate-100">
             <span className="text-slate-700 font-bold uppercase tracking-wider text-xs flex items-center">Platform Net</span>
             <span className="text-blue-700 font-black text-right text-base">{fmt(platformRevenue)}</span>
           </div>

           <div className="pt-2">
             <span className="text-slate-400 text-[11px] uppercase font-bold tracking-widest mb-2.5 block">Payment Intent Trace</span>
             <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded truncate flex-1 min-w-0 mr-3">
                  {b.paymentIntentId || 'None Generated'}
                </span>
                <a 
                  href={b.paymentIntentId ? `https://dashboard.stripe.com/payments/${b.paymentIntentId}` : '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap px-3.5 py-2 rounded-md transition shadow-sm ${b.paymentIntentId ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:shadow shadow-indigo-100/50' : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed pointer-events-none'}`}
                >
                  Stripe <ExternalLink className="w-3.5 h-3.5" />
                </a>
             </div>
           </div>
           
         </div>
       </div>
    </div>
  );
}
