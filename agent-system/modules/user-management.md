# Module Documentation: User Management

---

## 📌 Purpose
The User Management module provides administration for the two core user populations on the UltraHealers platform: **Healers** (holistic practitioners, hosts) and **Seekers** (clients, patients).

---

## 🗂️ Core Files & Location
- **List Pages**:
  - `src/pages/users/Healers.tsx`
  - `src/pages/users/Seekers.tsx`
- **Detail Pages**:
  - `src/pages/users/HealerDetail.tsx`
  - `src/pages/users/SeekerDetail.tsx`
- **Components**: `src/components/DataTable.tsx`, `src/components/StatusBadge.tsx`

---

## ⚡ Features & UI Workflows
1. **Healer Verification Management**: Inspect uploaded credentials, licenses, identity proof, and approve/reject verification status.
2. **Seeker Activity Tracking**: View booking history, spent amount, open disputes, and account status.
3. **Status Control & Soft Deletion**: Toggle active/suspended states and trigger account soft deletion.
4. **Data Filtering & Export**: Search by name/email, filter by status or verification state, and export user lists to CSV/Excel.

---

## ⚖️ Business Rules & Safeguards
- Medical notes and private consultation logs for Seekers are restricted from general admin viewing.
- Suspending a Healer automatically unpublishes active retreat listings and halts automated payout releases.

---

## 🔌 API Endpoints & Data Model
- `GET /api/users/healers` – List healers with pagination and filters (`q`, `status`, `subscription`, `startDate`, `endDate`).
- `GET /api/users/healers/:id` – Fetch detailed healer profile, listings, and payout history.
- `PATCH /api/users/healers/:id/suspension` – Suspend or reactivate healer (`{ suspended: boolean, reason?: string | null }`).
- `PATCH /api/users/healers/:id/soft-delete` – Soft-delete or restore healer (`{ deleted: boolean, reason?: string | null }`).
- `GET /api/users/seekers` – List seekers.
- `GET /api/users/seekers/:id` – Fetch detailed seeker profile and booking history.
- `PATCH /api/users/seekers/:id/suspension` – Suspend or reactivate seeker (`{ suspended: boolean, reason?: string | null }`).
- `PATCH /api/users/seekers/:id/soft-delete` – Soft-delete or restore seeker (`{ deleted: boolean, reason?: string | null }`).

---

## 🔮 Known Limitations & Extension Points
- Detail pages currently use static mock placeholders for booking history and financial tabs.
- Extension Point: Implement combined "All Users" view with role switcher and unified search.
