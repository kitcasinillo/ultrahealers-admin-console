import { DownloadCloud, Download, FileText, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";

interface ExportDropdownProps {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

export function ExportDropdown({ onExportExcel, onExportPdf }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex justify-center sm:justify-start items-center gap-2.5 w-full sm:w-auto bg-[#4318FF] hover:bg-[#3311CC] dark:bg-[#4318FF] dark:hover:bg-[#3510e0] text-white font-bold py-3 px-5 sm:px-6 rounded-full shadow-[0_10px_20px_rgba(67,24,255,0.25)] transition-all text-sm group shrink-0 cursor-pointer">
          <DownloadCloud className="h-4 w-4 text-white/90 group-hover:scale-110 transition-transform" />
          <span className="whitespace-nowrap">Export</span>
          <ChevronDown className="h-4 w-4 text-white/80 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[200px] w-[var(--radix-dropdown-menu-trigger-width)] p-2 rounded-2xl border-none shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#A3AED0]">Available Formats</DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 opacity-5" />
        <DropdownMenuItem
          onClick={onExportExcel}
          className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer group data-[highlighted]:bg-blue-50 dark:data-[highlighted]:bg-blue-500/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1b254b] dark:text-white">Excel (CSV)</span>
            <span className="text-[10px] text-[#A3AED0]">Spreadsheet report data</span>
          </div>
          <Download className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onExportPdf}
          className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer group data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-500/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1b254b] dark:text-white">PDF Document</span>
            <span className="text-[10px] text-[#A3AED0]">Print-ready summary</span>
          </div>
          <Download className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
