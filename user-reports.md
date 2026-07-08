I have an admin console dashboard for a booking-style platform with two user 
roles: "healer" and "seeker". User data is stored in Firestore. There are 
existing Healers and Seekers pages and a User Reports section, but the actual 
data-fetching and query logic is either missing, incomplete, or incorrect.

⚠️ HARD CONSTRAINT — READ-ONLY ONLY
This is a reporting/dashboard feature. It must ONLY read data. Do not write, 
update, delete, or modify any Firestore document, field, or collection at any 
point — including during the audit, implementation, or testing/verification 
steps.
- Only use Firestore read operations: `.get()`, `.where()`, `onSnapshot()` 
  (read listener), or equivalent read-only SDK/Admin SDK calls.
- Do NOT use `.set()`, `.update()`, `.delete()`, `.add()`, batch writes, or 
  transactions anywhere in this feature.
- Do NOT create, modify, or backfill any field on any user document, even if 
  you find missing or inconsistent data (e.g. missing `createdAt`) — report 
  it to me instead of fixing it.
- Do NOT change Firestore security rules.
- If verifying data requires comparing against the Firestore console, do so 
  by reading/viewing only — no edits.
- If implementing this properly seems to require a write of any kind for any 
  reason, STOP and explain why before writing any code — do not proceed 
  without my explicit approval.
- Firestore composite indexes are the one exception: creating an index is a 
  configuration/infrastructure action, not a data write, so if a query 
  requires one, you may create the index (or give me the Firebase-generated 
  link to create it myself) — but this should not modify any document data.

STEP 1 — AUDIT BEFORE CHANGING ANYTHING
Before writing or editing any code, examine the current system and report back:
1. Locate the Healers page, Seekers page, and User Reports component/page files.
2. Show me the current Firestore query logic (or lack thereof) in each.
3. Inspect the Firestore `users` collection schema — confirm the exact field 
   names used for role (e.g. `role`, `userType`) and signup date 
   (e.g. `createdAt`, `signupDate`, `timestamp`). Flag if these fields are 
   inconsistent across documents or missing entirely.
4. Check whether any existing Firestore composite indexes exist for queries 
   combining role + date filters.
5. Check how "today's traffic" is currently being sourced, if at all (GA4 API 
   integration, or none).
6. Summarize what's broken, missing, or mismatched between what the UI expects 
   and what the data actually provides.

Do not write implementation code yet — give me this audit first so I can 
confirm the actual field names and structure before you proceed.

STEP 2 — IMPLEMENT (after I confirm the audit)
Once I confirm the schema details, implement the following, using read-only 
queries exclusively:

A. Healers Page & Seekers Page
   - Query Firestore `users` collection filtered by role (`healer` / `seeker`).
   - Support a date range filter (default: March 1, [current year] to today).
   - Display: total count in range, new signups in range, and a list/table of 
     users with name, email, signup date, and role.
   - Add a loading state and an empty state ("No signups in this range").

B. User Reports Page
   - Combined summary view: total new healers vs new seekers in selected date 
     range, shown as counts and a simple chart (bar or line by day/week).
   - Date range picker, defaulting to March 1 to today, editable by the admin.
   - Handle Firestore composite index requirements — if a query needs an index 
     that doesn't exist, surface the Firebase-generated index creation link 
     clearly in an error state rather than failing silently.

C. Today's Traffic
   - If GA4 is already connected, use the GA4 Data API (read-only reporting 
     endpoint) to pull today's active users/sessions. If no GA4 API 
     integration exists yet, tell me before building it, and propose the 
     minimal integration needed (service account, property ID, endpoint) 
     rather than assuming.

STEP 3 — VERIFY (read-only)
   - Confirm queries return correct counts by manually cross-checking one 
     sample query result against the Firestore console (view only).
   - Confirm the date range filter is inclusive of both start and end dates.
   - Confirm role filtering only returns exact matches (no seekers appearing 
     in healer counts or vice versa).
   - Confirm no write/delete operations were introduced anywhere in the diff — 
     explicitly show me a summary of all Firestore SDK calls used, so I can 
     verify they are all reads.

Do not modify unrelated parts of the admin console. Ask me before changing 
any shared components used elsewhere. If at any point you are unsure whether 
an action counts as a "write," stop and ask me rather than proceeding.