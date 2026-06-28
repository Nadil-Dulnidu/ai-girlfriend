import { logger } from "./logger";

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

/**
 * Wraps a fetch function with exponential backoff retry logic.
 * Retries on network errors and 5xx responses.
 */
export function withRetry(
  fetchFn: typeof fetch = fetch,
  options: RetryOptions = {}
): typeof fetch {
  const { maxAttempts = 3, baseDelayMs = 250, maxDelayMs = 2000 } = options;

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetchFn(input, init);

        // Retry on 5xx server errors
        if (response.status >= 500 && attempt < maxAttempts) {
          logger.warn("[retry] 5xx response, retrying", {
            attempt,
            status: response.status,
            url: typeof input === "string" ? input : input.toString(),
          });
          await sleep(getDelay(attempt, baseDelayMs, maxDelayMs));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts) {
          logger.warn("[retry] Network error, retrying", {
            attempt,
            error,
            url: typeof input === "string" ? input : input.toString(),
          });
          await sleep(getDelay(attempt, baseDelayMs, maxDelayMs));
        }
      }
    }

    logger.error("[retry] All attempts exhausted", {
      maxAttempts,
      error: lastError,
    });
    throw lastError;
  };
}

function getDelay(attempt: number, baseMs: number, maxMs: number): number {
  // Exponential backoff: base * 2^(attempt-1) + jitter
  const exponential = baseMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * baseMs;
  return Math.min(exponential + jitter, maxMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
