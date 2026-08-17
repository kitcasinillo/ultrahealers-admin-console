import { z } from "zod";

export const formSchema = z.object({
    general: z.object({
        listing_limit_free: z.coerce.number().min(0, "Must be at least 0"),
        listing_limit_premium: z.coerce.number().min(0, "Use 0 for unlimited"),
        max_images_per_listing: z.coerce.number().min(1, "Must allow at least 1 image"),
        max_file_size_mb: z.coerce.number().min(1, "Must be at least 1MB"),
        pricing: z.object({
            free: z.object({ amount: z.coerce.number().min(0) }),
            premium: z.object({ amount: z.coerce.number().min(0), currency: z.string().min(1) }),
        }),
    }),
    adminBootstrap: z.any(),
    commission: z.object({
        HEALER_COMMISSION_PERCENT: z.coerce.number().min(0).max(100),
        SEEKER_FEE_PERCENT: z.coerce.number().min(0).max(100),
        PROCESSING_FEE_PERCENT: z.coerce.number().min(0).max(100),
        PROCESSING_FEE_FIXED: z.coerce.number().min(0),
    }),
    featureFlags: z.array(z.object({
        id: z.string().min(1, "ID is required"),
        label: z.string().min(1, "Label is required"),
        description: z.string(),
        tier: z.enum(["free", "premium"]),
        enabled: z.boolean(),
    })),
    welcomeEmails: z.object({
        admin_email: z.string().refine((val) => {
            if (!val || !val.trim()) return true;
            const emails = val.split(",").map(e => e.trim()).filter(Boolean);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emails.length > 0 && emails.every(email => emailRegex.test(email));
        }, { message: "Must be a valid email or comma-separated list of emails (e.g. admin1@example.com, admin2@example.com)" }).optional(),
        seeker_subject: z.string().min(1, "Seeker subject is required"),
        seeker_body: z.string().min(1, "Seeker body message is required"),
        healer_subject: z.string().min(1, "Healer subject is required"),
        healer_body: z.string().min(1, "Healer body message is required"),
    }),
});

export type SettingsFormValues = z.infer<typeof formSchema>;

export const defaultValues: SettingsFormValues = {
    general: {
        listing_limit_free: 5,
        listing_limit_premium: 50,
        max_images_per_listing: 10,
        max_file_size_mb: 5,
        pricing: {
            free: { amount: 0 },
            premium: { amount: 120, currency: "USD" },
        },
    },
    adminBootstrap: {
        enabled: false,
        email: "ultrahealerz@gmail.com",
        password: "uh2025#",
        display_name: "UltraHealers Admin",
        super_admin: true,
        seeded_at: null,
        last_seed_error: null,
    },
    commission: {
        HEALER_COMMISSION_PERCENT: 10,
        SEEKER_FEE_PERCENT: 5,
        PROCESSING_FEE_PERCENT: 2.9,
        PROCESSING_FEE_FIXED: 30, // in cents
    },
    featureFlags: [
        { id: "basic_listings", label: "Basic Listings", description: "Allow healers to create standard sessions.", tier: "free", enabled: true },
        { id: "messaging", label: "Messaging", description: "Enable chat between healers and seekers.", tier: "free", enabled: true },
        { id: "basic_analytics", label: "Basic Analytics", description: "Provide simple booking reporting.", tier: "free", enabled: true },
        { id: "unlimited_listings", label: "Unlimited Listings", description: "Release the hard cap on active listings.", tier: "premium", enabled: false },
        { id: "advanced_analytics", label: "Advanced Analytics", description: "Deep insights into conversion and traffic.", tier: "premium", enabled: false },
        { id: "priority_support", label: "Priority Support", description: "Fast-track healer support tickets.", tier: "premium", enabled: false },
        { id: "custom_branding", label: "Custom Branding", description: "Allow profile and media personalization.", tier: "premium", enabled: false },
    ],
    welcomeEmails: {
        admin_email: "ultrahealerz@gmail.com",
        seeker_subject: "Welcome to Ultra Healers, {{name}} - Getting Started",
        seeker_body: `Welcome, {{name}}!

Thank you for joining Ultra Healers. We are thrilled to have you in our community of seekers dedicated to personal growth, healing, and holistic well-being.

Here is what you can do right away:
- Discover Practitioners: Browse verified healers specializing in reiki, meditation, sound therapy, and more.
- Book 1-on-1 Sessions: Schedule online or in-person appointments at times that suit you.
- Explore Retreats: Find transformative wellness retreats tailored to your goals.

Explore Healers & Services:
{{dashboardUrl}}`,
        healer_subject: "Welcome to Ultra Healers, {{name}} - Getting Started as a Practitioner",
        healer_body: `Welcome, {{name}}!

We are honored to welcome you as a practitioner on Ultra Healers. Our platform connects dedicated healers like you with seekers looking for guidance, transformation, and holistic care.

Steps to get your practice ready:
1. Complete Your Profile: Add your biography, certifications, and profile picture.
2. Create Service Listings: Publish your offerings, modalities, pricing, and available session formats.
3. Connect Payouts: Set up your payout details to receive earnings.

Set Up Your Practitioner Profile:
{{dashboardUrl}}`,
    },
};
