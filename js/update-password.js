// js/update-password.js
// Password reset completion handler — AUTH-04 (part 2)
// Listens for the PASSWORD_RECOVERY auth event from Supabase, then calls
// supabase.auth.updateUser() with the new password.
//
// IMPORTANT: Do NOT parse URL params manually. The Supabase client automatically
// exchanges the hash-fragment token and fires the PASSWORD_RECOVERY event.
import { supabase } from './supabase.js'

const waitingState = document.getElementById('waiting-state')
const expiredState = document.getElementById('expired-state')
const updateForm = document.getElementById('update-form')
const submitBtn = document.getElementById('submit-btn')
const globalError = document.getElementById('global-error')
const successMsg = document.getElementById('success-msg')

// ── Error helpers ─────────────────────────────────────────────────────────────
function showFieldError(id, message) {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = message
  el.classList.add('show')
}

function clearFieldError(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = ''
  el.classList.remove('show')
}

function showGlobalError(message) {
  globalError.textContent = message
  globalError.classList.add('show')
}

function clearAllErrors() {
  clearFieldError('password-error')
  clearFieldError('confirm-error')
  globalError.textContent = ''
  globalError.classList.remove('show')
}

// ── Auth state listener ───────────────────────────────────────────────────────
// Track whether PASSWORD_RECOVERY fired — used by the expiry timeout below
let recoveryReceived = false

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    recoveryReceived = true

    // Hide waiting spinner, show the new-password form
    waitingState.style.display = 'none'
    updateForm.classList.add('show')

    // Page is now meaningful — remove loading state
    document.body.classList.remove('page-loading')
  } else if (event === 'SIGNED_IN' && !recoveryReceived) {
    // Edge case: user somehow signed in on this page without a recovery flow.
    // Redirect them to profile-setup so they're not stranded.
    window.location.href = '/profile-setup.html'
  }
})

// ── Expiry fallback ───────────────────────────────────────────────────────────
// If PASSWORD_RECOVERY hasn't fired after 10 seconds, the link is probably
// expired or the user navigated here without a valid token.
setTimeout(() => {
  if (!recoveryReceived) {
    waitingState.style.display = 'none'
    expiredState.classList.add('show')
    document.body.classList.remove('page-loading')
  }
}, 10_000)

// Always remove page-loading after a short tick so the spinner is visible
// (prevents the page from staying invisible if the event fires instantly)
requestAnimationFrame(() => {
  document.body.classList.remove('page-loading')
})

// ── Form submit ───────────────────────────────────────────────────────────────
updateForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearAllErrors()

  const newPassword = document.getElementById('new-password').value
  const confirmPassword = document.getElementById('confirm-password').value

  // ── Client-side validation ──
  let hasError = false

  if (newPassword.length < 8) {
    showFieldError('password-error', 'Password must be at least 8 characters.')
    hasError = true
  }

  if (newPassword !== confirmPassword) {
    showFieldError('confirm-error', 'Passwords do not match.')
    hasError = true
  }

  if (hasError) return

  // ── Submit ──
  submitBtn.disabled = true
  submitBtn.textContent = 'Updating...'

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    showGlobalError(error.message)
    submitBtn.disabled = false
    submitBtn.textContent = 'Update password'
    return
  }

  // Success — show confirmation, then redirect to login after 2 seconds
  updateForm.style.display = 'none'
  successMsg.classList.add('show')

  setTimeout(() => {
    window.location.href = '/login.html'
  }, 2_000)
})
