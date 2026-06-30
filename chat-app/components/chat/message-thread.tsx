"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Heart, Sparkles, Clock } from "lucide-react";
import type { UIMessage } from "ai";

interface MessageThreadProps {
  messages: UIMessage[];
  status: string;
}

export function MessageThread({ messages, status }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <ScrollArea className="flex-1 bg-gradient-to-b from-background via-background to-pink-accent/[0.02]">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-pink-accent/10 ring-1 ring-pink-accent/20">
              <Heart className="size-7 text-pink-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              New Conversation
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Your companion is ready to chat. Share what&apos;s on your mind,
              ask a question, or just say hello.
            </p>

            {/* Suggestion chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border/50">
                <Sparkles className="size-3 text-pink-accent" />
                Tell me about yourself
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border/50">
                <Heart className="size-3 text-pink-accent" />
                How are you feeling?
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border/50">
                <Clock className="size-3 text-pink-accent" />
                What time is it?
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {status === "submitted" && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
