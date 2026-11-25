# Agent Long-Term Memory & Discoveries

This file persists key architectural discoveries, long-term project context, and reusable insights gathered over time.

---

## 📌 Active Memories

### MEM-001: Admin Console System Architecture & Setup
- **Date Recorded**: 2026-07-23
- **Source**: Initial Repository Assessment
- **Importance Level**: High
- **Tags**: `[architecture, project-structure, stack]`
- **Summary**: Modern Admin Console web application built with React/TypeScript/Vite.
- **Full Context**:
  - Uses Vite as dev server and build tool.
  - UI styled with Tailwind CSS & PostCSS.
  - Includes user reports, registered user data reporting, and agent persona specifications.
  - Configuration stored in `.env` and `.env.example`.

### MEM-002: Registered Users Auth Report Feature Implementation
- **Date Recorded**: 2026-07-23
- **Source**: `registered-user-report.md` Feature Implementation
- **Importance Level**: High
- **Tags**: `[reports, firebase-auth, user-management, csv-export]`
- **Summary**: Registered user account directory fetched via `/api/users/auth-list` and rendered in `UsersAuthReport.tsx`.
- **Full Context**:
  - Integrated `UsersAuthReport.tsx` component into `UserReport.tsx` under sub-tab "Registered User Accounts (Firebase Auth)".
  - Displays Email, UID, Created Date, Last Sign-In Date, and Email Verification Status.
  - Features real-time search, verification status filter, 5-minute client-side caching, and one-click CSV export via `PapaParse`.

### MEM-003: Self-Hosted Native Web Analytics Platform
- **Date Recorded**: 2026-08-11
- **Source**: `admin-analytics.md` Custom Self-Hosted Web Analytics Implementation
- **Importance Level**: High
- **Tags**: `[analytics, self-hosted, cross-subdomain, ingestion-beacon, admin-dashboard]`
- **Summary**: Custom self-hosted analytics engine replacing legacy third-party Google Analytics across all subdomains.
- **Full Context**:
  - Ingestion API endpoint: `POST /api/v1/analytics/collect` in `backend-server` (`controllers/analyticsController.js`).
  - Native tracking snippet: `public/uh-analytics.js` deployed across `seeker-app`, `healer-app`, and `ultrahealers-admin-console`.
  - Admin UI: `AnalyticsDashboard.tsx` in `src/pages/reports/AnalyticsDashboard.tsx` with date range & subdomain filters, user acquisition metrics (Healers vs Seekers), traffic sources, pageview stats, click interactions, and exit drop-off pages.

### MEM-004: Responsive Mobile Sidebar Navigation Drawer
- **Date Recorded**: 2026-08-19
- **Source**: Sidebar Responsiveness Bug Resolution
- **Importance Level**: High
- **Tags**: `[ui, responsive, sidebar, mobile-drawer, layout]`
- **Summary**: Implemented slide-over mobile navigation drawer & TopBar toggle button for small screens (<768px).
- **Full Context**:
  - `Sidebar.tsx` renders persistent `w-[290px]` layout on `md:` screens, and an animated drawer overlay on smaller screens.
  - `TopBar.tsx` renders a mobile hamburger menu button (`Menu` icon from `lucide-react`) on `md:hidden`.
  - `AdminLayout.tsx` maintains `isMobileOpen` state and automatically closes the drawer on route changes via `useLocation`.

### MEM-005: Top 10 Report Items Stick-on-Click Hover Display
- **Date Recorded**: 2026-08-19
- **Source**: Web Analytics Report UX Polish
- **Importance Level**: Medium
- **Tags**: `[analytics, hover-display, stick-on-click, untruncated-view, positioning]`
- **Summary**: Implemented dynamic top/bottom card positioning and click-to-stick pinned state for Top 10 list items.
- **Full Context**:
  - Implemented in `AnalyticsDashboard.tsx` for Top 10 Pageviews, Top 10 Click Interactions, and Top 10 Drop-off / Exit Pages.
  - Items 1 and 2 (`idx < 2`) render cards below (`top-full mt-1.5`) to prevent header clipping; items 3+ render above (`bottom-full mb-1.5`).
  - Clicking any item pins its display card open with `pinnedItemKey` state and a `Pinned` badge indicator. Removed modal dialogs in favor of this direct card pinning.

### MEM-006: Healer Subscription Model (7-Day Trial, $99 Upfront + $9.99/mo, CMS-Editable, Grandfathered)
- **Date Recorded**: 2026-11-25
- **Source**: Healer Subscription Model Implementation
- **Importance Level**: High
- **Tags**: `[subscriptions, stripe, cms, healer-onboarding, finance, grandfathering]`
- **Summary**: Implemented CMS-editable healer subscription model with 7-day free trial, $99 Day-7 upfront fee + $9.99/mo recurring billing, embedded Stripe PaymentElement card capture at signup, and existing-healer grandfathering.
- **Full Context**:
  - **CMS Config**: `settings/app_config -> healer_subscription` editable in `GeneralSettings.tsx` (`SettingsPage.tsx`, `schema.ts`) with automatic Stripe Product/Price sync in `backend-server/controllers/settingsController.js` and `subscriptionController.js`.
  - **Backend API & Webhooks**: `/api/subscriptions/*` (`config`, `setup-intent`, `activate`, `status/:healerId`, `portal-session`, `cancel`); `webhookController.js` handles `invoice.created` (attaches $99 upfront InvoiceItem idempotently on Day 7), `invoice.paid` (logs to `subscription_invoices`), `invoice.payment_failed`, `customer.subscription.trial_will_end`, `customer.subscription.updated`, and `customer.subscription.deleted`.
  - **Healer App**: Embedded Stripe `PaymentElement` in `Subscribe.jsx` / `CardSetupForm.jsx`, route-guarded in `App.jsx` via `hasActiveHealerSubscription` (respects `grandfather_existing_healers` + `grandfather_cutoff_iso` + `subscription_exempt`), trial/past-due banners in `Layout.jsx`, and Stripe Billing Portal in `Upgrade.jsx` (`/billing`).
  - **Admin Finance**: `adminFinanceController.js` & `PremiumSubscriptionsTable.tsx` now display real invoice revenue and `Trialing` / `Active` / `Past Due` / `Canceled` / `Exempt` statuses.
  - **Admin Stripe Settings**: `StripeSettings.tsx` (Settings → Stripe tab) backed by `/api/admin/stripe/*` (`adminStripeController.js`, `utils/secretCrypto.js`, hot-reloadable `config/stripe.js`) lets admins switch Test/Live mode & API keys (AES-256-GCM encrypted in `settings/stripe_secrets`), view connected account + live balance, and serve `stripe_publishable_key` dynamically to `healer-app`.

---

## 📥 Template for New Entries

```markdown
### MEM-XXX: [Title of Insight/Discovery]
- **Date Recorded**: YYYY-MM-DD
- **Source**: [e.g., Code Review / User Input / Debugging Session]
- **Importance Level**: [High | Medium | Low]
- **Tags**: `[tag1, tag2]`
- **Summary**: Concise summary of what was discovered or remembered.
- **Full Context**: Detailed context, code snippets, or reference links.
```
