import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { upsertAgentSettings } from "@/lib/db/settings";
import {
  getCachedAgentSettings,
  invalidateSettingsCache,
} from "@/lib/cache/settings-cache";
import { unauthorized, validationError, internalError } from "@/lib/errors";

const settingsSchema = z.object({
  girlfriend_name: z.string().min(1).max(50),
  memories: z.string().max(2000),
  description: z.string().min(1).max(1000),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    const settings = await getCachedAgentSettings(userId);
    return Response.json(settings);
  } catch (e) {
    console.error("[GET /api/settings]", e);
    return internalError();
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const settings = await upsertAgentSettings({
      user_id: userId,
      ...parsed.data,
    });

    // Invalidate cached settings so next chat request picks up changes
    await invalidateSettingsCache(userId);

    return Response.json(settings);
  } catch (e) {
    console.error("[PUT /api/settings]", e);
    return internalError();
  }
}
