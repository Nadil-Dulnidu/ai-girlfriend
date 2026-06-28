"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { MessageThread } from "./message-thread";
import { ChatInput } from "./chat-input";

interface ChatProps {
  id: string;
  initialMessages?: UIMessage[];
}

export function Chat({ id, initialMessages }: ChatProps) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // Send only the last message + conversation id to the server
      prepareSendMessagesRequest({ messages }) {
        return {
          body: {
            id,
            message: messages[messages.length - 1],
          },
        };
      },
    }),
    experimental_throttle: 50,
    onError: (error) => {
      console.error("[Chat] Error:", error);
    },
  });

  function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <MessageThread messages={messages} status={status} />
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
        status={status}
      />
    </div>
  );
}
