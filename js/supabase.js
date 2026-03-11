// js/supabase.js
// Single shared Supabase client — import this everywhere, never create another instance.
// Multiple createClient() calls fragment session state across pages.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
// Defaults active: persistSession: true (localStorage), autoRefreshToken: true
