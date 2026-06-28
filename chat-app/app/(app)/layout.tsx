import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listConversations } from "@/lib/db/conversations";
import { ChatSidebar } from "@/components/sidebar/chat-sidebar";
import { MobileSidebar } from "@/components/sidebar/mobile-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const conversations = await listConversations(userId);

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Desktop sidebar */}
      <ChatSidebar conversations={conversations} />

      {/* Main content area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header with sidebar trigger */}
        <MobileSidebar conversations={conversations} />
        {children}
      </main>
    </div>
  );
}
