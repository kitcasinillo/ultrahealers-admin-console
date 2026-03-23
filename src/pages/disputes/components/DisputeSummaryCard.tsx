import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DisputeDetail } from "@/lib/disputes";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function DisputeSummaryCard({ dispute }: { dispute: DisputeDetail }) {
  const getSeverityBadge = () => {
    if (dispute.severity === "safety") {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white border-red-500 font-bold px-2 py-0.5 whitespace-nowrap">
          Safety
        </Badge>
      );
    }
    return <Badge variant="outline">Normal</Badge>;
  };

  const getStatusBadge = () => {
    const s = dispute.status;
    let color = "bg-gray-100 text-gray-800 border-gray-200";
    let label = "Unknown";

    if (s === "open") {
      color = "bg-yellow-100 text-yellow-800 border-yellow-200";
      label = "Open";
    } else if (s === "in_review") {
      color = "bg-blue-100 text-blue-800 border-blue-200";
      label = "In Review";
    } else if (s.startsWith("resolved_")) {
      color = "bg-green-100 text-green-800 border-green-200";
      label = s.replace('resolved_', '').replace('_', ' ');
    } else if (s === "denied") {
      color = "bg-slate-100 text-slate-800 border-slate-200";
      label = "Denied";
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize border ${color}`}>
        {label}
      </span>
    );
  };

  const getTypeStr = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formattedSubmitted = dispute.submittedAt ? format(new Date(dispute.submittedAt), "MMM d, yyyy h:mm a") : "Unknown";
  const formattedDue = dispute.responseDueAt ? format(new Date(dispute.responseDueAt), "MMM d, yyyy h:mm a") : "Unknown";

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Dispute Core Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-6 text-sm">
          
          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Type</span>
            <Badge variant="secondary" className="font-medium text-slate-700">{getTypeStr(dispute.type)}</Badge>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Severity</span>
            {getSeverityBadge()}
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Status</span>
            {getStatusBadge()}
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Requested Amt</span>
            <div className="font-semibold text-slate-900 border border-slate-200 bg-slate-50 rounded px-2 mt-0.5 inline-block text-xs py-0.5 whitespace-nowrap">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: dispute.currency }).format(dispute.requestedAmount || 0)}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Booking ID</span>
            <Link to={`/bookings/sessions/${dispute.bookingId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-sm block">
              {dispute.bookingId}
            </Link>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Submitted At</span>
            <span className="text-slate-700 font-medium block">{formattedSubmitted}</span>
          </div>

          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Response Due</span>
            <span className={`block font-semibold ${dispute.isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
              {formattedDue} {dispute.isOverdue && "(Overdue)"}
            </span>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
