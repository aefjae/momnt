// js/login.js
// Login page handler — AUTH-02
// Signs in via supabase.auth.signInWithPassword() then routes based on profile completeness.
import { supabase } from './supabase.js'
import { redirectIfAuth } from './auth-guard.js'

const form = document.getElementById('login-form')
const submitBtn = document.getElementById('submit-btn')
const globalError = document.getElementById('global-error')

// ── Field error helpers ──────────────────────────────────────────────────────
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

function clearAllErrors() {
  clearFieldError('email-error')
  clearFieldError('password-error')
  globalError.textContent = ''
  globalError.classList.remove('show')
}

function showGlobalError(message) {
  globalError.textContent = message
  globalError.classList.add('show')
}

// ── Auth check ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // If already logged in, redirect away (prevents visiting login while authenticated)
  await redirectIfAuth()

  // Reveal page after auth check
  document.body.classList.remove('page-loading')
})

// ── Form submit ──────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearAllErrors()

  const email = form.email.value.trim()
  const password = form.password.value

  // ── Client-side validation ──
  let hasError = false

  if (!email) {
    showFieldError('email-error', 'Email is required.')
    hasError = true
  }

  if (!password) {
    showFieldError('password-error', 'Password is required.')
    hasError = true
  }

  if (hasError) return

  // ── Submit ──
  submitBtn.disabled = true
  submitBtn.textContent = 'Logging in...'

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    showGlobalError(error.message)
    submitBtn.disabled = false
    submitBtn.textContent = 'Log in'
    return
  }

  // ── Profile completeness routing (AUTH-02 + profile-setup gate) ──
  // Check if this user has completed profile setup (display_name set)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', data.session.user.id)
    .single()

  if (profile?.display_name) {
    // Profile complete — send to feed (Phase 3 placeholder; page may not exist yet)
    window.location.href = '/feed.html'
  } else {
    // Profile incomplete — send to profile setup
    window.location.href = '/profile-setup.html'
  }
})
