---
phase: 01-identity
plan: 05
subsystem: auth
tags: [supabase, rls, smoke-test, phase-gate, auth, profiles]

requires:
  - phase: 01-identity plan 01
    provides: Supabase project provisioned, js/config.js, js/supabase.js
  - phase: 01-identity plan 02
    provides: js/auth-guard.js, css/app.css shared foundations
  - phase: 01-identity plan 03
    provides: signup.html, login.html, forgot-password.html, update-password.html
  - phase: 01-identity plan 04
    provides: profile-setup.html, js/profile-setup.js with avatar upload + initials fallback
provides:
  - Phase 1 verified complete — all 6 requirements pass manual smoke tests against live Supabase
  - RLS INSERT policy on profiles table confirmed and fixed
affects: [02-creation, 03-social]

tech-stack:
  added: []
  patterns:
    - "Supabase RLS pattern: SELECT + UPDATE policies alone are insufficient — INSERT policy also required when app code inserts profile rows"

key-files:
  created: []
  modified: []

key-decisions:
  - "Phase 1 declared complete — all AUTH-01, AUTH-02, AUTH-03, AUTH-04, PROF-01, PROF-02 verified manually against live Supabase project"
  - "profiles table INSERT RLS policy applied manually in Supabase dashboard: auth.uid() = id check required for profile-setup.js to write rows"

patterns-established:
  - "RLS completeness: Always provision SELECT + INSERT + UPDATE (and DELETE if needed) policies together — missing INSERT silently blocks first-time profile saves"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, PROF-01, PROF-02]

duration: ~5min (manual verification)
completed: 2026-03-11
---

# Phase 1 Plan 05: Phase Gate Smoke Tests Summary

**All six Phase 1 requirements verified live — Supabase email/password auth, session persistence, logout, password reset, profile save, and amber initials avatar all confirmed working**

## Performance

- **Duration:** ~5 min (manual smoke testing in browser)
- **Started:** 2026-03-11T09:00:00Z
- **Completed:** 2026-03-11T09:07:01Z
- **Tasks:** 1 (human-verify checkpoint)
- **Files modified:** 0

## Accomplishments

- All 6 Phase 1 requirements verified passing in a real browser against the live Supabase project
- Identified and resolved missing INSERT RLS policy on `profiles` table that blocked first-time profile saves
- Phase 1 declared complete — Phase 2 (Creation) can begin

## Task Commits

This plan is a human-verify checkpoint — no code was written. All code commits are from plans 01-01 through 01-04.

Previous plan metadata commits:
- `04aa2f7` — docs(01-01): complete Supabase provisioning plan
- `d020b11` — docs(01-02): complete shared JS foundation and design system plan
- `563a8d6` — docs(01-03): complete auth pages plan
- `d9699f6` — docs(01-04): complete profile setup plan — PROF-01 + PROF-02

## Files Created/Modified

None — this was a verification-only plan.

## Decisions Made

- Phase 1 declared complete. All six requirements verified as working against the live Supabase project.
- The missing INSERT RLS policy on `profiles` was identified during PROF-01 smoke testing and fixed immediately in the Supabase dashboard. Future phases that add new tables must provision INSERT + SELECT + UPDATE policies together.

## Deviations from Plan

### Human-Applied Fix (during smoke testing)

**1. [Rule 2 - Missing Critical] INSERT RLS policy missing from profiles table**
- **Found during:** Task 1 — PROF-01 smoke test (profile save)
- **Issue:** The `profiles` table had SELECT and UPDATE RLS policies but lacked an INSERT policy. When `profile-setup.js` attempted to write the initial profile row, Supabase silently rejected the insert due to RLS enforcement.
- **Fix:** User applied the following SQL manually in the Supabase dashboard:
  ```sql
  create policy "Users can insert own profile"
    on public.profiles for insert
    to authenticated
    with check (auth.uid() = id);
  ```
- **Files modified:** None (Supabase dashboard — no local file change)
- **Verification:** PROF-01 re-tested after fix — profile row saved correctly with display_name, bio populated and avatar_url NULL

---

**Total deviations:** 1 human-applied fix (missing RLS INSERT policy — critical for profile save correctness)
**Impact on plan:** Essential fix. Without it, PROF-01 and PROF-02 could not pass. No scope creep.

## Smoke Test Results

| Requirement | Test | Result |
|-------------|------|--------|
| AUTH-01 | Signup creates Supabase Auth user | PASS |
| AUTH-02 | Session persists across page refresh and new tab | PASS |
| AUTH-03 | Logout clears session, protected page redirects to /login.html | PASS |
| AUTH-04 | Password reset email received, update-password.html processes PASSWORD_RECOVERY, login with new password | PASS |
| PROF-01 | Profile row saved with display_name + bio, avatar_url NULL | PASS (after RLS fix) |
| PROF-02 | Amber initials circle renders correctly when no avatar uploaded | PASS (after RLS fix) |

## Issues Encountered

**Missing INSERT RLS policy on profiles table** — Supabase RLS blocks all operations by default when policies are enabled. The provisioning plan (01-01) established SELECT and UPDATE policies but did not include INSERT. This silently prevented `profile-setup.js` from creating the initial profiles row. Resolved by applying the INSERT policy in the Supabase dashboard before retesting.

## User Setup Required

None — the RLS fix was applied directly during this smoke test session.

## Next Phase Readiness

Phase 1 is complete. All identity infrastructure is in place:
- Supabase Auth handles email/password signup, login, and password reset
- Session persistence works across tabs and refreshes via Supabase localStorage tokens
- Logout clears session and auth-guard.js blocks protected page access
- profiles table stores display_name, bio, and optional avatar_url with correct RLS
- Amber initials avatar renders reliably when no photo is uploaded

Phase 2 (Creation) can begin. Note: `profile-setup.html` currently redirects to `/feed.html` on save success — this page does not exist until Phase 3. A 404 after profile save is expected and documented.

---
*Phase: 01-identity*
*Completed: 2026-03-11*
