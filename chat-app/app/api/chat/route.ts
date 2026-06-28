import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  isStepCount,
  UIMessage,
} from "ai";
import { qwenModel } from "@/lib/ai/provider";
import { chatTools } from "@/lib/ai/tools";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { getConversation } from "@/lib/db/conversations";
import { saveMessage } from "@/lib/db/messages";
import {
  dbMessageToUIMessage,
  uiMessageToInsert,
  flattenPartsToContent,
} from "@/lib/db/message-utils";
import { getCachedAgentSettings } from "@/lib/cache/settings-cache";
import {
  getCachedMessages,
  invalidateMessagesCache,
} from "@/lib/cache/messages-cache";
import { maybeSummarize } from "@/lib/ai/summarize";
import { logger } from "@/lib/observability/logger";
import { unauthorized } from "@/lib/errors";

// Use Node.js runtime for streaming + consumeStream support
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const startTime = Date.now();
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const body = await req.json();
  const { id: conversationId, message } = body as {
    id: string;
    message: UIMessage;
  };

  if (!conversationId || !message) {
    logger.warn("[/api/chat] Missing id or message", { userId });
    return Response.json(
      { error: "Missing id or message", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  logger.info("[/api/chat] Request received", { userId, conversationId });

  // Verify conversation ownership
  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    logger.warn("[/api/chat] Conversation not found", {
      userId,
      conversationId,
    });
    return Response.json(
      { error: "Conversation not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  try {
    // Persist the user message + invalidate messages cache
    await saveMessage(uiMessageToInsert(message, conversationId, userId));
    await invalidateMessagesCache(conversationId);

    // Load previous messages (cache-aside: Redis → DB fallback)
    const dbMessages = await getCachedMessages(conversationId, userId);
    const previousMessages: UIMessage[] = dbMessages.map(dbMessageToUIMessage);

    // Load agent settings (cache-aside: Redis → DB fallback)
    const agentSettings = await getCachedAgentSettings(userId);

    // Build system prompt with real agent settings
    const systemPrompt = buildSystemPrompt({
      girlfriendName: agentSettings.girlfriend_name,
      description: agentSettings.description,
      memories: agentSettings.memories,
      summary: conversation.summary || undefined,
    });

    const result = streamText({
      model: qwenModel,
      system: systemPrompt,
      messages: await convertToModelMessages(previousMessages),
      tools: chatTools,
      stopWhen: isStepCount(5),
      maxRetries: 3,
    });

    // Consume the stream to ensure it completes even if client disconnects
    result.consumeStream();

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: previousMessages,
        generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
        onError: (error) => {
          logger.error("[/api/chat] Stream error", {
            userId,
            conversationId,
            error,
            latencyMs: Date.now() - startTime,
          });
          return "An error occurred while generating the response.";
        },
        onEnd: async ({ messages }) => {
          const latencyMs = Date.now() - startTime;

          // Find the new assistant message(s) that weren't in previousMessages
          const previousIds = new Set(previousMessages.map((m) => m.id));
          const newMessages = messages.filter((m) => !previousIds.has(m.id));

          // Save each new assistant message to DB
          for (const msg of newMessages) {
            if (msg.role === "assistant") {
              await saveMessage({
                conversation_id: conversationId,
                user_id: userId,
                role: "assistant",
                parts: msg.parts as unknown[],
                content: flattenPartsToContent(msg.parts),
              });
            }
          }

          // Invalidate messages cache after assistant reply saved
          await invalidateMessagesCache(conversationId);

          logger.info("[/api/chat] Stream complete", {
            userId,
            conversationId,
            latencyMs,
            assistantMessages: newMessages.length,
          });

          // Fire-and-forget: check if summarization is needed
          maybeSummarize({
            conversationId,
            userId,
            existingSummary: conversation.summary || "",
            summarizedThrough: conversation.summarized_through,
          });
        },
      }),
    });
  } catch (error) {
    logger.error("[/api/chat] Unhandled error", {
      userId,
      conversationId,
      error,
      latencyMs: Date.now() - startTime,
    });
    return Response.json(
      { error: "Internal server error", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
