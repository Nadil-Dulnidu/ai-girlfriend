import { generateText } from "ai";
import { qwenModel } from "./provider";
import { getMessagesAfter, getMessageCount } from "@/lib/db/messages";
import { updateConversationSummary } from "@/lib/db/conversations";
import { invalidateSummaryCache } from "@/lib/cache/summary-cache";
import type { Message } from "@/types/db";

const SUMMARY_TRIGGER = parseInt(process.env.SUMMARY_TRIGGER ?? "30", 10);
const HISTORY_LIMIT = parseInt(process.env.MESSAGE_HISTORY_LIMIT ?? "20", 10);

/**
 * Check if summarization should run, and if so, fire it (non-blocking).
 * Called after assistant reply is saved.
 */
export function maybeSummarize(params: {
  conversationId: string;
  userId: string;
  existingSummary: string;
  summarizedThrough: string | null;
}): void {
  // Fire-and-forget — don't await, don't block the response
  runSummarizationIfNeeded(params).catch((err) => {
    console.error("[summarize] Error during summarization:", err);
  });
}

async function runSummarizationIfNeeded(params: {
  conversationId: string;
  userId: string;
  existingSummary: string;
  summarizedThrough: string | null;
}): Promise<void> {
  const { conversationId, userId, existingSummary, summarizedThrough } = params;

  // Count total messages in the conversation
  const totalCount = await getMessageCount(conversationId, userId);

  // Only summarize if we have enough unsummarized messages
  // Unsummarized = total - the ones already folded into summary
  // Approximation: if total > SUMMARY_TRIGGER + HISTORY_LIMIT, time to summarize
  if (totalCount <= SUMMARY_TRIGGER) return;

  // Get messages that are older than the current verbatim window
  // We want to summarize everything up to (total - HISTORY_LIMIT)
  // But only messages after the last summarization point
  const afterTimestamp = summarizedThrough || "1970-01-01T00:00:00Z";
  const unsummarizedMessages = await getMessagesAfter(
    conversationId,
    userId,
    afterTimestamp
  );

  // Keep the last HISTORY_LIMIT messages as verbatim — summarize the rest
  const messagesToSummarize = unsummarizedMessages.slice(
    0,
    Math.max(0, unsummarizedMessages.length - HISTORY_LIMIT)
  );

  if (messagesToSummarize.length < 10) {
    // Not enough new messages to warrant a summarization pass
    return;
  }

  // Build the summarization prompt
  const conversationText = messagesToSummarize
    .map((m: Message) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = existingSummary
    ? `You are a summarization assistant. Below is an existing conversation summary followed by new messages. Produce an updated, concise summary that captures all key facts, emotional context, and relationship details. Keep it under 500 words.

Existing summary:
${existingSummary}

New messages to incorporate:
${conversationText}

Updated summary:`
    : `You are a summarization assistant. Summarize the following conversation concisely, capturing key facts, emotional context, and relationship details. Keep it under 500 words.

Conversation:
${conversationText}

Summary:`;

  const { text: newSummary } = await generateText({
    model: qwenModel,
    prompt,
    maxRetries: 2,
  });

  if (!newSummary.trim()) return;

  // The watermark is the timestamp of the last message we summarized
  const lastSummarizedMessage =
    messagesToSummarize[messagesToSummarize.length - 1];
  const newWatermark = lastSummarizedMessage.created_at;

  // Update DB
  await updateConversationSummary(
    conversationId,
    userId,
    newSummary.trim(),
    newWatermark
  );

  // Invalidate summary cache
  await invalidateSummaryCache(conversationId);
}
