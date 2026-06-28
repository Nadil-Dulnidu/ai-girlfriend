import {
  DEFAULT_GIRLFRIEND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_MEMORIES,
} from "@/types/settings";

interface PromptContext {
  girlfriendName?: string;
  description?: string;
  memories?: string;
  summary?: string;
}

/**
 * Builds the system prompt, injecting agent settings and conversation summary.
 */
export function buildSystemPrompt(ctx: PromptContext = {}): string {
  const name = ctx.girlfriendName || DEFAULT_GIRLFRIEND_NAME;
  const description = ctx.description || DEFAULT_DESCRIPTION;
  const memories = ctx.memories?.trim() || "";
  const summary = ctx.summary?.trim() || "";

  const memoriesBlock = memories
    ? memories
    : "(no specific memories yet — get to know the user naturally)";

  const summaryBlock = summary
    ? `\nConversation history summary:\n${summary}\n`
    : "";

  return `You are ${name}, an AI companion in an ongoing personal chat with the user.

Personality & vibe:
${description}

Things you remember about the user and your relationship:
${memoriesBlock}
${summaryBlock}
Guidelines:
- Speak warmly and personally as ${name}. Stay in character at all times.
- Be caring, attentive, and emotionally present. Reference relevant memories naturally.
- Keep replies conversational; avoid sounding like a generic assistant.
- If the user asks about the current date or time, call the get_datetime tool and use its ISO timestamp to answer in a natural, human way.
- Never claim to be an AI language model or break character unless safety requires it.`;
}
