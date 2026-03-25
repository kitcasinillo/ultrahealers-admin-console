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
    commission: z.object({
        HEALER_COMMISSION_PERCENT: z.coerce.number().min(0).max(100),
        SEEKER_FEE_PERCENT: z.coerce.number().min(0).max(100),
        PROCESSING_FEE_PERCENT: z.coerce.number().min(0).max(100),
        PROCESSING_FEE_FIXED: z.coerce.number().min(0),
    }),
    featureFlags: z.object({
        basic_listings: z.boolean(),
        messaging: z.boolean(),
        basic_analytics: z.boolean(),
        unlimited_listings: z.boolean(),
        advanced_analytics: z.boolean(),
        priority_support: z.boolean(),
        custom_branding: z.boolean(),
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
    commission: {
        HEALER_COMMISSION_PERCENT: 10,
        SEEKER_FEE_PERCENT: 5,
        PROCESSING_FEE_PERCENT: 2.9,
        PROCESSING_FEE_FIXED: 30, // in cents
    },
    featureFlags: {
        basic_listings: true,
        messaging: true,
        basic_analytics: true,
        unlimited_listings: false,
        advanced_analytics: false,
        priority_support: false,
        custom_branding: false,
    },
};
