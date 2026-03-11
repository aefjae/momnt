// js/signup.js
// Signup page handler — AUTH-01
// Creates new accounts via supabase.auth.signUp().
// Handles both email-confirmation-required and instant-session paths.
import { supabase } from './supabase.js'
import { redirectIfAuth } from './auth-guard.js'

const form = document.getElementById('signup-form')
const submitBtn = document.getElementById('submit-btn')
const globalError = document.getElementById('global-error')
const successMsg = document.getElementById('success-msg')

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
  clearFieldError('confirm-error')
  globalError.textContent = ''
  globalError.classList.remove('show')
}

function showGlobalError(message) {
  globalError.textContent = message
  globalError.classList.add('show')
}

// ── Auth check ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // If already logged in, redirect away (prevents double-login)
  await redirectIfAuth()

  // Reveal page only after auth check resolves
  document.body.classList.remove('page-loading')
})

// ── Form submit ──────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearAllErrors()

  const email = form.email.value.trim()
  const password = form.password.value
  const confirmPassword = form['confirm-password'].value

  // ── Client-side validation ──
  let hasError = false

  if (!email) {
    showFieldError('email-error', 'Email is required.')
    hasError = true
  }

  if (password.length < 8) {
    showFieldError('password-error', 'Password must be at least 8 characters.')
    hasError = true
  }

  if (password !== confirmPassword) {
    showFieldError('confirm-error', 'Passwords do not match.')
    hasError = true
  }

  if (hasError) return

  // ── Submit ──
  submitBtn.disabled = true
  submitBtn.textContent = 'Creating...'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://mixmomnt.com/login.html',
    },
  })

  if (error) {
    showGlobalError(error.message)
    submitBtn.disabled = false
    submitBtn.textContent = 'Create account'
    return
  }

  // data.session is set when email confirmation is disabled (instant access)
  // data.session is null when email confirmation is required
  if (data.session) {
    // Instant session — go straight to profile setup
    window.location.href = '/profile-setup.html'
  } else {
    // Email confirmation required — show message, hide form
    form.style.display = 'none'
    successMsg.classList.add('show')
  }
})
