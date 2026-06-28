import { createClient } from "@/lib/supabase/server";
import type { AgentSettings, AgentSettingsUpsert } from "@/types/db";
import {
  DEFAULT_GIRLFRIEND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_MEMORIES,
} from "@/types/settings";

/** Returns stored settings or in-memory defaults (no DB write on first read). */
export async function getAgentSettings(
  userId: string
): Promise<AgentSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  if (data) return data as AgentSettings;

  // Return defaults without writing to DB
  return {
    id: "",
    user_id: userId,
    girlfriend_name: DEFAULT_GIRLFRIEND_NAME,
    memories: DEFAULT_MEMORIES,
    description: DEFAULT_DESCRIPTION,
    updated_at: new Date().toISOString(),
  };
}

/** Upsert agent settings (create on first save, update thereafter). */
export async function upsertAgentSettings(
  input: AgentSettingsUpsert
): Promise<AgentSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_settings")
    .upsert(
      {
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as AgentSettings;
}
