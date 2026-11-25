# Module Documentation: Finance & Payments

---

## 📌 Purpose
The Finance & Payments module monitors platform gross merchandise value (GMV), net platform fee revenue, healer payouts, transaction histories, and financial reporting.

---

## 🗂️ Core Files & Location
- `src/pages/payments/FinanceOverview.tsx`
- `src/pages/payments/Payouts.tsx`
- `src/pages/payments/Transactions.tsx`

---

## ⚡ Features & UI Workflows
1. **Revenue Dashboard**: Visual breakdown of total GMV, platform fee revenue (15% default), real Healer Subscription invoice revenue (`subscription_invoices`), pending payouts, and refunded volumes using Recharts.
2. **Healer Subscriptions Table (`PremiumSubscriptionsTable.tsx`)**: Displays real Stripe subscription statuses (`Trialing`, `Active`, `Past Due`, `Canceled`, `Exempt`), trial end dates, upfront fee status (`Paid` / `Pending`), total paid, and Stripe Subscription IDs.
3. **Payout Processing**: Inspect pending healer payouts, hold suspicious payouts, and release manual disbursements.
4. **Transaction Search & Filter**: Filter transactions by date range, payment method, status (`success`, `failed`, `refunded`), and user ID.
5. **Financial Exports**: Export transaction logs and payout summaries to CSV, Excel, and PDF.

---

## ⚖️ Business Rules & Safeguards
- Payouts are delayed by 7 days post-event completion to allow dispute windows.
- Any manual payout adjustment or override must be authorized by a Super Admin role.

---

## 🔌 API Endpoints & Data Model
- `GET /api/v1/admin/finance/stats` – Aggregate financial metrics.
- `GET /api/v1/admin/finance/payouts` – Pending and completed payouts.
- `POST /api/v1/admin/finance/payouts/:id/release` – Trigger payout release.

---

## 🔮 Known Limitations & Extension Points
- Finance overview currently fetches stats but payout release actions are partially wired.
- Extension Point: Automated Stripe/Connect payout status webhooks.
