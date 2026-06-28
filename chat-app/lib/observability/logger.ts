type LogLevel = "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  conversationId?: string;
  latencyMs?: number;
  error?: unknown;
  [key: string]: unknown;
}

/**
 * Structured JSON logger for API routes.
 * Outputs one JSON object per line for log aggregation.
 */
function log(level: LogLevel, message: string, context: LogContext = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    ...(context.error instanceof Error
      ? { error: context.error.message, stack: context.error.stack }
      : context.error
        ? { error: String(context.error) }
        : {}),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) =>
    log("error", message, context),
};
