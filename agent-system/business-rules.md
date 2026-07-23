# UltraHealers Admin Console — Business Rules & Governance

This document preserves the platform's core business logic, administrative policies, and operational constraints.

---

## 👥 1. User Management & Verification Rules

### Healers (Practitioners)
- **Verification Process**: Healers must submit license credentials, identity verification, and background details before listing retreats.
- **Status States**: `Pending Verification` → `Verified Active` | `Suspended` | `Rejected`.
- **Commission Rates**: Platform fees default to 15% per booking unless custom healer agreement exists.
- **Soft Deletion**: Deleting a healer profile soft-deletes their account, cancels pending payouts, and unpublishes active retreats.

### Seekers (Clients)
- **Status States**: `Active` | `Flagged` | `Suspended`.
- **Privacy Policy**: Seekers' full medical notes and private consultation logs are strictly confidential and inaccessible to non-super-admin roles.

---

## 🏞️ 2. Retreats & Listings Rules

- **Approval Workflow**:
  - All new retreats or major edits enter a `Pending Review` queue.
  - Content Managers inspect retreat schedule, location, pricing, and healer credentials.
  - Rejection requires an explicit administrative reason logged in the decision audit trail.
- **Status Flags**: `Draft` | `Pending Review` | `Published` | `Rejected` | `Archived`.
- **Capacity Enforcement**: Bookings cannot exceed the maximum participant cap defined in the retreat listing.

---

## ⚖️ 3. Disputes & Refund Policy

- **Dispute Opening**: A Seeker may open a dispute within 48 hours of retreat completion or booking cancellation.
- **Evidence Review**: Admins review chat logs, booking timestamps, and healer responses.
- **Resolution Outcomes**:
  - **Full Refund**: 100% funds returned to Seeker; healer payout canceled.
  - **Partial Refund**: Split percentage defined by admin; partial payout released to healer.
  - **Dismissal**: Dispute closed; 100% funds released to healer (minus platform fee).
- **Audit Logging**: Every dispute resolution action triggers an entry in `admin_audit_logs`.

---

## 📢 4. Campaign & Marketing Rules

- **Budget Cap**: Marketing campaigns cannot execute if the allocated budget exceeds platform monthly marketing limit without Super Admin approval.
- **Target Audience Segments**: `All Users`, `Active Seekers`, `Verified Healers`, `Inactive Users (>90 days)`.
- **Promo Code Validation**: Promo codes must have explicit start/end dates, usage limits, and minimum booking spend.

---

## 💰 5. Finance & Payout Rules

- **Payout Schedule**: Healer payouts are processed weekly on a 7-day rolling delay post-retreat completion.
- **Platform Fee Calculation**:
  $$\text{Net Healer Payout} = \text{Gross Booking Amount} \times (1 - \text{Platform Fee Rate})$$
- **Hold Policy**: Payouts are automatically held if an active dispute is open against the booking.

---

## ⚙️ 6. System Settings & Auditability

- **Configuration Storage**: Application settings read/write directly to Cloud Firestore path `settings/app_config`.
- **Immutable Audit Logging**: Any change to application settings, user status, retreat status, or dispute resolutions MUST emit an immutable log record to `admin_audit_logs` containing:
  - `adminId` & `adminEmail`
  - `timestamp`
  - `actionType`
  - `targetEntityId`
  - `previousValue` & `newValue`
