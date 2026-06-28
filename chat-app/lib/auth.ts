import { auth } from "@clerk/nextjs/server";

/**
 * Resolves the authenticated userId from the Clerk session.
 * Throws a Response with 401 if unauthenticated.
 * Use in API route handlers and server components.
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized", code: "UNAUTHENTICATED" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return userId;
}

/**
 * Gets the Clerk session token for Supabase auth bridging.
 * Returns the token string or null if unavailable.
 */
export async function getSupabaseToken(): Promise<string | null> {
  const { getToken } = await auth();
  return getToken({ template: "supabase" });
}
