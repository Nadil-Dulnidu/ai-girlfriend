import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createConversation } from "@/lib/db/conversations";

export default async function ChatIndexPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Create a new conversation and redirect to it
  const conversation = await createConversation({ user_id: userId });
  redirect(`/chat/${conversation.id}`);
}
