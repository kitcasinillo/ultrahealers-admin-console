# Module Documentation: System Settings & Audit Logs

---

## 📌 Purpose
This module handles global system configuration management and provides a tamper-proof administrative audit log.

---

## 🗂️ Core Files & Location
- `src/pages/settings/Settings.tsx`
- Firestore collections: `settings/app_config`, `admin_audit_logs`

---

## ⚡ Features & UI Workflows
1. **Global Configuration Management**: Update platform commission rates, default currency, admin notification emails (for healer and seeker signups), support emails, maintenance mode, and feature flags.
2. **Firestore Synchronization**: Reads and writes directly to Firestore path `settings/app_config`.
3. **Analytics Track Count Reset**: Target tracker selector (`clicks`, `pageviews`, `sessions`, `exits`, `conversions`) or `all` trackers reset via backend `POST /api/v1/analytics/reset` and UI panel in `SystemSettings.tsx`.
4. **Audit Log Inspection**: Browse historical administrative actions, filter by admin user ID, timestamp, or action type.

---

## ⚖️ Business Rules & Safeguards
- Updating application settings or resetting analytics track counts MUST emit an audit record (`RESET_ANALYTICS_TRACKER` / `UPDATE_SETTINGS`) to `admin_audit_logs`.
- Enabling `Maintenance Mode` immediately restricts non-admin public access to the primary mobile app and web frontend.

---

## 🔮 Known Limitations & Extension Points
- Basic audit log viewer exists; extension point includes IP address tracking and advanced audit search filters.
