---
phase: 1
slug: identity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — plain HTML/JS project. Manual smoke checklist per wave. |
| **Config file** | None — Wave 0 creates `js/supabase.js` and `js/config.js` |
| **Quick run command** | Open affected page in browser, run primary flow manually |
| **Full suite command** | Manual smoke checklist — all 6 requirements, browser only |
| **Estimated runtime** | ~5–10 minutes manual per wave |

---

## Sampling Rate

- **After every task commit:** Open the affected page in browser, verify primary flow works
- **After every plan wave:** Run through the full manual smoke checklist for all 6 requirements
- **Before `/gsd:verify-work`:** All 6 manual smoke tests must pass
- **Max feedback latency:** ~5 minutes

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| AUTH-01 | TBD | 0 | AUTH-01 | manual-smoke | Open signup.html, submit form, verify account created | ❌ Wave 0 | ⬜ pending |
| AUTH-02 | TBD | 0 | AUTH-02 | manual-smoke | Login, refresh page, verify session persists | ❌ Wave 0 | ⬜ pending |
| AUTH-03 | TBD | 0 | AUTH-03 | manual-smoke | Logout, verify redirect to login, confirm no session | ❌ Wave 0 | ⬜ pending |
| AUTH-04 | TBD | 0 | AUTH-04 | manual-smoke | Submit email, receive reset link, set new password, login | ❌ Wave 0 | ⬜ pending |
| PROF-01 | TBD | 0 | PROF-01 | manual-smoke | Submit profile-setup form, verify in Supabase dashboard | ❌ Wave 0 | ⬜ pending |
| PROF-02 | TBD | 0 | PROF-02 | manual-smoke | Complete profile without avatar, verify initials shown | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Supabase project created (URL + anon key available)
- [ ] `js/config.js` — stores SUPABASE_URL and SUPABASE_ANON_KEY (gitignored)
- [ ] `js/supabase.js` — shared client module exported for all pages
- [ ] `profiles` table created in Supabase SQL editor (display_name, bio, avatar_url, id FK to auth.users)
- [ ] DB trigger: auto-create profiles row on auth.users insert
- [ ] RLS policies: users can only read/write their own profile row
- [ ] `avatars` Supabase Storage bucket created (public), RLS via `storage.foldername()`
- [ ] Redirect URLs configured in Supabase dashboard (site URL + `/reset-password.html`)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Signup creates account | AUTH-01 | Requires email confirmation flow (may need real email) | Open signup.html, submit valid email/pass, check Supabase dashboard → Authentication → Users |
| Session persists across refresh | AUTH-02 | Browser localStorage state, can't unit test statically | Login, refresh tab, confirm still logged in (profile visible) |
| Logout clears session | AUTH-03 | Browser session state | Click logout, verify redirected to /login, refresh — still logged out |
| Password reset email received | AUTH-04 | Requires real email delivery | Submit reset form, receive email, click link, update password, login with new password |
| Profile saves to Supabase | PROF-01 | Requires live Supabase connection | Submit profile-setup, open Supabase dashboard → Table Editor → profiles, verify row exists |
| Initials shown without avatar | PROF-02 | Visual rendering | Complete profile without uploading avatar, verify amber initials circle appears everywhere |

---

## Validation Sign-Off

- [ ] All tasks have manual smoke test instructions documented above
- [ ] Wave 0 prerequisites completed before any Wave 1 tasks run
- [ ] AUTH-04 verified with real email delivery (not just UI submit)
- [ ] All 6 manual smoke tests pass before `/gsd:verify-work`
- [ ] No automated commands that require build tools or a test runner
- [ ] `nyquist_compliant: true` set in frontmatter when all above are checked

**Approval:** pending
