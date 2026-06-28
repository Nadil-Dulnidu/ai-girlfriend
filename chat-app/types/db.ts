export interface Conversation {
  id: string;
  user_id: string;
  name: string;
  summary: string;
  summarized_through: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  parts: unknown[];
  content: string;
  created_at: string;
}

export interface AgentSettings {
  id: string;
  user_id: string;
  girlfriend_name: string;
  memories: string;
  description: string;
  updated_at: string;
}

/** Insert types (omit server-generated fields) */
export type ConversationInsert = Pick<Conversation, "user_id"> &
  Partial<Pick<Conversation, "name">>;

export type MessageInsert = Pick<
  Message,
  "conversation_id" | "user_id" | "role" | "parts" | "content"
>;

export type AgentSettingsUpsert = Pick<
  AgentSettings,
  "user_id" | "girlfriend_name" | "memories" | "description"
>;
