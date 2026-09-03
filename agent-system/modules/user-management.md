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
- `GET /api/v1/admin/healers` – List healers with pagination and filters.
- `GET /api/v1/admin/healers/:id` – Fetch detailed healer profile, listings, and payout history.
- `POST /api/v1/admin/healers/:id/verify` – Update verification status.
- `GET /api/v1/admin/seekers` – List seekers.
- `POST /api/v1/admin/users/:id/status` – Update user account status (`active`, `suspended`).

---

## 🔮 Known Limitations & Extension Points
- Detail pages currently use static mock placeholders for booking history and financial tabs.
- Extension Point: Implement combined "All Users" view with role switcher and unified search.
