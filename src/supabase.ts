import { createClient } from '@supabase/supabase-js'

// TODO: Bytt til import.meta.env.VITE_SUPABASE_URL osv. når miljøvariabler fungerer i deploy
const url = 'https://wfklkakrogxbhozxhtqd.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indma2xrYWtyb2d4YmhvenhodHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzc3NzIsImV4cCI6MjA2MjcxMzc3Mn0.VFWpg4lovcGy-OUE8D1vRTHH9_E9MY4nTs2ugfccH9I'

export const supabase = createClient(url, key)