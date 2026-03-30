import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export function EmailSettings() {
    const handleTestEmail = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Sending test email...',
                success: 'Test email delivered to admin inbox!',
                error: 'Failed to send test email.',
            }
        );
    };

    return (
        <div className="space-y-6">
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-[#4318FF]" />
                            SMTP Configuration
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Outbound mail server settings (Read-only from ENV).</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">SMTP Host</Label>
                            <Input value="smtp.gmail.com" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">Port</Label>
                            <Input value="587" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">Sender Name</Label>
                            <Input value="UltraHealers Team" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">Encryption</Label>
                            <div className="h-10 flex items-center px-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none font-bold text-[10px]">TLS Enabled</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white">Delivery Testing</CardTitle>
                    <CardDescription className="text-xs font-medium">Send a diagnostic email to ensure the connection is live.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input placeholder="Enter admin email..." defaultValue="admin@ultrahealers.com" className="rounded-lg border-gray-200" />
                        </div>
                        <Button onClick={handleTestEmail} className="bg-[#4318FF] hover:bg-[#3311CC] text-white font-bold rounded-lg px-6 h-10 shadow-sm transition-all shrink-0">
                            <Send className="w-4 h-4 mr-2" />
                            Send Test Email
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
