---
phase: 01-identity
plan: 03
subsystem: auth
tags: [supabase-js, auth-pages, signup, login, password-reset, dark-theme]

# Dependency graph
requires:
  - phase: 01-identity-02
    provides: js/supabase.js singleton client, js/auth-guard.js guards, css/app.css design system

provides:
  - signup.html — signup page with email/password/confirm form
  - js/signup.js — signUp() handler with both email-confirmation paths
  - login.html — login page with email/password form and forgot-password link
  - js/login.js — signInWithPassword() handler with profile-completeness routing
  - js/auth-guard.js — extended with logout() export (AUTH-03)
  - forgot-password.html — password reset request page
  - js/forgot-password.js — resetPasswordForEmail() handler
  - update-password.html — new password form with loading/expired states
  - js/update-password.js — PASSWORD_RECOVERY event listener + updateUser()

affects: [01-04, 01-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Auth page pattern — each page calls redirectIfAuth() on DOMContentLoaded before revealing content
    - Success state swap — on success, hide form and show success-msg div (no page navigation for non-redirect flows)
    - Ambiguous reset success — forgot-password never reveals whether email is registered (security best practice)
    - PASSWORD_RECOVERY event pattern — update-password.html waits for Supabase event rather than parsing URL params
    - 10s expiry fallback — update-password.js shows expired-link UI if PASSWORD_RECOVERY doesn't fire within 10 seconds

key-files:
  created:
    - signup.html (signup page — email/password/confirm form, dark form-card layout)
    - js/signup.js (signUp() handler — both email-confirm and instant-session paths)
    - login.html (login page — email/password, forgot-password link, back to signup)
    - js/login.js (signInWithPassword() — profile-completeness routing to feed or profile-setup)
    - forgot-password.html (reset request page — email form, ambiguous success message)
    - js/forgot-password.js (resetPasswordForEmail() — 60s retry gate, security-safe success message)
    - update-password.html (new password form — spinner waiting state, expired-link state, success state)
    - js/update-password.js (PASSWORD_RECOVERY listener, 10s expiry timeout, updateUser(), redirect to login)
  modified:
    - js/auth-guard.js (added logout() export — signOut() + redirect to /login.html)

key-decisions:
  - "logout() lives in auth-guard.js (not login.js) — any page can import it without pulling in login-page logic"
  - "Ambiguous reset success message — 'If this email is registered' phrasing avoids confirming account existence"
  - "PASSWORD_RECOVERY event pattern — update-password.html never parses URL hash directly; Supabase client handles token exchange automatically"
  - "10s expiry fallback on update-password.html — prevents page being stuck in loading state if user navigates there without a valid token"
  - "60s retry gate on forgot-password.js — prevents spam clicking while still allowing genuine retry"

patterns-established:
  - "redirectIfAuth() is always the first async call on auth pages — prevents flash of form on authenticated users"
  - "page-loading class removed after auth check resolves — all auth pages follow this pattern"
  - "form-error spans with min-height — reserves vertical space so error appearance doesn't shift layout"
  - "Success state swap pattern — form hidden, success-msg shown, no page reload needed"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: ~3min
completed: 2026-03-11
---

# Phase 1 Plan 03: Auth Pages Summary

**Four auth pages (signup, login, forgot-password, update-password) completing the full Supabase Auth lifecycle with dark form-card design, profile-completeness routing, and PASSWORD_RECOVERY event-driven password reset**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-11T08:40:16Z
- **Completed:** 2026-03-11T08:43:43Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- signup.html + js/signup.js built: calls signUp(), handles both email-confirmation-required (show message) and instant-session (redirect to /profile-setup.html) paths. Form validation with inline errors and no layout shift.
- login.html + js/login.js built: calls signInWithPassword(), then checks profiles.display_name to route new users to /profile-setup.html or returning users to /feed.html. logout() added to auth-guard.js for AUTH-03.
- forgot-password.html + js/forgot-password.js built: resetPasswordForEmail() with ambiguous success message (security best practice), 60s retry gate.
- update-password.html + js/update-password.js built: waits for PASSWORD_RECOVERY event via onAuthStateChange, shows new-password form when received, 10s expiry fallback for invalid/expired links, redirects to /login.html on success.

## Task Commits

Each task was committed atomically:

1. **Task 1: signup.html, login.html, js/signup.js, js/login.js** - `8365e24` (feat)
2. **Task 2: forgot-password.html, update-password.html, js/forgot-password.js, js/update-password.js** - `b27b3cb` (feat)

## Files Created/Modified

- `signup.html` — Signup page with dark form-card, email/password/confirm fields, module script
- `js/signup.js` — redirectIfAuth check, client validation, signUp(), handles confirmation-required and instant-session
- `login.html` — Login page with dark form-card, email/password, forgot-password link, module script
- `js/login.js` — redirectIfAuth check, signInWithPassword(), profiles.display_name completeness routing
- `js/auth-guard.js` — Added logout() export: signOut() + redirect to /login.html (AUTH-03)
- `forgot-password.html` — Reset request page with email form and ambiguous success state
- `js/forgot-password.js` — resetPasswordForEmail(), ambiguous success, 60s retry gate
- `update-password.html` — New password form with spinner waiting state, expired-link fallback, success state
- `js/update-password.js` — onAuthStateChange PASSWORD_RECOVERY listener, 10s expiry timeout, updateUser()

## Decisions Made

- logout() placed in auth-guard.js (not login.js) — keeps auth utilities centralized; any page can import without depending on login-page logic
- Ambiguous reset success message — "If this email is registered" phrasing is standard security practice; never confirms account existence
- PASSWORD_RECOVERY event-driven approach — update-password.html relies entirely on onAuthStateChange, never manually parses the URL hash fragment; Supabase handles token exchange automatically via its CDN client
- 10s expiry fallback — prevents the update-password page being stuck in a loading spinner forever if the user lands there without a valid token
- logout() not used by any page in this plan but is available for plan 04 (profile-setup navbar) and plan 05

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required for these pages. The Supabase project must have password reset email configured (handled in plan 01 setup), but no new configuration is needed.

## Next Phase Readiness

- Plan 01-04 (profile-setup) can now import `{ requireAuth, logout }` from `/js/auth-guard.js` for its protected page + nav logout button
- All four auth pages use consistent dark form-card design matching css/app.css token set
- AUTH-01 through AUTH-04 are fully implemented via these pages
- No blockers for plan 01-04 or plan 01-05

---
*Phase: 01-identity*
*Completed: 2026-03-11*
