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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import type { SettingsFormValues } from "../schema";

interface AdminBootstrapSettingsProps {
  control: Control<SettingsFormValues>;
}

export function AdminBootstrapSettings({ control }: AdminBootstrapSettingsProps) {
  return (
    <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden md:col-span-2">
      <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#4318FF]" />
          Admin Bootstrap
        </CardTitle>
        <CardDescription className="text-xs font-medium">
          Seed or refresh the fallback admin-console user from backend settings when no admin exists yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <FormField
          control={control}
          name="adminBootstrap.enabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3">
              <div className="space-y-1 pr-4">
                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Enable admin bootstrap</FormLabel>
                <FormDescription className="text-[11px] font-medium leading-tight text-[#A3AED0]">
                  When enabled, backend settings initialization can create or refresh the admin user automatically.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="adminBootstrap.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Admin Email</FormLabel>
                <FormControl>
                  <Input {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="adminBootstrap.display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Display Name</FormLabel>
                <FormControl>
                  <Input {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="adminBootstrap.password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Admin Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus-visible:ring-[#4318FF] h-10" />
                </FormControl>
                <FormDescription className="text-[11px] font-medium leading-tight text-[#A3AED0]">
                  This is stored in backend settings, so use it carefully and rotate later if needed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="adminBootstrap.super_admin"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 h-full">
                <div className="space-y-1 pr-4">
                  <FormLabel className="text-[#1b254b] dark:text-white font-bold text-sm">Grant super admin claim</FormLabel>
                  <FormDescription className="text-[11px] font-medium leading-tight text-[#A3AED0]">
                    Applies the `super_admin` Firebase custom claim in addition to `admin`.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50/60 dark:bg-white/5">
            <div className="text-xs font-bold uppercase text-gray-400 mb-2">Last Seeded</div>
            <FormField
              control={control}
              name="adminBootstrap.seeded_at"
              render={({ field }) => (
                <div className="text-sm font-medium text-[#1b254b] dark:text-white">
                  {field.value ? new Date(field.value).toLocaleString() : "Not seeded yet"}
                </div>
              )}
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50/60 dark:bg-white/5">
            <div className="text-xs font-bold uppercase text-gray-400 mb-2">Seed Status</div>
            <FormField
              control={control}
              name="adminBootstrap.last_seed_error"
              render={({ field }) => (
                field.value ? (
                  <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{field.value}</span>
                  </div>
                ) : (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none font-bold text-[10px]">No seed error</Badge>
                )
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
