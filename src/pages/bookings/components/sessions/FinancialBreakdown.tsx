import { CircleDollarSign } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { formatCurrency } from "../../../../lib/bookings"

interface FinancialBreakdownProps {
    amount: number
    currency: string
    platformRevenue: number
    seekerFee: number
    healerFee: number
    stripeFee: number
    healerPayout: number
}

export function FinancialBreakdown({ 
    amount, 
    currency, 
    platformRevenue, 
    seekerFee, 
    healerFee, 
    stripeFee, 
    healerPayout 
}: FinancialBreakdownProps) {
    return (
        <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                    <CircleDollarSign className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-[#1b254b] dark:text-white">Financials</h3>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm font-bold text-[#1b254b] dark:text-white pb-3 border-b border-gray-100 dark:border-white/10">
                    <span>Base Session Price</span>
                    <span className="text-lg">{formatCurrency(amount, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-medium text-[#A3AED0]">
                    <span>Seeker Fee (5%)</span>
                    <span>+{formatCurrency(seekerFee, currency)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm font-medium text-[#A3AED0]">
                    <span>Healer Commission (10%)</span>
                    <span>+{formatCurrency(healerFee, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-[#4318FF] bg-[#4318FF]/5 rounded-xl p-3">
                    <span>Total Platform Revenue</span>
                    <span>{formatCurrency(platformRevenue, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-medium text-[#A3AED0] mt-2">
                    <span>Stripe Processing ~</span>
                    <span className="text-red-400">-{formatCurrency(stripeFee, currency)}</span>
                </div>

                <div className="flex justify-between items-center font-bold text-[#1b254b] dark:text-white pt-4 border-t border-gray-100 dark:border-white/10">
                    <span>Net Healer Payout</span>
                    <span className="text-xl text-green-500">{formatCurrency(healerPayout, currency)}</span>
                </div>
            </div>

            <Button className="w-full mt-6 bg-[#1b254b] hover:bg-[#111C44] dark:bg-white/10 dark:hover:bg-white/20 rounded-xl font-bold h-12">
                View Payment Intent
            </Button>
        </div>
    )
}
