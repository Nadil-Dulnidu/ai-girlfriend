import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { withRetry } from "@/lib/observability/retry";

/**
 * Qwen3 fine-tuned model provider.
 * Connects to the FastAPI backend's OpenAI-compatible endpoint.
 * Uses a retry-wrapped fetch for exponential backoff on network/5xx errors.
 */
export const qwen = createOpenAICompatible({
  name: "qwen3",
  baseURL: process.env.QWEN3_API_URL!,
  apiKey: process.env.QWEN3_API_KEY || undefined,
  fetch: withRetry(fetch, {
    maxAttempts: 3,
    baseDelayMs: 250,
    maxDelayMs: 2000,
  }),
});

export const qwenModel = qwen(process.env.QWEN3_MODEL ?? "qwen3-finetuned");
