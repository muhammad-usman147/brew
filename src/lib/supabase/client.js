import { createBrowserClient } from '@supabase/ssr'

// Use createBrowserClient from @supabase/ssr so the session is stored
// in cookies (readable by middleware) instead of localStorage
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
