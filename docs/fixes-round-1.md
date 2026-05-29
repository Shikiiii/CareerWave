# CareerWave fixes round 1

Implemented fixes requested by the user:

1. Header auth state
   - Header now reads the current user server-side from the auth cookie.
   - Logged-in users see Dashboard, Notifications, and Logout.
   - Guests see Login and Register.
   - Mobile menu now follows the same logic.

2. Jobs navigation
   - Header Jobs link now goes to `/`, because the homepage is the public jobs listing.
   - `/jobs` redirects to `/` to avoid a missing page.

3. Job detail route
   - Updated the dynamic route for Next.js 16 async `params`.
   - The page now reads the correct job by slug.

4. Apply flow
   - Upload validation now accepts browser uploads that report PDF/DOC/DOCX as `application/octet-stream` or an empty MIME type, while still checking extension and magic bytes.
   - API errors are more visible during local development.

5. Job listing UI
   - Rebuilt job cards with better spacing, badges, icons, hover effects, and salary/location metadata.
   - Rebuilt filters with styled inputs/selects and extra filters for company, experience, contract type, and minimum salary.
