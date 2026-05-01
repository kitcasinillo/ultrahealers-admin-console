import { useEffect, useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Search, X } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { fetchBookings, type AdminBooking } from '../../lib/bookings';

const formatCurrency = (amount: number, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
}).format(amount || 0);

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export function RetreatBookings() {
  const [data, setData] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  useEffect(() => {
    let mounted = true;

    const timeout = setTimeout(() => {
      const load = async () => {
        try {
          setLoading(true);
          setError(null);
          const results = await fetchBookings({
            q: search,
            status: statusFilter,
            type: 'retreat',
            paymentStatus: paymentStatusFilter,
          });
          if (!mounted) return;
          setData(results);
        } catch (err: any) {
          console.error('Failed to load retreat bookings:', err);
          if (!mounted) return;
          setError(err?.response?.data?.error || err?.message || 'Failed to load retreat bookings');
        } finally {
          if (mounted) setLoading(false);
        }
      };

      load();
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [search, statusFilter, paymentStatusFilter]);

  const columns = useMemo<ColumnDef<AdminBooking>[]>(() => [
    {
      accessorKey: 'listingTitle',
      header: 'Retreat',
      cell: ({ row }) => (
        <Link to={`/bookings/retreats/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.listingTitle}
        </Link>
      ),
    },
    {
      accessorKey: 'healerName',
      header: 'Host',
    },
    {
      accessorKey: 'seekerName',
      header: 'Guest',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.status === 'completed' ? 'outline' : row.original.status === 'confirmed' ? 'default' : 'secondary'}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => <Badge variant={row.original.paymentStatus === 'succeeded' ? 'outline' : 'secondary'}>{row.original.paymentStatus}</Badge>,
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.amount, row.original.currency)}</div>,
    },
    {
      accessorKey: 'sessionDate',
      header: 'Start Date',
      cell: ({ row }) => formatDate(row.original.sessionDate || row.original.createdAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" className="h-8 w-8 p-0" asChild>
          <Link to={`/bookings/retreats/${row.original.id}`}>
            <span className="sr-only">Open booking</span>
            <MoreHorizontal className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Retreat Bookings</h2>
        <p className="text-[#A3AED0] text-sm mt-1 font-medium">Review and manage live retreat bookings from the backend.</p>
      </div>

      <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-4 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3AED0]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by booking, host, guest, retreat" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white">
            <option value="">All statuses</option>
            <option value="created">created</option>
            <option value="pending_confirmation">pending_confirmation</option>
            <option value="confirmed">confirmed</option>
            <option value="completed">completed</option>
          </select>
          <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#4318FF] dark:border-white/10 dark:bg-white/5 dark:text-white">
            <option value="">All payment states</option>
            <option value="succeeded">succeeded</option>
            <option value="pending">pending</option>
            <option value="failed">failed</option>
          </select>
          <Button type="button" variant="ghost" onClick={() => { setSearch(''); setStatusFilter(''); setPaymentStatusFilter(''); }} disabled={!search && !statusFilter && !paymentStatusFilter}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</div>}

      <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
        {loading ? <div className="py-16 text-center text-sm text-[#A3AED0]">Loading retreat bookings...</div> : <DataTable columns={columns} data={data} />}
      </div>
    </div>
  );
}
