---
phase: 01-identity
plan: 02
subsystem: auth
tags: [supabase-js, auth-guard, css, design-system, dark-theme]

# Dependency graph
requires:
  - phase: 01-identity-01
    provides: js/config.js with SUPABASE_URL and SUPABASE_ANON_KEY
provides:
  - js/supabase.js — singleton Supabase client, imported by all pages
  - js/auth-guard.js — requireAuth(), redirectIfAuth(), renderAvatar() guards
  - css/app.css — complete shared dark design system for all app pages
affects: [01-03, 01-04, 01-05]

# Tech tracking
tech-stack:
  added: [supabase-js@2 (CDN ESM), css custom properties]
  patterns:
    - Singleton client pattern — js/supabase.js is the single createClient() call; all other files import from it
    - Auth guard pattern — requireAuth() for protected pages, redirectIfAuth() for public auth pages
    - page-loading class pattern — body starts hidden, JS removes class after auth check to prevent flash
    - Profile completeness routing — redirectIfAuth checks display_name to route new vs returning users

key-files:
  created:
    - js/supabase.js (singleton Supabase client export)
    - js/auth-guard.js (requireAuth, redirectIfAuth, renderAvatar)
    - css/app.css (shared design tokens, form, button, avatar, spinner, loading state styles)
  modified: []

key-decisions:
  - "CDN ESM import for supabase-js — no build step required; matches project's plain HTML/JS approach"
  - "Singleton client in dedicated module — prevents session fragmentation from multiple createClient() calls"
  - "redirectIfAuth checks display_name in profiles table to distinguish new from returning users"
  - "renderAvatar falls back to amber initials circle (avi-am) — enforces no-face-required design principle"
  - ".page-loading opacity-0 pattern — hides page until auth check completes, preventing flash of wrong content"

patterns-established:
  - "Import pattern: import { supabase } from '/js/supabase.js' — all pages use this, never create their own client"
  - "Guard pattern: requireAuth() top of protected page scripts; redirectIfAuth() top of login/signup scripts"
  - "Avatar pattern: renderAvatar(profile) always returns safe HTML — graceful fallback with '?' initial"
  - "CSS pattern: link css/app.css + Google Fonts in each HTML page head; never duplicate design tokens"

requirements-completed: [AUTH-02, AUTH-03]

# Metrics
duration: ~3min
completed: 2026-03-11
---

# Phase 1 Plan 02: Shared JS Foundation and Design System Summary

**Singleton Supabase client in js/supabase.js, requireAuth/redirectIfAuth guards in js/auth-guard.js, and complete dark design system in css/app.css — the shared dependency for all auth and profile pages in Phase 1**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-11T08:33:09Z
- **Completed:** 2026-03-11T08:35:28Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- js/supabase.js created as the single shared Supabase client module — imports from js/config.js, exports `supabase` constant used by all subsequent pages
- js/auth-guard.js created with three exports: requireAuth() redirects unauthenticated users, redirectIfAuth() routes already-logged-in users based on profile completeness, renderAvatar() generates safe avatar HTML with amber initials fallback
- css/app.css created with the full shared design system: dark tokens matching index.html, form card + field components, btn-primary/ghost/link, avatar sizes and color variants, CSS-only spinner, .page-loading flash prevention, prefers-reduced-motion support

## Task Commits

Each task was committed atomically:

1. **Task 1: Create js/supabase.js shared client module** - `28aec2b` (feat)
2. **Task 2: Create js/auth-guard.js and css/app.css** - `3eceee8` (feat)

## Files Created/Modified

- `js/supabase.js` — Singleton Supabase client; imports CDN ESM supabase-js and credentials from js/config.js
- `js/auth-guard.js` — Three guard exports: requireAuth, redirectIfAuth, renderAvatar
- `css/app.css` — Shared dark design system: tokens, layout, navbar, buttons, form components, avatars, spinner, loading state, reduced-motion support

## Decisions Made

- CDN ESM pattern for supabase-js (cdn.jsdelivr.net) — matches the existing no-build-tool approach of the project; no npm/bundler needed
- Singleton client module — critical for session state consistency; all pages share one auth session via localStorage
- redirectIfAuth checks profiles.display_name to route users: new users go to /profile-setup.html, returning users go to /feed.html (Phase 3 placeholder)
- renderAvatar outputs amber initials fallback (avi-am class) — enforces the "no face required" platform principle at the rendering level
- .page-loading on `<body>` tag, removed by JS after getSession() resolves — cleanest way to prevent flash of unauthenticated page content

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plans 01-03 (login), 01-04 (signup), 01-05 (profile-setup) can all now import `{ supabase }` from `/js/supabase.js` and `{ requireAuth, redirectIfAuth, renderAvatar }` from `/js/auth-guard.js`
- All HTML pages should link `<link rel="stylesheet" href="/css/app.css">` and the Google Fonts link
- css/app.css provides all component classes needed without duplication
- No blockers for any subsequent plan in Phase 1

---
*Phase: 01-identity*
*Completed: 2026-03-11*
