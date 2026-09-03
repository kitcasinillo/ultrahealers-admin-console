I want to add role-based tracking (Healer vs Seeker) to Google Analytics (GA4) 
on my site. User role is stored in Firestore at `profile.role` on each user's 
document. GA4 (gtag.js) is already connected to the site.

⚠️ HARD CONSTRAINT — READ-ONLY ON FIRESTORE
This task only READS the existing `profile.role` field from Firestore to pass 
it into GA4. Do not write, update, delete, or modify any Firestore document, 
field, or collection at any point.
- Only use Firestore read operations (`.get()`, `onSnapshot()` read listeners).
- Do NOT use `.set()`, `.update()`, `.delete()`, `.add()`, batch writes, or 
  transactions on the `users` collection or any other collection.
- Do NOT change Firestore security rules.
- If you believe a write is required for any reason, STOP and explain why 
  before writing any code — do not proceed without my explicit approval.

STEP 1 — AUDIT BEFORE CHANGING ANYTHING
Before writing any code, examine the current system and report back:
1. Locate where GA4 (gtag.js) is currently initialized in the codebase 
   (script tag, config file, or analytics wrapper/service).
2. Locate the signup flow and login flow — show me where the user's Firestore 
   profile is fetched after authentication in each.
3. Confirm the exact field path for role — `profile.role` — and check if it's 
   consistent across all user documents (flag any inconsistencies, e.g. 
   missing profile object, different field name, null values).
4. Check whether there's already any custom event or user property being sent 
   to GA4 anywhere in the codebase, so we don't duplicate or conflict with it.
5. Summarize what needs to be added and where.

Do not write implementation code yet — give me this audit first.

STEP 2 — IMPLEMENT (after I confirm the audit)
Once confirmed, implement the following:

A. Create a single reusable function, e.g. `setAnalyticsUserRole(role)`, that 
   calls:
   gtag('set', 'user_properties', { user_role: role });
   
   This should live in one shared analytics utility/service file — not 
   duplicated inline across multiple pages.

B. Call `setAnalyticsUserRole(role)` in these two places only:
   1. Immediately after a new user's Firestore profile is created during 
      signup (role is known at that point — 'healer' or 'seeker').
   2. Immediately after fetching the user's Firestore profile on every login 
      (since gtag user properties do not persist across sessions/devices on 
      their own — this must be re-set each time the user authenticates).

C. Guard against undefined/null role values — if `profile.role` is missing 
   or not exactly 'healer' or 'seeker', do NOT send the property (avoid 
   polluting GA4 with bad data); log a warning instead so we can catch data 
   quality issues.

D. Do not change how `sign_up` or other existing gtag events are structured — 
   only add the user property call described above. Existing events will 
   automatically inherit `user_role` once the user property is set, so no 
   other event code needs to change.

STEP 3 — VERIFY
   - Confirm `setAnalyticsUserRole` fires exactly once per signup and once 
     per login — no duplicate calls, no calls before the role is available.
   - Confirm no Firestore write/delete calls were introduced — show me a 
     summary of every Firestore SDK call touched or added in this task so I 
     can verify they are all reads.
   - Confirm the function fails gracefully (no thrown errors) if `gtag` is 
     not yet loaded when called.

Do not modify unrelated analytics code or other parts of the app. Ask me 
before changing any shared authentication or profile-fetching logic used 
elsewhere.