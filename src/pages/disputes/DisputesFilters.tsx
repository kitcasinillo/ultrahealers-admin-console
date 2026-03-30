import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Disc, ShieldAlert, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

export interface DisputesFiltersState {
  search: string;
  status: string[];
  type: string[];
  severity: string;
  overdue: boolean;
  healerId: string;
  seekerId: string;
  dateFrom: string;
  dateTo: string;
}

interface DisputesFiltersProps {
  filters: DisputesFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<DisputesFiltersState>>;
  summary: {
    open: number;
    safety: number;
    overdue: number;
    inReview: number;
  };
}

export function DisputesFilters({ filters, setFilters, summary }: DisputesFiltersProps) {

  const handleStatusToggle = (val: string) => {
    setFilters(prev => {
      const active = prev.status.includes(val);
      return { ...prev, status: active ? prev.status.filter(s => s !== val) : [...prev.status, val] };
    });
  };

  const handleTypeToggle = (val: string) => {
    setFilters(prev => {
      const active = prev.type.includes(val);
      return { ...prev, type: active ? prev.type.filter(t => t !== val) : [...prev.type, val] };
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setFilters(prev => ({ ...prev, status: ['open'] }))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors text-sm font-medium"
        >
          <Disc className="h-3.5 w-3.5 text-red-500 fill-red-500" /> Open <Badge variant="secondary" className="bg-white/50">{summary.open}</Badge>
        </button>
        <button 
          onClick={() => setFilters(prev => ({ ...prev, severity: 'safety' }))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <ShieldAlert className="h-4 w-4 text-red-600" /> Safety <Badge variant="secondary" className="bg-white/50">{summary.safety}</Badge>
        </button>
        <button 
          onClick={() => setFilters(prev => ({ ...prev, overdue: true }))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors text-sm font-medium"
        >
          <AlertTriangle className="h-4 w-4 text-orange-600" /> Overdue <Badge variant="secondary" className="bg-white/50">{summary.overdue}</Badge>
        </button>
        <button 
          onClick={() => setFilters(prev => ({ ...prev, status: ['in_review'] }))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <Disc className="h-3.5 w-3.5 text-blue-500 fill-blue-500" /> In Review <Badge variant="secondary" className="bg-white/50">{summary.inReview}</Badge>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-[#111C44] p-5 rounded-[24px] border border-transparent dark:border-white/5 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search ID, Seeker, Healer..." 
            className="pl-9 bg-gray-50/50"
            value={filters.search}
            onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[120px] justify-between">
              {filters.status.length ? `${filters.status.length} Statuses` : "Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['open', 'in_review', 'resolved_refunded', 'resolved_partial_refund', 'resolved_credit', 'denied'].map(s => (
              <DropdownMenuCheckboxItem 
                key={s} 
                checked={filters.status.includes(s)}
                onCheckedChange={() => handleStatusToggle(s)}
              >
                {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[120px] justify-between">
              {filters.type.length ? `${filters.type.length} Types` : "Type"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['no_show', 'quality', 'safety', 'refund_request', 'other'].map(t => (
              <DropdownMenuCheckboxItem 
                key={t} 
                checked={filters.type.includes(t)}
                onCheckedChange={() => handleTypeToggle(t)}
              >
                {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={filters.severity} onValueChange={(v) => setFilters(p => ({ ...p, severity: v }))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer ml-2">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary"
            checked={filters.overdue}
            onChange={(e) => setFilters(p => ({ ...p, overdue: e.target.checked }))}
          />
          Show overdue only
        </label>

        <div className="h-6 w-px bg-gray-100 dark:bg-white/10 mx-2" />

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Submitted Date:</label>
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              className="h-9 w-[130px] rounded-lg bg-gray-50 dark:bg-white/5 border-none text-[11px] dark:text-white"
              value={filters.dateFrom || ""}
              onChange={(e) => setFilters(p => ({ ...p, dateFrom: e.target.value }))}
            />
            <span className="text-gray-400">-</span>
            <Input 
              type="date" 
              className="h-9 w-[130px] rounded-lg bg-gray-50 dark:bg-white/5 border-none text-[11px] dark:text-white"
              value={filters.dateTo || ""}
              onChange={(e) => setFilters(p => ({ ...p, dateTo: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 ml-auto">
          <Input 
            placeholder="Healer ID/Name" 
            className="w-32 lg:w-40"
            value={filters.healerId}
            onChange={(e) => setFilters(p => ({ ...p, healerId: e.target.value }))}
          />
          <Input 
            placeholder="Seeker ID/Name" 
            className="w-32 lg:w-40"
            value={filters.seekerId}
            onChange={(e) => setFilters(p => ({ ...p, seekerId: e.target.value }))}
          />
        </div>

        <Button 
          variant="ghost" 
          onClick={() => setFilters({
            search: "", status: [], type: [], severity: "all", overdue: false, healerId: "", seekerId: "", dateFrom: "", dateTo: ""
          })}
          className="text-gray-500 hover:text-gray-900 w-full sm:w-auto"
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
