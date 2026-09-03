import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Trash2, RotateCcw, ShieldAlert, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { resetAnalyticsTrackers } from "@/api/analytics";
import { logAdminAction } from "@/lib/audit";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function AnalyticsResetSettings() {
    const { user: admin } = useAdminAuth();
    const [selectedTarget, setSelectedTarget] = useState<string>("clicks");
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [pendingTarget, setPendingTarget] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState<boolean>(false);

    const handleOpenResetDialog = (target: string) => {
        setPendingTarget(target);
        setIsDialogOpen(true);
    };

    const handleConfirmReset = async () => {
        if (!pendingTarget) return;

        setIsResetting(true);
        const toastId = toast.loading(`Clearing stored telemetry records for '${pendingTarget}'...`);

        try {
            const res = await resetAnalyticsTrackers(pendingTarget);
            
            // Record administrative audit trail
            if (admin) {
                await logAdminAction({
                    adminId: admin.uid,
                    adminEmail: admin.email || "unknown",
                    action: "RESET_ANALYTICS_TRACKER",
                    module: "Settings",
                    targetId: pendingTarget,
                    reason: `Cleared analytics telemetry counts for target: ${pendingTarget} (${res.deletedCount || 0} records deleted).`
                });
            }

            // Clear local browser session token to start a clean session
            sessionStorage.removeItem('uh_sid');

            toast.success(res.message || `Tracker counts for '${pendingTarget}' reset successfully.`, { id: toastId });
            setIsDialogOpen(false);
            setPendingTarget(null);
        } catch (error: any) {
            console.error("Failed to reset analytics trackers:", error);
            toast.error(error.message || "Failed to reset target tracker.", { id: toastId });
        } finally {
            setIsResetting(false);
        }
    };

    const getTargetLabel = (targetKey: string) => {
        switch (targetKey) {
            case "all":
                return "All Trackers (Full Analytics Reset)";
            case "pageviews":
                return "Pageviews & Traffic Logs";
            case "clicks":
                return "Click Interactions & Button Logs";
            case "sessions":
                return "Visitor Session Logs";
            case "exits":
                return "Drop-off & Exit Page Logs";
            case "conversions":
                return "Conversion Goal Logs";
            default:
                return targetKey;
        }
    };

    return (
        <Card className="border border-red-100 dark:border-red-900/30 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden mt-6">
            <CardHeader className="bg-red-50/40 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 pb-4">
                <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                    <Trash2 className="w-5 h-5 mr-2 text-red-500" />
                    Reset Analytics Track Counts
                </CardTitle>
                <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Clear stored telemetry data for a specific target tracker or perform a full analytics reset across all 3 platforms.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {isResetting && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs font-bold text-[#4318FF] dark:text-blue-300 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-[#4318FF]" />
                        <span>Clearing stored telemetry data from Firestore backend... Please wait.</span>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 block">
                            Target Tracker
                        </label>
                        <Select value={selectedTarget} onValueChange={setSelectedTarget} disabled={isResetting}>
                            <SelectTrigger className="w-full bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5">
                                <SelectValue placeholder="Select target tracker..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clicks">Click Interactions & Button Logs</SelectItem>
                                <SelectItem value="pageviews">Pageviews & Traffic Logs</SelectItem>
                                <SelectItem value="sessions">Visitor Session Logs</SelectItem>
                                <SelectItem value="exits">Drop-off & Exit Page Logs</SelectItem>
                                <SelectItem value="conversions">Conversion Goal Logs</SelectItem>
                                <SelectItem value="all" className="font-bold text-red-600 dark:text-red-400">
                                    All Trackers (Full Analytics Reset)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isResetting}
                            className="flex-1 border-gray-200 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 text-xs h-10"
                            onClick={() => handleOpenResetDialog(selectedTarget)}
                        >
                            {isResetting && pendingTarget === selectedTarget ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#4318FF]" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="w-4 h-4 mr-2 text-[#4318FF]" />
                                    Reset Target ({selectedTarget})
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isResetting}
                            className="font-bold text-xs h-10 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            onClick={() => handleOpenResetDialog("all")}
                        >
                            {isResetting && pendingTarget === "all" ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="w-4 h-4 mr-2" />
                                    Reset All Trackers
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-bold">Administrative Security Note:</span> Resetting track counts permanently deletes stored telemetry records in Firestore. Every reset action is logged to the <span className="underline font-bold">Admin Audit Ledger</span>.
                </div>
            </CardContent>

            <ConfirmModal
                isOpen={isDialogOpen}
                onClose={() => !isResetting && setIsDialogOpen(false)}
                onConfirm={handleConfirmReset}
                title="Confirm Analytics Reset"
                description={`Are you sure you want to reset track counts for "${getTargetLabel(pendingTarget || "")}"? Warning: This action cannot be undone. All matching telemetry will be erased from backend databases.`}
                confirmText={isResetting ? "Resetting..." : "Confirm & Reset"}
                cancelText="Cancel"
                variant="destructive"
                icon={isResetting ? <Loader2 className="w-8 h-8 text-red-500 animate-spin" /> : <ShieldAlert className="w-8 h-8 text-red-500" />}
            />
        </Card>
    );
}
