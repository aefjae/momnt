// js/auth-guard.js
// Auth guard utilities for client-side page protection.
// requireAuth() — for protected pages (profile-setup, app pages)
// redirectIfAuth() — for public auth pages (login, signup) to skip if already logged in
import { supabase } from './supabase.js'

/**
 * Redirect to login if no active session.
 * Also checks if profile is complete (has display_name).
 * If logged in but profile incomplete, redirects to profile-setup.
 * @param {string} redirectTo - Where to send unauthenticated users
 * @returns {Promise<import('@supabase/supabase-js').Session|null>}
 */
export async function requireAuth(redirectTo = '/login.html') {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.href = redirectTo
    return null
  }
  return session
}

/**
 * Redirect away from auth pages if user is already logged in.
 * Checks profile completeness to decide where to send them.
 * @param {string} redirectTo - Where to send authenticated users
 */
export async function redirectIfAuth(redirectTo = '/profile-setup.html') {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  // If they have a display_name, they've completed setup — go to feed (placeholder for now)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.display_name) {
    window.location.href = '/feed.html'  // Phase 3 destination; placeholder for now
  } else {
    window.location.href = '/profile-setup.html'
  }
}

/**
 * Sign out the current user and redirect to /login.html.
 * AUTH-03 — call this from any page's "Log out" button.
 * Usage: import { logout } from '/js/auth-guard.js'
 */
export async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/login.html'
}

/**
 * Render an avatar element: <img> if avatar_url exists, amber initials circle otherwise.
 * Guards against empty display_name with '?' fallback.
 * @param {{ display_name: string|null, avatar_url: string|null }} profile
 * @returns {string} HTML string
 */
export function renderAvatar(profile) {
  if (profile?.avatar_url) {
    return `<img src="${profile.avatar_url}" alt="${profile.display_name ?? 'Avatar'}" class="avi" />`
  }
  const initial = (profile?.display_name || '?')[0].toUpperCase()
  return `<div class="avi avi-am" aria-hidden="true">${initial}</div>`
}
