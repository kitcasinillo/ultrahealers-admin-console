# Architecture & Implementation Patterns

This file documents proven architectural patterns, design solutions, and workflow templates used across the application.

---

## 📐 Catalog of Reusable Patterns

### PAT-001: Append-Only Audit Log Pattern
- **Category**: Knowledge Engineering
- **Context**: Storing historical events, decisions, or system logs without losing context window efficiency.
- **Solution**:
  - Store active records in chronological append-only Markdown files.
  - Prefix each record with standardized YAML metadata headers.
  - Archive full context entries to `archive/` when file exceeds token budget thresholds.

### PAT-002: Modular UI Component Layout
- **Category**: Frontend Architecture
- **Context**: Building admin dashboards with reusable controls and consistent spacing.
- **Solution**:
  - Separate container logic (data fetching, state) from presentational UI components.
  - Utilize design system tokens for color palettes, typography, and dynamic layouts.

### PAT-003: React Context Auth & Route Guard Pattern
- **Category**: Security & State Management
- **Context**: Protecting administrative routes and providing global user authentication state.
- **Solution**:
  - `AdminAuthContext.tsx` provides `user`, `isAuthenticated`, `login`, `logout`, and claim validation.
  - `AdminGuard.tsx` wraps protected route trees in `App.tsx` and redirects unauthenticated users to `/login`.

### PAT-004: Sortable Data Table & Filter Pattern
- **Category**: Frontend UI Components
- **Context**: Rendering large tabular datasets (healers, seekers, bookings, disputes) with client/server sorting.
- **Solution**:
  - Use `DataTable.tsx` and `SortableDataTable.tsx` powered by `@tanstack/react-table` & `@dnd-kit/sortable`.
  - Include search inputs, status badges (`StatusBadge.tsx`), pagination controls, and column visibility toggles.

### PAT-005: Multi-Format Data Export Pipeline
- **Category**: Data Processing & Reporting
- **Context**: Exporting grid data and analytics charts to CSV, Excel, and PDF formats.
- **Solution**:
  - CSV: Use `papaparse` utility for JSON-to-CSV blob generation and stream download.
  - Excel: Use `xlsx` utility to construct multi-sheet workbooks.
  - PDF: Use `jspdf` and `jspdf-autotable` combined with `html2canvas` for visual chart capture.

### PAT-006: Modal Confirmation & Action Dialog Pattern
- **Category**: UI Interaction & Safety
- **Context**: Requiring explicit admin confirmation for destructive or high-impact actions (deleting user, holding payout, rejecting retreat).
- **Solution**:
  - Reusable `Modal.tsx` and `ConfirmModal.tsx` built on `@radix-ui/react-dialog`.
  - Accepts action title, descriptive prompt, danger variant styling, and `onConfirm`/`onCancel` promise handlers.

---

## 📥 Template for New Patterns

```markdown
### PAT-XXX: [Pattern Name]
- **Category**: [Frontend | API | Architecture | Database | Knowledge]
- **Problem Statement**: What problem does this pattern solve?
- **Context**: When and where should this pattern be applied?
- **Solution**: Detailed description and code structure.
- **Trade-offs**: Pros, cons, and performance implications.
- **Examples**: Short code or diagram template.
```
