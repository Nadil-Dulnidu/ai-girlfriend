"use client";

import { useState } from "react";
import { Heart, Menu } from "lucide-react";
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
    <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="flex items-center gap-2">
              <Heart className="size-4 text-pink-accent" />
              Aria
            </SheetTitle>
          </SheetHeader>

          <div className="px-3 py-3">
            <NewChatButton />
          </div>

          <Separator />

          <ScrollArea className="flex-1 px-2 py-2">
            <div className="flex flex-col gap-0.5">
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
        <span className="text-sm font-medium">Aria</span>
      </div>
    </div>
  );
}
