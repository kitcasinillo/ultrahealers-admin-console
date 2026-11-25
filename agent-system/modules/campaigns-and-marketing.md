# Module Documentation: Campaigns & Marketing

---

## 📌 Purpose
The Campaigns & Marketing module allows content managers and administrators to design, schedule, send, and monitor email marketing campaigns, reusable templates, and unsubscribe lists for Healers and Seekers.

---

## 🗂️ Core Files & Location
- **Frontend**:
  - `src/pages/campaigns/pages/CampaignList.tsx`
  - `src/pages/campaigns/pages/CampaignEditor.tsx`
  - `src/pages/campaigns/pages/CampaignDetail.tsx`
  - `src/pages/campaigns/pages/Templates.tsx`
  - `src/pages/campaigns/pages/UnsubscribeList.tsx`
  - `src/pages/campaigns/pages/UnsubscribePage.tsx`
  - `src/api/campaigns.ts`
- **Backend (`backend-server`)**:
  - `controllers/campaignController.js`
  - `routes/campaignRoutes.js`

---

## ⚡ Features & UI Workflows
1. **Campaign Builder & Editor**: 4-step wizard for Audience selection (segments, modalities, regions, CSV upload, exclude unsubscribed), Compose (TipTap rich-text HTML editor + merge tags + saved templates), Schedule (immediate or cron-scheduled), and Review/Test Email.
2. **Real Audience Preview**: Queries Firestore `profiles`, `bookings`, `disputes`, and `campaign_unsubscribes` to calculate live recipient reach.
3. **Email Delivery & Scheduling**: Sends personalized HTML emails via `nodemailer` (`config/email.js`) in batches with a signed one-click unsubscribe link and open-tracking pixel. Scheduled campaigns are dispatched every minute via `node-cron`.
4. **Template Library**: Full Firestore-backed CRUD (`campaign_templates`) for reusable email templates.
5. **Unsubscribe Management**: Public signed `/unsubscribe?token=...` endpoint persists opt-outs in `campaign_unsubscribes`; admins can inspect, export CSV, or re-subscribe users.

---

## ⚖️ Business Rules & Safeguards
- Email sender alignment strictly follows `LESSON-002` (`from` aligned with `EMAIL_USER`, explicit `replyTo`).
- Unsubscribed emails are automatically excluded when `excludeUnsubscribed` is enabled.
- Deleted user profiles are automatically skipped during audience resolution.

---

## 🔌 API Endpoints & Data Model
- **Firestore Collections**: `campaigns`, `campaign_templates`, `campaign_unsubscribes`
- `GET /api/admin/campaigns` – List & filter campaigns
- `POST /api/admin/campaigns` – Create campaign
- `GET /api/admin/campaigns/:id` – Get campaign details & activity log
- `PUT /api/admin/campaigns/:id` – Update campaign (draft/scheduled/pause/resume)
- `DELETE /api/admin/campaigns/:id` – Delete campaign
- `POST /api/admin/campaigns/audience-preview` – Compute real recipient count
- `POST /api/admin/campaigns/:id/send` – Dispatch campaign via SMTP
- `POST /api/admin/campaigns/:id/test` – Send test email
- `GET/POST/PUT/DELETE /api/admin/campaigns/templates` – Templates CRUD
- `GET /api/admin/campaigns/unsubscribes` & `DELETE /api/admin/campaigns/unsubscribes/:id` – Unsubscribes management
- `POST /api/campaigns/unsubscribe` – Public signed unsubscribe handler
- `GET /api/campaigns/track/open/:id` – 1×1 tracking pixel for email opens
