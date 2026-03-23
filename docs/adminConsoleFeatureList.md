# 🛡️ UltraHealers Admin Console — Feature List & CMS Specification

> **Project Name:** `admin-console`  
> **Tech Stack:** React 18 + Vite + TypeScript + Tailwind CSS v3 + Radix UI + Recharts  
> **Backend:** Existing `backend-server` (Express) + Firebase Admin SDK  
> **Port:** `5176` (dev) | Deployment: Vercel  
> **Version:** 1.0 — Planned  
> **Date:** 2026-02-20

---

## 📐 Tech Stack Decision

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 18 + Vite 5 + **TypeScript** | Same as `retreats-app`; type safety critical for admin |
| Styling | Tailwind CSS v3 | Consistent with `healer-app` + `seeker-app` |
| UI Components | Radix UI + shadcn/ui | Same design system; accessible, headless |
| Charts & Reports | **Recharts** | React-native charting; lightweight, composable |
| Data Tables | **TanStack Table v8** | Sort, filter, paginate large datasets |
| Forms | **React Hook Form + Zod** | Typed, validated forms for settings/campaigns |
| Rich Text (Email) | **TipTap** or **Quill** | WYSIWYG email template editor |
| Auth | Firebase (Admin role check) | Extend existing Firebase auth w/ admin claim |
| Date Picker | **react-day-picker** | Date range selection for reports/campaigns |
| Export | **xlsx** + **jspdf** | CSV/Excel + PDF report exports |
| Toast | Same `ToastContext` pattern | Consistent UX |
| Routing | React Router DOM v6 | Same as seeker-app |

---

## 🏗️ Application Architecture

```
admin-console/
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Root router + AdminGuard
│   ├── contexts/
│   │   ├── AdminAuthContext.tsx    # Firebase auth + admin claim check
│   │   └── ToastContext.tsx
│   ├── lib/
│   │   ├── firebase.ts             # Firebase client init
│   │   ├── api.ts                  # Axios/fetch wrapper → backend-server
│   │   ├── firestore.ts            # Admin Firestore reads
│   │   ├── users.ts                # Healer/Seeker CRUD
│   │   ├── bookings.ts
│   │   ├── retreats.ts
│   │   ├── disputes.ts
│   │   ├── finance.ts
│   │   ├── campaigns.ts            # Email campaign API
│   │   ├── reports.ts
│   │   └── settings.ts
│   ├── components/
│   │   ├── Sidebar.tsx             # Admin navigation
│   │   ├── TopBar.tsx              # Breadcrumbs + admin user
│   │   ├── StatsCard.tsx           # Metric card widget
│   │   ├── DataTable.tsx           # TanStack Table wrapper
│   │   ├── Charts/                 # Reusable chart components
│   │   ├── EmailEditor.tsx         # WYSIWYG campaign editor
│   │   ├── StatusBadge.tsx
│   │   ├── ConfirmModal.tsx
│   │   └── ui/                     # Radix/shadcn components
│   └── pages/
│       ├── Login.tsx
│       ├── Dashboard.tsx           # Overview / home
│       ├── users/                  # Healers & Seekers management
│       ├── listings/               # Service listing management
│       ├── retreats/               # Retreat management
│       ├── bookings/               # Session booking management
│       ├── retreat-bookings/       # Retreat booking management
│       ├── payments/               # Financial management
│       ├── disputes/               # Dispute resolution
│       ├── campaigns/              # Email campaign management
│       ├── reports/                # Analytics & reports
│       ├── modalities/             # Modality management
│       ├── notifications/          # Notification management
│       └── settings/               # Platform settings
```

---

## 🔐 Module 0 — Authentication & Access Control

### 0.1 Admin Login
- Firebase email/password sign-in
- Validates Firebase **custom claim** `admin: true` on token
- Redirect unauthenticated users to login; redirect non-admins with an "Access Denied" page
- "Remember me" support via Firebase persistence

### 0.2 Role Management *(Future v2)*
- `super_admin` — Full access
- `moderator` — Disputes + user management only
- `finance` — Payments + reports only
- `support` — View-only on users, bookings, disputes

### 0.3 Admin Audit Log
- Every action (update, delete, decision, campaign send) is logged with `adminId`, `timestamp`, `action`, `targetId`, `before/after`
- Stored in Firestore `admin_audit_logs` collection
- Viewable in Settings → Audit Log with filters

---

## 📊 Module 1 — Dashboard (Overview)

**Route:** `/dashboard`

### 1.1 Platform KPI Cards (real-time, from Firestore)
| Metric | Data Source |
|--------|------------|
| Total Registered Healers | `profiles` collection (role=healer) |
| Total Registered Seekers | `profiles` collection (role=seeker) |
| Free vs Premium Healers | `profiles.subscription_type` |
| Total Active Listings | `listings` (status=active) |
| Total Active Retreats | `retreat_listings` (status=active) |
| Total Session Bookings (All Time) | `bookings` count |
| Total Retreat Bookings (All Time) | `retreat_bookings` count |
| Open Disputes | `disputes` (status=open) |
| Revenue This Month | Sum of `bookings.amount` for current month |
| Platform Commission This Month | 10% of Healer revenue + 5% Seeker fees |
| MRR (Monthly Recurring Revenue) | Premium subscriptions × $120 |

### 1.2 Charts
- **Revenue Trend** — Line chart, last 12 months (session + retreat revenue stacked)
- **New User Registrations** — Bar chart, last 30 days (healers vs seekers)
- **Booking Volume** — Bar chart, last 30 days (session vs retreat)
- **Subscription Breakdown** — Pie chart (Free vs Premium healers)
- **Top Modalities** — Horizontal bar (most booked modalities)
- **Dispute Rate** — Line chart, dispute count vs total bookings %

### 1.3 Quick Actions Panel
- ✉️ Create Email Campaign
- 🔍 Search User by email/name
- ⚠️ View Open Disputes
- ⚙️ Platform Settings
- 📤 Export Today's Data

### 1.4 Recent Activity Feed
- Last 20 bookings created
- Last 10 new healer registrations
- Last 10 disputes opened/resolved
- Live update every 60 seconds

---

## 👥 Module 2 — User Management

### 2.1 Healers

**Route:** `/users/healers`

**Table Columns:**
- Avatar | Name | Email | Location | Subscription (Free/Premium 🏅) | Status (Active/Suspended) | Listings Count | Total Bookings | Total Earned | Joined Date | Actions

**Features:**
- 🔍 Search by name, email, modality, location
- 🔽 Filter by: subscription type, status, modality, registration date range, has Stripe Connect
- 📊 Sort by any column
- 📄 Pagination (25/50/100 per page)
- 📤 Export to CSV / Excel

**Healer Detail Page** (`/users/healers/:id`):
- Full profile info (name, bio, photo, modalities, certifications, location)
- Subscription info: plan, `premium_activated_at`, Stripe Connect ID
- Listing limit usage (X of Y)
- **All listings** (table with status, bookings, revenue)
- **All retreats** (table with status, bookings, revenue)
- **All bookings** (table: session, seeker, date, amount, status)
- **Payout history** (table: date, amount, Stripe transfer ID)
- **Dispute history** (healer-related disputes)
- **Timeline** (account activity: created, premium upgrade, listing created, etc.)
- ✏️ **Edit profile** inline (update name, bio, modalities, status)
- 💎 **Grant/Revoke Premium** manually (with reason note)
- 🔴 **Suspend / Unsuspend** account (with reason + email notification)
- 🗑️ **Delete account** (soft delete with confirmation dialog)
- 📧 **Send email** directly from admin
- 💬 **Add admin note** (internal CRM note, not visible to healer)

### 2.2 Seekers

**Route:** `/users/seekers`

**Table Columns:**
- Avatar | Name | Email | Location | Status | Total Bookings | Total Spent | Joined Date | Actions

**Features:**
- Same search/filter/sort/export as Healers

**Seeker Detail Page** (`/users/seekers/:id`):
- Profile info (name, email, photo, location)
- **All bookings** (table: listing, healer, date, amount, status)
- **All retreat bookings** (table: retreat, healer, dates, amount, status)
- **Dispute history** (seeker-filed disputes)
- **Chat activity** (count of active chats)
- ✏️ Edit profile inline
- 🔴 Suspend / Unsuspend
- 🗑️ Delete account
- 📧 Send email directly
- 💬 Add admin note

### 2.3 All Users View

**Route:** `/users/all`
- Combined table of all users
- Filter by role (healer / seeker / all)
- Bulk action: send email, suspend, export

---

## 📋 Module 3 — Listings Management

**Route:** `/listings`

### 3.1 Listings Table
**Columns:** Healer | Title | Modality | Format | Price | Session Length | Status | Bookings | Revenue | Created | Actions

**Filters:**
- Status: active / inactive / draft
- Modality (multi-select from existing modalities list)
- Format: Remote / In-Person / Both
- Price range (min/max)
- Healer (search)
- Date range (created)

**Features:**
- Full text search (title, healer name, modality)
- View listing detail
- ✏️ Edit listing (title, description, price, modality, images, status)
- 🔁 Toggle active/inactive
- 🗑️ Delete listing (with confirmation)
- 📤 Export to CSV
- **[NEW - CMS Aligned]** 🛠️ **Reusable Blocks** — Manage internal templates for listing sections (FAQs, Testimonials).
- **[NEW - CMS Aligned]** 📄 **Drafts & Previews** — Preview listing changes before they go live on the app.
- **[NEW - CMS Aligned]** 🕒 **Scheduled Publishing** — Schedule listing activation/inactivation.
- **[NEW - CMS Aligned]** 📜 **Revision History** — View previous versions of listing content and rollback.
- **[NEW - CMS Aligned]** 🔒 **Content Locking** — Prevent two admins from editing the same listing simultaneously.

### 3.2 Listing Detail Page (`/listings/:id`)
- All listing fields displayed
- Booking history table (seeker, date, amount, status)
- Revenue generated by this listing
- Image gallery management
- Status toggle + edit button

---

## 🏕️ Module 4 — Retreats Management

**Route:** `/retreats`

### 4.1 Retreats Table
**Columns:** Host/Healer | Title | Location | Dates (Start–End) | Price/person | Capacity | Booked Spots | Status | Revenue | Actions

**Filters:**
- Status: active / inactive / draft / full
- Location (text search)
- Date range (start date range)
- Price range
- Healer

**Features:**
- Full text search
- 📷 View retreat with gallery
- ✏️ Edit retreat fields
- 🔁 Toggle status
- 🗑️ Delete
- 📤 Export
- **[NEW - CMS Aligned]** 📅 **Content Calendar** — Visual view of upcoming retreats and scheduled updates.
- **[NEW - CMS Aligned]** 📝 **Approval Workflows** — Healer-submitted retreats must be reviewed before appearing in `retreats-app`.

### 4.2 Retreat Detail Page (`/retreats/:id`)
- All retreat fields (title, description, location, dates, capacity, pricing, images)
- **Enrolled Seekers Table** (name, email, paid amount, booking date, payment status)
- Revenue vs capacity fill rate
- Direct link to public `retreats-app` listing
- Status management

---

## 📅 Module 5 — Session Bookings Management

**Route:** `/bookings/sessions`

### 5.1 Bookings Table
**Columns:** Booking ID | Listing | Healer | Seeker | Session Date | Amount | Currency | Commission | Status Flags | Payment Status | Created | Actions

**Status Flags (from `booking.status` object):**
- `invite-email-to-seeker` ✅/❌
- `invite-email-to-healer` ✅/❌
- `booking-confirmed-by-healer` ✅/❌
- `booking-marked-as-complete-by-healer` ✅/❌
- `booking-marked-as-complete-by-seeker` ✅/❌

**Filters:**
- Payment status: succeeded / pending / failed
- Booking status flags (each individually)
- Healer (search)
- Seeker (search)
- Date range (session date / created date)
- Amount range
- Has dispute: yes/no
- Modality

**Export:** CSV, Excel

### 5.2 Booking Detail Page (`/bookings/sessions/:id`)
- Full booking record
- **Commission breakdown display:**
  - Base Amount
  - Seeker Fee (5%)
  - Healer Commission (10%)
  - Processing Fee (2.9% + $0.30)
  - Healer Payout
  - Platform Revenue
- Payment Intent link (Stripe Dashboard)
- Status flags with manual override toggles
- Chat transcript viewer (read-only, from Firebase Realtime Database)
- Dispute status (if exists) with link
- ✉️ Resend confirmation email (to healer / seeker / both)
- ⚠️ Flag booking for review

---

## 🏕️ Module 6 — Retreat Bookings Management

**Route:** `/bookings/retreats`

### 6.1 Retreat Bookings Table
**Columns:** Booking ID | Retreat Title | Healer | Seeker | Amount | Payment Status | Booking Date | Actions

**Filters:** Same pattern as session bookings

### 6.2 Retreat Booking Detail Page (`/bookings/retreats/:id`)
- Full booking info
- Retreat link
- Payment details + Stripe PI link
- ✉️ Resend confirmation

---

## 💰 Module 7 — Financial Management

**Route:** `/finance`

### 7.1 Revenue Overview Dashboard
- **Total Platform Revenue** (all time / this month / this week / custom range)
- **Revenue by Source:**
  - Session commission (healer 10% + seeker 5%)
  - Premium subscription revenue ($120/healer)
  - Retreat platform fees
- **Gross Booking Volume** (total money processed through Stripe)
- **Net Platform Revenue** after Stripe processing fees

### 7.2 Commission Report Table
**Columns:** Booking ID | Date | Healer | Seeker | Base Amount | Healer Commission | Seeker Fee | Processing Fee | Healer Payout | Platform Net | Stripe PI ID

- Date range picker
- Filter by healer
- **Export to Excel** (for accounting)
- Totals row at bottom

### 7.3 Premium Subscriptions Table
**Columns:** Healer | Email | Activated At | Amount Paid | Stripe PI/Session ID | Status (Active/Revoked)

- Revenue from premium upgrades
- Filter by date range, status

### 7.4 Payout Management

**Route:** `/finance/payouts`

**Columns:** Healer | Stripe Account ID | Amount | Currency | Date Initiated | Status | Stripe Payout ID

- View all triggered payouts
- Filter by healer, date, status
- Trigger manual payout for a healer (calls `/api/payouts`)
- View Stripe Connect account status per healer

### 7.5 Payout Settings Per Healer

**Route:** `/finance/payout-settings`
- View/edit each healer's payout preferences (from `payoutSettings` collection)
- Payout schedule: manual / automatic
- Minimum payout threshold

### 7.6 Commission Configuration

✏️ Edit commission rates (directly updates `config/commission.js` via settings endpoint):
- `HEALER_COMMISSION_PERCENT` (default: 10%)
- `SEEKER_FEE_PERCENT` (default: 5%)
- Changes logged to audit log

---

## ⚖️ Module 8 — Dispute Resolution Center

**Route:** `/disputes`

### 8.1 Disputes Queue Table
**Columns:** Dispute ID | Type | Severity | Booking | Seeker | Healer | Requested Amount | Status | Submitted At | Response Due | Actions

**Dispute Types:** `no_show` | `quality` | `safety` | `refund_request` | `other`

**Statuses:** `open` → `in_review` → `resolved_refunded` | `resolved_partial_refund` | `resolved_credit` | `denied`

**Severity:** `normal` | `safety` 🚨

**Filters:**
- Status (multi-select)
- Type (multi-select)
- Severity
- Overdue (response/decision due date passed)
- Healer (search)
- Seeker (search)
- Date range

**Sorting:** By severity, due date, submitted date

**Badges:** Overdue disputes highlighted in red; safety disputes badged 🚨

### 8.2 Dispute Detail Page (`/disputes/:id`)

**Sections:**
1. **Dispute Summary** — Type, severity, status, requested amount, currency, booking link
2. **Timeline** — Submitted → Healer Responded → In Review → Decision
3. **Seeker Statement** — Original description + evidence attachments
4. **Healer Statement** — Response (if submitted)
5. **Evidence Gallery** — All uploaded evidence files (images, docs) from both parties
6. **Chat Transcript** — Related booking chat (read-only)
7. **Booking Details** — Amount, session info, payment intent link

**Admin Actions:**
- **Render Decision** — Form with:
  - Outcome: `Full Refund` | `Partial Refund` | `Credit` | `Deny`
  - Refund Amount (if partial)
  - Credit Amount (if credit)
  - Admin Notes (internal)
  - → Saves to `disputes.decision`, updates status, triggers `dispute.resolved` n8n event + emails both parties
- **Add Internal Note** — Visible only to admins
- **Escalate to Safety** — Change severity to `safety`
- **Trigger Email Notification** — Manually fire `dispute.email` n8n event
- **Link to Stripe** — Open Stripe refund UI for the related Payment Intent

### 8.3 Dispute Analytics Widget (on Reports page)
- Disputes by type (pie)
- Dispute resolution rate (% resolved vs denied)
- Average resolution time
- Dispute rate per 100 bookings (trend line)

---

## 📣 Module 9 — Email Campaign Management

**Route:** `/campaigns`

> This module enables composing, scheduling, and tracking email campaigns sent to healers and/or seekers directly from the admin console, using the existing Nodemailer infra (or a future SendGrid integration).

### 9.1 Campaign List

**Route:** `/campaigns`

**Table Columns:** Name | Audience | Subject | Status | Recipients | Open Rate | Click Rate | Sent At | Created By | Actions

**Statuses:** `draft` | `scheduled` | `sending` | `sent` | `paused` | `failed`

**Filters:** Status, audience, date range, created by

### 9.2 Create / Edit Campaign

**Route:** `/campaigns/new` | `/campaigns/:id/edit`

#### Audience Builder
- **Target audience:**
  - ☑️ All Healers
  - ☑️ All Seekers
  - ☑️ All Users (Healers + Seekers)
  - ☑️ Free Healers only
  - ☑️ Premium Healers only
  - ☑️ Healers with no bookings in last 30 days (re-engagement)
  - ☑️ Healers who joined in last 7 days (welcome)
  - ☑️ Seekers with no bookings in last 30 days (re-engagement)
  - ☑️ Seekers who have pending disputes (dispute follow-up)
  - ☑️ Healers with specific modality (filter)
  - ☑️ Users by location/region (filter)
  - ☑️ **Custom Segment** — CSV upload of email list
- **Live audience preview:** "This campaign will send to **X** users"
- Exclude unsubscribed users (Firestore `email_unsubscribed` flag)

#### Campaign Composer
- **From Name** (default: "UltraHealers Team")
- **From Email** (default: configured `EMAIL_USER`)
- **Reply-To Email**
- **Subject Line** — with personalization tokens: `{{first_name}}`, `{{last_name}}`, `{{email}}`
- **Preview Text** (email preview snippet)
- **Body — WYSIWYG Rich Text Editor (TipTap):**
  - Bold, italic, underline, lists, blockquote
  - Headings (H1–H3)
  - Links + buttons (CTA)
  - Image embed (from URL or Firebase Storage upload)
  - Personalization tokens: `{{first_name}}`, `{{subscription_type}}`, `{{total_bookings}}`, `{{platform_url}}`
  - HTML source view toggle
  - Mobile preview mode

#### Email Template Library
- **Pre-built templates:**
  - 📨 Welcome — Healer
  - 📨 Welcome — Seeker
  - 💎 Premium Upgrade Promotion
  - 🔁 Re-engagement — Healer (no recent bookings)
  - 🔁 Re-engagement — Seeker (no recent bookings)
  - 🎉 New Feature Announcement
  - 📆 Retreat Promotion
  - 📰 Monthly Newsletter
  - ⚠️ Platform Maintenance Notice
- Save current draft as custom template
- Load from template replaces editor content

#### Schedule & Send
- **Send Options:**
  - 🚀 Send Immediately
  - 📅 Schedule for specific date/time (with timezone selector)
  - 🔁 Recurring (weekly/monthly — future v2)
- **Test Email:** Send a test to admin's own email before live send
- **Confirm & Launch** modal with recipient count warning

### 9.3 Campaign Detail / Analytics

**Route:** `/campaigns/:id`

**Metrics (tracked via n8n or email service webhook):**
| Metric | Description |
|--------|-------------|
| 📤 Total Sent | Number of emails dispatched |
| 📬 Delivered | Successfully accepted by recipient servers |
| ✅ Opened | Unique opens (requires tracking pixel) |
| 🖱️ Clicked | Unique link clicks |
| 🔙 Bounced | Hard + soft bounces |
| 🚫 Unsubscribed | Users who unsubscribed via this campaign |
| ❌ Spam Reports | Marked as spam |
| 📊 Open Rate | Opens / Delivered × 100% |
| 📊 CTR | Clicks / Delivered × 100% |

**Charts:**
- Opens over time (hourly, line chart)
- Clicks over time (hourly)
- Device breakdown (mobile vs desktop) — if tracked

**Activity Log:** Timestamped list of events (sent, opened, clicked, bounced, etc.)

**Actions:**
- ⏸️ Pause scheduling (if scheduled/recurring)
- 📋 Duplicate campaign
- 🗑️ Delete campaign
- 📤 Export recipient + interaction report to CSV

### 9.4 Unsubscribe Management

**Route:** `/campaigns/unsubscribes`

- Table of all unsubscribed users (email, name, date, source campaign)
- One-click re-subscribe (with confirmation)
- Bulk export
- **Unsubscribe landing page** included in `admin-console` at `/unsubscribe?token=...` (public route) — updates Firestore `email_unsubscribed: true`

### 9.5 Email Templates Library

**Route:** `/campaigns/templates`
- List of all saved templates
- Preview, Edit, Duplicate, Delete
- Create from scratch

---

## 📈 Module 10 — Reports & Analytics

**Route:** `/reports`

> All reports have: date range picker, granularity toggle (daily/weekly/monthly), and Export (CSV + PDF) button.

### 10.1 Platform Overview Report

**Route:** `/reports/overview`

- **Summary Cards** (for selected period):
  - New Healers registered
  - New Seekers registered
  - Total bookings (sessions + retreats)
  - Total gross volume (GBV)
  - Total platform revenue (commission + subscriptions)
  - Disputes opened / resolved
  - Premium upgrades

- **Charts:**
  - User Growth — Dual line (healers vs seekers, cumulative)
  - Booking Volume — Stacked bar (sessions + retreats)
  - Revenue Composition — Stacked area (session commission + seeker fees + premium subscriptions)
  - Platform Health Score — Gauge (bookings/disputes ratio)

### 10.2 Financial Report

**Route:** `/reports/financial`

**Exportable Table — Per Booking:**
- Date | Booking ID | Listing/Retreat | Healer | Seeker | Gross Amount | Healer Commission | Seeker Fee | Processing Fee | Net Platform Revenue | Stripe PI

**Summary Charts:**
- Revenue by source (session vs retreat vs subscription) — Pie + trend
- Monthly revenue vs. prior period — Bar with % change
- Top 10 revenue-generating healers — Horizontal bar
- Top 10 revenue-generating retreat events — Horizontal bar
- Stripe processing fee impact — Line chart

**Premium Revenue Table:**
- Healer | Activation Date | Amount | Stripe Session ID

### 10.3 User Cohort Report

**Route:** `/reports/users`

- **Registration Trend** — Daily new healers + seekers
- **Churn Indicators** — Healers/seekers with 0 activity in 30/60/90 days
- **Healer Conversion Funnel:**
  - Registered → onboarding complete → first listing → first booking → premium
- **Seeker Funnel:**
  - Registered → profile complete → first search → first booking → repeat booking
- **Subscription Cohort** — % of free healers who upgraded to premium by month
- **Retention Table** — Cohort-based retention (monthly)

### 10.4 Booking & Session Report

**Route:** `/reports/bookings`

- **Booking Volume** — Bar chart by day/week/month
- **Modality Popularity** — Bar chart (sessions per modality)
- **Format Breakdown** — Remote vs In-Person (pie)
- **Session Length Distribution** — Bar (30min, 60min, 90min, 2h)
- **Booking Status Completion Rate** — % of bookings that reach each status flag
- **Average Booking Value** — Line chart over time
- **Repeat Booking Rate** — % of seekers with 2+ bookings
- **Top 10 Healers by Booking Count** — Horizontal bar
- **Top 10 Healers by Revenue** — Horizontal bar

### 10.5 Retreat Report

**Route:** `/reports/retreats`

- Active retreats count trend
- Retreat booking rate (% capacity booked)
- Revenue by retreat event
- Top locations for retreats (map or list)
- Average retreat price per person trend
- Retreats by duration (1–3 days, 4–7 days, 7+ days)

### 10.6 Dispute Report

**Route:** `/reports/disputes`

- Dispute rate (disputes / bookings) — Line chart
- Disputes by type — Pie chart
- Disputes by severity — Bar (normal vs safety)
- Average resolution time (hours) — Line chart
- Resolution outcomes breakdown — Stacked bar (refund/partial/credit/deny)
- Dispute rate by modality — Horizontal bar
- Healer repeat dispute rate (healers with 2+ disputes — flagged)

### 10.7 Campaign Performance Report

**Route:** `/reports/campaigns`

- All campaigns summary table (sent, open rate, CTR, bounce rate)
- Best-performing campaign by open rate
- Unsubscribe rate trend
- Audience segment performance comparison
- Deliverability health dashboard

### 10.8 Notification & Scheduler Report

**Route:** `/reports/notifications`

- Notification emails sent (unread message digests) — count by day
- Scheduler status (running/stopped) + last run timestamps
- Email delivery failures log
- n8n webhook event log (event type, timestamp, success/failure)

---

## 🔍 Module 14 — SEO & Discoverability (App-Specific) **[NEW - CMS Aligned]**

**Route:** `/seo`

### 14.1 App Page SEO Controls
- **Listing & Retreat Meta Manager** — Override default title tags and descriptions for high-traffic healers/retreats.
- **Open Graph / Social Previews** — Custom image uploads and descriptions for social sharing of retreats.
- **Schema Markup Support** — Manage Article, LocalBusiness, and FAQ schema injection for app pages.
- **Canonical URL Management** — Resolve duplicate content issues across multi-repos.

### 14.2 SEO Health Checks
- Missing Alt-text detection (for listing/retreat images)
- Missing H1/H2 validation in descriptions
- Broken internal link detection (links within bio/description that 404)

---

## 🧩 Module 11 — Modalities Management

**Route:** `/modalities`

### 11.1 Modalities Table
**Columns:** Name | Icon/Emoji | Listings Using It | Active | Created | Actions

**Features:**
- ➕ Add new modality (name + emoji/icon)
- ✏️ Edit modality name
- 🔁 Toggle active/inactive (inactive modalities hidden from search)
- 🗑️ Delete (only if no listings use it; else prompt)
- Reorder via drag-and-drop (affects display order on search)
- 🌱 **Re-seed defaults** button (trigger `initializeModalitiesIfEmpty`)
- **[NEW - CMS Aligned]** 📁 **Media Library** — Central repository for all app-wide assets (icons, brand images) with folders, tags, and search.
- **[NEW - CMS Aligned]** 🖼️ **Image Tools** — Auto-compression, WebP support, and alt-text prompts for all library uploads.

---

## 🔔 Module 12 — Notification Management

**Route:** `/notifications`

### 12.1 Notification Scheduler Control Panel
- **Status Card:** Running ✅ / Stopped 🔴
- **Last Run:** timestamp of last notification batch
- **Next Run:** scheduled time (every 6 hours by default)
- **Emails Sent Last Run:** healerNotifications + seekerNotifications count
- Buttons:
  - ▶️ Start Scheduler
  - ⏹️ Stop Scheduler
  - 🚀 **Trigger Now** (manual run of unread message notifications)

### 12.2 Test Notification
- Select user type (healer / seeker)
- Enter user ID or search by name/email
- → Preview unread messages found
- → Send test notification email
- Display result: emails sent, unread count

### 12.3 n8n Event Dispatcher

- Form to dispatch any n8n event type manually:
  - `booking.created`
  - `dispute.created`
  - `dispute.resolved`
  - `dispute.updated`
  - `healer.premium.activated`
  - `retreat.booking`
  - `system.ping`
  - Custom (free-text)
- JSON payload editor
- View response (sent/failed + reason)
- Event history log (last 50 dispatched events)

### 12.4 Email Template Preview
- Preview rendered HTML of each email template (`healerEmail`, `seekerEmail`)
- Input mock data (booking details) to render template
- Useful for debugging email rendering

---

## ⚙️ Module 13 — Platform Settings

**Route:** `/settings`

### 13.1 General Platform Settings
Directly maps to Firestore `settings/app_config`:

| Setting | Field | Default |
|---------|-------|---------|
| Free Tier Listing Limit | `listing_limit_free` | 5 |
| Premium Tier Listing Limit | `listing_limit_premium` | 50 (0 = unlimited) |
| Max Images Per Listing | `max_images_per_listing` | 10 |
| Max File Size (MB) | `max_file_size_mb` | 5 |
| Free Tier Price | `pricing.free.amount` | $0 |
| Premium Tier Price | `pricing.premium.amount` | $120 |
| Premium Tier Currency | `pricing.premium.currency` | USD |

- Edit inline with type-safe inputs + Zod validation
- **"Reset to Defaults"** button with confirmation dialog
- All changes logged to audit log

### 13.2 Commission Settings
| Setting | Field | Default |
|---------|-------|---------|
| Healer Commission % | `HEALER_COMMISSION_PERCENT` | 10% |
| Seeker Fee % | `SEEKER_FEE_PERCENT` | 5% |
| Stripe Processing Fee % | `PROCESSING_FEE_PERCENT` | 2.9% |
| Stripe Fixed Fee (¢) | `PROCESSING_FEE_FIXED` | 30¢ |

- Live commission calculator: enter a base amount → see full breakdown
- Changes require super_admin role + are logged

### 13.3 Feature Flags
| Feature | Tier |
|---------|------|
| basic_listings | Free |
| messaging | Free |
| basic_analytics | Free |
| unlimited_listings | Premium |
| advanced_analytics | Premium |
| priority_support | Premium |
| custom_branding | Premium |

- Toggle each feature per tier
- Add new feature flags

### 13.4 CORS & App URLs
- `ALLOWED_ORIGINS` list (add/remove frontend URLs)
- `HEALER_APP_URL`, `SEEKER_APP_URL`, `RETREATS_APP_URL`
- Shown as read-only (require server restart to change)

### 13.5 Email Configuration
- SMTP host, port, sender name (read-only display from env)
- Send test email from admin console

### 13.6 n8n Configuration
- n8n Webhook URL (read-only from env)
- Signing secret status (configured / missing)
- Test connection (fires `system.ping`)
- **[NEW - CMS Aligned]** 🚀 **Performance & Scalability** — Dashboard for cache status, CDN-friendly media toggles, and health monitoring hooks.
- **[NEW - CMS Aligned]** 🔒 **Security (Non-negotiable)** — Granular permissions for admin users, secure file upload restrictions, and malware scanning hooks.

### 13.7 Audit Log

**Route:** `/settings/audit-log`

**Table Columns:** Timestamp | Admin | Action | Resource Type | Resource ID | Changes | IP Address

**Filters:**
- Admin user
- Action type (created/updated/deleted/campaign_sent/dispute_decided/etc.)
- Resource type (user/listing/retreat/booking/dispute/campaign/settings)
- Date range

- Export to CSV

---

## 🧭 Navigation Structure (Sidebar)

```
🏠 Dashboard
👥 Users
   ├─ All Users
   ├─ Healers
   └─ Seekers
📋 Listings
🏕️ Retreats
📅 Bookings
   ├─ Session Bookings
   └─ Retreat Bookings
💰 Finance
   ├─ Revenue Overview
   ├─ Commission Report
   ├─ Premium Subscriptions
   └─ Payouts
⚖️ Disputes
📣 Campaigns
   ├─ All Campaigns
   ├─ Create Campaign
   ├─ Templates
   └─ Unsubscribes
📈 Reports
   ├─ Platform Overview
   ├─ Financial
   ├─ Users & Cohorts
   ├─ Bookings
   ├─ Retreats
   ├─ Disputes
   ├─ Campaigns
   └─ Notifications
🧩 Modalities
🔔 Notifications
⚙️ Settings
   ├─ General
   ├─ Commission
   ├─ Feature Flags
   ├─ Email Config
   ├─ n8n Config
   └─ Audit Log
```

---

## 🚀 Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
# Admin-specific
VITE_ADMIN_EMAILS=admin@yourdomain.com  # fallback email allowlist
```

---

## 🔒 Security Considerations

1. **Firebase Custom Claims** — `admin: true` set via Firebase Admin SDK; checked on every protected route
2. **Backend Admin Middleware** — All new admin API endpoints on `backend-server` protected by verifying Firebase ID token + admin claim
3. **Audit Trail** — Every destructive action (delete, suspend, decide dispute) is audited
4. **Campaign Safeguards** — Test email required before live send; recipient count warning; daily send cap
5. **Rate Limiting** — Admin API endpoints rate-limited on backend
6. **No PII in Logs** — Email addresses/names truncated in server logs

---

## 📦 Build & Dev

```bash
# Install
cd admin-console && npm install

# Run dev
npm run dev   # → localhost:5176

# Build
npm run build

# Lint
npm run lint
```

---

## 🗓️ Implementation Phases

| Phase | Modules | Priority |
|-------|---------|----------|
| **Phase 1** | Auth, Dashboard, User Management (Healers + Seekers) | 🔴 Critical |
| **Phase 2** | Listings, Retreats, Session Bookings, Retreat Bookings | 🔴 Critical |
| **Phase 3** | Dispute Resolution Center | 🔴 Critical |
| **Phase 4** | Financial Management, Commission Report | 🟠 High |
| **Phase 5** | Email Campaigns (create, send, track) | 🟠 High |
| **Phase 6** | Reports & Analytics | 🟡 Medium |
| **Phase 7** | Notifications, Modalities, Settings | 🟡 Medium |
| **Phase 8** | Audit Log, Role Management, Advanced Campaign Features | 🟢 Nice-to-have |

---

*UltraHealers Admin Console v1.0 Specification*
