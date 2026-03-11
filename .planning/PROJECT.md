# Mixmomnt

## What This Is

Mixmomnt is a social platform for musicians, sound engineers, producers, and sound creatives to share audio moments — a photo, a caption, and an optional audio clip (MP3/WAV). Think Instagram, but built around sound. Users share specific slices: the mix section they loved, the live solo they nailed, the beat they just made, the cover they've been sitting on. No face required.

## Core Value

Sound creators can share the moments that matter — raw and specific — without the pressure of showing their face or releasing a finished product.

## Requirements

### Validated

- ✓ Waitlist landing page — phase 0 (shipped)

### Active

- [ ] User can create a post with a photo and caption
- [ ] User can attach an optional audio clip (MP3 or WAV) to a post
- [ ] User can post audio-only (no photo required)
- [ ] User can tag posts with mood, vibe, or genre
- [ ] User can view a sound-first feed of posts
- [ ] User can play audio clips inline in the feed
- [ ] User can react and comment on posts
- [ ] User can create a profile (no face/photo required)
- [ ] User can follow other creators
- [ ] User can share a cover without showing their face

### Out of Scope

- Full track uploads / albums — this is moments, not releases
- Video posts — sound and photo only; no video complexity in v1
- Real-time chat / DMs — feed-first for v1
- Monetisation / tipping — future milestone
- Mobile app (iOS/Android) — web-first, mobile later

## Context

- Landing page with waitlist is live at `index.html` — dark, app-ready design using Space Grotesk + Righteous, amber (#f59e0b) + blue (#3b82f6) accent palette on deep black (#0d0d0d) backgrounds
- Design system is established and documented in the landing page — all app screens should follow the same token set (--bg, --surface, --elevated, --border, --amber, --blue, --text, --text-2, --text-3)
- The "no face needed" angle is a core differentiator and should be reflected in UX decisions (optional avatar, audio-identity features)
- Target audience: musicians, sound engineers, producers, sound creatives globally

## Constraints

- **Design**: Must follow the established dark design system from the landing page — no regressions
- **Format**: Web-first; responsive down to 375px mobile
- **Audio**: Support MP3 and WAV natively; audio is always optional on posts
- **Identity**: Profile photos optional — platform must work without face/avatar

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Audio optional on posts | Not everyone has audio every moment; photo+caption is valid | — Pending |
| No face required | Core differentiator — sound is identity | — Pending |
| Web-first, not mobile app | Faster to ship, validate before native investment | — Pending |
| Dark design system | Matches studio/late-night culture of the audience | ✓ Good |

---
*Last updated: 2026-03-11 after initial project setup and landing page build*
