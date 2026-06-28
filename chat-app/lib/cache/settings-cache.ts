import { redis } from "./redis";
import { getAgentSettings as getFromDb } from "@/lib/db/settings";
import type { AgentSettings } from "@/types/db";

const TTL = parseInt(process.env.CACHE_TTL_SETTINGS ?? "300", 10);

function key(userId: string) {
  return `agent_settings:${userId}`;
}

/**
 * Cache-aside read for agent settings.
 * Hit → return parsed. Miss → query DB → cache → return.
 */
export async function getCachedAgentSettings(
  userId: string
): Promise<AgentSettings> {
  try {
    const cached = await redis.get<AgentSettings>(key(userId));
    if (cached) return cached;
  } catch {
    // Redis failure is non-fatal; fall through to DB
  }

  const settings = await getFromDb(userId);

  try {
    await redis.set(key(userId), settings, { ex: TTL });
  } catch {
    // Cache write failure is non-fatal
  }

  return settings;
}

/**
 * Invalidate cached agent settings (call after upsert).
 */
export async function invalidateSettingsCache(userId: string): Promise<void> {
  try {
    await redis.del(key(userId));
  } catch {
    // Non-fatal
  }
}
