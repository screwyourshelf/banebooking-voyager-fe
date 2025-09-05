import { createClient } from '@supabase/supabase-js'
import { config } from '@/config'

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.access_token) {
    localStorage.setItem("supabase_token", session.access_token)
  } else {
    localStorage.removeItem("supabase_token")
  }
})
