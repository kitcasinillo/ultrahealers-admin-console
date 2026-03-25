import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    MoreHorizontal,
    Pencil,
    Copy,
    TestTube,
    Send,
    Trash2,
    BarChart3
} from "lucide-react"
import type { Campaign } from "../utils/type"

interface ActionMenuProps {
    campaign: Campaign
    onDuplicate: (campaign: Campaign) => void
    onSendTest: (id: string) => void
    onSendNow: (id: string) => void
    onDelete: (campaign: Campaign) => void
}

export function ActionMenu({ campaign, onDuplicate, onSendTest, onSendNow, onDelete }: ActionMenuProps) {
    const canSend = campaign.status === "draft" || campaign.status === "scheduled"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#F4F7FE] dark:hover:bg-white/5 rounded-lg">
                    <MoreHorizontal className="h-4 w-4 text-[#A3AED0]" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-gray-100 dark:border-white/10 shadow-xl min-w-[160px]">
                {campaign.status !== 'draft' && (
                    <DropdownMenuItem asChild className="cursor-pointer font-bold text-[#1b254b] dark:text-white hover:text-[#4318FF] focus:text-[#4318FF]">
                        <Link to={`/campaigns/${campaign.id}`} className="flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analytics
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer font-bold text-[#1b254b] dark:text-white hover:text-[#4318FF] focus:text-[#4318FF]">
                    <Link to={`/campaigns/${campaign.id}/edit`} className="flex items-center">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer font-bold text-[#1b254b] dark:text-white hover:text-[#4318FF] focus:text-[#4318FF]"
                    onClick={() => onDuplicate(campaign)}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer font-bold text-[#1b254b] dark:text-white hover:text-[#4318FF] focus:text-[#4318FF]"
                    onClick={() => onSendTest(campaign.id)}
                >
                    <TestTube className="mr-2 h-4 w-4" />
                    Send Test
                </DropdownMenuItem>
                {canSend && (
                    <DropdownMenuItem
                        className="cursor-pointer font-bold text-[#4318FF] hover:bg-[#4318FF]/5"
                        onClick={() => onSendNow(campaign.id)}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Send Now
                    </DropdownMenuItem>
                )}
                <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                <DropdownMenuItem
                    className="cursor-pointer font-bold text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                    onClick={() => onDelete(campaign)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
