"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Heart } from "lucide-react";
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
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-pink-accent/10 ring-1 ring-pink-accent/20">
              <Heart className="size-6 text-pink-accent" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Start a conversation
            </p>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
              Say hi, share your day, or ask anything. I&apos;m here for you.
            </p>
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
