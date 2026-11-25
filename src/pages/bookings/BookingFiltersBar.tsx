import { Calendar, Check, ChevronDown, CreditCard, ListFilter, Search, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  BOOKING_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  formatBookingStatus,
  formatPaymentStatus,
} from '../../lib/bookings';

export type BookingDatePreset = 'all' | 'today' | '7d' | '30d' | 'month' | 'custom';

const DATE_PRESET_OPTIONS: Array<{ value: Exclude<BookingDatePreset, 'custom'>; label: string }> = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
];

const toLocalDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function resolveBookingDateRange(
  preset: BookingDatePreset,
  customStartDate: string,
  customEndDate: string
): { startDate?: string; endDate?: string } {
  const now = new Date();
  const todayStr = toLocalDateInput(now);

  if (preset === 'all') return {};
  if (preset === 'today') return { startDate: todayStr, endDate: todayStr };
  if (preset === '7d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { startDate: toLocalDateInput(start), endDate: todayStr };
  }
  if (preset === '30d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { startDate: toLocalDateInput(start), endDate: todayStr };
  }
  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: toLocalDateInput(start), endDate: todayStr };
  }
  return {
    startDate: customStartDate || undefined,
    endDate: customEndDate || undefined,
  };
}

const formatShortDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

interface BookingFiltersBarProps {
  search: string;
  setSearch: (value: string) => void;
  searchPlaceholder: string;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (value: string) => void;
  datePreset: BookingDatePreset;
  setDatePreset: (value: BookingDatePreset) => void;
  customStartDate: string;
  setCustomStartDate: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  onClear: () => void;
}

export function BookingFiltersBar({
  search,
  setSearch,
  searchPlaceholder,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  datePreset,
  setDatePreset,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  onClear,
}: BookingFiltersBarProps) {
  const hasActiveFilters = Boolean(
    search || statusFilter || paymentStatusFilter || datePreset !== 'all' || customStartDate || customEndDate
  );

  const selectedStatusOption = BOOKING_STATUS_OPTIONS.find((opt) => opt.value === statusFilter);
  const selectedPaymentOption = PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === paymentStatusFilter);

  const dateRangeLabel = (() => {
    if (datePreset === 'custom') {
      if (customStartDate && customEndDate) {
        return `${formatShortDate(customStartDate)} – ${formatShortDate(customEndDate)}`;
      }
      if (customStartDate) return `From ${formatShortDate(customStartDate)}`;
      if (customEndDate) return `Until ${formatShortDate(customEndDate)}`;
      return 'Custom Range';
    }
    return DATE_PRESET_OPTIONS.find((opt) => opt.value === datePreset)?.label || 'All Time';
  })();

  const triggerBaseClass =
    'flex h-11 w-full items-center justify-between gap-2.5 rounded-xl border bg-white px-3.5 text-sm font-semibold transition-all cursor-pointer outline-none dark:bg-white/5';

  const getTriggerStateClass = (isActive: boolean) =>
    isActive
      ? 'border-[#4318FF]/50 bg-[#F4F7FE]/60 text-[#1b254b] dark:border-[#01A3B4]/50 dark:bg-white/10 dark:text-white'
      : 'border-slate-200 text-[#1b254b] hover:border-[#4318FF]/40 hover:bg-slate-50/70 dark:border-white/10 dark:text-white dark:hover:bg-white/10';

  return (
    <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-4 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_210px_190px_220px_auto]">
        {/* Search Input */}
        <div className="relative md:col-span-2 xl:col-span-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3AED0]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-medium text-[#1b254b] placeholder:text-[#A3AED0] outline-none transition focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={`${triggerBaseClass} ${getTriggerStateClass(Boolean(statusFilter))}`}>
              <span className="flex items-center gap-2 overflow-hidden">
                {selectedStatusOption ? (
                  <span className={`h-2 w-2 shrink-0 rounded-full ${selectedStatusOption.dotClass}`} />
                ) : (
                  <ListFilter className="h-4 w-4 shrink-0 text-[#A3AED0]" />
                )}
                <span className="truncate">
                  {statusFilter ? formatBookingStatus(statusFilter) : 'All Statuses'}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#A3AED0]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-[220px] p-2 rounded-2xl border border-slate-100 dark:border-white/10 shadow-[0_20px_50px_rgba(11,20,55,0.12)]"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A3AED0]">
              Booking Status
            </div>
            <DropdownMenuItem
              onClick={() => setStatusFilter('')}
              className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer font-semibold text-[13px] text-[#1b254b] dark:text-white data-[highlighted]:bg-[#F4F7FE] data-[highlighted]:text-[#4318FF] dark:data-[highlighted]:bg-white/5"
            >
              <span>All Statuses</span>
              {!statusFilter && <Check className="h-3.5 w-3.5 text-[#4318FF] dark:text-[#01A3B4]" />}
            </DropdownMenuItem>
            {BOOKING_STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer font-semibold text-[13px] text-[#1b254b] dark:text-white data-[highlighted]:bg-[#F4F7FE] data-[highlighted]:text-[#4318FF] dark:data-[highlighted]:bg-white/5"
              >
                <span className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${option.dotClass}`} />
                  {option.label}
                </span>
                {statusFilter === option.value && <Check className="h-3.5 w-3.5 text-[#4318FF] dark:text-[#01A3B4]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Payment Status Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={`${triggerBaseClass} ${getTriggerStateClass(Boolean(paymentStatusFilter))}`}>
              <span className="flex items-center gap-2 overflow-hidden">
                {selectedPaymentOption ? (
                  <span className={`h-2 w-2 shrink-0 rounded-full ${selectedPaymentOption.dotClass}`} />
                ) : (
                  <CreditCard className="h-4 w-4 shrink-0 text-[#A3AED0]" />
                )}
                <span className="truncate">
                  {paymentStatusFilter ? formatPaymentStatus(paymentStatusFilter) : 'All Payments'}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#A3AED0]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-[200px] p-2 rounded-2xl border border-slate-100 dark:border-white/10 shadow-[0_20px_50px_rgba(11,20,55,0.12)]"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A3AED0]">
              Payment Status
            </div>
            <DropdownMenuItem
              onClick={() => setPaymentStatusFilter('')}
              className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer font-semibold text-[13px] text-[#1b254b] dark:text-white data-[highlighted]:bg-[#F4F7FE] data-[highlighted]:text-[#4318FF] dark:data-[highlighted]:bg-white/5"
            >
              <span>All Payments</span>
              {!paymentStatusFilter && <Check className="h-3.5 w-3.5 text-[#4318FF] dark:text-[#01A3B4]" />}
            </DropdownMenuItem>
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setPaymentStatusFilter(option.value)}
                className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer font-semibold text-[13px] text-[#1b254b] dark:text-white data-[highlighted]:bg-[#F4F7FE] data-[highlighted]:text-[#4318FF] dark:data-[highlighted]:bg-white/5"
              >
                <span className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${option.dotClass}`} />
                  {option.label}
                </span>
                {paymentStatusFilter === option.value && <Check className="h-3.5 w-3.5 text-[#4318FF] dark:text-[#01A3B4]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={`${triggerBaseClass} ${getTriggerStateClass(datePreset !== 'all')}`}>
              <span className="flex items-center gap-2 overflow-hidden">
                <Calendar className="h-4 w-4 shrink-0 text-[#A3AED0]" />
                <span className="truncate">{dateRangeLabel}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#A3AED0]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[250px] p-2 rounded-2xl border border-slate-100 dark:border-white/10 shadow-[0_20px_50px_rgba(11,20,55,0.12)]"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A3AED0]">
              Date Range
            </div>
            <div className="mb-2">
              {DATE_PRESET_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    setDatePreset(option.value);
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer font-semibold text-[13px] text-[#1b254b] dark:text-white data-[highlighted]:bg-[#F4F7FE] data-[highlighted]:text-[#4318FF] dark:data-[highlighted]:bg-white/5"
                >
                  <span>{option.label}</span>
                  {datePreset === option.value && <Check className="h-3.5 w-3.5 text-[#4318FF] dark:text-[#01A3B4]" />}
                </DropdownMenuItem>
              ))}
            </div>

            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-white/10">
              <div className="px-3 py-1.5 mb-1 text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider">
                Custom Range
              </div>
              <div className="flex flex-col gap-2 px-2">
                <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#4318FF]/20 focus-within:border-[#4318FF] transition-all">
                  <span className="text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider pl-3 w-12 shrink-0">From</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-[13px] font-medium bg-transparent border-none py-2 px-2 text-[#1b254b] dark:text-white focus:outline-none focus:ring-0 cursor-pointer w-full [color-scheme:light] dark:[color-scheme:dark]"
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setDatePreset('custom');
                    }}
                  />
                </div>
                <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#4318FF]/20 focus-within:border-[#4318FF] transition-all">
                  <span className="text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider pl-3 w-12 shrink-0">To</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-[13px] font-medium bg-transparent border-none py-2 px-2 text-[#1b254b] dark:text-white focus:outline-none focus:ring-0 cursor-pointer w-full [color-scheme:light] dark:[color-scheme:dark]"
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setDatePreset('custom');
                    }}
                  />
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
          disabled={!hasActiveFilters}
          className="h-11 rounded-xl px-4 font-semibold text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white disabled:opacity-40"
        >
          <X className="h-4 w-4 mr-1.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}
