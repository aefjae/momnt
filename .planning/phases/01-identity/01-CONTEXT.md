# Phase 1: Identity - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can securely create accounts and build profiles on Mixmomnt. Covers authentication (sign up, log in, log out, password reset) and profile setup (display name, bio, optional avatar). Feed, posts, and social graph belong to later phases.

</domain>

<decisions>
## Implementation Decisions

### Auth service
- Use Supabase Auth — handles email/password signup, session persistence, and password-reset email out of the box
- No custom auth server; Supabase is the backend for auth in v1

### Auth pages
- Dedicated pages: `/login` and `/signup` (not modals)
- Standard social media pattern — matches Instagram/Twitter conventions users already know
- Pages must follow the established dark design system (--bg, --surface, --border, --amber, --text tokens)

### Onboarding flow
- After signup, route user to a profile setup step before reaching the app
- Profile setup: display name (required), bio (optional), avatar upload (optional)
- Standard social platform pattern — user lands in the app ready to go, not confused about who they are

### Avatar placeholder
- Users with no avatar get an initials-based placeholder (first letter of display name)
- Placeholder styled in amber (#f59e0b) to match brand — not generic grey
- "No face required" must feel intentional, not like a broken state

### Claude's Discretion
- Exact routing structure and page layout
- Form validation UX (inline vs on-submit errors)
- Session persistence mechanism (Supabase handles this)
- Loading/transition states between auth steps
- Mobile layout adjustments within the 375px constraint

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- CSS custom properties from `index.html`: --bg, --surface, --elevated, --border, --border-s, --amber, --amber-h, --blue, --text, --text-2, --text-3
- Fonts already loaded via Google Fonts: Space Grotesk (body), Righteous (headings/logo)
- Button styles (.btn-ghost, .btn-primary pattern) established in landing page

### Established Patterns
- Dark background (#0d0d0d) with layered surfaces (#161616, #1e1e1e)
- Amber accent (#f59e0b) for primary actions; blue (#3b82f6) secondary
- Space Grotesk for UI text, Righteous for brand/heading moments
- Navbar: fixed, 56px height, blurred background, border-bottom

### Integration Points
- New app screens must import/extend the CSS token set from index.html (or a shared CSS file)
- Auth state from Supabase feeds into all subsequent phases — session must be accessible app-wide

</code_context>

<specifics>
## Specific Ideas

- Follow Instagram/Twitter conventions for auth flows — users already know how these work, no surprises
- "No face required" should feel like a feature, not a missing avatar — the initials placeholder should look intentional and branded

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-identity*
*Context gathered: 2026-03-11*
