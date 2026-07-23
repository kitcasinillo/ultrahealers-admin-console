# Module Documentation: Bookings & Dispute Resolution

---

## 📌 Purpose
This module handles oversight of all customer bookings, session schedules, and dispute resolution workflows between Seekers and Healers.

---

## 🗂️ Core Files & Location
- **Bookings Pages**: `src/pages/bookings/`
- **Disputes Pages**:
  - `src/pages/disputes/Disputes.tsx`
  - `src/pages/disputes/DisputeDetail.tsx`

---

## ⚡ Features & UI Workflows
1. **Booking Directory**: View all active, completed, and canceled session and retreat bookings.
2. **Dispute Case Management**: Review dispute tickets raised by Seekers (reasons: service non-attendance, quality dissatisfaction, cancellation disagreement).
3. **Evidence Review**: Inspect chat transcripts, booking receipts, and healer responses.
4. **Resolution Action Engine**: Issue full refund, partial refund, or dismiss claim.

---

## ⚖️ Business Rules & Safeguards
- Opening a dispute automatically freezes payout disbursement to the Healer for that booking.
- Full refunds calculate and reverse platform commission automatically.

---

## 🔌 API Endpoints & Data Model
- `GET /api/v1/admin/disputes` – List open and resolved dispute cases.
- `GET /api/v1/admin/disputes/:id` – Detailed case file & messages.
- `POST /api/v1/admin/disputes/:id/resolve` – Submit resolution decision (`full_refund`, `partial_refund`, `dismiss`).

---

## 🔮 Known Limitations & Extension Points
- Dispute detail page UI is interactive but needs real backend binding for chat transcript streaming.
- Extension Point: Automated dispute escalation if unaddressed after 72 hours.
