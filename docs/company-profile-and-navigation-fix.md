# Company profile and navigation cleanup

Implemented a real `/employer/company` page and API so employers can edit company information and upload a company logo.

Changes:
- Removed `For employers` from the global header navigation.
- Removed job seeker and employer `Settings` links from dashboard sidebars.
- Added redirects for `/account/settings` and `/employer/settings` back to their dashboards.
- Updated logout to hard-redirect to `/login` after clearing auth cookies.
- Added company logo upload support.
- Job cards and company cards now display uploaded company logos.
