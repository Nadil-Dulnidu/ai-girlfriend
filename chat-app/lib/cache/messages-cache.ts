import { redis } from "./redis";
import { getMessages as getFromDb } from "@/lib/db/messages";
import type { Message } from "@/types/db";

const TTL = parseInt(process.env.CACHE_TTL_MESSAGES ?? "120", 10);

function key(conversationId: string) {
  return `messages:${conversationId}`;
}

/**
 * Cache-aside read for recent messages.
 * Hit → return parsed. Miss → query DB → cache → return.
 */
export async function getCachedMessages(
  conversationId: string,
  userId: string,
  limit?: number
): Promise<Message[]> {
  try {
    const cached = await redis.get<Message[]>(key(conversationId));
    if (cached) return cached;
  } catch {
    // Redis failure is non-fatal; fall through to DB
  }

  const messages = await getFromDb(conversationId, userId, limit);

  try {
    await redis.set(key(conversationId), messages, { ex: TTL });
  } catch {
    // Cache write failure is non-fatal
  }

  return messages;
}

/**
 * Invalidate cached messages for a conversation (call after save).
 */
export async function invalidateMessagesCache(
  conversationId: string
): Promise<void> {
  try {
    await redis.del(key(conversationId));
  } catch {
    // Non-fatal
  }
}
