### Role & Mandate
You are an expert full-stack developer. Your task is to design and implement a custom, self-hosted web analytics platform built directly into our existing backend/frontend infrastructure across `ultrahealers.com`, `healers.ultrahealers.com`, and `seekers.ultrahealers.com`.

**STRICT REQUIREMENT:** Do NOT use or suggest third-party analytics services (e.g., Google Analytics, Plausible, Mixpanel, PostHog, Segment). Everything—from event collection to data storage, aggregation, and admin UI—must be owned, custom-built, and self-hosted within our current stack.

---

### Step 1: Mandatory Discovery & System Audit (Do This First)
Before writing any code or database migrations, analyze our existing application architecture, database, and codebase patterns.

1. **Project & Architecture Audit:**
   - Map out the directory structure and cross-subdomain mechanics for `ultrahealers.com`, `healers.ultrahealers.com`, and `seekers.ultrahealers.com`.
   - Identify how cookies/sessions, CORS rules, and subdomains are currently handled across these domains.
   - Analyze the current stack (Framework, ORM, Database engine, Caching layer like Redis, and Job Queue system).

2. **Database & Schema Audit:**
   - Inspect existing user tables (`users`, `healers`, `seekers`) to identify timestamp fields (`created_at`) and role mappings.
   - Assess database performance capabilities (indexing, storage capacity) to handle high-frequency analytics logs.

3. **Admin Panel Structure:**
   - Examine existing Admin controllers, API routes, middleware/authorization, and frontend layout patterns to seamlessly blend the custom analytics dashboard into the present ecosystem.

---

### Step 2: Architecture & Implementation Plan

Once discovery is complete, present a clear execution plan following the project’s established architectural patterns before proceeding with implementation.

#### Implementation Blueprint:

1. **Custom Data Model & Database Schema:**
   - Design lightweight, indexed custom analytics tables (e.g., `analytics_pageviews`, `analytics_events`, `analytics_sessions`).
   - Store critical metrics: session token, domain/subdomain, URL path, referrer/UTM source, user-agent details (device/browser), session duration, bounce flags, and click interactions.
   - Incorporate `user_id` linkage when a user is authenticated (Healer/Seeker) while anonymizing unauthenticated IP addresses for privacy compliance.

2. **Custom Tracker Script & Ingestion API:**
   - Create a lightweight, native JavaScript tracking snippet to be included across all three subdomains (`ultrahealers.com`, `healers.ultrahealers.com`, `seekers.ultrahealers.com`).
   - Implement `beacon` or asynchronous POST calls (`navigator.sendBeacon` / `fetch`) to stream page views, click paths, time-on-page (via page visibility API), and exit/bounce points.
   - Build a high-performance backend collector API endpoint (e.g., `POST /api/v1/analytics/collect`) configured with proper CORS settings to accept incoming beacon payloads from all three subdomains securely.

3. **User Acquisition & Aggregation Queries:**
   - Write optimized database queries/jobs to aggregate user registrations over time by role (Healers vs Seekers) grouped by month.
   - Implement background aggregation jobs or optimized indexed views if needed to keep read queries fast for heavy traffic.

4. **Custom Admin Dashboard UI Integration:**
   - Build a dedicated Analytics view inside the existing Admin dashboard using our established UI components and design system.
   - Display key metrics cleanly:
     - **Monthly Acquisition Trends:** Healer vs. Seeker signup counts over time.
     - **Traffic Acquisition Sources:** Top referrers, organic traffic, and UTM campaigns.
     - **Behavioral Insights:** Pageview volume per subdomain, click maps/popular click paths, average time-on-page, and high drop-off/bounce pages.
   - Include filter capabilities (date ranges, subdomain filtering).

---

### Step 3: Execution & Testing
1. Implement the database migrations, backend collector endpoint, custom JS tracker script, and admin views following project conventions.
2. Verify cross-subdomain tracking without CORS blocks or console errors.
3. Test time-on-page, click tracking, and exit/bounce logic across various browser contexts.
4. Verify that data rendered in the Admin Dashboard is accurate, matches raw DB records, and loads efficiently.