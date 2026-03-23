import { Calendar as CalendarIcon, X, Check } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, startOfYesterday } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "../../../../lib/utils"
import { Button } from "../../../../components/ui/button"
import { Calendar } from "../../../../components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover"

interface DateRangePickerProps {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  date,
  setDate,
}: DateRangePickerProps) {
  const presets = [
    { label: "Today", value: { from: new Date(), to: new Date() } },
    { label: "Yesterday", value: { from: startOfYesterday(), to: startOfYesterday() } },
    { label: "Last 7 Days", value: { from: subDays(new Date(), 7), to: new Date() } },
    { label: "This Month", value: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
  ]

  const isSelected = (value: { from: Date; to: Date }) => {
    if (!date?.from || !date?.to) return false;
    return (
      date.from.toDateString() === value.from.toDateString() &&
      date.to.toDateString() === value.to.toDateString()
    );
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"ghost"}
            className={cn(
              "h-10 px-4 rounded-xl text-[13px] font-bold text-[#1b254b] dark:text-white bg-white/50 dark:bg-[#111C44]/50 hover:bg-white dark:hover:bg-white/10 flex items-center gap-2 transition-all min-w-[240px] justify-start text-left",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4 text-[#4318FF]" />
            <div className="flex flex-col items-start leading-none group relative">
                {date?.from ? (
                <span className="text-[12px]">
                    {date.to ? (
                        <>
                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(date.from, "LLL dd, y")
                    )}
                </span>
                ) : (
                <span className="text-[#A3AED0]">Filter by Date Range</span>
                )}
            </div>
            {date && (
                 <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        setDate(undefined);
                    }}
                    className="ml-auto hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-full text-red-500 transition-colors"
                    title="Clear Filter"
                >
                    <X className="h-3 w-3" />
                </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-col md:flex-row !rounded-[32px] overflow-hidden" align="start">
          {/* Side Menu with Presets & Selection Display */}
          <div className="flex flex-col p-6 bg-gray-50/50 dark:bg-white/5 md:min-w-[200px] border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest px-2 mb-4">Quick Presets</span>
            <div className="flex flex-col gap-2">
                {presets.map((preset) => {
                    const active = isSelected(preset.value);
                    return (
                        <Button
                            key={preset.label}
                            variant="ghost"
                            className={cn(
                                "justify-start h-10 px-3 text-[13px] font-bold rounded-xl transition-all",
                                active 
                                    ? "bg-[#4318FF] text-white hover:bg-[#4318FF] hover:text-white shadow-md shadow-blue-100 dark:shadow-none" 
                                    : "text-[#1b254b] dark:text-[#A3AED0] hover:bg-[#4318FF]/5 hover:text-[#4318FF]"
                            )}
                            onClick={() => setDate(preset.value)}
                        >
                            {preset.label}
                            {active && <Check className="ml-auto h-3 w-3" />}
                        </Button>
                    )
                })}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
                <span className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest px-2 mb-2 block">Current Selection</span>
                <div className="bg-white dark:bg-[#111C44] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                    {date?.from ? (
                        <div className="flex flex-col gap-1">
                            <span className="text-[12px] font-bold text-[#1b254b] dark:text-white">{format(date.from, "MMM dd, y")}</span>
                            {date.to && (
                                <>
                                    <div className="h-3 w-[1px] bg-gray-200 dark:bg-white/10 ml-1 my-1" />
                                    <span className="text-[12px] font-bold text-[#1b254b] dark:text-white">{format(date.to, "MMM dd, y")}</span>
                                </>
                            )}
                        </div>
                    ) : (
                        <span className="text-[11px] font-medium text-[#A3AED0]">No range selected</span>
                    )}
                </div>
            </div>
          </div>

          <div className="p-2">
            <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
