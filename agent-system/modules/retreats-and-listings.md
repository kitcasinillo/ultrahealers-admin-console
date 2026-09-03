# Module Documentation: Retreats & Listings

---

## 📌 Purpose
The Retreats & Listings module allows administrators to inspect, moderate, approve, or reject wellness retreats, workshops, and therapy session listings submitted by Healers.

---

## 🗂️ Core Files & Location
- **List Pages**:
  - `src/pages/retreats/Retreats.tsx`
  - `src/pages/listings/Listings.tsx`
- **Detail Pages**:
  - `src/pages/retreats/RetreatDetail.tsx`
  - `src/pages/listings/ListingDetail.tsx`

---

## ⚡ Features & UI Workflows
1. **Multi-Step Approval Queue**: Review submitted retreat details (title, description, itinerary, location, pricing, capacity, images).
2. **Approval / Rejection Dialog**: Approve listing for public search or reject with structured feedback notes sent to the Healer.
3. **Status Toggle**: Temporarily unpublish or archive listings.
4. **Enrollment Inspection**: View current seeker bookings and capacity utilization per retreat.

---

## ⚖️ Business Rules & Safeguards
- Published retreats cannot have their base price modified if active paid bookings exist.
- Rejection of a retreat requires an administrative rationale entry in `admin_audit_logs`.

---

## 🔌 API Endpoints & Data Model
- `GET /api/v1/admin/retreats` – Fetch list of retreats.
- `GET /api/v1/admin/retreats/:id` – Fetch retreat details & enrolled seekers.
- `POST /api/v1/admin/retreats/:id/approve` – Approve retreat listing.
- `POST /api/v1/admin/retreats/:id/reject` – Reject retreat with feedback reason.

---

## 🔮 Known Limitations & Extension Points
- `Listings.tsx` page currently relies on mock arrays in the page file.
- Extension Point: Add scheduled publishing, media library tooling, and content revision history.
