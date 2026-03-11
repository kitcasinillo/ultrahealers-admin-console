# 🚀 Admin Console CMS — Step-by-Step Implementation Plan

This document outlines the step-by-step execution plan for building the `admin-console` application, based on the `ADMIN_CONSOLE_FEATURE_LIST.md` specifications.

---

## 🛠️ Phase 0: Project Setup & Scaffolding
- [x] **0.1 Initialize Project:** Scaffold React 18 + Vite + TypeScript application in `admin-console`.
- [x] **0.2 Install Dependencies:** Add Tailwind CSS v4, `@tailwindcss/postcss`, Radix UI / shadcn/ui, Recharts, TanStack Table v8, React Hook Form, Zod, and Firebase SDK.
- [x] **0.3 Architecture Setup:** Create folder structure (`src/pages`, `src/components`, `src/lib`, `src/contexts`). Adopt **Apex Dashboard** component organization leveraging shadcn/ui primitives.
- [x] **0.4 Routing Setup:** Configure React Router DOM v6 with a root shell layout (`Sidebar`, `TopBar`).
- [x] **0.5 Environment Variables:** Setup `.env` configuration for API URL and Firebase.
- [ ] **0.6 Retrofit Apex Dashboard UI:** Apply Apex Dashboard component organization and styling to the already completed Phase 1 (Auth, Dashboard, Users) and Phase 2 (Listings) pages and components.


## 🔴 Phase 1: Auth, Dashboard, User Management (Critical Priority)
- [x] **1.1 Module 0 — Authentication:**
  - [x] Integrate Firebase Auth context.
  - [x] Build `/login` page.
  - [x] Implement `AdminGuard` to restrict access by Firebase custom claim `admin: true`.
  - [x] Build a default Super Admin user seeder (create/verify super admin on startup or via script).
- [x] **1.2 Module 1 — Dashboard Overview:**
  - [x] Build `/dashboard` page.
  - [x] Create `StatsCard` components for KPI metrics.
  - [x] Integrate real-time feed and quick actions panel.
- [x] **1.3 Module 2 — User Management:**
  - [x] Build `/users/healers` view with TanStack Table (sort, filter, pagination).
  - [x] Build Healer Detail Page (`/users/healers/:id`) with actions (suspend, premium toggle).
  - [x] Build `/users/seekers` view and Seeker Detail Page.

## 🔴 Phase 2: Core Platform Entities (Listings, Retreats, Bookings)
- [x] **2.1 Module 3 — Listings Management:**
  - [x] Build `/listings` data table.
  - [x] Build Listing Detail Page (edit, status toggle, revision history hooks).
- [ ] **2.2 Module 4 — Retreats Management:**
  - [ ] Build `/retreats` data table.
  - [ ] Build Retreat Detail Page (enrolled seekers, approval workflows).
- [ ] **2.3 Module 5 & 6 — Bookings Management:**
  - [ ] Build `/bookings/sessions` data table with status flags and filters.
  - [ ] Build Session Booking Detail Page (commission breakdown, chat viewer).
  - [ ] Build `/bookings/retreats` data table and Retreat Booking Detail Page.

## 🔴 Phase 3: Dispute Resolution Center
- [ ] **3.1 Module 8 — Disputes Queue:**
  - [ ] Build `/disputes` table with severity badging and type filters.
- [ ] **3.2 Module 8 — Dispute Details & Resolution:**
  - [ ] Build Dispute Detail Page (`/disputes/:id`) showing both statements and evidence.
  - [ ] Implement Admin Decision form (Full Refund, Partial Refund, Deny) and trigger actions.

## 🟠 Phase 4: Financial Management
- [ ] **4.1 Module 7 — Finance Dashboards:**
  - [ ] Build `/finance` Revenue Overview dashboard.
  - [ ] Build Commission Report table with Excel export.
  - [ ] Build Premium Subscriptions table.
- [ ] **4.2 Module 7 — Payouts Settings:**
  - [ ] Build `/finance/payouts` table.
  - [ ] Build Payout Settings per healer (`/finance/payout-settings`).

## 🟠 Phase 5: Email Campaigns
- [ ] **5.1 Module 9 — Campaigns Manager:**
  - [ ] Build `/campaigns` listing view.
  - [ ] Integrate Rich Text WYSIWYG Editor (TipTap/Quill) for campaign composer.
  - [ ] Build Audience Builder logic (custom segments, filters).
- [ ] **5.2 Module 9 — Templates & Tracking:**
  - [ ] Build Analytics view for campaigns (`/campaigns/:id`).
  - [ ] Build templates library and unsubscribe management logic.

## 🟡 Phase 6: Reports & Analytics
- [ ] **6.1 Module 10 — Building Reports:**
  - [ ] Platform Overview Report (`/reports/overview`).
  - [ ] Financial Report (`/reports/financial`).
  - [ ] User Cohort Report (`/reports/users`).
  - [ ] Bookings & Retreats Reports.
  - [ ] Disputes & Campaign Reports.

## 🟡 Phase 7: App Management
- [ ] **7.1 Module 11 — Modalities:**
  - [ ] Build `/modalities` list (CRUD, emoji/icons, drag-and-drop).
- [ ] **7.2 Module 12 — Notifications:**
  - [ ] Build `/notifications` scheduler control panel.
  - [ ] Build Manual Event Dispatcher interface.
- [ ] **7.3 Module 13 — Settings:**
  - [ ] Build `/settings` global configuration arrays (platform limits, fees).
  - [ ] Build Feature Flags toggles.
  - [ ] Add SEO controls (`/seo` view).

## 🟢 Phase 8: Finishing Touches
- [ ] **8.1 Module 13 — Audit Log:**
  - [ ] Build `/settings/audit-log` tracking page for all admin actions.
- [ ] **8.2 Role Management & Refinements:**
  - [ ] Setup permissions for sub-admin roles (moderator, finance).
  - [ ] Final UI/UX polish, micro-animations, loading states.
