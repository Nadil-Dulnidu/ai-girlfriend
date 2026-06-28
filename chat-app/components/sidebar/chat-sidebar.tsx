import { Heart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NewChatButton } from "./new-chat-button";
import { ConversationItem } from "./conversation-item";
import { AgentSettingsDrawer } from "@/components/settings/agent-settings-drawer";
import type { Conversation } from "@/types/db";

interface ChatSidebarProps {
  conversations: Conversation[];
}

export function ChatSidebar({ conversations }: ChatSidebarProps) {
  return (
    <aside className="hidden md:flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Brand header */}
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-pink-accent/10">
          <Heart className="size-4 text-pink-accent" />
        </div>
        <span className="text-base font-semibold text-foreground">Aria</span>
      </div>

      <div className="px-3 pb-3">
        <NewChatButton />
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {conversations.length === 0 && (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <ConversationItem key={conv.id} conversation={conv} />
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-3">
        <AgentSettingsDrawer />
      </div>
    </aside>
  );
}
