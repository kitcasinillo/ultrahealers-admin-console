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
    adminBootstrap: z.object({
        enabled: z.boolean(),
        email: z.string().email("Enter a valid admin email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        display_name: z.string().min(1, "Display name is required"),
        super_admin: z.boolean(),
        seeded_at: z.union([z.string(), z.date(), z.null()]).optional(),
        last_seed_error: z.union([z.string(), z.null()]).optional(),
    }),
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
};
