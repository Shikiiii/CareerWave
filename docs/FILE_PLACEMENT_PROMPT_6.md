# Prompt 6 - Design System + Layout Foundation

This prompt adds reusable visual/layout infrastructure only. It does not implement job browsing, profile management, applications, employer job CRUD, or applicant workflows.

## Added files

### Configuration
- `config/navigation.ts` - public navigation, job seeker dashboard navigation, employer dashboard navigation, quick links.
- `config/theme.ts` - CareerWave brand constants and reusable gradient/shadow tokens.

### Layout components
- `components/layout/site-header.tsx` - public sticky header with auth-aware actions.
- `components/layout/mobile-nav.tsx` - responsive mobile navigation dialog.
- `components/layout/site-footer.tsx` - public footer.
- `components/layout/marketing-shell.tsx` - wrapper for public marketing pages.
- `components/layout/dashboard-sidebar.tsx` - desktop dashboard sidebar.
- `components/layout/dashboard-shell.tsx` - responsive protected dashboard shell with mobile navigation.

### Shared components
- `components/shared/logo.tsx` - reusable CareerWave logo.
- `components/shared/page-heading.tsx` - consistent page heading block.
- `components/shared/empty-state.tsx` - reusable empty state component.
- `components/shared/loading-state.tsx` - card grid skeleton component.
- `components/shared/form-section.tsx` - reusable form section wrapper.

### UI primitives
- `components/ui/badge.tsx` - status/label badge.
- `components/ui/skeleton.tsx` - loading skeleton primitive.
- `components/ui/separator.tsx` - separator primitive.
- `components/ui/dialog.tsx` - modal/dialog primitive based on Radix Dialog.

## Updated files

- `components/ui/button.tsx` - added `asChild` support through Radix Slot for clean `Button` + `Link` composition.
- `app/layout.tsx` - added base body classes.
- `app/page.tsx` - replaced old one-off header/footer with the new marketing layout and polished homepage design.
- `app/account/page.tsx` - moved protected job seeker page into the reusable dashboard shell.
- `app/employer/page.tsx` - moved protected employer page into the reusable dashboard shell.

## Notes

- The dashboard links point to future routes that will be implemented in later prompts.
- Notification buttons are visual placeholders for the notification system planned in a later prompt.
- The added dialog primitive uses `@radix-ui/react-dialog`, which is already listed in `package.json`.
- Type checking requires dependencies to be installed with `npm install`; the submitted zip intentionally excludes `node_modules`.
