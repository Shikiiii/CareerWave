# Manual testing checklist

## Public browsing

- [ ] Homepage loads successfully.
- [ ] Latest jobs are visible.
- [ ] Featured jobs are visible if seeded data exists.
- [ ] Search by keyword works.
- [ ] Filter by location works.
- [ ] Filter by salary works.
- [ ] Filter by employment type works.
- [ ] Filter by remote type works.
- [ ] Filter by experience level works.
- [ ] Sorting by newest works.
- [ ] Pagination works.
- [ ] Job details page opens.

## Authentication

- [ ] Register as job seeker.
- [ ] Register as employer.
- [ ] Login as job seeker.
- [ ] Login as employer.
- [ ] Logout clears session.
- [ ] Protected pages redirect unauthenticated users.
- [ ] Job seeker cannot access employer dashboard.
- [ ] Employer cannot access job seeker dashboard pages where blocked.

## Job seeker workflow

- [ ] Edit profile.
- [ ] Add skills.
- [ ] Add education/work experience.
- [ ] Upload CV.
- [ ] Upload additional document.
- [ ] Apply to job with saved CV.
- [ ] Apply to job with new CV.
- [ ] Duplicate application is blocked.
- [ ] Application appears in applications page.
- [ ] Application status is displayed.
- [ ] Withdraw application.
- [ ] Bookmark a job.
- [ ] Remove bookmarked job.

## Employer workflow

- [ ] Employer dashboard stats load.
- [ ] Create job listing.
- [ ] Edit job listing.
- [ ] Pause job listing.
- [ ] Reactivate job listing.
- [ ] Delete job listing.
- [ ] View applicants for a job.
- [ ] Open application detail.
- [ ] Opening submitted application changes status to reviewing.
- [ ] Accept application.
- [ ] Reject application.
- [ ] Accepted applicant appears in accepted tab.
- [ ] Add interview/contact notes.

## Notifications

- [ ] Job seeker receives reviewing notification.
- [ ] Job seeker receives accepted notification.
- [ ] Job seeker receives rejected notification.
- [ ] Employer receives new applicant notification.
- [ ] Mark notification as read.
- [ ] Mark all notifications as read.

## Security checks

- [ ] API blocks unauthenticated protected requests.
- [ ] Employer cannot manage another employer's job.
- [ ] User cannot withdraw another user's application.
- [ ] User cannot delete another user's document.
- [ ] Invalid upload MIME type is rejected.
- [ ] Oversized upload is rejected.
