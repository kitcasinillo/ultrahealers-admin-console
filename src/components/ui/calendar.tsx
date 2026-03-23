import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "../../lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-x-8",
        month: "flex flex-col gap-4",
        caption: "flex justify-between items-center mb-4 relative",
        caption_label: "text-base font-bold text-[#1b254b] dark:text-white capitalize",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-20"
        ),
        button_next: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-20"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex items-center justify-between mb-2",
        weekday: "text-[#A3AED0] w-10 font-bold text-[11px] uppercase tracking-wider text-center",
        week: "flex w-full mt-1 justify-between",
        day: cn(
          "relative h-10 w-10 p-0 text-center text-sm font-bold transition-all rounded-2xl flex items-center justify-center focus-within:z-20",
          props.mode === "range" && "m-0"
        ),
        day_button: "h-full w-full flex items-center justify-center rounded-2xl transition-all",
        range_start: "day-range-start !bg-[#4318FF] !text-white !rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none ring-2 ring-[#4318FF] ring-offset-2 dark:ring-offset-[#111C44]",
        range_end: "day-range-end !bg-[#4318FF] !text-white !rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none ring-2 ring-[#4318FF] ring-offset-2 dark:ring-offset-[#111C44]",
        range_middle: "day-range-middle !bg-[#4318FF]/5 !text-[#4318FF] !font-bold !rounded-none border-y-2 border-[#4318FF]/20",
        selected: "bg-[#4318FF] text-white hover:bg-[#4318FF] hover:text-white focus:bg-[#4318FF] focus:text-white",
        today: "text-[#4318FF] border-2 border-[#4318FF]/20",
        outside: "text-[#A3AED0] opacity-30",
        disabled: "text-[#A3AED0] opacity-20",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
