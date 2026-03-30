import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, Zap, Database } from "lucide-react";

export function SystemSettings() {
    return (
        <div className="space-y-6">
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                        <Link className="w-5 h-5 mr-2 text-[#4318FF]" />
                        App Origins & CORS
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">Whitelisted domains allowed to access the platform API.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-gray-400">Healer App URL</Label>
                        <Input value="http://localhost:5173" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-gray-400">Seeker App URL</Label>
                        <Input value="http://localhost:5174" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-gray-400">Retreats App URL</Label>
                        <Input value="http://localhost:3000" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-gray-400">Platform API Root</Label>
                        <Input value="http://localhost:5001" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 font-bold" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                            Workflow Automation (n8n)
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">External workflow engine status.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <span className="text-sm font-bold text-gray-400">Status</span>
                            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-none font-bold text-[10px]">Inactive (Dev Mode)</Badge>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">Webhook Sync URL</Label>
                            <Input value="https://n8n.ultrahealerdev.com/webhook/..." readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 text-xs text-gray-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                            <Database className="w-5 h-5 mr-2 text-[#4318FF]" />
                            Firebase Health
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Core database status.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/30 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">Firestore (NoSQL)</span>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none font-bold text-[10px]">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/30 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">Realtime DB</span>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none font-bold text-[10px]">Connected</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
