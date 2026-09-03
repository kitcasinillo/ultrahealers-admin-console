import { useState } from "react";
import type { Control } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, Send, Eye, Sparkles, User, UserCheck, Code, Save, Bell, X } from "lucide-react";
import { toast } from "react-hot-toast";
import type { SettingsFormValues } from "../schema";

interface EmailSettingsProps {
    control?: Control<SettingsFormValues>;
    onSave?: () => void;
}

interface EmailBadgeInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function EmailBadgeInput({ value, onChange, placeholder = "Type email & press Enter, Space, or comma..." }: EmailBadgeInputProps) {
    const [inputValue, setInputValue] = useState("");

    const emails = (value || "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const addEmails = (rawText: string) => {
        if (!rawText.trim()) return;

        const candidates = rawText
            .split(/[\s,;]+/)
            .map((e) => e.trim())
            .filter(Boolean);

        const newValidEmails: string[] = [];
        let hasInvalid = false;

        for (const item of candidates) {
            if (emailRegex.test(item)) {
                if (!emails.includes(item) && !newValidEmails.includes(item)) {
                    newValidEmails.push(item);
                }
            } else {
                hasInvalid = true;
            }
        }

        if (hasInvalid && newValidEmails.length === 0) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (newValidEmails.length > 0) {
            const updated = [...emails, ...newValidEmails];
            onChange(updated.join(", "));
            setInputValue("");
        } else {
            setInputValue("");
        }
    };

    const removeEmail = (indexToRemove: number) => {
        const updated = emails.filter((_, idx) => idx !== indexToRemove);
        onChange(updated.join(", "));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "," || e.key === ";" || e.key === " " || e.code === "Space") {
            e.preventDefault();
            if (inputValue.trim()) {
                addEmails(inputValue);
            }
        } else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
            removeEmail(emails.length - 1);
        }
    };

    const handleBlur = () => {
        if (inputValue.trim()) {
            addEmails(inputValue);
        }
    };

    return (
        <div 
            className="w-full min-h-[46px] p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-[#4318FF] transition-all cursor-text"
            onClick={(e) => {
                const inputEl = e.currentTarget.querySelector("input");
                if (inputEl) inputEl.focus();
            }}
        >
            {emails.map((email, idx) => (
                <span
                    key={`${email}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4318FF]/10 text-[#4318FF] dark:bg-[#4318FF]/20 dark:text-purple-300 text-xs font-bold border border-[#4318FF]/20"
                >
                    <span>{email}</span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeEmail(idx);
                        }}
                        className="rounded-full p-0.5 hover:bg-[#4318FF]/20 dark:hover:bg-purple-500/30 text-[#4318FF] dark:text-purple-300 transition-colors focus:outline-none"
                        title={`Remove ${email}`}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={emails.length === 0 ? placeholder : "Add another email..."}
                className="flex-1 min-w-[180px] bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 py-1 px-1"
            />
        </div>
    );
}

export function EmailSettings({ control, onSave }: EmailSettingsProps) {
    const [activeRole, setActiveRole] = useState<"seeker" | "healer">("seeker");
    const [showPreview, setShowPreview] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [testRole, setTestRole] = useState<"seeker" | "healer" | "admin">("seeker");
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [isSavingTemplates, setIsSavingTemplates] = useState(false);
    const [isSavingAdminEmail, setIsSavingAdminEmail] = useState(false);

    const watchedEmails = useWatch({
        control,
        name: "welcomeEmails",
    });

    const adminEmail = watchedEmails?.admin_email || "ultrahealerz@gmail.com";
    const seekerSubject = watchedEmails?.seeker_subject || "Welcome to Ultra Healers, {{name}} - Getting Started";
    const seekerBody = watchedEmails?.seeker_body || "";
    const healerSubject = watchedEmails?.healer_subject || "Welcome to Ultra Healers, {{name}} - Getting Started as a Practitioner";
    const healerBody = watchedEmails?.healer_body || "";

    const handleSaveAdminEmail = async () => {
        setIsSavingAdminEmail(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "";
            const response = await fetch(`${apiUrl}/api/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    welcome_emails: {
                        admin_email: adminEmail,
                        seeker_subject: seekerSubject,
                        seeker_body: seekerBody,
                        healer_subject: healerSubject,
                        healer_body: healerBody,
                    },
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success("Admin notification email saved successfully!");
                if (onSave) {
                    try { onSave(); } catch (_) { }
                }
            } else {
                throw new Error(data.error || "Failed to save admin notification email");
            }
        } catch (err: any) {
            console.error("Save Admin Email Error:", err);
            toast.error(err.message || "Failed to save admin notification email");
        } finally {
            setIsSavingAdminEmail(false);
        }
    };

    const handleSaveTemplates = async () => {
        setIsSavingTemplates(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "";
            const response = await fetch(`${apiUrl}/api/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    welcome_emails: {
                        admin_email: adminEmail,
                        seeker_subject: seekerSubject,
                        seeker_body: seekerBody,
                        healer_subject: healerSubject,
                        healer_body: healerBody,
                    },
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success("Welcome email templates and admin email saved successfully!");
                if (onSave) {
                    try { onSave(); } catch (_) { }
                }
            } else {
                throw new Error(data.error || "Failed to save welcome email templates");
            }
        } catch (err: any) {
            console.error("Save Templates Error:", err);
            toast.error(err.message || "Failed to save welcome email templates");
        } finally {
            setIsSavingTemplates(false);
        }
    };

    const handleTestWelcomeEmail = async () => {
        if (!testEmail && testRole !== "admin") {
            toast.error("Please enter a recipient email address for testing.");
            return;
        }

        setIsSendingTest(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "";
            if (testRole === "admin") {
                const response = await fetch(`${apiUrl}/api/notifications/test-admin-notification`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: testEmail || adminEmail,
                        name: "Test New User",
                        role: "seeker",
                        userId: "test-uid-123",
                    }),
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    toast.success(`Admin signup notification sent successfully to ${data.result?.recipient || adminEmail}!`);
                } else {
                    throw new Error(data.error || "Failed to send admin signup notification");
                }
            } else {
                const response = await fetch(`${apiUrl}/api/notifications/test-welcome-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: testEmail,
                        name: "Test User",
                        role: testRole,
                    }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    toast.success(`Welcome email sent successfully to ${testRole} (${testEmail})!`);
                } else {
                    throw new Error(data.error || "Failed to send test email");
                }
            }
        } catch (err: any) {
            console.error("Test Email Error:", err);
            toast.error(err.message || "Failed to send test email");
        } finally {
            setIsSendingTest(false);
        }
    };

    const insertVariable = (_fieldName: "welcomeEmails.seeker_body" | "welcomeEmails.healer_body", variable: string, onChange: (val: string) => void, currentValue: string) => {
        const newValue = currentValue ? `${currentValue} ${variable}` : variable;
        onChange(newValue);
        toast.success(`Added ${variable} to email body`);
    };

    const renderPreviewBody = (text: string, role: "seeker" | "healer") => {
        const sampleName = role === "healer" ? "Dr. Sarah Jenkins" : "Alex Morgan";
        const sampleEmail = testEmail || "alex@example.com";
        const sampleUrl = role === "healer" ? "https://ultrahealers.com/healer/dashboard" : "https://ultrahealers.com/dashboard";

        let rendered = text
            .replace(/\{\{\s*name\s*\}\}/g, sampleName)
            .replace(/\$\{\s*name\s*\}/g, sampleName)
            .replace(/\{\{\s*email\s*\}\}/g, sampleEmail)
            .replace(/\$\{\s*email\s*\}/g, sampleEmail)
            .replace(/\{\{\s*dashboardUrl\s*\}\}/g, sampleUrl)
            .replace(/\$\{\s*dashboardUrl\s*\}/g, sampleUrl);

        return rendered.split(/\n\s*\n/).map((para, i) => (
            <p key={i} className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                {para.split('\n').map((line, j) => (
                    <span key={j}>
                        {line}
                        {j < para.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </p>
        ));
    };

    return (
        <div className="space-y-6">
            {/* SMTP Status & Outbound Config */}
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-[#4318FF]" />
                            SMTP Configuration
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Outbound mail server settings (Configured via backend server environment).</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-gray-400">SMTP Host</Label>
                            <Input value="smtp.gmail.com" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 font-mono text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-gray-400">Port</Label>
                            <Input value="587" readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 font-mono text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-gray-400">Sender Identity</Label>
                            <Input value='"Ultra Healers" <configured-email>' readOnly className="rounded-lg bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 font-mono text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-gray-400">Encryption</Label>
                            <div className="h-10 flex items-center px-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none font-bold text-[10px]">TLS Active</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Admin Signup Notification Routing Card */}
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                            <Bell className="w-5 h-5 mr-2 text-[#4318FF]" />
                            Admin Signup Notification Email(s)
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">
                            Configure single or multiple admin email addresses that receive instant notification alerts whenever a new Healer or Seeker registers.
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        onClick={handleSaveAdminEmail}
                        disabled={isSavingAdminEmail}
                        className="bg-[#4318FF] hover:bg-[#3311CC] text-white text-xs font-bold rounded-lg h-9 px-4 shadow-sm shrink-0"
                    >
                        {isSavingAdminEmail ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1.5" />
                        ) : (
                            <Save className="w-4 h-4 mr-1.5" />
                        )}
                        {isSavingAdminEmail ? "Saving..." : "Save Admin Email"}
                    </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2 max-w-xl">
                        <Label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                            Admin Notification Recipient Email(s)
                        </Label>
                        {control ? (
                            <Controller
                                name="welcomeEmails.admin_email"
                                control={control}
                                render={({ field }) => (
                                    <EmailBadgeInput
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        placeholder="Type email & press Enter or comma..."
                                    />
                                )}
                            />
                        ) : (
                            <EmailBadgeInput
                                value={adminEmail}
                                onChange={() => {}}
                                placeholder="Type email & press Enter or comma..."
                            />
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enter a single email or multiple email addresses separated by commas. Whenever a new seeker or healer registers, automated signup notification emails will be sent to all listed recipients.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Welcome Email Template Management */}
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-[#01A3B4]" />
                            Welcome Email Customization
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">
                            Customize the subjects and welcome message formats sent automatically to newly registered Seekers and Healers.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                            className="border-[#01A3B4] text-[#01A3B4] hover:bg-[#01A3B4]/10 text-xs font-bold rounded-lg h-9"
                        >
                            <Eye className="w-4 h-4 mr-1.5" />
                            {showPreview ? "Hide Preview" : "Live Email Preview"}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveTemplates}
                            disabled={isSavingTemplates}
                            className="bg-[#4318FF] hover:bg-[#3311CC] text-white text-xs font-bold rounded-lg h-9 px-4 shadow-sm"
                        >
                            {isSavingTemplates ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1.5" />
                            ) : (
                                <Save className="w-4 h-4 mr-1.5" />
                            )}
                            {isSavingTemplates ? "Saving..." : "Save Welcome Templates"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <Tabs value={activeRole} onValueChange={(val) => setActiveRole(val as "seeker" | "healer")}>
                        <TabsList className="grid grid-cols-2 w-full max-w-md bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-6">
                            <TabsTrigger value="seeker" className="rounded-lg font-bold text-xs flex items-center justify-center gap-2">
                                <User className="w-4 h-4" />
                                Seeker Welcome Email
                            </TabsTrigger>
                            <TabsTrigger value="healer" className="rounded-lg font-bold text-xs flex items-center justify-center gap-2">
                                <UserCheck className="w-4 h-4" />
                                Healer Welcome Email
                            </TabsTrigger>
                        </TabsList>

                        {/* Available Dynamic Template Variables Guide */}
                        <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 text-xs text-cyan-800 dark:text-cyan-300 space-y-2">
                            <div className="font-bold flex items-center gap-1.5">
                                <Code className="w-4 h-4 text-[#01A3B4]" />
                                Dynamic Template Placeholders
                            </div>
                            <p className="text-cyan-700 dark:text-cyan-400">
                                You can use placeholders in the email body or subject. They will automatically be replaced with real user data when the email is sent:
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="px-2.5 py-1 bg-white dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-md font-mono font-bold text-[11px] text-[#01A3B4]">
                                    {"{{name}}"} <span className="font-normal text-gray-500">- User&apos;s Full Name</span>
                                </span>
                                <span className="px-2.5 py-1 bg-white dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-md font-mono font-bold text-[11px] text-[#01A3B4]">
                                    {"{{email}}"} <span className="font-normal text-gray-500">- User&apos;s Email Address</span>
                                </span>
                                <span className="px-2.5 py-1 bg-white dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-md font-mono font-bold text-[11px] text-[#01A3B4]">
                                    {"{{dashboardUrl}}"} <span className="font-normal text-gray-500">- Direct App Dashboard Link</span>
                                </span>
                            </div>
                        </div>

                        {/* Seeker Welcome Email Settings */}
                        <TabsContent value="seeker" className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Seeker Welcome Email Subject</Label>
                                {control ? (
                                    <Controller
                                        name="welcomeEmails.seeker_subject"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="e.g. Welcome to Ultra Healers, {{name}} - Getting Started"
                                                className="rounded-lg border-gray-200 dark:border-white/10"
                                            />
                                        )}
                                    />
                                ) : (
                                    <Input
                                        defaultValue={seekerSubject}
                                        placeholder="e.g. Welcome to Ultra Healers, {{name}} - Getting Started"
                                        className="rounded-lg border-gray-200 dark:border-white/10"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Seeker Welcome Email Message Body</Label>
                                    {control && (
                                        <Controller
                                            name="welcomeEmails.seeker_body"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => insertVariable("welcomeEmails.seeker_body", "{{name}}", field.onChange, field.value)}
                                                        className="text-[11px] font-bold text-[#01A3B4] hover:underline px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 rounded"
                                                    >
                                                        + {"{{name}}"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => insertVariable("welcomeEmails.seeker_body", "{{dashboardUrl}}", field.onChange, field.value)}
                                                        className="text-[11px] font-bold text-[#01A3B4] hover:underline px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 rounded"
                                                    >
                                                        + {"{{dashboardUrl}}"}
                                                    </button>
                                                </div>
                                            )}
                                        />
                                    )}
                                </div>
                                {control ? (
                                    <Controller
                                        name="welcomeEmails.seeker_body"
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                rows={9}
                                                placeholder="Enter the welcome message text for new seekers..."
                                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-sm text-gray-900 dark:text-gray-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#01A3B4]"
                                            />
                                        )}
                                    />
                                ) : (
                                    <textarea
                                        defaultValue={seekerBody}
                                        rows={9}
                                        placeholder="Enter the welcome message text for new seekers..."
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-sm text-gray-900 dark:text-gray-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#01A3B4]"
                                    />
                                )}
                            </div>
                        </TabsContent>

                        {/* Healer Welcome Email Settings */}
                        <TabsContent value="healer" className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Healer Welcome Email Subject</Label>
                                {control ? (
                                    <Controller
                                        name="welcomeEmails.healer_subject"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="e.g. Welcome to Ultra Healers, {{name}} - Getting Started as a Practitioner"
                                                className="rounded-lg border-gray-200 dark:border-white/10"
                                            />
                                        )}
                                    />
                                ) : (
                                    <Input
                                        defaultValue={healerSubject}
                                        placeholder="e.g. Welcome to Ultra Healers, {{name}} - Getting Started as a Practitioner"
                                        className="rounded-lg border-gray-200 dark:border-white/10"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Healer Welcome Email Message Body</Label>
                                    {control && (
                                        <Controller
                                            name="welcomeEmails.healer_body"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => insertVariable("welcomeEmails.healer_body", "{{name}}", field.onChange, field.value)}
                                                        className="text-[11px] font-bold text-[#01A3B4] hover:underline px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 rounded"
                                                    >
                                                        + {"{{name}}"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => insertVariable("welcomeEmails.healer_body", "{{dashboardUrl}}", field.onChange, field.value)}
                                                        className="text-[11px] font-bold text-[#01A3B4] hover:underline px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 rounded"
                                                    >
                                                        + {"{{dashboardUrl}}"}
                                                    </button>
                                                </div>
                                            )}
                                        />
                                    )}
                                </div>
                                {control ? (
                                    <Controller
                                        name="welcomeEmails.healer_body"
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                rows={9}
                                                placeholder="Enter the welcome message text for new practitioners..."
                                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-sm text-gray-900 dark:text-gray-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#01A3B4]"
                                            />
                                        )}
                                    />
                                ) : (
                                    <textarea
                                        defaultValue={healerBody}
                                        rows={9}
                                        placeholder="Enter the welcome message text for new practitioners..."
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-sm text-gray-900 dark:text-gray-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#01A3B4]"
                                    />
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Live Preview Box */}
                    {showPreview && (
                        <div className="mt-6 border border-cyan-200 dark:border-cyan-900/50 rounded-xl overflow-hidden bg-white dark:bg-[#0B1437] shadow-lg">
                            <div className="bg-gradient-to-r from-[#01A3B4] to-[#0891b2] p-6 text-center text-white">
                                <h2 className="text-xl font-bold">Ultra Healers</h2>
                                <p className="text-cyan-100 text-xs mt-1">
                                    {activeRole === "healer" ? "Welcome to Our Practitioner Community" : "Welcome to Your Wellness Journey"}
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="text-xs text-gray-400 font-mono border-b pb-2">
                                    <strong>Subject:</strong> {activeRole === "healer" ? healerSubject.replace(/\{\{\s*name\s*\}\}/g, "Dr. Sarah Jenkins") : seekerSubject.replace(/\{\{\s*name\s*\}\}/g, "Alex Morgan")}
                                </div>
                                {renderPreviewBody(activeRole === "healer" ? healerBody : seekerBody, activeRole)}
                                <div className="text-center pt-4">
                                    <a
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="inline-block px-6 py-3 bg-[#01A3B4] text-white text-xs font-bold rounded-lg shadow"
                                    >
                                        {activeRole === "healer" ? "Set Up Your Practitioner Profile" : "Explore Healers & Services"}
                                    </a>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/[0.02] p-3 text-center text-[11px] text-gray-400 border-t">
                                © {new Date().getFullYear()} Ultra Healers. All rights reserved. (Automated Message Preview)
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delivery Testing & Verification Card */}
            <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center">
                        <Send className="w-5 h-5 mr-2 text-[#4318FF]" />
                        Test Welcome Email Dispatch
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">
                        Send an instant live welcome email to your recipient address to test your customized template.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="w-full sm:w-56">
                            <select
                                value={testRole}
                                onChange={(e) => setTestRole(e.target.value as "seeker" | "healer" | "admin")}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none"
                            >
                                <option value="seeker">Seeker Welcome Email</option>
                                <option value="healer">Healer Welcome Email</option>
                                <option value="admin">Admin Signup Notification</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder={testRole === "admin" ? `Recipient email (defaults to ${adminEmail})` : "Enter email address (e.g. user@example.com)"}
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="rounded-lg border-gray-200 dark:border-white/10 text-xs"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={handleTestWelcomeEmail}
                            disabled={isSendingTest}
                            className="bg-[#4318FF] hover:bg-[#3311CC] text-white font-bold rounded-lg px-6 h-10 shadow-sm transition-all shrink-0 text-xs"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {isSendingTest ? "Sending Email..." : "Send Test Email"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
