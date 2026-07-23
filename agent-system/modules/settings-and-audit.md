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
1. **Global Configuration Management**: Update platform commission rates, default currency, support emails, maintenance mode, and feature flags.
2. **Firestore Synchronization**: Reads and writes directly to Firestore path `settings/app_config`.
3. **Audit Log Inspection**: Browse historical administrative actions, filter by admin user ID, timestamp, or action type.

---

## ⚖️ Business Rules & Safeguards
- Updating application settings MUST emit an audit record to `admin_audit_logs`.
- Enabling `Maintenance Mode` immediately restricts non-admin public access to the primary mobile app and web frontend.

---

## 🔮 Known Limitations & Extension Points
- Basic audit log viewer exists; extension point includes IP address tracking and advanced audit search filters.
