// js/forgot-password.js
// Password reset request handler — AUTH-04 (part 1)
// Sends a reset email via supabase.auth.resetPasswordForEmail().
// This page is public — no auth check needed.
import { supabase } from './supabase.js'

const form = document.getElementById('forgot-form')
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
  clearFieldError('email-error')
  globalError.textContent = ''
  globalError.classList.remove('show')
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Public page — no auth check. Just remove loading state.
  document.body.classList.remove('page-loading')
})

// ── Form submit ───────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearAllErrors()

  const email = form.email.value.trim()

  if (!email) {
    showFieldError('email-error', 'Email is required.')
    return
  }

  // ── Submit ──
  submitBtn.disabled = true
  submitBtn.textContent = 'Sending...'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://mixmomnt.com/update-password.html',
  })

  if (error) {
    showGlobalError(error.message)
    submitBtn.disabled = false
    submitBtn.textContent = 'Send reset link'
    return
  }

  // Success — hide form, show ambiguous success message (security best practice:
  // don't reveal whether email exists in the system).
  form.style.display = 'none'
  successMsg.classList.add('show')

  // Allow retry after 60 seconds (rate-limit UX, genuine retry still possible)
  setTimeout(() => {
    submitBtn.disabled = false
    submitBtn.textContent = 'Send reset link'
  }, 60_000)
})
