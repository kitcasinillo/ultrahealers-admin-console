import { useState, useEffect } from "react";
import { useForm, type Resolver, type Control, type UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Save, RefreshCcw, Mail, Link as LinkIcon, Shield, Image as ImageIcon } from "lucide-react";

import { db } from "../../lib/firebase";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";

import { ConfirmModal } from "../../components/ConfirmModal";

import { formSchema, defaultValues, type SettingsFormValues } from "./schema";
import { GeneralSettings } from "./components/GeneralSettings";
import { CommissionSettings } from "./components/CommissionSettings";
import { FeatureFlagSettings } from "./components/FeatureFlagSettings";
import { EmailSettings } from "./components/EmailSettings";
import { SystemSettings } from "./components/SystemSettings";
import { AuditLogSettings } from "./components/AuditLogSettings";
import { MediaLibraryTab } from "./components/MediaLibraryTab";

/**
 * SettingsPage Component
 * Orchestrates platform configuration across multiple domains.
 */
export function SettingsPage() {
    const { user } = useAdminAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema) as unknown as Resolver<SettingsFormValues>,
        defaultValues,
    });

    // Sync form with Firestore on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`);
                const payload = await response.json();

                if (!response.ok || !payload.success) {
                    throw new Error(payload.error || "Failed to load settings");
                }

                const data = payload.data || {};
                const featureFlags = Array.isArray(data.featureFlags) ? data.featureFlags : defaultValues.featureFlags;
                const pricing = data.pricing || defaultValues.general.pricing;

                form.reset({
                    general: {
                        listing_limit_free: data.listing_limit_free ?? defaultValues.general.listing_limit_free,
                        listing_limit_premium: data.listing_limit_premium ?? defaultValues.general.listing_limit_premium,
                        max_images_per_listing: data.max_images_per_listing ?? defaultValues.general.max_images_per_listing,
                        max_file_size_mb: data.max_file_size_mb ?? defaultValues.general.max_file_size_mb,
                        pricing: {
                            free: {
                                amount: pricing.free?.amount ?? defaultValues.general.pricing.free.amount,
                            },
                            premium: {
                                amount: pricing.premium?.amount ?? defaultValues.general.pricing.premium.amount,
                                currency: pricing.premium?.currency ?? defaultValues.general.pricing.premium.currency,
                            },
                        },
                    },
                    commission: {
                        HEALER_COMMISSION_PERCENT: data.HEALER_COMMISSION_PERCENT ?? defaultValues.commission.HEALER_COMMISSION_PERCENT,
                        SEEKER_FEE_PERCENT: data.SEEKER_FEE_PERCENT ?? defaultValues.commission.SEEKER_FEE_PERCENT,
                        PROCESSING_FEE_PERCENT: data.PROCESSING_FEE_PERCENT ?? defaultValues.commission.PROCESSING_FEE_PERCENT,
                        PROCESSING_FEE_FIXED: data.PROCESSING_FEE_FIXED ?? defaultValues.commission.PROCESSING_FEE_FIXED,
                    },
                    featureFlags,
                    adminBootstrap: {
                        enabled: data.admin_bootstrap?.enabled ?? defaultValues.adminBootstrap.enabled,
                        email: data.admin_bootstrap?.email ?? defaultValues.adminBootstrap.email,
                        password: data.admin_bootstrap?.password ?? defaultValues.adminBootstrap.password,
                        display_name: data.admin_bootstrap?.display_name ?? defaultValues.adminBootstrap.display_name,
                        super_admin: data.admin_bootstrap?.super_admin ?? defaultValues.adminBootstrap.super_admin,
                        seeded_at: data.admin_bootstrap?.seeded_at ?? defaultValues.adminBootstrap.seeded_at,
                        last_seed_error: data.admin_bootstrap?.last_seed_error ?? defaultValues.adminBootstrap.last_seed_error,
                    },
                });
            } catch (error) {
                console.error("Fetch Error:", error);
                toast.error("Failed to load settings from backend.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onSubmit = async (data: SettingsFormValues) => {
        setIsSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    listing_limit_free: data.general.listing_limit_free,
                    listing_limit_premium: data.general.listing_limit_premium,
                    max_images_per_listing: data.general.max_images_per_listing,
                    max_file_size_mb: data.general.max_file_size_mb,
                    pricing: data.general.pricing,
                    HEALER_COMMISSION_PERCENT: data.commission.HEALER_COMMISSION_PERCENT,
                    SEEKER_FEE_PERCENT: data.commission.SEEKER_FEE_PERCENT,
                    PROCESSING_FEE_PERCENT: data.commission.PROCESSING_FEE_PERCENT,
                    PROCESSING_FEE_FIXED: data.commission.PROCESSING_FEE_FIXED,
                    featureFlags: data.featureFlags,
                    admin_bootstrap: data.adminBootstrap,
                }),
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.error || "Failed to update settings");
            }
            
            // Log the action for security and audit trail
            if (user) {
                await addDoc(collection(db, "admin_audit_logs"), {
                    adminId: user.uid,
                    adminEmail: user.email,
                    action: 'UPDATE_SETTINGS',
                    module: 'Platform Settings',
                    changes: data,
                    timestamp: serverTimestamp(),
                });
            }

            if (payload.data?.admin_bootstrap) {
                form.setValue("adminBootstrap.seeded_at", payload.data.admin_bootstrap.seeded_at ?? null);
                form.setValue("adminBootstrap.last_seed_error", payload.data.admin_bootstrap.last_seed_error ?? null);
            }

            toast.success("Platform settings updated successfully");
        } catch (error) {
            console.error("Save Error:", error);
            toast.error("Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setIsResetDialogOpen(true);
    };

    const confirmReset = () => {
        form.reset(defaultValues);
        toast.success("Settings reverted to defaults. Remember to hit save.");
        setIsResetDialogOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4318FF] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">
                        Platform Settings
                    </h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Manage global configuration, limits, fees, and system connectivity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleReset}
                        className="font-bold text-[#A3AED0] hover:text-[#1b254b] dark:hover:text-white rounded-xl border-gray-200 dark:border-white/10 shrink-0"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Reset Defaults
                    </Button>
                    <Button 
                        onClick={form.handleSubmit(onSubmit)} 
                        disabled={isSaving}
                        className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl px-6 font-bold shadow-[0_10px_20px_0_rgba(67,24,255,0.15)] transition-all shrink-0"
                    >
                        {isSaving ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </header>

            <Form {...form}>
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <Tabs defaultValue="general" className="w-full">
                        <div className="bg-white dark:bg-[#111C44] rounded-lg p-1.5 mb-6 shadow-sm border border-gray-100 dark:border-white/5 w-fit hidden lg:block">
                            <TabsList className="bg-transparent space-x-1">
                                <TabsTrigger value="general" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">General</TabsTrigger>
                                <TabsTrigger value="commission" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">Fees</TabsTrigger>
                                <TabsTrigger value="feature_flags" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">Flags</TabsTrigger>
                                <TabsTrigger value="email" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                </TabsTrigger>
                                <TabsTrigger value="system" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    System
                                </TabsTrigger>
                                <TabsTrigger value="audit_log" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Audit Log
                                </TabsTrigger>
                                <TabsTrigger value="media" className="rounded-md px-4 py-2 data-[state=active]:bg-[#F4F7FE] data-[state=active]:dark:bg-white/5 data-[state=active]:text-[#4318FF] data-[state=active]:dark:text-white font-bold text-[#A3AED0]">
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Media
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Mobile and Tablet tabs fallback */}
                        <div className="mb-6 lg:hidden overflow-x-auto pb-2 scrollbar-hide">
                            <TabsList className="flex bg-white dark:bg-[#111C44] p-1 h-auto rounded-xl w-max min-w-full">
                                <TabsTrigger value="general" className="text-xs px-4">General</TabsTrigger>
                                <TabsTrigger value="commission" className="text-xs px-4">Fees</TabsTrigger>
                                <TabsTrigger value="feature_flags" className="text-xs px-4">Flags</TabsTrigger>
                                <TabsTrigger value="email" className="text-xs px-4">Email</TabsTrigger>
                                <TabsTrigger value="system" className="text-xs px-4">System</TabsTrigger>
                                <TabsTrigger value="audit_log" className="text-xs px-4">Audit</TabsTrigger>
                                <TabsTrigger value="media" className="text-xs px-4">Media</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="general" className="mt-0 space-y-6 outline-none">
                            <GeneralSettings control={form.control as unknown as Control<SettingsFormValues>} />
                        </TabsContent>

                        <TabsContent value="commission" className="mt-0 space-y-6 outline-none">
                            <CommissionSettings 
                                control={form.control as unknown as Control<SettingsFormValues>} 
                                watch={form.watch as unknown as UseFormWatch<SettingsFormValues>} 
                            />
                        </TabsContent>

                        <TabsContent value="feature_flags" className="mt-0 space-y-6 outline-none">
                            <FeatureFlagSettings control={form.control as unknown as Control<SettingsFormValues>} />
                        </TabsContent>

                        <TabsContent value="email" className="mt-0 space-y-6 outline-none">
                            <EmailSettings />
                        </TabsContent>

                        <TabsContent value="system" className="mt-0 space-y-6 outline-none">
                            <SystemSettings
                                apiRoot={import.meta.env.VITE_API_URL || ""}
                                corsOrigins={String(import.meta.env.VITE_CORS_ORIGINS || "")
                                    .split(",")
                                    .map((origin) => origin.trim())
                                    .filter(Boolean)}
                                runtimeMode={import.meta.env.MODE}
                                firebaseProjectId={import.meta.env.VITE_FIREBASE_PROJECT_ID || null}
                            />
                        </TabsContent>

                        <TabsContent value="audit_log" className="mt-0 space-y-6 outline-none">
                            <AuditLogSettings />
                        </TabsContent>

                        <TabsContent value="media" className="mt-0 space-y-6 outline-none">
                            <MediaLibraryTab />
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>

            <ConfirmModal 
                isOpen={isResetDialogOpen} 
                onClose={() => setIsResetDialogOpen(false)}
                onConfirm={confirmReset}
                title="Reset Platform Settings"
                description="Are you sure you want to reset all settings to their default values? Make sure to click 'Save Changes' afterwards to apply them."
                confirmText="Confirm"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}
