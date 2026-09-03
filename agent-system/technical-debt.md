# UltraHealers Admin Console — Technical Debt & Refactoring Backlog

This document tracks known architectural debt, incomplete bindings, hardcoded mock data, and refactoring opportunities discovered during codebase analysis.

> [!NOTE]
> Items listed here are for tracking and prioritization. The agent must NOT automatically refactor these without explicit user direction or task scope.

---

## 🚨 Critical Technical Debt & Security Gaps

### TD-001: Route Protection Guard Disabled in `App.tsx`
- **Location**: `src/App.tsx`
- **Impact**: Protected admin routes are currently accessible without authentication because `AdminGuard` is temporarily commented out / bypassed.
- **Remediation Plan**: Re-enable `AdminGuard` wrapper around protected route subtree and verify Firebase Auth token claims.

### TD-002: Inconsistent API Layer & Mock Data Dependancy
- **Location**: `src/api/`, `src/pages/`
- **Impact**: Some pages use Axios wrappers, others use direct `fetch()`, and several modules point to `/public/data/*.json` mock files instead of real backend REST endpoints.
- **Remediation Plan**: Standardize a uniform API service layer (`src/api/client.ts`) with typed request methods, automatic Auth Bearer header injection, and global error handling.

---

## 🚧 Module Completion & Binding Deficits

### TD-003: Dashboard KPIs & Charts Are Static
- **Location**: `src/pages/Dashboard.tsx`
- **Impact**: Dashboard stats cards display hardcoded static values. The revenue chart displays a placeholder *"Chart Configuration Pending"* message.
- **Remediation Plan**: Bind Dashboard KPI cards and Recharts components to real Firestore aggregation queries or API metrics endpoints.

### TD-004: User Detail Pages Have Unbound Action Buttons
- **Location**: `src/pages/users/HealerDetail.tsx`, `src/pages/users/SeekerDetail.tsx`
- **Impact**: UI action buttons (e.g. "Verify Healer", "Suspend User", "Issue Payout") emit local console logs or toasts without executing backend mutations.
- **Remediation Plan**: Wire action buttons to Firebase Cloud Functions / backend API endpoints.

### TD-005: Local-Only State for Modalities & SEO Modules
- **Location**: `src/pages/modalities/Modalities.tsx`, `src/pages/seo/`
- **Impact**: Modality taxonomy additions and SEO metadata updates mutate local component state and are lost on page refresh.
- **Remediation Plan**: Connect Modalities and SEO management forms to Firestore collections.

### TD-006: Missing Fine-Grained Role-Based Access Control (RBAC)
- **Location**: `src/contexts/AdminAuthContext.tsx`
- **Impact**: The context currently handles a binary `isAdmin` boolean claim rather than granular roles (`Super Admin`, `Support Agent`, `Content Manager`, `Financial Auditor`).
- **Remediation Plan**: Extend `AdminAuthContext` to decode claim roles and enforce permission-based UI element visibility.

---

## 🧹 Refactoring & Code Quality Opportunities

- **TD-007**: Extract duplicated table filtering and pagination logic across page components into a reusable `useDataTable` custom hook.
- **TD-008**: Consolidate scattered TypeScript interfaces (`src/types/`) into centralized domain model declarations.
