---
phase: 01-identity
plan: 01
subsystem: infra
tags: [supabase, postgres, rls, storage, auth]

# Dependency graph
requires: []
provides:
  - Live Supabase project with URL and anon key
  - public.profiles table (id, display_name, bio, avatar_url, created_at)
  - DB trigger auto-creating profiles row on every auth.users insert
  - RLS policies scoping profile read/update to owner
  - avatars storage bucket (public) with owner-scoped INSERT/UPDATE/DELETE
  - js/config.js with SUPABASE_URL and SUPABASE_ANON_KEY
  - .gitignore excluding js/config.js from commits
affects: [01-02, 01-03, 01-04, 01-05]

# Tech tracking
tech-stack:
  added: [supabase-js, supabase auth, supabase storage, postgres rls]
  patterns:
    - config.js credentials file pattern — gitignored, imported by js/supabase.js
    - owner-folder storage pattern — avatars/{uid}/filename scoped by RLS

key-files:
  created:
    - js/config.js (gitignored — contains SUPABASE_URL and SUPABASE_ANON_KEY)
    - .gitignore
  modified: []

key-decisions:
  - "Supabase Auth chosen as identity backend — email/password, no OAuth in v1"
  - "profiles table uses auth.users FK with cascade delete — no orphan profiles"
  - "DB trigger handle_new_user auto-inserts profile row on signup — no manual insert needed in app code"
  - "avatars bucket is public (URLs are shareable) — RLS restricts writes to owner folder only"
  - "js/config.js gitignored to avoid committing project-specific config — anon key is not a secret but project URL ties to billing"

patterns-established:
  - "Credentials pattern: js/config.js exports SUPABASE_URL and SUPABASE_ANON_KEY — all JS modules import from js/supabase.js which reads these"
  - "RLS pattern: policies scope all data access to auth.uid() = id — never trust client-supplied user IDs"
  - "Storage path pattern: avatars/{uid}/filename — RLS checks foldername()[1] matches auth.uid()"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, PROF-01, PROF-02]

# Metrics
duration: ~15min
completed: 2026-03-11
---

# Phase 1 Plan 01: Supabase Backend Provisioning Summary

**Live Supabase project with profiles table, DB trigger, RLS policies, public avatars bucket, and gitignored js/config.js — full backend foundation for Phase 1 auth flows**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-11T08:20:16Z
- **Completed:** 2026-03-11T08:35:00Z
- **Tasks:** 2 (1 human-action checkpoint + 1 auto)
- **Files modified:** 2

## Accomplishments

- Supabase project provisioned at `https://miclpyiqlcynguhcsgcs.supabase.co`
- `public.profiles` table created with id (FK to auth.users), display_name, bio, avatar_url, created_at
- DB trigger `on_auth_user_created` auto-inserts a profiles row on every signup — no app-level insert needed
- RLS enabled on profiles: authenticated users can only read/update their own row
- `avatars` storage bucket created (public) with owner-scoped write policies via folder path matching
- `update-password.html` added to Supabase redirect allowlist for both production and localhost
- `js/config.js` written with real credentials and added to `.gitignore`

## Task Commits

Each task was committed atomically:

1. **Task 1: Provision Supabase backend** — human-action checkpoint, no commit (dashboard work)
2. **Task 2: Create js/config.js and add to .gitignore** — `54c7634` (chore)

## Files Created/Modified

- `js/config.js` — Supabase credentials (gitignored, not in repo)
- `.gitignore` — Excludes js/config.js from all future commits

## Decisions Made

- Supabase Auth is the identity backend for v1 — email/password only, no OAuth
- profiles table FK references auth.users with cascade delete — orphan rows impossible
- DB trigger approach means app code never manually inserts into profiles — simpler, safer
- avatars bucket is public (read URLs are shareable links) — RLS restricts writes to owner's folder
- js/config.js is gitignored even though the anon key is not secret — avoids project-specific config leaking into the repo

## Deviations from Plan

None — plan executed exactly as written. Human completed all 7 provisioning steps, provided credentials, Task 2 auto-executed as specified.

## Issues Encountered

None.

## User Setup Required

All setup completed during this plan execution:
- Supabase project created and live
- SQL run in dashboard (profiles table, trigger, RLS, storage policies)
- Redirect URLs configured
- Credentials stored in js/config.js locally

## Next Phase Readiness

- All subsequent plans in Phase 1 can import from `js/supabase.js` (Plan 02) which reads from `js/config.js`
- Backend is fully ready: auth, profile storage, avatar storage, RLS all in place
- No blockers for Plan 02 (Supabase client + auth pages)

---
*Phase: 01-identity*
*Completed: 2026-03-11*
