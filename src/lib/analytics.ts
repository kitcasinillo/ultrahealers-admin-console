// Shared Google Analytics (GA4) Utility Service

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Validates and sets the `user_role` user property in Google Analytics 4 (GA4).
 *
 * @param role - The user role string fetched from Firestore (must be 'healer' or 'seeker').
 */
export function setAnalyticsUserRole(role: unknown): void {
  try {
    // Guard against undefined, null, or invalid role values
    if (typeof role !== 'string' || (role !== 'healer' && role !== 'seeker')) {
      console.warn(
        `[Analytics] Invalid or missing user_role for GA4 tracking. Expected 'healer' or 'seeker', but received:`,
        role
      );
      return;
    }

    // Fail gracefully if gtag function is not initialized
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      console.warn('[Analytics] gtag is not loaded or initialized on window.');
      return;
    }

    // Set GA4 user property
    window.gtag('set', 'user_properties', { user_role: role });
  } catch (error) {
    // Fail gracefully without throwing errors
    console.error('[Analytics] Error setting user_role property in GA4:', error);
  }
}
