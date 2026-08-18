# Module Documentation: Reports & Analytics

---

## 📌 Purpose
The Reports & Analytics module provides executive dashboards and export engines for user registration trends, revenue growth, booking completion rates, and platform usage metrics.

---

## 🗂️ Core Files & Location
- `src/pages/reports/`
- `src/api/reports.ts` & `src/api/analytics.ts`
- `src/lib/exports/domains/analyticsExports.ts` (Web analytics export pipeline for PDF, Excel, and CSV)
- `public/uh-analytics.js` (Self-hosted analytics ingestion script)
- `platform-audit-analytics.md`, `admin-analytics.md` & `user-analytics.md` (Domain reference documentation)


---

## ⚡ Features & UI Workflows
1. **Report Generation Hub**: Filter metrics by date range (`Today`, `7 Days`, `30 Days`, `YTD`, `Custom`).
2. **Multi-Format Exporters**: Client-side generation of downloadable reports in CSV (PapaParse), PDF (jsPDF), and Excel (XLSX).
3. **Interactive Charts**: Recharts visualizations for monthly active users (MAU), booking volume trends, and revenue distribution.
4. **Self-Hosted Analytics & RUM Dashboard**: Real-time cross-subdomain tracking (`ultrahealers.com`, `healers.ultrahealers.com`, `seekers.ultrahealers.com`), Core Web Vitals (LCP, CLS, FID/INP), Uncaught JS Exception Monitoring, Rage Click Hotspot detection, and Conversion Goal milestones.

---

## 🔌 API Endpoints & Data Model
- Interacts with backend reporting endpoints via `src/api/reports.ts` and `src/api/analytics.ts`.
- Ingestion endpoint: `POST /api/v1/analytics/collect`
- Stats aggregator: `GET /api/v1/analytics/stats`

---

## 🔮 Known Limitations & Extension Points
- Extension Point: Automated scheduled email reports for executive team members.
- Extension Point: Funnel visualizer component for multi-step checkout paths.
