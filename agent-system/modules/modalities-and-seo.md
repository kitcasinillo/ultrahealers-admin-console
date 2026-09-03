# Module Documentation: Modalities & SEO Taxonomy

---

## 📌 Purpose
This module manages the system-wide healing modalities taxonomy (e.g. Reiki, Acupuncture, Breathwork, Ayurveda) and platform SEO metadata configurations.

---

## 🗂️ Core Files & Location
- `src/pages/modalities/Modalities.tsx`
- `src/pages/seo/SEOManagement.tsx`

---

## ⚡ Features & UI Workflows
1. **Modality Hierarchy**: Create, edit, reorder, and categorize healing modalities used in search filters and healer profiles.
2. **Icon & Category Assignment**: Assign visual icons, descriptions, and active status toggles.
3. **SEO Meta Tag Configuration**: Update page titles, meta descriptions, OpenGraph images, and canonical URL rules for public platform pages.

---

## ⚖️ Business Rules & Safeguards
- Modalities assigned to active retreats or healer profiles cannot be hard deleted; they must be marked `inactive`.

---

## 🔮 Known Limitations & Extension Points
- Currently operates in local component state.
- Extension Point: Direct synchronization with Firestore modality taxonomy collection and sitemap generator.
