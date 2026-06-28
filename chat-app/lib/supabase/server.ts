import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for server components and route handlers.
 *
 * Uses the service role key to bypass RLS on the server side.
 * This is safe because:
 * - All routes are protected by Clerk middleware (auth verified before DB access)
 * - All queries filter explicitly by user_id (data isolation enforced in code)
 * - RLS stays enabled as defense-in-depth
 *
 * To switch to Clerk↔Supabase JWT bridging later:
 * 1. Create a "supabase" JWT template in Clerk (signing key = Supabase JWT secret)
 * 2. Replace this with the @supabase/ssr client using the Clerk token
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
