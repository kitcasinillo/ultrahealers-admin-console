import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../contexts/ToastContext';
import { fetchBookingDetail, type AdminBookingDetail, updateBookingStatus } from '../../lib/bookings';

const formatCurrency = (amount: number, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
}).format(amount || 0);

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export function BookingDetail() {
  const { id = '', type = 'sessions' } = useParams();
  const [data, setData] = useState<AdminBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchBookingDetail(id);
        if (!mounted) return;
        setData(result);
      } catch (err: any) {
        console.error('Failed to load booking detail:', err);
        if (!mounted) return;
        setError(err?.response?.data?.error || err?.message || 'Failed to load booking detail');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!id || !data) return;
    try {
      setSaving(true);
      await updateBookingStatus(id, status);
      setData((prev) => prev ? { ...prev, status } : prev);
      showToast(`Booking status updated to ${status}.`, 'success');
    } catch (err: any) {
      console.error('Failed to update booking status:', err);
      showToast(err?.response?.data?.error || err?.message || 'Failed to update booking status', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to={type === 'retreats' ? '/bookings/retreats' : '/bookings/sessions'}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{data?.listingTitle || 'Booking Detail'}</h2>
            {data && <Badge variant={data.status === 'completed' ? 'outline' : data.status === 'confirmed' ? 'default' : 'secondary'}>{data.status}</Badge>}
            {data && <Badge variant="secondary">{data.bookingType}</Badge>}
          </div>
          <p className="text-muted-foreground text-sm">Booking ID: {id}</p>
        </div>
      </div>

      {loading && <div className="rounded-2xl bg-white dark:bg-[#111C44] p-6 text-sm text-[#A3AED0]">Loading booking details...</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</div>}

      {!loading && !error && data && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full lg:col-span-2 space-y-6">
            <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-lg">Booking Details</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div><span className="text-muted-foreground block mb-1">Listing</span><span className="font-medium">{data.listingTitle}</span></div>
                <div><span className="text-muted-foreground block mb-1">Listing ID</span><span className="font-medium">{data.listingId || '—'}</span></div>
                <div><span className="text-muted-foreground block mb-1">Healer</span><span className="font-medium">{data.healerName}</span></div>
                <div><span className="text-muted-foreground block mb-1">Seeker</span><span className="font-medium">{data.seekerName}</span></div>
                <div><span className="text-muted-foreground block mb-1">Amount</span><span className="font-medium">{formatCurrency(data.amount, data.currency)}</span></div>
                <div><span className="text-muted-foreground block mb-1">Payment Status</span><span className="font-medium">{data.paymentStatus}</span></div>
                <div><span className="text-muted-foreground block mb-1">Session Date</span><span className="font-medium">{formatDate(data.sessionDate)}</span></div>
                <div><span className="text-muted-foreground block mb-1">Session Time</span><span className="font-medium">{data.sessionTime || '—'}</span></div>
                <div><span className="text-muted-foreground block mb-1">Format</span><span className="font-medium">{data.format || '—'}</span></div>
                <div><span className="text-muted-foreground block mb-1">Modality</span><span className="font-medium">{data.modality || '—'}</span></div>
                <div><span className="text-muted-foreground block mb-1">Created</span><span className="font-medium">{formatDate(data.createdAt)}</span></div>
                <div><span className="text-muted-foreground block mb-1">Updated</span><span className="font-medium">{formatDate(data.updatedAt)}</span></div>
              </div>
            </div>

            <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-lg">Transcript / Session Messages</h3>
              {Array.isArray(data.transcript) && data.transcript.length > 0 ? (
                <div className="space-y-3">
                  {data.transcript.map((message, index) => (
                    <div key={index} className="rounded-xl border border-border/50 p-3 text-sm">
                      <div className="font-medium">{String(message.senderName || message.sender || 'Unknown')}</div>
                      <div className="text-muted-foreground mt-1 whitespace-pre-wrap">{String(message.message || message.text || '')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transcript/messages found for this booking.</p>
              )}
            </div>
          </div>

          <div className="col-span-full lg:col-span-1 space-y-6">
            <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-lg">Admin Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Override Status</label>
                  <select value={data.status} onChange={(e) => handleStatusChange(e.target.value)} className="w-full border rounded-md p-2 bg-background text-sm" disabled={saving}>
                    <option value="created">created</option>
                    <option value="pending_confirmation">pending_confirmation</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Updates the backend booking status flags.</p>
                </div>
                <div className="pt-4 border-t text-sm text-muted-foreground space-y-2">
                  <p>Healer Email: <span className="font-medium text-foreground break-all">{data.healerEmail || '—'}</span></p>
                  <p>Seeker Email: <span className="font-medium text-foreground break-all">{data.seekerEmail || '—'}</span></p>
                </div>
              </div>
            </div>

            {data.bookingType === 'retreat' && data.retreatRecord && (
              <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                <h3 className="font-semibold mb-4">Retreat Record</h3>
                <pre className="text-xs whitespace-pre-wrap break-all text-muted-foreground">{JSON.stringify(data.retreatRecord, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
