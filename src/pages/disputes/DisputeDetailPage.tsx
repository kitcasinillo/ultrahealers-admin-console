import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDisputeById, escalateDispute, sendDisputeEmail, type DisputeDetail } from "@/lib/disputes";
import { ArrowLeft, Loader2, CheckCircle2, ShieldAlert, Mail, ExternalLink } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import DisputeSummaryCard from "./components/DisputeSummaryCard";
import DisputeTimeline from "./components/DisputeTimeline";
import StatementCard from "./components/StatementCard";
import EvidenceGallery from "./components/EvidenceGallery";
import ChatTranscript from "./components/ChatTranscript";
import BookingDetailsCard from "./components/BookingDetailsCard";
import DecisionForm from "./components/DecisionForm";
import InternalNotes from "./components/InternalNotes";

export default function DisputeDetailPage() {
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [escalating, setEscalating] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDisputeById(id)
      .then(data => setDispute(data))
      .catch(err => {
        console.error(err);
        showToast("Failed to locate dispute details.", "error");
        navigate("/disputes");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleEscalate = async () => {
    if (!dispute) return;
    setIsEscalateModalOpen(false);
    setEscalating(true);
    try {
      const updated = await escalateDispute(dispute.id);
      setDispute(prev => prev ? { ...prev, severity: updated.severity } : null);
      showToast("Dispute escalated to safety.");
    } catch (err) {
      console.error(err);
      showToast("Failed to escalate dispute.", "error");
    } finally {
      setEscalating(false);
    }
  };

  const handleEmail = async () => {
    if (!dispute) return;
    setEmailing(true);
    try {
      await sendDisputeEmail(dispute.id);
      showToast("Email notification sent to both parties.");
    } catch (err) {
      console.error(err);
      showToast("Failed to send email.", "error");
    } finally {
      setEmailing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center p-6 bg-slate-50/50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Decyphering Case Ledger...</h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">Retrieving cross-referenced evidence, statements, and timeline states.</p>
        </div>
      </div>
    );
  }

  if (!dispute) return null;

  const isSafety = dispute.severity === 'safety';
  const isResolved = dispute.status.startsWith('resolved_') || dispute.status === 'denied';

  return (
    <div className="flex flex-col flex-1 bg-slate-50 overflow-hidden">

      {/* 1. Alert Banners */}
      {isResolved && (
        <div className="bg-emerald-600 text-white px-6 py-3.5 flex items-center justify-center shadow-inner shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-sm tracking-wide">
            <CheckCircle2 className="w-5 h-5 opacity-90" />
            This dispute has been resolved — {dispute.decision?.outcome.replace('_', ' ') || 'Unknown'} on {dispute.decision?.renderedAt ? new Date(dispute.decision.renderedAt).toLocaleDateString() : 'Unknown date'}
          </div>
        </div>
      )}
      {!isResolved && isSafety && (
        <div className="bg-red-600 text-white px-6 py-3.5 flex items-center justify-center shadow-inner shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-sm tracking-wide">
            <ShieldAlert className="w-5 h-5 opacity-90" />
            This is a Safety dispute. Handle with priority.
          </div>
        </div>
      )}

      {/* 2. Fixed Header Section */}
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm z-10 transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 tracking-wide uppercase">
                <Link to="/disputes" className="hover:text-slate-800 transition-colors flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <ArrowLeft className="w-3.5 h-3.5" /> Disputes Back
                </Link>
                <span>/</span>
                <span className="text-slate-600 tracking-tight">{dispute.id}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                Case #{dispute.id}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dual Column Scrollable Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] gap-8 h-full">

          {/* Left Column Scrollable */}
          <div className="sticky top-6 self-start h-[calc(100vh-230px)] overflow-y-auto hide-scrollbar pr-4 space-y-6 pb-24">
            <DisputeSummaryCard dispute={dispute} />
            <DisputeTimeline dispute={dispute} />

            <StatementCard
              party="seeker"
              name={dispute.seekerName}
              userId={dispute.seekerId}
              entries={[
                {
                  statement: dispute.seekerStatement,
                  evidence: dispute.seekerEvidence,
                  submittedAt: dispute.submittedAt
                },
                {
                  statement: "Example 2: The healer was unresponsive to my initial complaints and seemed indifferent to the technical issues I was facing. I expect better support when paying for a premium spiritual session. The connection issues were definitely on their side.",
                  evidence: [],
                  submittedAt: new Date(Date.now() - 3600000).toISOString()
                },
                {
                  statement: "Example 3: Adding to my previous report: I also checked my internet connection during the session and it was perfectly stable on other sites. The healer's video was freezing every 2 minutes. This session should definitely be refunded.",
                  evidence: [],
                  submittedAt: new Date(Date.now() - 7200000).toISOString()
                }
              ]}
            />

            <StatementCard
              party="healer"
              name={dispute.healerName}
              userId={dispute.healerId}
              entries={[
                {
                  statement: dispute.healerStatement,
                  evidence: dispute.healerEvidence,
                  submittedAt: new Date().toISOString()
                },
                {
                  statement: "Example 2: I have conducted over 500 sessions and never had this issue. I believe the seeker might be using an outdated browser or has some firewall settings blocking the video stream. I am happy to offer a 15-minute follow-up for free.",
                  evidence: [],
                  submittedAt: new Date(Date.now() - 43200000).toISOString()
                },
                {
                  statement: "Example 3: Initial response was delayed because I was traveling. I was present 5 minutes before the session started. The seeker joined late and immediately started complaining about the quality before we even began the healing process.",
                  evidence: [],
                  submittedAt: new Date(Date.now() - 129600000).toISOString()
                },
                {
                  statement: "Example 4: I have logs showing my upload speed was 50Mbps throughout. Any slowdown was certainly on the client side. I don't feel a refund is appropriate.",
                  evidence: [],
                  submittedAt: new Date(Date.now() - 172800000).toISOString()
                }
              ]}
            />

            <EvidenceGallery dispute={dispute} />
            <ChatTranscript bookingId={dispute.bookingId} />
            <BookingDetailsCard dispute={dispute} />
          </div>

          {/* Right Column Scrollable */}
          <div className="sticky top-6 self-start h-[calc(100vh-230px)] overflow-y-auto hide-scrollbar pr-2 space-y-6 pb-24">
            <DecisionForm dispute={dispute} onUpdate={setDispute} />
            <InternalNotes disputeId={dispute.id} initialNotes={dispute.internalNotes} />

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3.5">
              <h3 className="text-[11.5px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Shortcuts</h3>

              {!isSafety && (
                <button
                  onClick={() => setIsEscalateModalOpen(true)}
                  disabled={escalating}
                  className="w-full flex items-center justify-between px-4.5 py-3.5 bg-white hover:bg-red-50 border-2 border-slate-100 hover:border-red-200 text-red-600 rounded-xl transition-all font-bold text-[13.5px] group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4.5 h-4.5 text-red-500 group-hover:scale-110 transition-transform" /> Escalate to Safety
                  </span>
                  {escalating && <Loader2 className="w-4 h-4 animate-spin text-red-400" />}
                </button>
              )}

              <button
                onClick={handleEmail}
                disabled={emailing}
                className="w-full flex items-center justify-between px-4.5 py-3.5 bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-slate-300 text-slate-700 rounded-xl transition-all font-bold text-[13.5px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className="flex items-center gap-2.5">
                  <Mail className="w-4.5 h-4.5 text-slate-400 group-hover:text-blue-500 transition-colors" /> Trigger Email Resend
                </span>
                {emailing && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </button>

              <a
                href={dispute.booking.paymentIntentId ? `https://dashboard.stripe.com/payments/${dispute.booking.paymentIntentId}` : '#'}
                target={dispute.booking.paymentIntentId ? "_blank" : undefined}
                rel="noreferrer"
                className={`w-full flex items-center justify-between px-4.5 py-3.5 bg-slate-50 border-2 border-slate-100 text-indigo-700 rounded-xl transition-all font-bold text-[13.5px] ${dispute.booking.paymentIntentId ? 'hover:bg-indigo-50 hover:border-indigo-200 shadow-sm group' : 'opacity-50 cursor-not-allowed grayscale'}`}
              >
                <span className="flex items-center gap-2.5">
                  <svg viewBox="0 0 40 40" className={`w-4.5 h-4.5 fill-current ${dispute.booking.paymentIntentId && 'group-hover:scale-110 transition-transform'}`}><path d="M20 0C8.95 0 0 8.95 0 20s8.95 20 20 20 20-8.95 20-20S31.05 0 20 0zm6.95 14.88c-.02 4.19-2.61 7.21-6.75 7.21h-2.53v6.33h-3.41V10.23h5.92c4.15 0 6.78 2.01 6.77 4.65zm-6.19 4.34c2.2 0 3.34-1.2 3.34-2.84 0-1.74-1.25-2.82-3.3-2.82h-2.73v5.66h2.69z" /></svg>
                  Stripe Trace
                </span>
                <ExternalLink className="w-4.5 h-4.5 text-indigo-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        onConfirm={handleEscalate}
        title="Escalate to Safety"
        description="Are you sure you want to escalate this dispute to Safety severity? This will alert the Trust and Safety team immediately and flag all involved accounts."
        confirmText="Escalate"
        variant="destructive"
      />
    </div>
  );
}
