import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client (REST-based, edge-compatible).
 * Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env.
 */
export const redis = Redis.fromEnv();
