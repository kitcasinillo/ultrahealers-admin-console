import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
    CreditCard,
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    RefreshCw,
    Save,
    Lock,
    Building2,
    Wallet,
} from "lucide-react";

import { db } from "../../../lib/firebase";
import { useAdminAuth } from "../../../contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StripeConfigData {
    mode: "test" | "live";
    source: string;
    publishableKey: string;
    hasSecretKey: boolean;
    secretKeyMasked: string | null;
    hasWebhookSecret: boolean;
    webhookSecretMasked: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
}

interface StripeStatusData {
    connected: boolean;
    mode: string;
    source?: string;
    error?: string;
    account?: {
        id: string;
        businessName: string;
        email: string | null;
        country: string | null;
        defaultCurrency: string;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        payoutSchedule?: {
            interval?: string;
            delay_days?: number;
        } | null;
    };
    balance?: {
        available: Array<{ amount: number; currency: string }>;
        pending: Array<{ amount: number; currency: string }>;
    };
    externalAccounts?: Array<{
        id: string;
        bankName: string;
        last4: string;
        currency: string;
        defaultForCurrency: boolean;
        status: string;
    }>;
}

export function StripeSettings() {
    const { user } = useAdminAuth();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshingStatus, setRefreshingStatus] = useState(false);

    const [config, setConfig] = useState<StripeConfigData | null>(null);
    const [status, setStatus] = useState<StripeStatusData | null>(null);

    const [mode, setMode] = useState<"test" | "live">("test");
    const [publishableKey, setPublishableKey] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [webhookSecret, setWebhookSecret] = useState("");

    const getAuthHeaders = useCallback(async () => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (user) {
            const token = await user.getIdToken();
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }, [user]);

    const loadAll = useCallback(async () => {
        if (!user) return;
        try {
            const headers = await getAuthHeaders();
            const [cfgRes, statusRes] = await Promise.all([
                fetch(`${apiUrl}/api/admin/stripe/config`, { headers }),
                fetch(`${apiUrl}/api/admin/stripe/status`, { headers }),
            ]);
            const cfgJson = await cfgRes.json().catch(() => ({}));
            const statusJson = await statusRes.json().catch(() => ({}));

            if (cfgRes.ok && cfgJson.success && cfgJson.data) {
                setConfig(cfgJson.data);
                setMode(cfgJson.data.mode === "live" ? "live" : "test");
                setPublishableKey(cfgJson.data.publishableKey || "");
            }
            if (statusRes.ok && statusJson.success) {
                setStatus(statusJson);
            } else {
                setStatus({
                    connected: false,
                    mode: cfgJson?.data?.mode || "test",
                    error: statusJson?.error || "Unable to verify Stripe account.",
                });
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to load Stripe configuration.");
        } finally {
            setLoading(false);
            setRefreshingStatus(false);
        }
    }, [apiUrl, getAuthHeaders, user]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || saving) return;

        setSaving(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${apiUrl}/api/admin/stripe/config`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    mode,
                    publishableKey: publishableKey.trim(),
                    ...(secretKey.trim() ? { secretKey: secretKey.trim() } : {}),
                    ...(webhookSecret.trim() ? { webhookSecret: webhookSecret.trim() } : {}),
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.success) {
                throw new Error(json.error || "Failed to update Stripe configuration.");
            }

            // Emit immutable audit log without storing any secret values
            await addDoc(collection(db, "admin_audit_logs"), {
                adminId: user.uid,
                adminEmail: user.email,
                action: "UPDATE_STRIPE_CONFIG",
                module: "Stripe Settings",
                changes: {
                    mode: { from: config?.mode || null, to: mode },
                    publishableKeyUpdated: Boolean(publishableKey.trim() && publishableKey.trim() !== config?.publishableKey),
                    secretKeyRotated: Boolean(secretKey.trim()),
                    webhookSecretRotated: Boolean(webhookSecret.trim()),
                },
                timestamp: serverTimestamp(),
            });

            setSecretKey("");
            setWebhookSecret("");
            toast.success(json.message || "Stripe configuration saved & active.");
            await loadAll();
        } catch (err: any) {
            toast.error(err?.message || "Failed to save Stripe configuration.");
        } finally {
            setSaving(false);
        }
    };

    const stripeDashboardUrl =
        mode === "live"
            ? "https://dashboard.stripe.com/settings/payouts"
            : "https://dashboard.stripe.com/test/settings/payouts";

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4318FF] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Connected Account & Live Balance Card */}
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#4318FF]" />
                            Connected Stripe Account & Payouts
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">
                            All healer subscription fees and platform commissions are deposited into this Stripe account.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            className={
                                (status?.mode || mode) === "live"
                                    ? "bg-emerald-500/15 text-emerald-600 border-none font-bold uppercase"
                                    : "bg-amber-500/15 text-amber-600 border-none font-bold uppercase"
                            }
                        >
                            {(status?.mode || mode) === "live" ? "Live Mode" : "Test Mode"}
                        </Badge>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={refreshingStatus}
                            onClick={() => {
                                setRefreshingStatus(true);
                                loadAll();
                            }}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshingStatus ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    {status?.connected && status.account ? (
                        <>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                                    <p className="text-[11px] font-bold uppercase text-[#A3AED0]">Account</p>
                                    <p className="text-base font-extrabold text-[#1b254b] dark:text-white mt-1">
                                        {status.account.businessName}
                                    </p>
                                    <p className="text-xs font-mono text-[#A3AED0] mt-0.5">{status.account.id}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {status.account.chargesEnabled ? "Charges Enabled" : "Charges Pending"}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                                    <p className="text-[11px] font-bold uppercase text-[#A3AED0] flex items-center gap-1.5">
                                        <Wallet className="w-3.5 h-3.5" /> Available Balance
                                    </p>
                                    <p className="text-2xl font-black text-[#1b254b] dark:text-white mt-1">
                                        {status.balance?.available?.length
                                            ? status.balance.available
                                                  .map((b) => `$${b.amount.toFixed(2)} ${b.currency}`)
                                                  .join(" · ")
                                            : "$0.00 USD"}
                                    </p>
                                    <p className="text-xs text-[#A3AED0] mt-1">
                                        Pending:{" "}
                                        {status.balance?.pending?.length
                                            ? status.balance.pending
                                                  .map((b) => `$${b.amount.toFixed(2)} ${b.currency}`)
                                                  .join(" · ")
                                            : "$0.00 USD"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 flex flex-col justify-between">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase text-[#A3AED0]">Payout Bank Account</p>
                                        {status.externalAccounts && status.externalAccounts.length > 0 ? (
                                            <p className="text-sm font-bold text-[#1b254b] dark:text-white mt-1">
                                                {status.externalAccounts[0].bankName} •••• {status.externalAccounts[0].last4}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-[#A3AED0] mt-1">
                                                Managed securely in Stripe Dashboard
                                            </p>
                                        )}
                                    </div>
                                    <a
                                        href={stripeDashboardUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4318FF] hover:underline mt-3"
                                    >
                                        Manage Bank Account & Payouts in Stripe
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Stripe Not Connected</p>
                                <p className="text-xs mt-0.5">
                                    {status?.error || "Enter your Stripe API keys below to connect your account."}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stripe API Keys Configuration Form */}
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#4318FF]" />
                        Stripe API Keys & Environment
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">
                        Switch between Test and Live Stripe accounts directly from the Admin Console. Secret keys are encrypted at rest (AES-256-GCM) and never sent back to the browser.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-5">
                        {/* Mode Switcher */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1b254b] dark:text-white">Stripe Mode</label>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                                <button
                                    type="button"
                                    onClick={() => setMode("test")}
                                    className={`rounded-xl border px-4 py-3 text-left transition-all ${
                                        mode === "test"
                                            ? "border-[#4318FF] bg-[#F4F7FE] dark:bg-white/10"
                                            : "border-gray-200 dark:border-white/10"
                                    }`}
                                >
                                    <p className="text-sm font-bold text-[#1b254b] dark:text-white">Test Mode</p>
                                    <p className="text-[11px] text-[#A3AED0]">Uses pk_test_ & sk_test_ keys</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode("live")}
                                    className={`rounded-xl border px-4 py-3 text-left transition-all ${
                                        mode === "live"
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                                            : "border-gray-200 dark:border-white/10"
                                    }`}
                                >
                                    <p className="text-sm font-bold text-[#1b254b] dark:text-white">Live Mode</p>
                                    <p className="text-[11px] text-[#A3AED0]">Real payments (pk_live_ & sk_live_)</p>
                                </button>
                            </div>
                        </div>

                        {/* Publishable Key */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-[#1b254b] dark:text-white">
                                Publishable Key ({mode === "live" ? "pk_live_..." : "pk_test_..."})
                            </label>
                            <Input
                                type="text"
                                value={publishableKey}
                                onChange={(e) => setPublishableKey(e.target.value)}
                                placeholder={mode === "live" ? "pk_live_..." : "pk_test_..."}
                                className="font-mono text-xs h-10 rounded-lg border-gray-200 dark:border-white/10"
                            />
                            <p className="text-[11px] text-[#A3AED0]">
                                Automatically served to the Healer App so you don&apos;t need to redeploy when switching keys.
                            </p>
                        </div>

                        {/* Secret Key */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-[#1b254b] dark:text-white">
                                    Secret Key ({mode === "live" ? "sk_live_..." : "sk_test_..."})
                                </label>
                                {config?.secretKeyMasked && (
                                    <span className="text-[11px] font-mono text-emerald-600">
                                        Saved: {config.secretKeyMasked}
                                    </span>
                                )}
                            </div>
                            <Input
                                type="password"
                                autoComplete="new-password"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                placeholder={
                                    config?.hasSecretKey
                                        ? "Leave blank to keep existing secret key"
                                        : mode === "live"
                                        ? "sk_live_..."
                                        : "sk_test_..."
                                }
                                className="font-mono text-xs h-10 rounded-lg border-gray-200 dark:border-white/10"
                            />
                        </div>

                        {/* Webhook Signing Secret */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-[#1b254b] dark:text-white">
                                    Webhook Signing Secret (whsec_...)
                                </label>
                                {config?.webhookSecretMasked && (
                                    <span className="text-[11px] font-mono text-emerald-600">
                                        Saved: {config.webhookSecretMasked}
                                    </span>
                                )}
                            </div>
                            <Input
                                type="password"
                                autoComplete="new-password"
                                value={webhookSecret}
                                onChange={(e) => setWebhookSecret(e.target.value)}
                                placeholder={
                                    config?.hasWebhookSecret
                                        ? "Leave blank to keep existing webhook secret"
                                        : "whsec_..."
                                }
                                className="font-mono text-xs h-10 rounded-lg border-gray-200 dark:border-white/10"
                            />
                            <p className="text-[11px] text-[#A3AED0]">
                                Webhook endpoint URL to register in Stripe: <code>{apiUrl}/api/stripe-webhook</code>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
                            <p className="text-xs text-[#A3AED0] flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" />
                                Saving validates the key with Stripe, hot-reloads the server, and syncs subscription pricing.
                            </p>
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl px-6 font-bold shrink-0"
                            >
                                {saving ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Stripe Config
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
