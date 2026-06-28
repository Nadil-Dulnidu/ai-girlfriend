import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getConversation } from "@/lib/db/conversations";
import { getMessages } from "@/lib/db/messages";
import { dbMessageToUIMessage } from "@/lib/db/message-utils";
import { Chat } from "@/components/chat/chat";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  // Verify conversation exists and belongs to user
  const conversation = await getConversation(id, userId);
  if (!conversation) notFound();

  // Load persisted messages and convert to UIMessage format
  const dbMessages = await getMessages(id, userId, 100);
  const initialMessages = dbMessages.map(dbMessageToUIMessage);

  return <Chat id={id} initialMessages={initialMessages} />;
}
