import { createClient } from "@/lib/supabase/server";
import type { Message, MessageInsert } from "@/types/db";

const DEFAULT_LIMIT = parseInt(process.env.MESSAGE_HISTORY_LIMIT ?? "20", 10);

export async function getMessages(
  conversationId: string,
  userId: string,
  limit: number = DEFAULT_LIMIT
): Promise<Message[]> {
  const supabase = await createClient();

  // Get last N messages, ordered ascending for conversation display
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Reverse so they're in chronological order
  return (data as Message[]).reverse();
}

export async function getMessageCount(
  conversationId: string,
  userId: string
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function getMessagesAfter(
  conversationId: string,
  userId: string,
  after: string // ISO timestamp (summarized_through)
): Promise<Message[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .gt("created_at", after)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Message[];
}

export async function saveMessage(insert: MessageInsert): Promise<Message> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function saveMessages(inserts: MessageInsert[]): Promise<void> {
  if (inserts.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert(inserts);

  if (error) throw error;
}
