# Webflow Analytics Integration Guide (`ultrahealers.com`)

---

## 📌 Problem Context
- **`ultrahealers.com` (Main Landing Page)**: Built and hosted on **Webflow**. It currently streams event activity to **Google Analytics 4 (GA4)** rather than serving custom source code.
- **`seekers.ultrahealers.com` & `healers.ultrahealers.com`**: React single-page applications using our custom self-hosted analytics engine (`uh-analytics.js` + Firestore backend).
- **Goal**: Establish a clear strategy to monitor `ultrahealers.com` analytics alongside our custom Seeker and Healer tracking without disrupting current operations.

---

## 🛠️ Integration Strategies

### Option 1: Embed `uh-analytics.js` in Webflow Custom Code *(Recommended)*

**Concept**: Add our lightweight, native tracking script directly to Webflow's site settings. `ultrahealers.com` will stream pageviews, clicks, traffic sources, and duration to our self-hosted backend collector seamlessly without needing Google Analytics API keys.

#### Setup Steps:
1. Log into **Webflow Dashboard** ➔ Select your project for `ultrahealers.com`.
2. Navigate to **Site Settings ➔ Custom Code**.
3. In the **Head Code** box, paste:
   ```html
   <!-- UltraHealers Custom Web Analytics -->
   <script src="https://api.ultrahealers.com/uh-analytics.js" async></script>
   ```
4. Click **Save Changes** and **Publish to Selected Domains**.

#### Advantages:
- ⚡ **1-Minute Setup**: Zero backend or API configuration required.
- 📊 **Unified Reporting**: In the Admin Console (`AnalyticsDashboard.tsx`), selecting `ultrahealers.com` in the subdomain dropdown will immediately show real-time metrics identical to the Seeker and Healer apps.
- 🔒 **Privacy First**: Fully self-hosted without reliance on third-party cookies or GA4 reporting delays.

---

### Option 2: Integrate Google Analytics 4 (GA4) Data API in `backend-server`

**Concept**: Keep `ultrahealers.com` sending metrics strictly to Google Analytics (gtag.js in Webflow). Update our Node.js `backend-server` to fetch traffic data for `ultrahealers.com` from Google's Reporting API and display it in the Admin Console.

#### Setup Steps:
1. **Google Cloud Console**:
   - Enable the **Google Analytics Data API (v1beta)**.
   - Create a **Service Account** and generate a JSON credentials key.
2. **Google Analytics**:
   - Add the Service Account email address to your GA4 Property (`ultrahealers.com`) with **Viewer** access.
3. **Backend Service (`backend-server`)**:
   - Install `@google-analytics/data` package.
   - Add backend handler in `analyticsController.js` to query GA4 metrics when `subdomain === 'ultrahealers.com'`.
4. **Admin Console**:
   - Displays GA4 data when filtering for `ultrahealers.com` and custom Firestore data when filtering for `seekers.ultrahealers.com` or `healers.ultrahealers.com`.

#### Advantages:
- Keeps Webflow setup untouched if third-party marketing tags are tied exclusively to GA4.

---

## 📊 Feature Comparison Matrix

| Criteria | Option 1: Webflow Custom Code | Option 2: GA4 Data API |
| :--- | :--- | :--- |
| **Setup Complexity** | Very Low (1 script tag in Webflow) | Medium (GCP Service Account + API integration) |
| **Maintenance** | Zero ongoing maintenance | Requires managing service keys & API quotas |
| **Data Real-time Status** | Real-time (instant ingestion) | Delayed by GA4 processing window (24–48 hrs for full accuracy) |
| **Data Ownership** | 100% Owned & Self-Hosted | Stored on Google Servers |
| **Admin Panel Compatibility** | Identical structure across all 3 subdomains | Requires parsing two distinct data structures |

---

## 💡 Recommendation
Start with **Option 1**. Pasting the script into Webflow provides unified, zero-delay real-time reporting across `ultrahealers.com`, `healers.ultrahealers.com`, and `seekers.ultrahealers.com` with zero maintenance overhead.
