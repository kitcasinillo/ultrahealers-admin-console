import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const canPrevious = currentPage > 1;
    const canNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-[#A3AED0] font-medium">
                Showing <span className="text-[#1b254b] dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="text-[#1b254b] dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                <span className="text-[#1b254b] dark:text-white">{totalItems}</span> results
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canPrevious}
                    className="h-8 w-8 p-0 border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                    <ChevronLeft className="h-4 w-4 text-[#1b254b] dark:text-white" />
                </Button>
                
                <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Basic logic to show only a few pages if there are many (optional, but keep it simple for now)
                        if (totalPages > 7 && Math.abs(pageNumber - currentPage) > 2 && pageNumber !== 1 && pageNumber !== totalPages) {
                            if (pageNumber === 2 || pageNumber === totalPages - 1) return <span key={pageNumber} className="px-1 text-gray-400">...</span>;
                            return null;
                        }

                        return (
                            <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "default" : "ghost"}
                                size="sm"
                                onClick={() => onPageChange(pageNumber)}
                                className={`h-8 w-8 p-0 text-xs font-bold transition-all ${
                                    currentPage === pageNumber 
                                    ? "bg-[#4318FF] hover:bg-[#4318FF]/90 text-white shadow-lg shadow-[#4318FF]/20" 
                                    : "text-[#1b254b] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canNext}
                    className="h-8 w-8 p-0 border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                    <ChevronRight className="h-4 w-4 text-[#1b254b] dark:text-white" />
                </Button>
            </div>
        </div>
    );
}
