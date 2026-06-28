import type { UIMessage } from "ai";

// Our app's UIMessage type (extend if metadata is added later)
export type MyUIMessage = UIMessage;

export interface ChatRequestBody {
  id: string; // conversationId
  message: MyUIMessage;
}

export interface ApiError {
  error: string;
  code:
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "UPSTREAM_ERROR"
    | "RATE_LIMITED"
    | "INTERNAL";
}
