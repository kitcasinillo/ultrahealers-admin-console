import { useState } from "react"
import { DataTable } from "@/components/DataTable"
import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Download, MailOpen } from "lucide-react"
import toast from "react-hot-toast"
import { SubNav } from "./SubNav"

export type UnsubscribedUser = {
    id: string
    name: string
    email: string
    date: string
    sourceCampaign: string
}

const mockUnsubscribes: UnsubscribedUser[] = [
    {
        id: "1",
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        date: "2026-03-24T14:30:00Z",
        sourceCampaign: "Welcome Email (Seeker)",
    },
    {
        id: "2",
        name: "Michael Chen",
        email: "chen.m@example.com",
        date: "2026-03-23T09:15:00Z",
        sourceCampaign: "Re-engagement - Healer",
    },
    {
        id: "3",
        name: "Elena Rodriguez",
        email: "elena.rod@example.com",
        date: "2026-03-22T16:45:00Z",
        sourceCampaign: "New Retreat Launch",
    },
]

export function Unsubscribes() {
    const [data, setData] = useState<UnsubscribedUser[]>(mockUnsubscribes)

    const handleResubscribe = (user: UnsubscribedUser) => {
        if (window.confirm(`Are you sure you want to re-subscribe ${user.email}?`)) {
            setData((prev) => prev.filter((u) => u.id !== user.id))
            toast.success(`${user.email} has been re-subscribed`)
        }
    }

    const handleBulkExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Name,Email,Date,Source Campaign\n"
            + data.map(u => `${u.name},${u.email},${u.date},${u.sourceCampaign}`).join("\n")
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "unsubscribes.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Export started")
    }

    const columns: ColumnDef<UnsubscribedUser>[] = [
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1b254b] dark:text-white">{row.original.email}</span>
                </div>
            )
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <span className="text-[#A3AED0]">{row.original.name}</span>
        },
        {
            accessorKey: "date",
            header: "Date Unsubscribed",
            cell: ({ row }) => (
                <span className="text-[#A3AED0]">{new Date(row.original.date).toLocaleDateString()}</span>
            )
        },
        {
            accessorKey: "sourceCampaign",
            header: "Source Campaign",
            cell: ({ row }) => (
                <span className="text-[#A3AED0]">{row.original.sourceCampaign}</span>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                return (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleResubscribe(row.original)}
                        className="text-[#4318FF] hover:text-[#3311CC] hover:bg-[#F4F7FE] dark:hover:bg-white/5 disabled:opacity-50"
                    >
                        <MailOpen className="w-4 h-4 mr-2" />
                        Re-subscribe
                    </Button>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <SubNav />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Unsubscribes</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Manage users who have opted out of email campaigns.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={handleBulkExport}
                        className="bg-white dark:bg-[#111C44] text-[#1b254b] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-6 py-5 font-bold transition-all shadow-sm"
                    >
                        <Download className="mr-2 h-5 w-5 text-[#A3AED0]" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111C44] rounded-[24px] shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 p-6">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
