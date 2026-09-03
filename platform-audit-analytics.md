Act as a senior full-stack developer and software architect. Please perform a thorough codebase audit of this application to determine which website, product, and UX analytics metrics are currently being tracked, collected, or logged.

Please inspect the entire codebase (frontend, backend, configuration files, third-party script tags, database schemas, and event listeners) and produce an inventory report structured around these key areas:

1. Growth & Traffic Metrics:
   - Identify any existing scripts or packages for tracking users, sessions, pageviews, acquisition channels, or referrer data (e.g., Google Analytics 4, Plausible, PostHog, Mixpanel, Segment, custom middleware).

2. Engagement & Content Metrics:
   - Identify any custom or library-based tracking for page/route changes, session duration, scroll depth, active time, or interaction with specific UI components.

3. Conversion & Business Metrics:
   - Identify any tracked conversion events, goals, or funnel steps (e.g., checkout/signup steps, form submissions, button clicks, API response handlers logging completed workflows).

4. Technical & UX/Performance Metrics:
   - Identify any performance or error monitoring tools (e.g., Sentry, LogRocket, Web Vitals libraries, Datadog) tracking page load speeds, Core Web Vitals, uncaught JS errors, or frustration signals (e.g., rage clicks, dead clicks).

5. Custom Analytics Infrastructure (Database & API):
   - Search for internal/custom analytics tables, collections, schema fields, or API endpoints that record system usage, user action logs, timestamped activity, or client/feature engagement.

---

### REQUIRED OUTPUT FORMAT

Please provide your findings in the following structured format:

#### A. Executive Summary
A 2–3 sentence overview stating whether analytics are currently **fully implemented**, **partially implemented**, or **absent**.

#### B. Inventory Matrix
A compact table summarizing status across key metric categories:
| Analytics Category | Status (Fully Tracked / Partial / Missing) | Tools / Packages Found | Code Locations / Files |
| :--- | :--- | :--- | :--- |
| Traffic & Pageviews | | | |
| User Engagement | | | |
| Conversions & Events | | | |
| UX & Error Tracking | | | |
| Custom Internal Logs | | | |

#### C. Detailed Findings & Evidentiary Code
- Group findings by file or module.
- For each detected tracking mechanism, quote the exact file path and line numbers or code snippet where the event/script is initialized or triggered.

#### D. Missing Gaps & Recommendations
- List high-priority metrics or standard analytics features that are currently missing from the system and suggest the cleanest implementation path based on our tech stack.