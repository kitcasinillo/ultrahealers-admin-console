# Agent Long-Term Memory & Discoveries

This file persists key architectural discoveries, long-term project context, and reusable insights gathered over time.

---

## 📌 Active Memories

### MEM-001: Admin Console System Architecture & Setup
- **Date Recorded**: 2026-07-23
- **Source**: Initial Repository Assessment
- **Importance Level**: High
- **Tags**: `[architecture, project-structure, stack]`
- **Summary**: Modern Admin Console web application built with React/TypeScript/Vite.
- **Full Context**:
  - Uses Vite as dev server and build tool.
  - UI styled with Tailwind CSS & PostCSS.
  - Includes user reports, registered user data reporting, and agent persona specifications.
  - Configuration stored in `.env` and `.env.example`.

### MEM-002: Registered Users Auth Report Feature Implementation
- **Date Recorded**: 2026-07-23
- **Source**: `registered-user-report.md` Feature Implementation
- **Importance Level**: High
- **Tags**: `[reports, firebase-auth, user-management, csv-export]`
- **Summary**: Registered user account directory fetched via `/api/users/auth-list` and rendered in `UsersAuthReport.tsx`.
- **Full Context**:
  - Integrated `UsersAuthReport.tsx` component into `UserReport.tsx` under sub-tab "Registered User Accounts (Firebase Auth)".
  - Displays Email, UID, Created Date, Last Sign-In Date, and Email Verification Status.
  - Features real-time search, verification status filter, 5-minute client-side caching, and one-click CSV export via `PapaParse`.

---

## 📥 Template for New Entries

```markdown
### MEM-XXX: [Title of Insight/Discovery]
- **Date Recorded**: YYYY-MM-DD
- **Source**: [e.g., Code Review / User Input / Debugging Session]
- **Importance Level**: [High | Medium | Low]
- **Tags**: `[tag1, tag2]`
- **Summary**: Concise summary of what was discovered or remembered.
- **Full Context**: Detailed context, code snippets, or reference links.
```
