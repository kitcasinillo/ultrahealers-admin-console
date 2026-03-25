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
import { Badge } from "@/components/ui/badge";
import type { SettingsFormValues } from "../schema";

interface FeatureFlagSettingsProps {
    control: Control<SettingsFormValues, any>;
}

export function FeatureFlagSettings({ control }: FeatureFlagSettingsProps) {
    const renderFlag = (name: keyof SettingsFormValues['featureFlags'], label: string, description: string) => (
        <FormField
            control={control}
            name={`featureFlags.${name}`}
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel className="text-sm font-bold text-[#1b254b] dark:text-white">
                            {label}
                        </FormLabel>
                        <FormDescription className="text-xs">
                            {description}
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
    );

    return (
        <div className="space-y-6">
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Free Tier Features</CardTitle>
                        <CardDescription className="text-xs font-medium">Core platform modules available to all users.</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-wider text-gray-500 border-gray-200">Standard</Badge>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {renderFlag("basic_listings", "Basic Listings", "Allow healers to create standard sessions.")}
                        {renderFlag("messaging", "Messaging", "Enable chat between healers and seekers.")}
                        {renderFlag("basic_analytics", "Basic Analytics", "Provide simple booking reporting.")}
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Premium Tier Features</CardTitle>
                        <CardDescription className="text-xs font-medium">Advanced functionality for upgraded healer profiles.</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-wider text-[#4318FF] border-[#4318FF]/20 bg-[#F4F7FE]">Premium</Badge>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {renderFlag("unlimited_listings", "Unlimited Listings", "Release the hard cap on active listings.")}
                        {renderFlag("advanced_analytics", "Advanced Analytics", "Deep insights into conversion and traffic.")}
                        {renderFlag("priority_support", "Priority Support", "Fast-track healer support tickets.")}
                        {renderFlag("custom_branding", "Custom Branding", "Allow profile and media personalization.")}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
