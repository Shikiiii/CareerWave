# Dashboard layout cleanup

Updated the dashboard layout after the global site header was added.

Changes:

- Removed the duplicate dashboard top bar that showed "Signed in as".
- Removed duplicate notification and logout controls from the dashboard shell.
- Dashboard pages now rely on the global header for account actions.
- Kept a compact mobile dashboard navigation button for small screens.
- Adjusted dashboard sidebar spacing so it sits naturally below the global header.
- Added more spacing between the job seeker dashboard heading and overview cards.

Files changed:

- `components/layout/dashboard-shell.tsx`
- `components/layout/dashboard-sidebar.tsx`
- `app/account/page.tsx`
