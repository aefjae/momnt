// js/profile-setup.js
// PROF-01: display name + bio upsert
// PROF-02: optional avatar upload to Supabase Storage; initials fallback when no avatar
import { supabase } from './supabase.js'
import { requireAuth } from './auth-guard.js'

// ── DOM refs ──────────────────────────────────────────────────────────────────
const form          = document.getElementById('profile-form')
const displayInput  = document.getElementById('display-name')
const displayError  = document.getElementById('display-name-error')
const bioInput      = document.getElementById('bio')
const charCount     = document.getElementById('char-count')
const submitBtn     = document.getElementById('submit-btn')
const globalError   = document.getElementById('global-error')
const avatarInput   = document.getElementById('avatar-input')
let   avatarPreview = document.getElementById('avatar-preview')

// Track whether user has picked a new file this session
let currentAvatarFile = null
// Track existing avatar url (for returning users)
let existingAvatarUrl = null

// ── Helpers ───────────────────────────────────────────────────────────────────

function showGlobalError(msg) {
  globalError.textContent = msg
  globalError.classList.add('show')
}

function clearGlobalError() {
  globalError.textContent = ''
  globalError.classList.remove('show')
}

function showFieldError(el, msg) {
  el.textContent = msg
  el.classList.add('show')
}

function clearFieldError(el) {
  el.textContent = ''
  el.classList.remove('show')
}

/** Update the initials circle text. Uses '?' fallback for empty input. */
function setInitialsPreview(value) {
  const initial = (value || '?')[0].toUpperCase()
  // Replace any <img> with the initials div
  if (avatarPreview.tagName === 'IMG') {
    const div = document.createElement('div')
    div.id = 'avatar-preview'
    div.setAttribute('aria-live', 'polite')
    div.setAttribute('aria-label', 'Avatar preview')
    div.style.cssText = [
      'width:64px', 'height:64px', 'border-radius:50%',
      'background:rgba(245,158,11,0.14)', 'color:var(--amber)',
      'font-size:1.4rem', 'font-weight:700',
      'display:flex', 'align-items:center', 'justify-content:center',
      'overflow:hidden', 'pointer-events:none',
    ].join(';')
    div.textContent = initial
    avatarPreview.replaceWith(div)
    avatarPreview = div
  } else {
    avatarPreview.textContent = initial
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Auth gate — redirect to /login.html if no session
  const session = await requireAuth()
  if (!session) return  // requireAuth() already redirected

  const userId = session.user.id

  // 2. Load existing profile (returning user pre-population)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url')
    .eq('id', userId)
    .single()

  if (profile?.display_name) {
    // Returning user — pre-populate fields
    displayInput.value = profile.display_name
    bioInput.value     = profile.bio ?? ''
    charCount.textContent = `${bioInput.value.length}/160`
    existingAvatarUrl     = profile.avatar_url ?? null

    if (profile.avatar_url) {
      // Show existing avatar as <img>
      const img = document.createElement('img')
      img.src   = profile.avatar_url
      img.alt   = 'Your avatar preview'
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;'
      avatarPreview.innerHTML = ''
      avatarPreview.appendChild(img)
    } else {
      // Show initials from existing display_name
      setInitialsPreview(profile.display_name)
    }
  } else {
    // New user — show '?' placeholder
    setInitialsPreview('')
  }

  // 3. Reveal page now that auth check and data load are done
  document.body.classList.remove('page-loading')

  // ── Live initials update while user types ────────────────────────────────
  displayInput.addEventListener('input', () => {
    // Only update initials when user hasn't picked a file and has no existing avatar
    if (!currentAvatarFile && !existingAvatarUrl) {
      setInitialsPreview(displayInput.value)
    }
  })

  // ── Bio character count ──────────────────────────────────────────────────
  bioInput.addEventListener('input', () => {
    charCount.textContent = `${bioInput.value.length}/160`
  })

  // ── File picker: client-side preview before upload ───────────────────────
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    currentAvatarFile = file

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = document.createElement('img')
      img.src   = ev.target.result
      img.alt   = 'Your avatar preview'
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;'

      // Replace whatever is currently in the preview with the image
      avatarPreview.innerHTML = ''
      avatarPreview.appendChild(img)
    }
    reader.readAsDataURL(file)
  })

  // ── Form submit ──────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearGlobalError()
    clearFieldError(displayError)

    const displayName = displayInput.value.trim()
    const bio         = bioInput.value.trim()

    // Validate display name
    if (!displayName) {
      showFieldError(displayError, 'Display name is required.')
      displayInput.focus()
      return
    }

    // Disable button while saving
    submitBtn.disabled = true
    submitBtn.textContent = 'Saving...'

    let avatarUrl = existingAvatarUrl  // keep existing unless new file picked

    // Upload avatar if user picked a file
    if (currentAvatarFile) {
      const ext  = currentAvatarFile.name.split('.').pop().toLowerCase()
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, currentAvatarFile, { upsert: true, cacheControl: '3600' })

      if (uploadError) {
        showGlobalError(`Avatar upload failed: ${uploadError.message}`)
        submitBtn.disabled = false
        submitBtn.textContent = 'Save profile'
        return
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)
      avatarUrl = urlData?.publicUrl ?? null
    }

    // Upsert profile row
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id:           userId,
        display_name: displayName,
        bio:          bio || null,
        avatar_url:   avatarUrl ?? null,
      })

    if (upsertError) {
      showGlobalError(`Could not save profile: ${upsertError.message}`)
      submitBtn.disabled = false
      submitBtn.textContent = 'Save profile'
      return
    }

    // Success — redirect to feed (Phase 3 destination; 404 is expected until then)
    window.location.href = '/feed.html'
  })
})
