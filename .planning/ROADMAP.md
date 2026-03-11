# Roadmap: Mixmomnt

## Overview

Three phases take Mixmomnt from zero to a live social platform for sound creators. Phase 1 establishes identity — users can securely create accounts and build profiles without requiring a face. Phase 2 delivers the core creative act — posting audio moments with photos, captions, and tags. Phase 3 closes the social loop — feeds, inline audio playback, and engagement. Each phase is independently verifiable before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Identity** - Users can create accounts and profiles (no face required)
- [ ] **Phase 2: Creation** - Users can create, edit, and delete audio-moment posts
- [ ] **Phase 3: Social** - Users can discover, play, and engage with the feed

## Phase Details

### Phase 1: Identity
**Goal**: Users can securely exist on the platform with an optional-face profile
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, PROF-01, PROF-02
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password and receive a working account
  2. User can log in and remain logged in across browser sessions (page refresh, new tab)
  3. User can log out from any page and be returned to a logged-out state
  4. User can reset a forgotten password via an email link and regain access
  5. User can create a profile with display name and bio — avatar is optional and the platform works without one
**Plans**: 5 plans

Plans:
- [ ] 01-01-PLAN.md — Supabase backend provisioning + js/config.js (human action gate)
- [ ] 01-02-PLAN.md — Shared JS foundation: js/supabase.js, js/auth-guard.js, css/app.css
- [ ] 01-03-PLAN.md — Auth pages: signup, login, forgot-password, update-password (AUTH-01–04)
- [ ] 01-04-PLAN.md — Profile setup page: display name, bio, optional avatar with initials fallback (PROF-01–02)
- [ ] 01-05-PLAN.md — Phase smoke test checkpoint: all 6 requirements verified manually

### Phase 2: Creation
**Goal**: Users can create, edit, and delete posts that combine a photo and/or audio with a caption and tags
**Depends on**: Phase 1
**Requirements**: POST-01, POST-02, POST-03, POST-04, POST-05, POST-06, PROF-03, PROF-04, PROF-05
**Success Criteria** (what must be TRUE):
  1. User can create a post with a photo and caption, with or without an audio clip
  2. User can create an audio-only post (no photo required)
  3. User can attach an MP3 or WAV clip to a post and it is stored and retrievable
  4. User can tag a post with mood, vibe, or genre and edit or delete the post later
  5. User can view another creator's profile page and see their posts, then follow or unfollow them
**Plans**: TBD

### Phase 3: Social
**Goal**: Users can discover posts in a feed, play audio inline, and leave reactions and comments
**Depends on**: Phase 2
**Requirements**: FEED-01, FEED-02, FEED-03, FEED-04, ENG-01, ENG-02, ENG-03
**Success Criteria** (what must be TRUE):
  1. User sees a chronological feed of posts from creators they follow
  2. User can browse a discovery feed of posts from all creators and filter it by tag
  3. User can play an audio clip inline within the feed without leaving or reloading the page
  4. User can react to a post (listen acknowledgement / like) and the count updates visibly
  5. User can comment on a post and delete their own comments
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Identity | 1/5 | In Progress|  |
| 2. Creation | 0/TBD | Not started | - |
| 3. Social | 0/TBD | Not started | - |
