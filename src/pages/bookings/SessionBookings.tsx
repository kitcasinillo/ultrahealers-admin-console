import { useEffect, useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useToast } from '../../contexts/ToastContext';
import {
  deleteBooking,
  fetchBookings,
  formatBookingStatus,
  formatPaymentStatus,
  type AdminBooking,
} from '../../lib/bookings';
import {
  BookingFiltersBar,
  resolveBookingDateRange,
  type BookingDatePreset,
} from './BookingFiltersBar';

const formatCurrency = (amount: number, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
}).format(amount || 0);

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export function SessionBookings() {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [datePreset, setDatePreset] = useState<BookingDatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [bookingToDelete, setBookingToDelete] = useState<AdminBooking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    try {
      setIsDeleting(true);
      await deleteBooking(bookingToDelete.id);
      setData((prev) => prev.filter((item) => item.id !== bookingToDelete.id));
      showToast('Booking permanently deleted.', 'success');
      setBookingToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete booking:', err);
      showToast(err?.response?.data?.error || err?.message || 'Failed to delete booking', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const { startDate, endDate } = resolveBookingDateRange(datePreset, customStartDate, customEndDate);

    const timeout = setTimeout(() => {
      const load = async () => {
        try {
          setLoading(true);
          setError(null);
          const results = await fetchBookings({
            q: search,
            status: statusFilter,
            type: 'session',
            paymentStatus: paymentStatusFilter,
            startDate,
            endDate,
          });
          if (!mounted) return;
          setData(results);
        } catch (err: any) {
          console.error('Failed to load session bookings:', err);
          if (!mounted) return;
          setError(err?.response?.data?.error || err?.message || 'Failed to load session bookings');
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
  }, [search, statusFilter, paymentStatusFilter, datePreset, customStartDate, customEndDate]);

  const columns = useMemo<ColumnDef<AdminBooking>[]>(() => [
    {
      accessorKey: 'listingTitle',
      header: 'Listing',
      cell: ({ row }) => (
        <Link to={`/bookings/sessions/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.listingTitle}
        </Link>
      ),
    },
    {
      accessorKey: 'healerName',
      header: 'Healer',
    },
    {
      accessorKey: 'seekerName',
      header: 'Seeker',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'completed' ? 'outline' : row.original.status === 'confirmed' ? 'default' : 'secondary'}>
          {formatBookingStatus(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => (
        <Badge variant={row.original.paymentStatus === 'succeeded' ? 'outline' : 'secondary'}>
          {formatPaymentStatus(row.original.paymentStatus)}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.amount, row.original.currency)}</div>,
    },
    {
      accessorKey: 'sessionDate',
      header: 'Session Date',
      cell: ({ row }) => formatDate(row.original.sessionDate || row.original.createdAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" className="h-8 w-8 p-0" asChild>
            <Link to={`/bookings/sessions/${row.original.id}`}>
              <span className="sr-only">Open booking</span>
              <MoreHorizontal className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            onClick={() => setBookingToDelete(row.original)}
            title="Delete booking"
          >
            <span className="sr-only">Delete booking</span>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Session Bookings</h2>
        <p className="text-[#A3AED0] text-sm mt-1 font-medium">Review and manage live session bookings from the backend.</p>
      </div>

      <BookingFiltersBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search by booking, healer, seeker, listing"
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        onClear={() => {
          setSearch('');
          setStatusFilter('');
          setPaymentStatusFilter('');
          setDatePreset('all');
          setCustomStartDate('');
          setCustomEndDate('');
        }}
      />

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</div>}

      <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
        {loading ? <div className="py-16 text-center text-sm text-[#A3AED0]">Loading session bookings...</div> : <DataTable columns={columns} data={data} />}
      </div>

      <ConfirmModal
        isOpen={!!bookingToDelete}
        onClose={() => !isDeleting && setBookingToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Booking Permanently?"
        description={
          bookingToDelete
            ? `Warning: You are about to permanently delete booking "${bookingToDelete.listingTitle}" (${bookingToDelete.seekerName} with ${bookingToDelete.healerName}, ${formatCurrency(bookingToDelete.amount, bookingToDelete.currency)}). This cannot be undone, will remove it from Finance and Financial Reports, and will NOT issue a Stripe refund.`
            : ''
        }
        confirmText="Delete Booking"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
