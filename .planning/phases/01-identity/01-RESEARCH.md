# Phase 1: Identity - Research

**Researched:** 2026-03-11
**Domain:** Supabase Auth + vanilla HTML/CSS/JS profile setup
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use Supabase Auth — handles email/password signup, session persistence, and password-reset email out of the box
- No custom auth server; Supabase is the backend for auth in v1
- Dedicated pages: `/login` and `/signup` (not modals)
- Pages must follow the established dark design system (--bg, --surface, --border, --amber, --text tokens)
- After signup, route user to a profile setup step before reaching the app
- Profile setup: display name (required), bio (optional), avatar upload (optional)
- Users with no avatar get an initials-based placeholder (first letter of display name)
- Placeholder styled in amber (#f59e0b) to match brand — not generic grey
- "No face required" must feel intentional, not like a broken state

### Claude's Discretion
- Exact routing structure and page layout
- Form validation UX (inline vs on-submit errors)
- Session persistence mechanism (Supabase handles this — not a discretion area, just noted)
- Loading/transition states between auth steps
- Mobile layout adjustments within the 375px constraint

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up with email and password | `supabase.auth.signUp({ email, password })` — email confirmation flow and redirect to profile-setup |
| AUTH-02 | User can log in and stay logged in across sessions | `supabase.auth.signInWithPassword()` + localStorage persistence by default; `onAuthStateChange` to react to session |
| AUTH-03 | User can log out | `supabase.auth.signOut()` clears session from localStorage and server |
| AUTH-04 | User can reset password via email link | `resetPasswordForEmail()` + redirect to update-password page; `PASSWORD_RECOVERY` event in `onAuthStateChange` |
| PROF-01 | User can create a profile with display name and bio | `profiles` table in Supabase with RLS; upsert via `supabase.from('profiles').upsert()` |
| PROF-02 | Profile photo is optional — platform works without avatar | Initials placeholder (amber circle, first char of display_name); avatar upload to Supabase Storage `avatars` bucket; avatar_url stored on profiles row |
</phase_requirements>

---

## Summary

Phase 1 builds identity entirely in vanilla HTML/CSS/JS backed by Supabase. The stack requires no build tools — supabase-js v2 loads from CDN as an ES module. Supabase Auth handles signup, login, logout, session persistence (localStorage), token refresh, and password reset emails out of the box. A `public.profiles` table stores display name, bio, and optional avatar_url, linked to `auth.users` via foreign key and protected by RLS. Supabase Storage holds avatar images under per-user folders.

The critical routing challenge is multi-page auth guarding in a static HTML app: every protected page must call `supabase.auth.getSession()` on load and redirect if no session exists. The onboarding redirect (signup → profile-setup) is handled by checking whether the profiles row has a `display_name` after login. Avatar uploads use a standard upsert pattern to the `avatars` bucket with path `{user_id}/avatar`.

**Primary recommendation:** Use supabase-js v2 via ES module CDN import, a dedicated `profiles` table with RLS, a Supabase Storage `avatars` bucket, and a shared `supabase.js` module across all HTML pages. Implement auth guards as a one-liner at the top of each protected page.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | v2 (latest) | Auth, DB queries, Storage | Official Supabase JS client — handles auth, Postgres queries, storage, realtime |
| Vanilla HTML/CSS/JS | — | UI pages | Project constraint; no framework |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase Auth (built into client) | v2 | Session management, token refresh | Always — handles all auth lifecycle |
| Supabase Storage (built into client) | v2 | Avatar image uploads | Profile setup step when user uploads avatar |
| Supabase Postgres RLS | — | Row-level security policies | Required on `profiles` table and `storage.objects` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth | Firebase Auth / Auth0 | Locked decision — Supabase chosen |
| Supabase Storage for avatars | Cloudinary / external service | Supabase Storage keeps everything in one platform, no extra accounts |
| Separate profiles table | `raw_user_meta_data` only | Table approach enables future JOIN queries, proper RLS, and indexing |

**Installation (CDN — no npm/build needed):**
```html
<!-- In each HTML page that needs Supabase -->
<script type="module" src="/js/app.js"></script>
```

```javascript
// js/supabase.js — shared module imported by all pages
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabase = createClient(
  'https://YOUR_PROJECT_REF.supabase.co',
  'YOUR_ANON_KEY'
)
```

---

## Architecture Patterns

### Recommended Project Structure

```
/
├── index.html              # Landing page (already exists)
├── login.html              # AUTH-02, AUTH-03
├── signup.html             # AUTH-01
├── profile-setup.html      # PROF-01, PROF-02 (post-signup onboarding)
├── update-password.html    # AUTH-04 (password reset landing)
├── forgot-password.html    # AUTH-04 (request reset email)
├── js/
│   ├── supabase.js         # Shared client — createClient() export
│   ├── auth-guard.js       # Shared auth check (redirect if no session)
│   ├── login.js            # Login page logic
│   ├── signup.js           # Signup page logic
│   ├── profile-setup.js    # Profile setup logic + avatar upload
│   └── update-password.js  # PASSWORD_RECOVERY handler + updateUser
└── favicon.svg             # Already exists
```

### Pattern 1: Shared Supabase Client (ES Module)

**What:** A single `supabase.js` file creates and exports the client. Every page imports from it — one client instance, one localStorage session.

**When to use:** Always in this project.

```javascript
// Source: https://supabase.com/docs/reference/javascript/installing
// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabase = createClient(
  'https://YOUR_PROJECT_REF.supabase.co',
  'YOUR_ANON_KEY'
  // autoRefreshToken: true (default), persistSession: true (default)
)
```

### Pattern 2: Auth Guard (Client-Side Page Protection)

**What:** Every protected page runs a session check at the top of its script. If no session, redirect to `/login.html`.

**When to use:** Any page that requires authentication (profile-setup, app pages).

```javascript
// Source: https://supabase.com/docs/reference/javascript/auth-getsession
// js/auth-guard.js
import { supabase } from './supabase.js'

export async function requireAuth(redirectTo = '/login.html') {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.href = redirectTo
    return null
  }
  return session
}

export async function redirectIfAuth(redirectTo = '/app.html') {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    window.location.href = redirectTo
  }
}
```

**Note on getSession vs getUser:** For client-side guards, `getSession()` is appropriate — it reads from localStorage without a server round-trip. `getUser()` makes a network call and is reserved for security-critical server-side validation. Since this is a client-rendered static app, `getSession()` is the correct choice.

### Pattern 3: Signup + Onboarding Redirect

**What:** After `signUp()` succeeds, redirect to `/profile-setup.html`. On profile-setup, check whether the user already has a `display_name` (returning user who skipped) and route accordingly.

```javascript
// Source: https://supabase.com/docs/guides/auth/passwords
// js/signup.js
import { supabase } from './supabase.js'

async function handleSignup(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://mixmomnt.com/login.html'
    }
  })
  if (error) return showError(error.message)
  // If email confirmation disabled: data.session is present → redirect immediately
  // If email confirmation enabled: data.session is null → show "check your email" message
  if (data.session) {
    window.location.href = '/profile-setup.html'
  } else {
    showMessage('Check your email to confirm your account.')
  }
}
```

### Pattern 4: Password Reset (Two-Page Flow)

**What:** `/forgot-password.html` collects the email and calls `resetPasswordForEmail()`. User gets an email link pointing to `/update-password.html`. That page listens for the `PASSWORD_RECOVERY` auth event, then calls `updateUser()`.

```javascript
// Source: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
// js/forgot-password.js
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://mixmomnt.com/update-password.html'
})

// Source: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
// js/update-password.js
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    const newPassword = document.getElementById('new-password').value
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) showError(error.message)
    else window.location.href = '/login.html'
  }
})
```

**Critical setup:** Add `https://mixmomnt.com/update-password.html` to Redirect URLs in the Supabase dashboard under Authentication > URL Configuration.

### Pattern 5: Profiles Table + Trigger

**What:** A `public.profiles` table, auto-populated on signup via a database trigger, holds display_name, bio, avatar_url.

```sql
-- Source: https://supabase.com/docs/guides/auth/managing-user-data
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text,
  bio         text,
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS policies
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

### Pattern 6: Avatar Upload to Supabase Storage

**What:** User picks a file → upload to `avatars/{user_id}/avatar` with upsert → store public URL on profile row.

```javascript
// Source: https://supabase.com/docs/reference/javascript/storage-from-upload
async function uploadAvatar(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' })

  if (uploadError) return { error: uploadError }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: data.publicUrl }
}
```

**Storage bucket setup (Supabase dashboard):**
1. Create bucket named `avatars`
2. Set bucket to **public** (enables `getPublicUrl` without signed URLs)
3. Add RLS policies (see below)

```sql
-- Source: https://supabase.com/docs/guides/storage/security/access-control
-- INSERT: users can only upload to their own folder
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: anyone can read (public bucket)
create policy "Public read avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- UPDATE + DELETE: users manage own folder only
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Pattern 7: Initials Avatar Placeholder

**What:** When `avatar_url` is null, render a CSS circle with the first character of `display_name` in amber. Matches the `.avi` pattern already established in `index.html`.

```html
<!-- Reuses existing pattern from landing page -->
<div class="avi avi-am" aria-label="Avatar for [name]">T</div>
```

```javascript
function renderAvatar(profile) {
  if (profile.avatar_url) {
    return `<img src="${profile.avatar_url}" alt="${profile.display_name}" class="avi" />`
  }
  const initial = (profile.display_name || '?')[0].toUpperCase()
  return `<div class="avi avi-am" aria-hidden="true">${initial}</div>`
}
```

### Anti-Patterns to Avoid

- **Storing credentials client-side:** Never store the Supabase anon key in a separate config file that's gitignored and deployed — the anon key is public; what protects data is RLS.
- **Skipping RLS:** Do NOT expose the `profiles` table without RLS. Without policies, any authenticated user can read/write all profiles.
- **Multiple supabase client instances:** Import from a single shared `supabase.js` module only. Multiple `createClient()` calls fragment the session state.
- **Using `getUser()` as an auth guard in client-side code:** It makes a network call on every page load. Use `getSession()` for client-side guards; `getUser()` is for server-side validation.
- **Blocking UI on auth check:** Show a loading state during the async `getSession()` call; don't leave the page blank.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence | Custom localStorage/cookie token storage | Supabase client (default persistSession: true) | Token refresh, expiry, PKCE — all handled |
| Token refresh | Manual `setInterval` refresh logic | Supabase client (default autoRefreshToken: true) | Race conditions, edge cases — already solved |
| Password reset email | Custom email sending + token generation | `supabase.auth.resetPasswordForEmail()` | Secure tokens, expiry, email templates managed by Supabase |
| Email confirmation | Custom confirm-token pages | Supabase handles the email link + callback | Deep auth states in the client library |
| Password hashing | Manual bcrypt calls | Supabase Auth server (never touches client) | Passwords never sent to or stored by supabase-js |
| RLS bypass for profiles | Reading `auth.users` directly | `public.profiles` table with proper RLS | `auth.users` is not accessible from the client; profiles table is the correct pattern |

**Key insight:** Supabase Auth is a complete auth server. The client library's job is to call it, not replace any part of it. Every auth concern (tokens, refresh, reset emails, confirmation) belongs to Supabase, not to custom code.

---

## Common Pitfalls

### Pitfall 1: Email Confirmation — Session is Null After Signup

**What goes wrong:** Developer calls `signUp()`, checks `data.session`, finds `null`, and assumes signup failed.

**Why it happens:** By default on hosted Supabase projects, email confirmation is enabled. The user must click the confirmation email before a session is issued. `signUp()` returns `{ user, session: null }` in this state.

**How to avoid:** Check `data.user` (not `data.session`) to confirm signup succeeded. Show a "check your email" message. Handle both states: `session !== null` (confirmation disabled) → redirect immediately; `session === null` → show message.

**Warning signs:** Signup "succeeds" in the console but the user can't log in.

### Pitfall 2: Redirect URL Not Configured in Dashboard

**What goes wrong:** Password reset email sends users to a URL that Supabase rejects as unauthorized — users get an error clicking the reset link.

**Why it happens:** Supabase validates `redirectTo` against an allowlist in Authentication > URL Configuration > Redirect URLs.

**How to avoid:** Add every `redirectTo` URL (including `localhost:*` for development) to the Redirect URLs list before testing.

**Warning signs:** "Redirect URI not allowed" error or a broken password reset link.

### Pitfall 3: Storage 403 on Avatar Upload

**What goes wrong:** `upload()` returns a 403 Unauthorized error despite the user being logged in.

**Why it happens:** Supabase Storage buckets have no RLS policies by default — all uploads are blocked. The bucket also needs the INSERT policy before any upload works.

**How to avoid:** Create the INSERT RLS policy on `storage.objects` before testing uploads. Use `(storage.foldername(name))[1] = auth.uid()::text` to scope to user's folder.

**Warning signs:** 403 on the first upload attempt; the bucket exists but the policy table is empty.

### Pitfall 4: profiles Row Not Created at Signup

**What goes wrong:** User signs up, tries to access their profile, gets no data back from the `profiles` table query.

**Why it happens:** The database trigger `on_auth_user_created` hasn't been created, or was created incorrectly and silently failed.

**How to avoid:** Verify the trigger exists in the Supabase Dashboard under Database > Functions and Triggers. Test by creating a test user and immediately querying `profiles`.

**Warning signs:** `profiles` table is empty after user creation; no error thrown on signup.

### Pitfall 5: Multi-Page Session State Inconsistency

**What goes wrong:** User is logged in on page A but appears logged out on page B.

**Why it happens:** Multiple `createClient()` calls across pages create separate instances each reading localStorage independently — but token refresh on one instance doesn't propagate to the other.

**How to avoid:** Import a single shared `supabase.js` module. In an HTML module context (`<script type="module">`), ES module instances are cached per origin — all pages share the same singleton.

**Warning signs:** Session appears valid on login page but undefined on the next page.

### Pitfall 6: Initials Placeholder Breaks for Empty Display Name

**What goes wrong:** During profile-setup, before a display name is entered, `display_name[0]` throws or renders an empty circle.

**Why it happens:** `display_name` is null or empty string; `.toUpperCase()[0]` returns `undefined`.

**How to avoid:** Always default: `(profile.display_name || '?')[0].toUpperCase()`. Show the `?` initials avatar until the form is submitted.

**Warning signs:** Blank amber circles or JS errors on the profile-setup page.

---

## Code Examples

Verified patterns from official sources:

### Initialize Supabase Client

```javascript
// Source: https://supabase.com/docs/reference/javascript/installing
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabase = createClient(
  'https://YOUR_PROJECT_REF.supabase.co',
  'YOUR_ANON_KEY'
  // Defaults: persistSession: true, autoRefreshToken: true
)
```

### Sign Up

```javascript
// Source: https://supabase.com/docs/guides/auth/passwords
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'strongpassword',
  options: { emailRedirectTo: 'https://mixmomnt.com/login.html' }
})
// data.session === null if email confirmation required
// data.session !== null if confirmation disabled
```

### Sign In

```javascript
// Source: https://supabase.com/docs/guides/auth/passwords
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'strongpassword'
})
if (error) showError(error.message)
else window.location.href = '/profile-setup.html' // or /feed if profile complete
```

### Sign Out

```javascript
// Source: https://supabase.com/docs/reference/javascript/auth-signout
const { error } = await supabase.auth.signOut()
window.location.href = '/login.html'
```

### Auth State Listener (for PASSWORD_RECOVERY)

```javascript
// Source: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    // Show new password form — session is active
    showNewPasswordForm()
  }
  if (event === 'SIGNED_OUT') {
    window.location.href = '/login.html'
  }
})
```

### Upsert Profile

```javascript
// Source: https://supabase.com/docs/guides/auth/managing-user-data
const { data: { session } } = await supabase.auth.getSession()
const { error } = await supabase.from('profiles').upsert({
  id: session.user.id,
  display_name: displayNameValue,
  bio: bioValue,
  avatar_url: avatarUrl ?? null
})
```

### Upload Avatar + Get Public URL

```javascript
// Source: https://supabase.com/docs/reference/javascript/storage-from-upload
const { error: uploadError } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file, { upsert: true, cacheControl: '3600' })

const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar.jpg`)
const publicUrl = data.publicUrl
```

### Check Profile Completeness (Post-Login Redirect)

```javascript
// After signInWithPassword succeeds
const { data: { session } } = await supabase.auth.getSession()
const { data: profile } = await supabase
  .from('profiles')
  .select('display_name')
  .eq('id', session.user.id)
  .single()

if (!profile?.display_name) {
  window.location.href = '/profile-setup.html'
} else {
  window.location.href = '/feed.html'
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| supabase-js v1 (global `window.supabase`) | supabase-js v2 (ES module, `createClient`) | 2022 | v2 is the current standard; v1 is deprecated |
| `supabase.auth.session()` | `supabase.auth.getSession()` async | v2 release | Must `await` the call now |
| `supabase.auth.user()` | `supabase.auth.getUser()` async | v2 release | Must `await`; getUser() makes server call |
| Script tag global CDN | `<script type="module">` + ES module CDN | 2022 | Module scope prevents global pollution |

**Deprecated/outdated:**
- `supabase.auth.session()` (sync): Removed in v2 — use `await supabase.auth.getSession()`
- `supabase.auth.user()` (sync): Removed in v2 — use `await supabase.auth.getUser()`
- `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@1">`: v1 CDN — do not use

---

## Open Questions

1. **Email confirmation enabled or disabled for development?**
   - What we know: Hosted Supabase projects have email confirmation enabled by default; this changes the signup flow (session is null immediately after signup)
   - What's unclear: The project owner's preference — confirm required (more secure) or disabled for fast iteration in early development
   - Recommendation: Plan for confirmation enabled (production-correct behavior). Handle both the `session !== null` and `session === null` states in the signup page. Consider disabling during development only.

2. **Supabase project credentials and URL**
   - What we know: No Supabase project has been created yet (phase is in planning)
   - What's unclear: Whether the project will be created during Wave 0 of this phase or as a prerequisite
   - Recommendation: Include Supabase project creation as the first task in Wave 0. The `supabase.js` shared client needs the project URL and anon key before any other code can run. Use a `.env` file or `js/config.js` (gitignored) for credentials.

3. **Profile setup required vs skippable**
   - What we know: Display name is required per PROF-01; avatar and bio are optional
   - What's unclear: Whether a user who closes the profile-setup page can still access the app in a broken state (no display_name)
   - Recommendation: Profile-setup should be a hard gate: `requireAuth()` guard on the page, plus redirect back to profile-setup from any app page if `display_name` is missing. Treat it as part of the auth flow, not an optional settings page.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — plain HTML/JS project, no test runner configured |
| Config file | None — Wave 0 must create |
| Quick run command | `open login.html` (manual browser test until test runner added) |
| Full suite command | TBD — recommend adding Playwright for e2e or manual smoke checklist |

**Note:** This is a plain HTML/JS project with no package.json or test infrastructure. Automated testing for auth flows typically uses browser automation (Playwright or Cypress). Given the project's no-build-tools philosophy, a manual smoke checklist per wave is the pragmatic approach. The planner should decide whether to introduce a lightweight test runner or rely on structured manual verification.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | User signs up with email/password | manual-smoke | Open signup.html, submit form | ❌ Wave 0 |
| AUTH-02 | Session persists across page refresh | manual-smoke | Login, refresh, verify session | ❌ Wave 0 |
| AUTH-03 | Logout clears session | manual-smoke | Logout, verify redirect to login | ❌ Wave 0 |
| AUTH-04 | Password reset email received and working | manual-smoke | Submit email, click link, update password | ❌ Wave 0 |
| PROF-01 | Profile with display name + bio saves | manual-smoke | Submit profile-setup form, verify in Supabase dashboard | ❌ Wave 0 |
| PROF-02 | Platform shows initials when no avatar | manual-smoke | Complete profile without uploading avatar | ❌ Wave 0 |

**Manual-only justification:** AUTH-04 (password reset) requires receiving a real email — inherently manual. AUTH-01 (signup) requires email confirmation in some configurations — also manual. For a static HTML project, manual smoke testing per auth flow is the correct approach at this stage.

### Sampling Rate

- **Per task commit:** Open the affected page in browser, verify the primary flow works
- **Per wave merge:** Run through the full manual smoke checklist for all 6 requirements
- **Phase gate:** All 6 manual smoke tests pass before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `js/supabase.js` — shared client (requires Supabase project URL + anon key)
- [ ] Supabase project created, credentials available
- [ ] `js/config.js` (gitignored) — stores SUPABASE_URL and SUPABASE_ANON_KEY
- [ ] Supabase `profiles` table + trigger created via SQL editor in dashboard
- [ ] Supabase `avatars` storage bucket created + RLS policies applied
- [ ] Redirect URLs configured in Supabase dashboard

---

## Sources

### Primary (HIGH confidence)
- `https://supabase.com/docs/guides/auth/passwords` — signUp, signInWithPassword, resetPasswordForEmail, updateUser API
- `https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail` — PASSWORD_RECOVERY event, two-step reset flow
- `https://supabase.com/docs/guides/auth/managing-user-data` — profiles table schema, trigger for auto-create, RLS policies
- `https://supabase.com/docs/reference/javascript/installing` — CDN URLs (jsdelivr and unpkg), ES module import pattern
- `https://supabase.com/docs/guides/storage/security/access-control` — storage.foldername() helper, INSERT/SELECT/UPDATE/DELETE RLS policy patterns
- `https://supabase.com/docs/reference/javascript/storage-from-upload` — upload() method signature, getPublicUrl() method

### Secondary (MEDIUM confidence)
- `https://supabase.com/docs/reference/javascript/auth-getsession` — getSession() docs; community discussion on getSession vs getUser client-side (verified multiple sources agree on: getSession for client guards)
- `https://supabase.com/docs/reference/javascript/auth-onauthstatechange` — onAuthStateChange events including PASSWORD_RECOVERY
- WebSearch: confirmed CDN ESM import pattern `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm` (multiple community sources consistent with official docs)

### Tertiary (LOW confidence)
- Community pattern: checking `profile.display_name` after login to gate profile-setup redirect (logical inference from docs, not explicitly documented — LOW)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Supabase official docs verified, CDN URLs confirmed
- Architecture: HIGH — all patterns derived from official Supabase docs
- Pitfalls: HIGH — pitfalls 1-4 sourced from official docs and community reports; pitfalls 5-6 verified by logic from source material
- Validation architecture: MEDIUM — no test infrastructure exists yet; recommendations are pragmatic for a no-build-tools project

**Research date:** 2026-03-11
**Valid until:** 2026-06-11 (Supabase JS v2 is stable; Auth APIs change slowly)
