# Agent Knowledge System Changelog

All notable updates to agent capabilities, skills, memory, lessons learned, and system specifications are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to Semantic Knowledge Versioning.

## [1.9.2] - 2026-08-13

### Fixed
- Fixed **Healer Listing Session vs Retreat Click Interaction Tracking & Route Mapping**:
  - Corrected native analytics tracker [`uh-analytics.js`](file:///C:/Users/ItechMediaLogic/prods/seeker-app/public/uh-analytics.js) across `seeker-app`, `healer-app`, and `ultrahealers-admin-console` in `getPageSectionPrefix()`: separated `if (path.includes('/retreats')) return 'retreats'` and `if (path.includes('/listings')) return 'listings'`. Previously `/listings` returned `'retreats'`, causing all seeker session booking interactions on `/listings/*` to be logged with a `retreats_` section prefix.
  - Corrected `routeMap` in [`AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx): updated `/listings` mapping from `'Retreat Listings'` to `'Healer Session Listings'`, and `/listings/*` detail paths to `'Healer Session Detail'`.
  - Updated backend controller [`controllers/adminBookingsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/adminBookingsController.js) `inferBookingType`: now checks explicit `bookingType`, `type`, and `retreatListingId` fields before using title string fallback logic.
  - Updated backend controller [`controllers/adminFinanceController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/adminFinanceController.js) `isRetreat` logic: respects explicit `bookingType === 'session'` to prevent healer sessions with "retreat" in the title or modality from being counted under retreat platform fees.
  - Updated [`StripePaymentForm.jsx`](file:///C:/Users/ItechMediaLogic/prods/seeker-app/src/components/StripePaymentForm.jsx) and [`bookingController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/bookingController.js) to explicitly set `bookingType: 'session'` when creating seeker session bookings.
- **Fixed Uncaught TypeError `Cannot read properties of undefined (reading 'split')` in Audit Log Settings**:
  - Added null safety checks in [`AuditLogSettings.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/settings/components/AuditLogSettings.tsx) for `log.adminEmail`, `log.module`, `log.timestamp`, `item.label`, and `item.value` when rendering table rows and parsing change diffs.
- **Omitted User UIDs from Click Interaction Telemetry & Dashboard Labels**:
  - Updated native analytics tracker [`uh-analytics.js`](file:///C:/Users/ItechMediaLogic/prods/seeker-app/public/uh-analytics.js) across `seeker-app`, `healer-app`, and `ultrahealers-admin-console`: `getPageSectionPrefix()` and `cleanElementDescriptor()` now strip 20+ character UIDs and path parameters, turning raw descriptors like `healers_4R1v9X0yZ2aB3cD4eF5g6h7i8j_view_all_sessions` into `healers_view_all_sessions`.
  - Updated [`AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx) `formatClickLabel` and backend [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) `stripUidFromDescriptor`: automatically filters out UID tokens when formatting click titles and aggregating counts, so clicks display cleanly as **"Healers View All Sessions"** or **"Healers Book Session"**.
- **Optional Credentials Setup During Healer Onboarding**:
  - Updated [`OnboardingWizard.jsx`](file:///C:/Users/ItechMediaLogic/prods/healer-app/src/components/OnboardingWizard.jsx): changed `validateStep(OnboardingSteps.CREDENTIALS)` to return `true` so healers can advance without uploading credentials. Added an informative banner and a `"Skip & Set Up Later"` button option.
- **Fixed Dual-Role Account Array Duplication & Symmetrical Initial Role Preservation (`roles`)**:
  - Enforced `Array.from(new Set(...))` across [`AuthContext.jsx`](file:///C:/Users/ItechMediaLogic/prods/healer-app/src/contexts/AuthContext.jsx) in `healer-app` and `seeker-app` when merging existing profile data for dual-role users (e.g. Seeker upgrading to Healer).
  - Fixed issue where single-role fallback `[data.role, data.type]` created duplicate `['seeker', 'seeker']` elements before appending `'healer'`, producing `['seeker', 'seeker', 'healer']`.
  - Preserved `existing.role` and `existing.type` in `healer-app` so adding a secondary healer role to an existing seeker account does not overwrite its initial signup role or corrupt historical User Acquisition Trends statistics.
- **Added Independent Role Registration Timestamps (`seeker_joined_at` & `healer_joined_at`)**:
  - Updated [`AuthContext.jsx`](file:///C:/Users/ItechMediaLogic/prods/healer-app/src/contexts/AuthContext.jsx) in `healer-app` and `seeker-app`: independent timestamps (`seeker_joined_at` and `healer_joined_at`) are saved when a user registers for or adds each respective role. Added auto-population on profile fetch/sign in so existing dual-role documents receive `healer_joined_at` automatically.
- **Adaptive Time Granularity & Continuous Timeline Buckets for User Acquisition Trends**:
  - Updated backend [`analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js): User Acquisition Trends now dynamically adjusts time grouping and pre-populates zero-count timeline buckets based on the selected date filter range:
    - **Last 7 Days (or $\le 14$ days)**: Pre-populates and groups **daily** (`Aug 7`, `Aug 8`, `Aug 9`, `Aug 10`, `Aug 11`, `Aug 12`, `Aug 13`).
    - **Last 30 Days & Last 90 Days (or 15 to 120 days)**: Pre-populates and groups **weekly** (`Week of Jul 14`, `Week of Jul 21`, `Week of Jul 28`, `Week of Aug 4`, `Week of Aug 11`).
    - **Year to Date & All Time (or $> 120$ days)**: Pre-populates and groups **monthly** (`Jan 2026`, `Feb 2026`, ..., `Aug 2026`).
    - **All Time Filter**: `range === 'all'` dynamically evaluates the earliest recorded timestamp in Firestore (`profiles`, `analytics_sessions`) and sets `startDate` to the beginning of the first recorded month, preventing 80+ empty zero-count months starting from 2020.
  - Fixed `req.query` destructuring in `getAnalyticsStats` in [`analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) for `customStartDate` and `customEndDate`.
  - Updated [`AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx), [`BaseAreaChart.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/components/Charts/BaseAreaChart.tsx), & [`BaseBarChart.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/components/Charts/BaseBarChart.tsx): chart title dynamically displays `(Daily)`, `(Weekly)`, or `(Monthly)` depending on active filter range; consolidated duplicate legend and totals into unified **Seeker Signups** and **Healer Signups** stat badges at the **bottom-right** of the chart card (`showLegend={false}`).

## [1.9.1] - 2026-08-12

### Fixed
- Fixed **Dev Environment Port Mapping Inversion for Web Analytics Tracker & Subdomain Filter**:
  - Corrected tracker scripts [`uh-analytics.js`](file:///C:/Users/ItechMediaLogic/prods/healer-app/public/uh-analytics.js) across `seeker-app`, `healer-app`, and `ultrahealers-admin-console` to map dev port `5174` -> `seekers.ultrahealers.com` and port `5175` -> `healers.ultrahealers.com` (previously port `5174` was erroneously mapped to `healers` and `5175` to `seekers`).
  - Updated backend domain matcher `matchesSubdomain` in [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) and frontend badge renderer `formatDomainBadge` in [`AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx) to accurately map port `5174` to Seekers and port `5175` to Healers.
  - Implemented `getCanonicalDomainCategory` in [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) to resolve target/domain matches into strict categories (`admin`, `seekers`, `healers`, `website`). This eliminates substring collisions (e.g. `ultrahealers.com` containing `healers.`) that previously caused the Healer App filter to match Admin Console documents.

## [1.9.0] - 2026-08-12

### Changed / Improved
- Implemented **Multi-Select Subdomain Filtering**:
  - Replaced single `<select>` with interactive Popover Multi-Select Component in [`AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx) allowing administrators to select any combination of subdomains (e.g., exclude Admin Console, view only Seekers + Healers, or select individual domains).
  - Updated frontend API [`src/api/analytics.ts`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/api/analytics.ts) to accept `subdomain: string | string[]` and format comma-separated query parameters.
  - Upgraded backend controller [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) with `matchesSubdomain` matcher to aggregate and filter telemetry across multi-selected domains.
- Replaced static placeholder percentage labels with **Dynamic Period-over-Period Trend Calculations**:
  - Updated backend controller [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) to query prior equivalent timeframe metrics (e.g. 7-14 days ago vs 0-7 days ago) and compute real percentage changes (`+15.2% vs previous period`, `0.0% vs previous period`, etc.) and trend indicators (`up`, `down`, `neutral`).
  - Updated frontend API [`src/api/analytics.ts`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/api/analytics.ts) and Admin Dashboard [`AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx) to render dynamic trend values on all 4 KPI summary cards (**Total Pageviews**, **Unique Sessions**, **Avg. Session Duration**, and **Bounce Rate**).
- Added **Domain Tracking Indicators & Explicit Admin Console Subdomain Option**:
  - Added `admin-console.ultrahealers.com` (Admin Console, mapped from port `5173`/`3000` during dev) as an explicit option in the Subdomain Filter dropdown in [`AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx).
  - Updated `formatDomainBadge` helper to render the slate <span style="background-color: #f1f5f9; color: #334155;">website</span> badge for the main `ultrahealers.com` domain.
  - Updated native tracker script [`public/uh-analytics.js`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/public/uh-analytics.js) across all 3 frontends to map dev port `5173`/`3000` to `admin-console.ultrahealers.com`.
  - Updated backend aggregator [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) to group and emit the originating domain (`admin-console.ultrahealers.com`, `healers.ultrahealers.com`, `seekers.ultrahealers.com`) for every item in `topPages`, `topClicks`, and `topExits`.
- Implemented **Analytics Track Count Reset Controls in System Settings**:
  - Added backend endpoint `POST /api/v1/analytics/reset` (`resetAnalyticsTrackers`) in [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) supporting specific target reset (`clicks`, `pageviews`, `sessions`, `exits`, `conversions`) and `all` trackers reset.
  - Added frontend API helper `resetAnalyticsTrackers(target)` in [`src/api/analytics.ts`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/api/analytics.ts).
  - Built [`AnalyticsResetSettings.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/settings/components/AnalyticsResetSettings.tsx) component integrated into [`SystemSettings.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/settings/components/SystemSettings.tsx) with target tracker dropdown, "Reset Target" button, "Reset All" danger action, confirmation dialog, automatic audit log emission (`RESET_ANALYTICS_TRACKER`), animated spinner loading indicators (`Loader2`), button disabled states during backend execution, and loading toast notifications (`toast.loading`).
- Implemented **Standardized `[Page/Section]_[Action/Verb]_[Object/Context]` Button Tracking Engine** ([`button-tracking-enhancement.md`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/button-tracking-enhancement.md)).
- Expanded **Top Analytics Lists to 10 Items with Scrollable Cards**.

## [1.8.0] - 2026-08-11

### Added
- Implemented **Core Web Vitals, Exception Monitoring, Rage Click & Conversion Tracking** (`platform-audit-analytics.md`):
  - Upgraded native tracker script [`public/uh-analytics.js`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/public/uh-analytics.js) across `ultrahealers-admin-console`, `healer-app`, and `seeker-app` with `PerformanceObserver` (LCP, CLS, FID), global `error` & `unhandledrejection` exception handlers, rapid click spatial rage-click detection, and `UHAnalytics.trackConversion()` helper.
  - Updated backend analytics controller [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js) to store and aggregate performance vitals, client error logs, rage click spots, and conversion goals.
  - Updated frontend API [`src/api/analytics.ts`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/api/analytics.ts) and Admin Console Dashboard [`src/pages/reports/AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx) with Core Web Vitals status cards, JS Error log list, Rage Click hotspots table, and Conversion milestone metrics.

## [1.7.0] - 2026-08-11

### Added
- Implemented custom **Self-Hosted Web Analytics Platform** (`admin-analytics.md`):
  - Created backend ingestion endpoint `POST /api/v1/analytics/collect` and stats aggregator `GET /api/v1/analytics/stats` in [`controllers/analyticsController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/analyticsController.js).
  - Deployed lightweight native tracker `public/uh-analytics.js` across `seeker-app`, `healer-app`, and `ultrahealers-admin-console`.
  - Replaced legacy Google Analytics (`gtag.js`) scripts in [`seeker-app/index.html`](file:///C:/Users/ItechMediaLogic/prods/seeker-app/index.html) and [`healer-app/index.html`](file:///C:/Users/ItechMediaLogic/prods/healer-app/index.html).
  - Built real-time analytics dashboard [`AnalyticsDashboard.tsx`](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/AnalyticsDashboard.tsx) with date range and subdomain filters, user acquisition metrics (Healers vs Seekers), traffic sources, pageview stats, click interactions, and exit drop-off pages.

## [1.6.0] - 2026-08-10

### Fixed
- Restored responsive **HTML styled welcome email templates** (`generateWelcomeSeekerEmail` & `generateWelcomeHealerEmail`) while retaining anti-spam headers:
  - Included both `html` and `text` parts in [`utils/notificationService.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/utils/notificationService.js) for full email client compatibility.
  - Retained strict sender address alignment (`"Ultra Healers" <${process.env.EMAIL_USER}>`) and `replyTo` header.
  - Kept clean, emoji-free subject lines to prevent automated spam categorization.

## [1.5.0] - 2026-08-06

### Added
- Implemented automated **Welcome & Thank You Email** dispatch system for Seekers & Healers:
  - Created responsive HTML welcome email templates (`generateWelcomeSeekerEmail` and `generateWelcomeHealerEmail`) in [`utils/emailTemplates.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/utils/emailTemplates.js).
  - Integrated automated signup event parsing (`signup_seeker`, `signup_healer`, `account.signup`) in [`controllers/notificationController.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/controllers/notificationController.js).
  - Added robust multi-URL fallback dispatcher in [`seeker-app/src/lib/n8n.js`](file:///C:/Users/ItechMediaLogic/prods/seeker-app/src/lib/n8n.js) and [`healer-app/src/lib/n8n.js`](file:///C:/Users/ItechMediaLogic/prods/healer-app/src/lib/n8n.js).
  - Supported dual delivery channels: n8n Workflow Webhooks (`sendEvent`) and direct Nodemailer SMTP fallback.
  - Added `/api/notifications/test-welcome-email` debugging endpoint in [`routes/notificationRoutes.js`](file:///C:/Users/ItechMediaLogic/prods/backend-server/routes/notificationRoutes.js).

## [1.4.0] - 2026-07-23

### Added
- Implemented **Registered Users Auth Report** feature specified in `registered-user-report.md`:
  - Created [src/components/reports/UsersAuthReport.tsx](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/components/reports/UsersAuthReport.tsx) component.
  - Added `getAuthUsersReport()` API helper method and `AuthUserRecord` type in [src/api/reports.ts](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/api/reports.ts).
  - Integrated sub-tabbed navigation in [src/pages/reports/UserReport.tsx](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/src/pages/reports/UserReport.tsx).
  - Supported email/name/UID search, verification status filters, 5-minute client-side caching, and one-click CSV export via `PapaParse`.

## [1.3.0] - 2026-07-23

### Added
- Added Cross-Model Bootstrap System based on `agent-gemini.md`:
  - Created [GEMINI.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/GEMINI.md) at root and [agent-system/GEMINI.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/GEMINI.md).
  - Defined mandatory 5-phase startup sequence (Identity ➜ Project Context ➜ Historical Knowledge ➜ Project Rules ➜ Task Context).
  - Established 8-step bootstrap execution workflow and model handoff principles for successor models.

## [1.2.0] - 2026-07-23

### Added
- Completed initial project analysis and knowledge extraction based on `agent-improvement.md`:
  - Added [agent-system/project-overview.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/project-overview.md) (System purpose, domain, modules, user roles, workflows).
  - Added [agent-system/architecture.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/architecture.md) (Frontend/backend stack, state management, auth flow, export engine).
  - Added [agent-system/business-rules.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/business-rules.md) (User verification, retreat approval, dispute/refund policy, fee calculation, audit log rules).
  - Added [agent-system/technical-debt.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/technical-debt.md) (Route guard bypass, API inconsistencies, mock dependencies, missing bindings).
  - Added [agent-system/modules/](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules) directory with 8 module specification files:
    - [user-management.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules/user-management.md)
    - [retreats-and-listings.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules/retreats-and-listings.md)
    - [bookings-and-disputes.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules/bookings-and-disputes.md)
    - [finance-and-payments.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules/finance-and-payments.md)
    - [campaigns-and-marketing.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules/campaigns-and-marketing.md)
    - [modalities-and-seo.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules/modalities-and-seo.md)
    - [reports-and-analytics.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules/reports-and-analytics.md)
    - [settings-and-audit.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/modules/settings-and-audit.md)
- Updated [agent-system/patterns.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/patterns.md) with codebase patterns (PAT-003 through PAT-006).

## [1.1.0] - 2026-07-23

### Added
- Added [agent-system/operating-system.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/operating-system.md) based on `agent-enhancement.md`.
  - Defined Workflow Orchestration rules (Plan Node Default, Subagent Strategy, Self-Improvement Loop, Verification Checklist, Demand Elegance, Autonomous Troubleshooting).
  - Implemented the 6-Phase Task Management Framework.
  - Formulated Core Engineering Principles (Simplicity First, Root Cause Focus, Minimal Impact Principle).
  - Defined Knowledge Persistence standards for successor models.

## [1.0.0] - 2026-07-23

### Added
- Created complete Agent Knowledge System (`agent-system/`) based on `agent-persona-creation.md`.
- Added system core documentation:
  - [agent-system/README.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/README.md) (System overview & operational rules)
  - [agent-system/agent.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/agent.md) (Identity, mission, principles, constraints)
  - [agent-system/persona.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/persona.md) (Tone & communication guidelines)
  - [agent-system/instructions.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/instructions.md) (SOPs & execution framework)
  - [agent-system/memory.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/memory.md) (Long-term memory & discoveries)
  - [agent-system/lessons-learned.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/lessons-learned.md) (Mistake tracking & preventative actions)
  - [agent-system/skills.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/skills.md) (Capabilities matrix & maturity levels)
  - [agent-system/patterns.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/patterns.md) (Architecture & UI design patterns)
  - [agent-system/decisions.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/decisions.md) (ADR log)
  - [agent-system/glossary.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/glossary.md) (Domain terminology)
  - [agent-system/changelog.md](file:///C:/Users/ItechMediaLogic/prods/ultrahealers-admin-console/agent-system/changelog.md) (Audit log)
- Initialized `agent-system/archive/` directory for historical context preservation.
