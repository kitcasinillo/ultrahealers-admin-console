import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"
import { useState } from "react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table"
import { Button } from "./ui/button"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    return (
        <div>
            <div className="w-full">
                <Table>
                    <TableHeader className="bg-gray-50/50 dark:bg-white/5 border-none">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-[#A3AED0] text-[12px] font-bold uppercase tracking-wider py-4">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Premium Skeleton Loader
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-b border-gray-100 dark:border-white/5">
                                    {columns.map((_, j) => (
                                        <TableCell key={j} className="py-6">
                                            <div className="h-4 w-full bg-gray-100 dark:bg-white/5 animate-pulse rounded-full opacity-60" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-[#A3AED0] font-medium">
                                    No records found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination with Horizon UI styles */}
            <div className="flex items-center justify-between py-6">
                <div className="text-sm font-medium text-[#A3AED0]">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-none bg-[#F4F7FE] dark:bg-white/5 text-[#4318FF] dark:text-white font-bold h-9 px-4 transition-all hover:bg-[#E2E8F0] disabled:opacity-30"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-none bg-[#F4F7FE] dark:bg-white/5 text-[#4318FF] dark:text-white font-bold h-9 px-4 transition-all hover:bg-[#E2E8F0] disabled:opacity-30"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
