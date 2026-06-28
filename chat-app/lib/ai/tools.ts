import { tool } from "ai";
import { z } from "zod";

/**
 * Tool: get_datetime
 * Returns the current date and time as an ISO 8601 timestamp.
 * The model calls this when the user asks about the current time/date.
 */
export const chatTools = {
  get_datetime: tool({
    description: "Get the current date and time as an ISO 8601 timestamp.",
    inputSchema: z.object({}),
    execute: async () => {
      return { now: new Date().toISOString() };
    },
  }),
};
