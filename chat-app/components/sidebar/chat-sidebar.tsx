import { Heart } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
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
      {/* App header */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-pink-accent/10">
          <Heart className="size-4 text-pink-accent" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-tight">
            Companion
          </span>
          <span className="text-[11px] text-muted-foreground leading-tight">
            AI Chat
          </span>
        </div>
      </div>

      <div className="px-3 pb-3">
        <NewChatButton />
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {conversations.length === 0 && (
            <div className="px-2 py-8 text-center">
              <p className="text-xs text-muted-foreground">
                No conversations yet
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/60">
                Start a new chat to begin
              </p>
            </div>
          )}
          {conversations.map((conv) => (
            <ConversationItem key={conv.id} conversation={conv} />
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="flex flex-col gap-1 p-3">
        <AgentSettingsDrawer />
      </div>

      <Separator />

      {/* User profile */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-7",
            },
          }}
        />
        <span className="text-xs text-muted-foreground">Account</span>
      </div>
    </aside>
  );
}
