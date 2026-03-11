---
phase: 01-identity
plan: 04
subsystem: profile
tags: [supabase-storage, profile-setup, avatar-upload, initials-fallback, onboarding]

# Dependency graph
requires:
  - phase: 01-identity-02
    provides: js/supabase.js singleton client, js/auth-guard.js (requireAuth, renderAvatar), css/app.css
  - phase: 01-identity-03
    provides: auth pages, login routing to /profile-setup.html when display_name is null

provides:
  - profile-setup.html — onboarding gate page with avatar, display name, bio form
  - js/profile-setup.js — profile save handler: upsert profiles row + optional avatar upload to storage

affects: [01-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Avatar initials pattern — (value || '?')[0].toUpperCase() guard prevents empty string errors
    - FileReader preview — client-side image preview before server upload; no round-trip on file change
    - Storage upsert pattern — upload with { upsert: true } so re-uploading avatar replaces the existing file
    - Existing profile pre-population — always fetch profile on load; populate fields for returning users
    - avatarPreview reference tracking — JS keeps a mutable let ref so img/div swaps stay in sync

key-files:
  created:
    - profile-setup.html (onboarding gate — avatar section, display name, bio, save button)
    - js/profile-setup.js (auth guard, profile load, live initials, FileReader preview, storage upload, upsert)
  modified: []

key-decisions:
  - "Avatar preview uses mutable let ref — when FileReader replaces the div with an img, the variable updates so subsequent handlers use the correct element"
  - "setInitialsPreview() reverts img to div when user clears file choice or on init — prevents stale image after file deselect"
  - "existingAvatarUrl tracked separately from currentAvatarFile — allows upsert to preserve an existing avatar_url when user doesn't pick a new file"
  - "Redirect to /feed.html on success — page doesn't exist until Phase 3; 404 is documented and expected behavior"

# Metrics
duration: ~3min
completed: 2026-03-11
---

# Phase 1 Plan 04: Profile Setup Summary

**Profile setup onboarding page with amber initials placeholder, live preview avatar upload to Supabase Storage, and profiles upsert implementing PROF-01 and PROF-02**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-11T08:47:27Z
- **Completed:** 2026-03-11T08:50:08Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- profile-setup.html built: amber initials circle as default avatar state (live-updating as user types display name), hidden file input wrapped in `<label>` for accessible click-to-upload, display name field (required, maxlength 40), bio textarea with character counter (maxlength 160), dark form-card at 480px max-width.
- js/profile-setup.js built: requireAuth() gate (unauthenticated users redirected to /login.html), existing profile loaded and pre-populated on return visits, live initials update using `(value || '?')[0]` guard, FileReader client-side avatar preview before upload, Supabase Storage avatar upload with upsert, profiles upsert with display_name + bio + avatar_url, redirect to /feed.html on success.

## Task Commits

Each task was committed atomically:

1. **Task 1: profile-setup.html** - `7c2a7f2` (feat)
2. **Task 2: js/profile-setup.js** - `52d3b92` (feat)

## Files Created/Modified

- `profile-setup.html` — Onboarding gate page: avatar section with amber initials circle, display name (required), bio textarea, save button, dark form-card layout
- `js/profile-setup.js` — requireAuth check, existing profile load + pre-populate, live initials listener, FileReader avatar preview, supabase.storage.from('avatars').upload(), profiles.upsert(), redirect to /feed.html

## Decisions Made

- Mutable `avatarPreview` let reference — when JS swaps the initials div for an `<img>` (or vice versa), the variable must track the live DOM node; a stale const ref would cause handlers to target detached elements
- `existingAvatarUrl` tracked as a separate state variable — allows the upsert to preserve the existing avatar_url when the user doesn't pick a new file in this session, without re-uploading or blanking it
- Redirect to `/feed.html` on success — Phase 3 will create this page; a 404 until then is acceptable and documented

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Supabase Storage bucket `avatars` must exist with public read access and RLS policy allowing authenticated users to upload to their own `userId/` prefix. This was specified in Plan 01-01 Supabase setup.

## Next Phase Readiness

- Plan 01-05 (final plan) can build profile view using display_name + avatar_url from profiles table
- PROF-01 and PROF-02 are fully implemented
- profile-setup.html is the redirect target from login.js when display_name is null — onboarding gate is live

## Self-Check: PASSED

- FOUND: profile-setup.html
- FOUND: js/profile-setup.js
- FOUND: .planning/phases/01-identity/01-04-SUMMARY.md
- FOUND commit: 7c2a7f2 (feat(01-04): build profile-setup.html)
- FOUND commit: 52d3b92 (feat(01-04): build js/profile-setup.js)

---
*Phase: 01-identity*
*Completed: 2026-03-11*
