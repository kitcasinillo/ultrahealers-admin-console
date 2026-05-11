export function ChartEmptyState({ message = "No data available for the selected period" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[250px] w-full bg-gray-50/50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-8 text-center animate-in fade-in duration-500">
      <p className="text-[#1b254b] dark:text-white font-bold text-lg mb-1">
        No Data to Show
      </p>
      <p className="text-[#A3AED0] text-sm max-w-[200px] font-medium leading-relaxed">
        {message}
      </p>
    </div>
  );
}
