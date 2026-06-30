"use client";

import { useState } from "react";
import { Heart, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NewChatButton } from "./new-chat-button";
import { ConversationItem } from "./conversation-item";
import { AgentSettingsDrawer } from "@/components/settings/agent-settings-drawer";
import type { Conversation } from "@/types/db";

interface MobileSidebarProps {
  conversations: Conversation[];
}

export function MobileSidebar({ conversations }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-border/50 px-3 py-2 md:hidden">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] max-w-[75vw] p-0">
            <SheetHeader className="px-4 pt-4 pb-2">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <Heart className="size-3.5 text-pink-accent" />
                Companion AI
              </SheetTitle>
            </SheetHeader>

            <div className="px-3 py-2">
              <NewChatButton />
            </div>

            <Separator />

            <ScrollArea className="flex-1 px-2 py-2">
              <div className="flex flex-col gap-0.5">
                {conversations.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
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
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-1.5">
          <Heart className="size-3.5 text-pink-accent" />
          <span className="text-sm font-medium">Companion</span>
        </div>
      </div>

      {/* User profile on mobile */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "size-7",
          },
        }}
      />
    </div>
  );
}
