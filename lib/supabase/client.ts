import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Creates a Supabase client for use in the browser.
 * @returns The Supabase browser client.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
