"use client";

import { useRef, useCallback } from "react";
import { SendHorizontal, Square } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  status: string;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  status,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";
  const canSend = input.trim().length > 0 && status === "ready";

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (canSend) onSubmit();
      }
    },
    [canSend, onSubmit]
  );

  return (
    <div className="border-t border-border/50 bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isStreaming}
          rows={1}
          className="min-h-[44px] max-h-[160px] resize-none rounded-xl border-border/50 bg-muted/30 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-pink-accent/30"
        />

        {isStreaming ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            aria-label="Stop generating"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Square className="size-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onSubmit}
            disabled={!canSend}
            aria-label="Send message"
            className="shrink-0"
          >
            <SendHorizontal className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
