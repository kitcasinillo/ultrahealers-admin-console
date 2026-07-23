# Module Documentation: Reports & Analytics

---

## 📌 Purpose
The Reports & Analytics module provides executive dashboards and export engines for user registration trends, revenue growth, booking completion rates, and platform usage metrics.

---

## 🗂️ Core Files & Location
- `src/pages/reports/`
- `src/api/reports.ts`
- `registered-user-report.md` & `user-reports.md` (Domain reference documentation)

---

## ⚡ Features & UI Workflows
1. **Report Generation Hub**: Filter metrics by date range (`Today`, `7 Days`, `30 Days`, `YTD`, `Custom`).
2. **Multi-Format Exporters**: Client-side generation of downloadable reports in CSV (PapaParse), PDF (jsPDF), and Excel (XLSX).
3. **Interactive Charts**: Recharts visualizations for monthly active users (MAU), booking volume trends, and revenue distribution.

---

## 🔌 API Endpoints & Data Model
- Interacts with backend reporting endpoints via `src/api/reports.ts`.

---

## 🔮 Known Limitations & Extension Points
- Reports UI is built, but some chart datasets rely on client-side generated sample datasets.
- Extension Point: Automated scheduled email reports for executive team members.
