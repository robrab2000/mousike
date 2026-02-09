import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { takes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trackId, blobUrl, duration, format, fileSize, isActive } = await request.json();

  if (!trackId || !blobUrl || !duration || !format || !fileSize) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // If this take should be active, deactivate others
  if (isActive) {
    await db
      .update(takes)
      .set({ isActive: false })
      .where(eq(takes.trackId, trackId));
  }

  const [newTake] = await db
    .insert(takes)
    .values({
      trackId,
      userId: session.user.id,
      blobUrl,
      duration,
      format,
      fileSize,
      isActive: isActive ?? true,
    })
    .returning();

  return NextResponse.json(newTake);
}
