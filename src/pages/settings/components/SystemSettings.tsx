import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, Zap, Database } from "lucide-react";

interface SystemSettingsProps {
    apiRoot: string;
    corsOrigins: string[];
    runtimeMode: string;
    firebaseProjectId?: string | null;
}

const getStatusBadgeClass = (active: boolean) => active
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-bold text-[10px]"
    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none font-bold text-[10px]";

export function SystemSettings({ apiRoot, corsOrigins, runtimeMode, firebaseProjectId }: SystemSettingsProps) {
    const normalizedOrigins = corsOrigins.length > 0 ? corsOrigins : ["Not exposed by backend settings yet"];
    const appOrigins = normalizedOrigins.slice(0, 3);
    const extraOrigins = normalizedOrigins.length - appOrigins.length;
    const hasConfiguredApiRoot = Boolean(apiRoot && apiRoot.trim());
    const n8nLooksConfigured = normalizedOrigins.some((origin) => /^https?:\/\//i.test(origin) && !origin.includes('localhost'));
    const firebaseConfigured = Boolean(firebaseProjectId);

    return (
        <div className="space-y-6">
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                        <Link className="w-5 h-5 mr-2 text-[#4318FF]" />
                        App Origins & CORS
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">Derived from the admin console runtime and configured backend CORS origins when available.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                    {appOrigins.map((origin, index) => (
                        <div key={`${origin}-${index}`} className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">Allowed Origin {index + 1}</Label>
                            <Input value={origin} readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500" />
                        </div>
                    ))}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-gray-400">Platform API Root</Label>
                        <Input value={apiRoot || "Unavailable"} readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 font-bold" />
                    </div>
                    {extraOrigins > 0 && (
                        <div className="md:col-span-2 text-xs font-medium text-[#A3AED0]">
                            + {extraOrigins} more allowed origin{extraOrigins > 1 ? 's' : ''} configured outside this panel.
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                            Workflow Automation (n8n)
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">This tab does not have a dedicated backend n8n status endpoint yet, so the status below is inferred and clearly marked.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <span className="text-sm font-bold text-gray-400">Status</span>
                            <Badge className={getStatusBadgeClass(n8nLooksConfigured)}>{n8nLooksConfigured ? 'Configured origin detected' : 'No confirmed runtime status'}</Badge>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">Runtime note</Label>
                            <Input value={n8nLooksConfigured ? 'At least one non-local origin is configured. Dedicated n8n health is still not exposed here.' : 'System settings no longer fake a dev-mode n8n state. A dedicated backend status endpoint is still missing.'} readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 text-xs text-gray-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                            <Database className="w-5 h-5 mr-2 text-[#4318FF]" />
                            Backend Runtime
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Reflects what the admin console can honestly infer from configured backend values today.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <span className="text-sm font-bold text-gray-400">API root configured</span>
                            <Badge className={getStatusBadgeClass(hasConfiguredApiRoot)}>{hasConfiguredApiRoot ? 'Yes' : 'No'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <span className="text-sm font-bold text-gray-400">Firebase project configured</span>
                            <Badge className={getStatusBadgeClass(firebaseConfigured)}>{firebaseConfigured ? firebaseProjectId : 'Unknown'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <span className="text-sm font-bold text-gray-400">Admin console mode</span>
                            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border-none font-bold text-[10px] uppercase">{runtimeMode || 'unknown'}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
