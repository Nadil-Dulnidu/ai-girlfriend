"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  userMessageVariants,
  assistantMessageVariants,
} from "@/lib/motion/variants";
import type { UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const variants = isUser ? userMessageVariants : assistantMessageVariants;

  return (
    <motion.div
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-pink-accent text-pink-accent-foreground rounded-br-md"
            : "bg-card text-card-foreground border border-border/50 rounded-bl-md"
        )}
      >
        {message.parts.map((part, index) => {
          switch (part.type) {
            case "text":
              return (
                <span key={index} className="whitespace-pre-wrap break-words">
                  {part.text}
                </span>
              );

            case "tool-get_datetime":
              if (part.state === "output-available") {
                return (
                  <span
                    key={index}
                    className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {new Date(
                      (part.output as { now: string }).now
                    ).toLocaleString()}
                  </span>
                );
              }
              if (
                part.state === "input-available" ||
                part.state === "input-streaming"
              ) {
                return (
                  <span
                    key={index}
                    className="text-xs text-muted-foreground italic"
                  >
                    Checking the time...
                  </span>
                );
              }
              return null;

            default:
              return null;
          }
        })}
      </div>
    </motion.div>
  );
}
