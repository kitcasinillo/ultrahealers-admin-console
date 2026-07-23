# Module Documentation: Campaigns & Marketing

---

## 📌 Purpose
The Campaigns & Marketing module allows content managers and administrators to design, schedule, execute, and analyze promotional marketing campaigns, promo codes, and audience broadcasts.

---

## 🗂️ Core Files & Location
- `src/pages/campaigns/Campaigns.tsx`
- `src/pages/campaigns/CampaignDetail.tsx`
- `src/api/campaigns.ts`
- `src/components/campaigns/`

---

## ⚡ Features & UI Workflows
1. **Campaign Creation Wizard**: Define campaign name, target audience segment, channel (`email`, `push`, `sms`), schedule, budget cap, and promo code.
2. **Rich Text Campaign Editor**: Built-in Tiptap editor for HTML email template creation with image embedding and live preview.
3. **Audience Segment Selector**: Target all users, verified healers, active seekers, or dormant accounts.
4. **Performance Analytics**: Track impressions, click-through rates (CTR), conversions, and budget spend.

---

## ⚖️ Business Rules & Safeguards
- Broadcast campaigns reaching >10,000 users require Super Admin verification.
- Campaigns automatically stop when budget cap is reached.

---

## 🔌 API Endpoints & Data Model
- Interacts with Cloud Firestore collection `campaigns`.
- Managed via `src/api/campaigns.ts` helper methods.

---

## 🔮 Known Limitations & Extension Points
- Uses local hook mixed with mock endpoints in `/public/data`.
- Extension Point: Integration with SendGrid / Firebase Cloud Messaging (FCM) for live delivery.
