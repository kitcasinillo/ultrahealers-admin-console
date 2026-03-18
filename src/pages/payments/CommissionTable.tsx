import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../components/DataTable"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"

export type CommissionRecord = {
    id: string
    bookingId: string
    healerName: string
    seekerName: string
    amount: number
    commission: number
    netHealer: number
    date: string
    status: "Processed" | "Pending" | "Refunded"
}

const data: CommissionRecord[] = [
    {
        id: "1",
        bookingId: "BK-9041",
        healerName: "John Doe",
        seekerName: "Michael Brown",
        amount: 150.00,
        commission: 22.50,
        netHealer: 127.50,
        date: "2024-03-15",
        status: "Processed",
    },
    {
        id: "2",
        bookingId: "BK-9042",
        healerName: "Jane Smith",
        seekerName: "Sarah Wilson",
        amount: 85.00,
        commission: 12.75,
        netHealer: 72.25,
        date: "2024-03-16",
        status: "Processed",
    },
    {
        id: "3",
        bookingId: "BK-9043",
        healerName: "Alice Johnson",
        seekerName: "David Miller",
        amount: 300.00,
        commission: 45.00,
        netHealer: 255.00,
        date: "2024-03-17",
        status: "Pending",
    },
    {
        id: "4",
        bookingId: "BK-9044",
        healerName: "John Doe",
        seekerName: "Emily Davis",
        amount: 120.00,
        commission: 18.00,
        netHealer: 102.00,
        date: "2024-03-17",
        status: "Processed",
    },
    {
        id: "5",
        bookingId: "BK-9045",
        healerName: "Robert Taylor",
        seekerName: "Jessica Garcia",
        amount: 200.00,
        commission: 30.00,
        netHealer: 170.00,
        date: "2024-03-18",
        status: "Refunded",
    },
]

export const columns: ColumnDef<CommissionRecord>[] = [
    {
        accessorKey: "bookingId",
        header: "Booking ID",
        cell: ({ row }) => <span className="font-bold text-[#1b254b] dark:text-white">{row.getValue("bookingId")}</span>,
    },
    {
        accessorKey: "healerName",
        header: "Healer",
    },
    {
        accessorKey: "seekerName",
        header: "Seeker",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            return <div className="font-bold text-[#1b254b] dark:text-white">${amount.toFixed(2)}</div>
        },
    },
    {
        accessorKey: "commission",
        header: "Commission (15%)",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("commission"))
            return <div className="font-bold text-[#4318FF]">${amount.toFixed(2)}</div>
        },
    },
    {
        accessorKey: "netHealer",
        header: "Net Healer",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("netHealer"))
            return <div className="font-medium text-[#A3AED0]">${amount.toFixed(2)}</div>
        },
    },
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"

            switch (status) {
                case "Processed":
                    variant = "outline"
                    break
                case "Pending":
                    variant = "secondary"
                    break
                case "Refunded":
                    variant = "destructive"
                    break
            }

            return <Badge variant={variant}>{status}</Badge>
        },
    },
]

export function CommissionTable() {
    const exportToExcel = () => {
        // Map the data to have human-readable headers
        const exportData = data.map(record => ({
            "Booking ID": record.bookingId,
            "Healer Name": record.healerName,
            "Seeker Name": record.seekerName,
            "Total Amount ($)": record.amount,
            "Commission ($)": record.commission,
            "Net Healer Payout ($)": record.netHealer,
            "Transaction Date": record.date,
            "Payment Status": record.status
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Commission Report")
        
        // Auto-size columns (rough estimate based on header lengths)
        const max_width = [15, 20, 20, 15, 15, 20, 15, 15]
        worksheet["!cols"] = max_width.map(w => ({ wch: w }))

        XLSX.writeFile(workbook, "UltraHealers_Commission_Report.xlsx")
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">Detailed Commission Records</h3>
                    <p className="text-sm font-medium text-[#A3AED0]">Transaction-level breakdown of platform fees</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={exportToExcel}
                        className="bg-[#39B2AB] hover:bg-[#2D8D87] text-white font-bold rounded-2xl px-6 h-11 transition-all shadow-lg shadow-[#39B2AB]/20"
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                </div>
            </div>
            <div className="bg-white dark:bg-[#111C44] rounded-[30px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
