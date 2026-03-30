import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { cn } from "@/lib/utils"

interface RetreatsFiltersProps {
    filters: any;
    setFilters: (filters: any) => void;
    onClear: () => void;
    pendingCount: number;
}

export function RetreatsFilters({ filters, setFilters, onClear, pendingCount }: RetreatsFiltersProps) {
    const handleStatusChange = (value: string) => {
        setFilters({ ...filters, status: value === "all" ? [] : [value] });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                {/* Pending Review Quick Filter */}
                <Button 
                    variant={filters.status?.includes("pending_review") ? "default" : "outline"}
                    className={cn(
                        "rounded-full h-10 px-4 flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50",
                        filters.status?.includes("pending_review") && "bg-orange-600 text-white border-transparent hover:bg-orange-700"
                    )}
                    onClick={() => handleStatusChange(filters.status?.includes("pending_review") ? "all" : "pending_review")}
                >
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    ⚠️ Pending Review ({pendingCount})
                </Button>

                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
                    <Input 
                        placeholder="Search title, healer, or location..." 
                        value={filters.search || ""}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10 h-11 bg-white dark:bg-[#111C44] border-none rounded-2xl shadow-sm focus-visible:ring-1 focus-visible:ring-[#4318FF] dark:text-white"
                    />
                </div>

                <div className="w-48">
                    <Select onValueChange={handleStatusChange} value={filters.status?.[0] || "all"}>
                        <SelectTrigger className="h-11 rounded-2xl border-none shadow-sm bg-white dark:bg-[#111C44] dark:text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                            <SelectItem value="pending_review">Pending Review</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="ghost" className="h-11 px-4 text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white" onClick={onClear}>
                    Clear Filters
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-[#111C44] rounded-3xl shadow-[0_4px_20px_0_rgba(11,20,55,0.02)] border border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Price Range:</label>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="number" 
                            placeholder="Min" 
                            className="w-20 h-9 rounded-lg bg-[#F4F7FE] dark:bg-white/5 border-none text-sm dark:text-white"
                            value={filters.priceMin || ""}
                            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
                        />
                        <span className="text-[#A3AED0]">-</span>
                        <Input 
                            type="number" 
                            placeholder="Max" 
                            className="w-20 h-9 rounded-lg bg-[#F4F7FE] dark:bg-white/5 border-none text-sm dark:text-white"
                            value={filters.priceMax || ""}
                            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
                        />
                    </div>
                </div>

                <div className="h-6 w-px bg-gray-100 dark:bg-white/10 mx-2" />

                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Location:</label>
                    <Input 
                        placeholder="Filter by city/country..." 
                        className="w-56 h-9 rounded-lg bg-[#F4F7FE] dark:bg-white/5 border-none text-sm dark:text-white"
                        value={filters.location || ""}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                </div>

                <div className="h-6 w-px bg-gray-100 dark:bg-white/10 mx-2" />

                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Start Date:</label>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="date" 
                            className="h-9 rounded-lg bg-[#F4F7FE] dark:bg-white/5 border-none text-xs dark:text-white"
                            value={filters.startDateFrom || ""}
                            onChange={(e) => setFilters({ ...filters, startDateFrom: e.target.value })}
                        />
                        <span className="text-[#A3AED0]">-</span>
                        <Input 
                            type="date" 
                            className="h-9 rounded-lg bg-[#F4F7FE] dark:bg-white/5 border-none text-xs dark:text-white"
                            value={filters.startDateTo || ""}
                            onChange={(e) => setFilters({ ...filters, startDateTo: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
