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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SettingsFormValues } from "../schema";
import { AdminBootstrapSettings } from "./AdminBootstrapSettings";

interface GeneralSettingsProps {
    control: Control<SettingsFormValues>;
    watch?: UseFormWatch<SettingsFormValues>;
}

export function GeneralSettings({ control, watch }: GeneralSettingsProps) {
    const subValues = watch ? watch("general.healerSubscription") : undefined;
    const trialDays = Number(subValues?.trial_days ?? 7);
    const upfrontFee = Number(subValues?.upfront_fee_amount ?? 99);
    const monthlyFee = Number(subValues?.monthly_fee_amount ?? 9.99);
    const currency = String(subValues?.currency || "USD").toUpperCase();
    const day7Total = (upfrontFee + monthlyFee).toFixed(2);
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
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Healer Subscription Model (CMS)</CardTitle>
                    <CardDescription className="text-xs font-medium">
                        Configure the healer free trial, upfront onboarding fee, monthly recurring price, and signup credit card requirements. Changes automatically sync a new Stripe Price for new signups.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Live Billing Summary Preview */}
                    <div className="rounded-xl border border-[#4318FF]/20 bg-[#F4F7FE] dark:bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-[#4318FF]">Live Offer Preview</p>
                            <p className="text-sm font-bold text-[#1b254b] dark:text-white mt-0.5">
                                {trialDays > 0
                                    ? `${trialDays}-day free trial ($0 today), then $${upfrontFee.toFixed(2)} upfront + $${monthlyFee.toFixed(2)}/mo (${currency})`
                                    : `$${upfrontFee.toFixed(2)} upfront + $${monthlyFee.toFixed(2)}/mo (${currency})`}
                            </p>
                            {trialDays > 0 && (
                                <p className="text-xs text-[#A3AED0] mt-0.5">
                                    First post-trial invoice on Day {trialDays}: ${day7Total} {currency} — then ${monthlyFee.toFixed(2)}/month.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Policy Toggles */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                            control={control}
                            name="general.healerSubscription.enabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-0">
                                    <div className="pr-3">
                                        <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Enable Subscription</FormLabel>
                                        <FormDescription className="text-[11px] text-[#A3AED0]">Activate healer membership billing.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(field.value)}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className="h-5 w-5 rounded accent-[#4318FF] cursor-pointer"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="general.healerSubscription.require_card_at_signup"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-0">
                                    <div className="pr-3">
                                        <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Require Card at Signup</FormLabel>
                                        <FormDescription className="text-[11px] text-[#A3AED0]">Gate onboarding until card is vaulted.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(field.value)}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className="h-5 w-5 rounded accent-[#4318FF] cursor-pointer"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="general.healerSubscription.grandfather_existing_healers"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-0">
                                    <div className="pr-3">
                                        <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Grandfather Existing</FormLabel>
                                        <FormDescription className="text-[11px] text-[#A3AED0]">Exempt healers joined before cutoff.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(field.value)}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className="h-5 w-5 rounded accent-[#4318FF] cursor-pointer"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Numeric Pricing & Trial Inputs */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <FormField
                            control={control}
                            name="general.healerSubscription.trial_days"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Free Trial (Days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} step={1} {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                    </FormControl>
                                    <FormDescription className="text-[11px] text-[#A3AED0]">0 = no trial.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="general.healerSubscription.upfront_fee_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Upfront Fee</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                                            <Input type="number" min={0} step="0.01" {...field} className="pl-7 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-[11px] text-[#A3AED0]">One-time fee on trial end.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="general.healerSubscription.monthly_fee_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Monthly Price</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                                            <Input type="number" min={0.5} step="0.01" {...field} className="pl-7 rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-[11px] text-[#A3AED0]">Recurring monthly charge.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="general.healerSubscription.currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Currency</FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={3} className="uppercase rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                    </FormControl>
                                    <FormDescription className="text-[11px] text-[#A3AED0]">ISO code (e.g. USD).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Plan Copy */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="general.healerSubscription.plan_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Plan Display Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="general.healerSubscription.grandfather_cutoff_iso"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Grandfather Cutoff (ISO UTC)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="2026-11-25T00:00:00.000Z" className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10 font-mono text-xs" />
                                    </FormControl>
                                    <FormDescription className="text-[11px] text-[#A3AED0]">Healers joined before this timestamp are exempt when Grandfathering is enabled.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={control}
                        name="general.healerSubscription.plan_description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Plan Description (Shown at Signup)</FormLabel>
                                <FormControl>
                                    <Textarea rows={2} {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF]" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden md:col-span-2">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Legacy Tier Pricing</CardTitle>
                    <CardDescription className="text-xs font-medium">Legacy free/premium tier reference values.</CardDescription>
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

            <AdminBootstrapSettings control={control} />
        </div>
    );
}
