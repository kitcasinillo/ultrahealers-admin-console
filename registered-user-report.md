Implement a new feature to fetch all registered user emails from Firebase Authentication 
and display them in the "Users Report" section of the app.

CONTEXT:
- Backend: Node.js/Express (adjust if using Next.js API routes or Cloud Functions)
- Frontend: React
- Firebase Admin SDK is already installed / needs to be installed (firebase-admin)
- A service account key JSON is available at [PATH] or configured via environment variables

REQUIREMENTS:

1. BACKEND — New API endpoint
   - Create a new route, e.g. GET /api/users/auth-list
   - Use the Firebase Admin SDK's `admin.auth().listUsers()` method to fetch all users
   - Handle pagination internally (listUsers returns max 1000 per call) — loop using 
     `result.pageToken` until all users are retrieved
   - Return an array of objects containing: uid, email, displayName (if any), 
     creationTime, lastSignInTime, and emailVerified status
   - Add proper error handling (e.g., missing permissions, invalid service account, 
     network errors) and return meaningful HTTP status codes
   - Ensure this endpoint is protected (only accessible to admin/authorized roles — 
     do NOT expose user emails publicly)

2. FRONTEND — New component
   - Create a component (e.g., `UsersAuthReport.jsx` or similar to match existing 
     naming conventions in the project)
   - On mount, call the new backend endpoint to fetch the list of users
   - Display results in a table with columns: Email, UID, Created Date, Last Sign-In, 
     Verified status
   - Add a loading state while fetching and an error state if the request fails
   - Add basic search/filter by email
   - Integrate this component into the existing "Users Report" page/section 
     (match existing styling/layout conventions used elsewhere in the app)

3. OPTIONAL ENHANCEMENTS (include if time allows)
   - Add a CSV export button for the fetched user list
   - Add pagination or infinite scroll on the frontend if the user count is large
   - Cache the fetched list briefly (e.g., 5 minutes) to avoid hitting Firebase 
     Admin SDK rate limits on frequent reloads

CONSTRAINTS:
- Do not expose the Firebase service account credentials to the frontend
- Follow the existing code style, folder structure, and naming conventions in the project
- Reuse existing UI components (tables, loaders, buttons) where available instead of 
  creating new ones from scratch