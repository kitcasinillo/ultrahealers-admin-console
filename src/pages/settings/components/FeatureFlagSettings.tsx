import type { Control } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SettingsFormValues } from "../schema";

interface FeatureFlagSettingsProps {
    control: Control<SettingsFormValues>;
}

export function FeatureFlagSettings({ control }: FeatureFlagSettingsProps) {
    return (
        <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Feature Rollouts</CardTitle>
                <CardDescription className="text-xs font-medium">Safely enable or disable platform modules.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="featureFlags.basic_listings"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 p-5 shadow-sm">
                                <div className="space-y-1">
                                    <FormLabel className="text-sm font-bold text-[#1b254b] dark:text-white">
                                        Basic Listings Module
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                        Allow healers to create standard sessions.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-[#4318FF]"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
