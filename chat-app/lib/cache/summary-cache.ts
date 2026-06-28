import { redis } from "./redis";

const TTL = parseInt(process.env.CACHE_TTL_SUMMARY ?? "300", 10);

function key(conversationId: string) {
  return `summary:${conversationId}`;
}

/**
 * Get cached summary for a conversation.
 * Returns null on miss (caller should use DB value from conversation row).
 */
export async function getCachedSummary(
  conversationId: string
): Promise<string | null> {
  try {
    return await redis.get<string>(key(conversationId));
  } catch {
    return null;
  }
}

/**
 * Set summary in cache.
 */
export async function setCachedSummary(
  conversationId: string,
  summary: string
): Promise<void> {
  try {
    await redis.set(key(conversationId), summary, { ex: TTL });
  } catch {
    // Non-fatal
  }
}

/**
 * Invalidate cached summary (call after summarization update).
 */
export async function invalidateSummaryCache(
  conversationId: string
): Promise<void> {
  try {
    await redis.del(key(conversationId));
  } catch {
    // Non-fatal
  }
}
