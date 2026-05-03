import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'

// Client for use in browser/client components (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for use in API routes only (service role key — never import in client components)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
