import { auth } from "@clerk/nextjs/server";
import {
  listConversations,
  createConversation,
} from "@/lib/db/conversations";
import { unauthorized, internalError } from "@/lib/errors";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    const conversations = await listConversations(userId);
    return Response.json({ conversations });
  } catch (e) {
    console.error("[GET /api/conversations]", e);
    return internalError();
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : "New chat";

    const conversation = await createConversation({ user_id: userId, name });
    return Response.json({ id: conversation.id, name: conversation.name }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/conversations]", e);
    return internalError();
  }
}
