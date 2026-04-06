import type { Control, UseFormWatch } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SettingsFormValues } from "../schema";

interface CommissionSettingsProps {
    control: Control<SettingsFormValues>;
    watch: UseFormWatch<SettingsFormValues>;
}

export function CommissionSettings({ control, watch }: CommissionSettingsProps) {
    const seekerFeePercent = watch("commission.SEEKER_FEE_PERCENT") || 0;
    const healerCommissionPercent = watch("commission.HEALER_COMMISSION_PERCENT") || 0;
    const processingFeePercent = watch("commission.PROCESSING_FEE_PERCENT") || 0;
    const processingFeeFixed = watch("commission.PROCESSING_FEE_FIXED") || 0;

    const basePrice = 100;
    const seekerPays = basePrice + basePrice * (seekerFeePercent / 100);
    const healerGets = basePrice - basePrice * (healerCommissionPercent / 100);
    const platformNet = 
        (basePrice * (seekerFeePercent / 100)) + 
        (basePrice * (healerCommissionPercent / 100)) - 
        (seekerPays * (processingFeePercent / 100) + (processingFeeFixed / 100));

    return (
        <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4318FF] text-white flex flex-col items-center justify-center font-bold text-sm">
                        %
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Platform Commission Rates</CardTitle>
                        <CardDescription className="text-xs font-medium mt-0.5">
                            Transaction math used for revenue distribution.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-6">
                        <FormField
                            control={control}
                            name="commission.HEALER_COMMISSION_PERCENT"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Healer Deduction (%)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" step="0.1" {...field} className="pr-8 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10 font-bold" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-[11px] font-medium leading-tight">Deducted from healer earnings.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="commission.SEEKER_FEE_PERCENT"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Seeker Convenience Fee (%)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" step="0.1" {...field} className="pr-8 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10 font-bold" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-[11px] font-medium leading-tight">Charged to seekers on top of price.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-6 p-5 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                        <div>
                            <h4 className="text-xs font-black text-[#1b254b] dark:text-white uppercase tracking-wider mb-1">Stripe Overheads</h4>
                            <p className="text-[10px] text-[#A3AED0] mb-4">Values for reporting/projections.</p>
                        </div>
                        <FormField
                            control={control}
                            name="commission.PROCESSING_FEE_PERCENT"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-[10px] uppercase">Processing %</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" step="0.1" {...field} className="pr-8 rounded-md border-gray-200 dark:border-white/5 bg-white dark:bg-[#111C44] focus-visible:ring-[#4318FF] h-9 text-sm" />
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">%</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="commission.PROCESSING_FEE_FIXED"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-[10px] uppercase">Fixed (Cents)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" {...field} className="pl-6 rounded-md border-gray-200 dark:border-white/5 bg-white dark:bg-[#111C44] focus-visible:ring-[#4318FF] h-9 text-sm" />
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">¢</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                
                {/* Live Revenue Simulator */}
                <div className="mt-8 border-t border-gray-100 dark:border-white/5 pt-8">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-bold text-sm text-[#1b254b] dark:text-white uppercase tracking-tight">
                            Live Commission Simulator
                        </h4>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-[#111C44] p-4 rounded-lg border border-gray-100 dark:border-white/10">
                            <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Base Price</p>
                            <p className="text-lg font-bold text-[#1b254b] dark:text-white tracking-tight">${basePrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-[#111C44] p-4 rounded-lg border border-gray-100 dark:border-white/10">
                            <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Seeker Pays</p>
                            <p className="text-lg font-bold text-[#1b254b] dark:text-white tracking-tight">${seekerPays.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-[#111C44] p-4 rounded-lg border border-gray-100 dark:border-white/10 border-l-2 border-l-amber-400">
                            <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Healer Gets</p>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 tracking-tight">${healerGets.toFixed(2)}</p>
                        </div>
                        <div className="bg-[#1b254b] dark:bg-white/10 p-4 rounded-lg border border-transparent shadow-sm">
                            <p className="text-[10px] font-bold text-white/50 dark:text-white/40 uppercase mb-1">Platform Net</p>
                            <p className="text-lg font-bold text-emerald-400 tracking-tight">${platformNet.toFixed(2)}</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-[#A3AED0] mt-4 font-medium italic text-center">
                        * Projection assumes standard credit card processing based on above inputs.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
