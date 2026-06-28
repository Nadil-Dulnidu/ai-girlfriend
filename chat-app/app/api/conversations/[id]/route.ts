import { auth } from "@clerk/nextjs/server";
import {
  getConversation,
  renameConversation,
  deleteConversation,
} from "@/lib/db/conversations";
import { getMessages } from "@/lib/db/messages";
import { invalidateMessagesCache } from "@/lib/cache/messages-cache";
import {
  unauthorized,
  notFound,
  validationError,
  internalError,
} from "@/lib/errors";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const { id } = await params;

  try {
    const conversation = await getConversation(id, userId);
    if (!conversation) return notFound("Conversation");

    const messages = await getMessages(id, userId, 100);
    return Response.json({ conversation, messages });
  } catch (e) {
    console.error("[GET /api/conversations/[id]]", e);
    return internalError();
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const { id } = await params;

  try {
    const body = await req.json();
    const name = body?.name;

    if (typeof name !== "string" || !name.trim()) {
      return validationError("name is required");
    }

    const conversation = await getConversation(id, userId);
    if (!conversation) return notFound("Conversation");

    const updated = await renameConversation(id, userId, name.trim());
    return Response.json(updated);
  } catch (e) {
    console.error("[PATCH /api/conversations/[id]]", e);
    return internalError();
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const { id } = await params;

  try {
    const conversation = await getConversation(id, userId);
    if (!conversation) return notFound("Conversation");

    await deleteConversation(id, userId);
    await invalidateMessagesCache(id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/conversations/[id]]", e);
    return internalError();
  }
}
