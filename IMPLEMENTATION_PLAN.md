# 🚀 Admin Console CMS — Reality Check and Completion Plan

This implementation plan has been revised against the current `admin-console` codebase and the feature specification.

The previous version overstated completion. The repo contains a lot of UI scaffolding, but many modules are still using mock data, placeholder components, disabled guards, or partial bindings.

This document now tracks:
- what is actually functional,
- what is partially wired,
- what is still only UI,
- and what must be completed to deliver the full admin console feature set.

---

## Current Reality Summary

### Actually wired, at least in a meaningful way
- Firebase app initialization exists.
- Admin auth context exists.
- Login page exists.
- Campaign module has substantial UI flow and local hook structure.
- Retreats list/detail have real page flows and some API calls for approve/status/delete.
- Disputes list/detail flows exist and are more than placeholders.
- Finance overview page fetches revenue stats from backend.
- Settings page reads/writes Firestore `settings/app_config` and logs settings updates to `admin_audit_logs`.

### Partially wired
- Auth is not fully enforcing access because route guard is disabled in `App.tsx`.
- Campaigns mix real UX flow with mock `/public/data` API behavior.
- Notifications/settings sub-tabs exist, but several panels are still display-first and need backend actions.
- Reports pages exist, but appear report-UI-first and mostly mock-data-driven.
- Modalities page is interactive, but fully local state and mock data only.
- Retreat details still use mock enrollments.

### Mostly UI or placeholder
- Dashboard KPIs, quick actions, recent activity, and charts.
- Healers and Seekers list/detail pages.
- Listings list/detail pages.
- Session bookings and retreat bookings routes.
- Many report modules.
- SEO module.
- Several advanced CMS-aligned features from the feature spec, including revision history, content locking, scheduled publishing, approval workflows beyond basic retreat approve, media library tooling, and granular permissions.

---

## Evidence-Based Findings by Module

### Phase 0, Foundations
- [x] Project scaffold, routing, contexts, and base layout exist.
- [x] Core dependency setup is present.
- [ ] Auth/access hardening is not complete.
  - `App.tsx` explicitly says protected admin routes are temporarily disabled.
  - No active `AdminGuard` enforcement in route tree.
- [ ] API layer is inconsistent.
  - Some modules use `axios` API wrapper.
  - Some use direct `fetch`.
  - Some point to mock `/data/*.json` instead of backend endpoints.
- [ ] Data architecture is incomplete.
  - No consistent typed service layer across all modules.
  - No shared loading/error/query conventions.
- [ ] Backend contract alignment is incomplete.
  - Several pages assume endpoints that may not exist yet.

### Phase 1, Auth, Dashboard, User Management

#### Module 0, Authentication
- [~] Firebase auth context exists.
- [~] Login page exists.
- [ ] Admin route protection is not complete.
- [ ] Non-admin access denial flow is not confirmed.
- [ ] Remember-me/persistence behavior should be verified explicitly.
- [ ] Role model beyond single admin claim is not implemented.

#### Module 1, Dashboard
- [ ] Dashboard is mostly placeholder.
  - KPI cards are hardcoded.
  - Revenue chart says `Chart Configuration Pending`.
  - Recent activity is hardcoded.
  - Quick actions are not implemented as a real panel.
  - No live refresh logic for actual platform metrics.

#### Module 2, User Management
- [ ] Healers list is not backend-bound.
  - Uses hardcoded sample rows.
  - Missing real search/filter/sort/export pipeline.
- [ ] Healer detail is placeholder UI.
  - Static person/profile/financial/activity data.
  - Action buttons are not bound to real backend workflows.
  - Missing listings, retreats, bookings, payouts, disputes, timeline, admin notes, email, premium management, soft delete.
- [ ] Seekers list is not backend-bound.
- [ ] Seeker detail is placeholder UI.
- [ ] Combined All Users view is missing entirely.

### Phase 2, Core Platform Entities

#### Module 3, Listings
- [ ] Listings page is mock-only.
  - Static array in page file.
  - No backend read, filters, status toggle, delete, edit, preview, export implementation.
- [ ] Listing detail is placeholder UI.
  - Static title, stats, revision history, controls.
  - No real save/status mutation.
- [ ] CMS-aligned listing features are not implemented.
  - Reusable blocks.
  - Draft/preview workflow.
  - Scheduled publishing.
  - Revision history from real persisted versions.
  - Content locking.

#### Module 4, Retreats
- [~] Retreats list is partially functional.
  - Filtering/export run locally on mock `retreat.json` data.
  - Approve/status/delete attempt real API calls.
- [~] Retreat detail is partially functional.
  - Fetches retreat by id from mock dataset.
  - Approve/status actions call backend endpoints.
  - Enrollments are mock data.
- [ ] Full retreat editing is not implemented.
- [ ] Approval workflow is only partial/basic.
- [ ] Content calendar and richer CMS workflow are not implemented.

#### Modules 5 and 6, Bookings
- [ ] Session bookings module is missing.
  - Route renders placeholder text only.
- [ ] Session booking detail page is missing.
- [ ] Retreat bookings module is missing.
  - Route renders placeholder text only.
- [ ] Retreat booking detail page is missing.

### Phase 3, Disputes
- [~] Disputes queue is substantially built.
  - Table, filters, export, status/escalation/email actions exist.
- [~] Dispute detail exists.
  - Need endpoint verification and full action-path validation.
- [ ] Must verify all decision actions persist correctly and trigger downstream workflows.
- [ ] Stripe refund/deep-link flow needs confirmation.
- [ ] Internal notes and audit coverage need validation.

### Phase 4, Finance
- [~] Finance overview exists and fetches revenue stats from backend.
- [~] Commission, premium subscriptions, and payouts tabs exist as pages/components, but binding depth still needs completion verification.
- [ ] Payout settings per healer route/page is missing.
- [ ] Export/accounting workflows need full backend validation.
- [ ] Commission configuration should be unified with settings and guarded by role.

### Phase 5, Campaigns
- [~] Campaign list/editor/detail/templates/unsubscribe routes exist.
- [~] Campaign hook/UI flow is relatively advanced.
- [ ] Campaign API is currently mock-based.
  - `src/api/campaigns.ts` reads from `/data/campaigns.json`.
  - create/update/delete/send/test are Promise mocks.
- [ ] Audience builder is not fully backed by real recipient query logic.
- [ ] Analytics and delivery metrics need real tracking integration.
- [ ] Template persistence and unsubscribe management need backend confirmation.
- [ ] WYSIWYG/editor capability needs verification against spec requirements.

### Phase 6, Reports and Analytics
- [ ] Reports area exists but appears largely mock-driven.
  - Example: `PlatformOverview.tsx` uses `MOCK_DATA`.
- [ ] Financial, user, booking, retreat, dispute, campaign, notification reports all need real backend analytics sources.
- [ ] PDF/Excel export needs data fidelity validation.

### Phase 7, Modalities, Notifications, Settings, SEO

#### Module 11, Modalities
- [~] Modalities page is interactive locally.
- [ ] CRUD is not persisted.
- [ ] Reorder is not persisted.
- [ ] Delete guard against in-use modalities is not real.
- [ ] Media library and image tools are not implemented.

#### Module 12, Notifications
- [ ] Notifications page exists as shell/dashboard.
- [ ] Need to verify whether scheduler control, trigger now, event dispatch, history, and preview are truly bound.
- [ ] Likely still partial/display-oriented until backend endpoints are confirmed.

#### Module 13, Settings
- [~] Main settings page is the strongest real module so far.
  - Loads from Firestore.
  - Saves to Firestore.
  - Writes audit log entry on save.
- [ ] Need to verify each sub-tab against spec:
  - General settings persistence shape.
  - Commission settings role restrictions and live calculator.
  - Feature flag add/edit behavior.
  - Email config read-only env display and test email.
  - n8n config status and ping.
  - Audit log filters/export.
  - Media library tab completeness.
  - Security/performance hooks.

#### Module 14, SEO
- [ ] SEO page exists, but full feature binding is not yet validated and likely incomplete.
- [ ] Meta manager, schema, canonical URLs, social previews, health checks require real storage and integration.

### Phase 8, Finalization and Governance
- [ ] Audit log viewer completeness is not yet verified.
- [ ] Role-based permissions are not implemented beyond basic admin concept.
- [ ] No end-to-end verification pass across destructive actions.
- [ ] No clear production-readiness hardening pass yet.

---

## Corrected Phase Status

### Phase 0, Foundations
- [x] App scaffold and base architecture
- [ ] Reinstate and verify route guards
- [ ] Standardize service layer and data fetching strategy
- [ ] Align frontend contracts with backend-server endpoints
- [ ] Add shared error/loading/query patterns

### Phase 1, Auth, Dashboard, Users
- [ ] Finish real auth enforcement
- [ ] Replace dashboard placeholders with real KPIs/charts/activity
- [ ] Implement real healer management
- [ ] Implement real seeker management
- [ ] Add all-users page and bulk actions

### Phase 2, Listings, Retreats, Bookings
- [ ] Replace listings mocks with backend CRUD and moderation flows
- [ ] Complete retreat detail data binding and editing flows
- [ ] Build session bookings module end to end
- [ ] Build retreat bookings module end to end
- [ ] Add missing CMS workflows where required

### Phase 3, Disputes
- [~] UI largely present
- [ ] Validate persistence, notifications, audit logging, refund paths, and edge cases

### Phase 4, Finance
- [~] Core overview started
- [ ] Complete report tables, exports, payout flows, payout settings, and commission controls

### Phase 5, Campaigns
- [~] UI foundation present
- [ ] Replace mock campaign APIs with real backend integration
- [ ] Implement real audience segmentation, sending, template persistence, analytics, unsubscribe flows

### Phase 6, Reports
- [ ] Replace mock report datasets with real aggregated analytics endpoints
- [ ] Verify export quality for CSV, Excel, PDF

### Phase 7, Modalities, Notifications, Settings, SEO
- [ ] Persist modalities and ordering
- [ ] Complete notifications control flows and logs
- [~] Expand settings submodules to full spec compliance
- [ ] Complete SEO data model and bindings

### Phase 8, Roles, Audit, Hardening
- [ ] Implement granular admin roles and permissions
- [ ] Complete audit log browsing/export and coverage
- [ ] Run end-to-end QA and production hardening

---

## Completion Backlog by Priority

## P0, Must complete first
- [ ] Re-enable `AdminGuard` and verify admin-claim enforcement on all protected routes.
- [ ] Inventory and document backend-server endpoints needed by admin-console.
- [ ] Replace all user-management mock data with real backend/Firestore sources.
- [ ] Replace listings mock data with real CRUD/moderation endpoints.
- [ ] Build session bookings pages and detail workflows.
- [ ] Build retreat bookings pages and detail workflows.
- [ ] Replace dashboard hardcoded metrics/activity with live data.
- [ ] Convert campaign API layer from mock `/data` usage to real backend endpoints.

## P1, Needed for functional parity with feature list
- [ ] Complete retreat detail bindings including real enrollments and editing.
- [ ] Validate dispute decision pipeline end to end.
- [ ] Complete finance tabs with real tables, exports, payout actions, and payout settings.
- [ ] Replace report mock datasets with real analytics endpoints.
- [ ] Persist modalities CRUD and drag-and-drop ordering.
- [ ] Complete notifications scheduler/event-dispatch/test-email integrations.
- [ ] Complete settings sub-features that are still display-only or partial.

## P2, CMS-aligned and operational completeness
- [ ] All Users combined view and bulk actions.
- [ ] Audit log viewer filters/export and full action coverage.
- [ ] Granular admin roles: `super_admin`, `moderator`, `finance`, `support`.
- [ ] SEO persistence and page-level controls.
- [ ] Template library polish and advanced campaign analytics.
- [ ] Media library, image tooling, content calendar, revision history, preview workflows, content locking.

---

## Recommended Execution Order

### Workstream 1, Secure the shell and data contracts
- [ ] Turn route protection back on.
- [ ] Audit all routes against required permissions.
- [ ] Produce frontend-to-backend endpoint matrix.
- [ ] Normalize API client usage and auth token injection.

### Workstream 2, Replace the biggest fake modules first
- [ ] Dashboard
- [ ] Healers
- [ ] Seekers
- [ ] Listings
- [ ] Bookings, sessions and retreats

### Workstream 3, Finish partially real modules
- [ ] Retreats
- [ ] Disputes
- [ ] Finance
- [ ] Campaigns
- [ ] Notifications
- [ ] Settings submodules

### Workstream 4, Reporting and governance
- [ ] Reports
- [ ] Audit log browser
- [ ] Roles and permissions
- [ ] SEO and CMS extras

---

## Definition of Done for This Admin Console

A module is only considered done when all of the following are true:
- [ ] Reads real data from backend-server and/or Firebase, not local mock constants or `/public/data` JSON.
- [ ] Writes persist correctly and survive refresh.
- [ ] Loading, empty, and error states are handled.
- [ ] Filters/search/sort/pagination/export work against real data.
- [ ] Destructive actions have confirmations and audit logging.
- [ ] Permissions are enforced in both frontend and backend.
- [ ] Route is navigable from sidebar and complete enough for admin use.
- [ ] QA verifies the full happy path and at least key failure paths.

---

## Immediate Next Implementation Targets

1. Re-enable and verify admin route protection.
2. Replace Healers and Seekers modules with real data and actions.
3. Replace Listings module with real listing moderation CRUD.
4. Build missing bookings modules.
5. Replace campaign mock API layer with real endpoints.
6. Replace dashboard and reports mock data with real aggregated data sources.

---

## Notes
- Presence of a page or route does not mean the feature is complete.
- Interactive local state is not considered completed backend functionality.
- Mock-data-backed flows should be treated as scaffolding until replaced with real contracts.
- Settings is currently the best example of a genuinely bound module and should be used as a pattern for the rest.
