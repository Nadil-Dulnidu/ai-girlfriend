import { createClient } from "@/lib/supabase/server";
import type { Conversation, ConversationInsert } from "@/types/db";

export async function listConversations(
  userId: string
): Promise<Conversation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Conversation[];
}

export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Conversation | null;
}

export async function createConversation(
  insert: ConversationInsert
): Promise<Conversation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function renameConversation(
  conversationId: string,
  userId: string,
  name: string
): Promise<Conversation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .update({ name })
    .eq("id", conversationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function updateConversationSummary(
  conversationId: string,
  userId: string,
  summary: string,
  summarizedThrough: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("conversations")
    .update({ summary, summarized_through: summarizedThrough })
    .eq("id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
}
