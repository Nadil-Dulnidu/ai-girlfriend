import type { UIMessage } from "ai";
import type { Message, MessageInsert } from "@/types/db";

/**
 * Convert a DB Message row back into a UIMessage for the client.
 */
export function dbMessageToUIMessage(msg: Message): UIMessage {
  // If parts were stored, use them directly
  if (msg.parts && Array.isArray(msg.parts) && msg.parts.length > 0) {
    return {
      id: msg.id,
      role: msg.role as UIMessage["role"],
      parts: msg.parts as UIMessage["parts"],
      createdAt: new Date(msg.created_at),
    } as UIMessage;
  }

  // Fallback: reconstruct from content field
  return {
    id: msg.id,
    role: msg.role as UIMessage["role"],
    parts: [{ type: "text", text: msg.content }],
    createdAt: new Date(msg.created_at),
  } as UIMessage;
}

/**
 * Flatten UIMessage parts into a plain text content string.
 * Used for the `content` column (search, summaries).
 */
export function flattenPartsToContent(parts: UIMessage["parts"]): string {
  return parts
    .map((part) => {
      if (part.type === "text") return part.text;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Build a MessageInsert from a UIMessage for DB persistence.
 */
export function uiMessageToInsert(
  message: UIMessage,
  conversationId: string,
  userId: string
): MessageInsert {
  return {
    conversation_id: conversationId,
    user_id: userId,
    role: message.role as "user" | "assistant" | "system",
    parts: message.parts as unknown[],
    content: flattenPartsToContent(message.parts),
  };
}
