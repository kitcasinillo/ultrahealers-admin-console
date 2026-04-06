import type { Control } from "react-hook-form";
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

interface GeneralSettingsProps {
    control: Control<SettingsFormValues>;
}

export function GeneralSettings({ control }: GeneralSettingsProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Listing Limits</CardTitle>
                    <CardDescription className="text-xs font-medium">Configure caps on what healers can create.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <FormField
                        control={control}
                        name="general.listing_limit_free"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Free Tier Limit</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                </FormControl>
                                <FormDescription className="text-[11px] font-medium leading-tight text-[#A3AED0]">Max listings for free healers.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="general.listing_limit_premium"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Premium Tier Limit</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                </FormControl>
                                <FormDescription className="text-[11px] font-medium leading-tight text-[#A3AED0]">Max listings for premium healers (0 = unlimited).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Media Uploads</CardTitle>
                    <CardDescription className="text-xs font-medium">Set limits for image and file uploads.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <FormField
                        control={control}
                        name="general.max_images_per_listing"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Max Images Per Listing</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="general.max_file_size_mb"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Max File Size (MB)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden md:col-span-2">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Platform Subscriptions</CardTitle>
                    <CardDescription className="text-xs font-medium">Define pricing for healer tiers.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <FormField
                            control={control}
                            name="general.pricing.free.amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Free Tier Cost</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                                            <Input type="number" {...field} className="pl-7 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name="general.pricing.premium.amount"
                                render={({ field }) => (
                                    <FormItem className="col-span-1">
                                        <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Premium Tier Cost</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                                                <Input type="number" {...field} className="pl-7 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="general.pricing.premium.currency"
                                render={({ field }) => (
                                    <FormItem className="col-span-1">
                                        <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Currency</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
