import { Calendar, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DateRangePickerProps {
  dateRange: string;
  setDateRange: (range: string) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
}

export function DateRangePicker({
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}: DateRangePickerProps) {
  const rangeOptions = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'];

  // Format date to a simpler, shorter format (e.g. "Feb 12")
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex justify-between sm:justify-start items-center gap-3 w-full sm:w-auto bg-white dark:bg-[#111C44] py-3 px-5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-[#1b254b] dark:text-white font-bold text-sm shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Calendar className="h-4 w-4 text-[#A3AED0] shrink-0" />
            <span className="truncate whitespace-nowrap text-ellipsis overflow-hidden">
              {dateRange === 'Custom Range' && customStartDate && customEndDate
                ? `${formatShortDate(customStartDate)} - ${formatShortDate(customEndDate)}`
                : dateRange === 'Custom Range' ? 'Custom Range' : dateRange}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-[#A3AED0] shrink-0 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[240px] w-[var(--radix-dropdown-menu-trigger-width)] p-2 rounded-2xl border-none shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
        <div className="mb-2">
          {rangeOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => {
                setDateRange(option);
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer font-semibold text-[13px] text-[#1b254b] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 transition-colors data-[highlighted]:bg-[#F4F7FE] data-[highlighted]:text-[#4318FF] dark:data-[highlighted]:bg-white/5 dark:data-[highlighted]:text-white"
            >
              {option}
              {dateRange === option && <Check className="h-3.5 w-3.5 text-[#4318FF] dark:text-[#01A3B4]" />}
            </DropdownMenuItem>
          ))}
        </div>

        <div className="pt-2 pb-1 border-t border-gray-100 dark:border-white/10">
          <div className="px-3 py-1.5 mb-1 text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider">
            Custom Range
          </div>
          <div className="flex flex-col gap-2 px-2">
            <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#4318FF]/20 focus-within:border-[#4318FF] transition-all">
              <span className="text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider pl-3 w-12 shrink-0">From</span>
              <input
                type="date"
                value={customStartDate}
                className="flex-1 text-[13px] font-medium bg-transparent border-none py-2 px-2 text-[#1b254b] dark:text-white focus:outline-none focus:ring-0 cursor-pointer w-full [color-scheme:light] dark:[color-scheme:dark]"
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setDateRange('Custom Range');
                }}
              />
            </div>
            <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#4318FF]/20 focus-within:border-[#4318FF] transition-all">
              <span className="text-[11px] font-bold text-[#A3AED0] uppercase tracking-wider pl-3 w-12 shrink-0">To</span>
              <input
                type="date"
                value={customEndDate}
                className="flex-1 text-[13px] font-medium bg-transparent border-none py-2 px-2 text-[#1b254b] dark:text-white focus:outline-none focus:ring-0 cursor-pointer w-full [color-scheme:light] dark:[color-scheme:dark]"
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setDateRange('Custom Range');
                }}
              />
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
