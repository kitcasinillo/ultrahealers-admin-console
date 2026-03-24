import { cn } from "../../lib/utils";

interface GranularityTabsProps {
  granularity: string;
  setGranularity: (val: string) => void;
  options?: string[];
}

export function GranularityTabs({
  granularity,
  setGranularity,
  options = ['Daily', 'Weekly', 'Monthly']
}: GranularityTabsProps) {
  return (
    <div className="flex w-full sm:w-auto bg-[#F4F7FE] dark:bg-white/5 p-1 rounded-full shadow-inner border border-gray-50/50 dark:border-white/5">
      {options.map((item) => (
        <button
          key={item}
          onClick={() => setGranularity(item)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
            granularity === item
              ? "bg-white dark:bg-[#111C44] text-[#4318FF] dark:text-white shadow-sm border border-gray-100/50 dark:border-white/10"
              : "text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-[#01A3B4]"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
