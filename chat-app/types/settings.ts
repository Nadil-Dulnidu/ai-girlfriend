export const DEFAULT_GIRLFRIEND_NAME = "Aria";
export const DEFAULT_DESCRIPTION =
  "A caring, warm, and witty AI companion who remembers everything about you.";
export const DEFAULT_MEMORIES = "";

export interface AgentSettingsInput {
  girlfriend_name: string;
  memories: string;
  description: string;
}
