import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ trackId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { trackId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const track = await db.query.tracks.findFirst({
    where: eq(tracks.id, trackId),
    with: {
      takes: true,
    },
  });

  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  return NextResponse.json(track);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { trackId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates = await request.json();

  const [updated] = await db
    .update(tracks)
    .set(updates)
    .where(eq(tracks.id, trackId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { trackId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deleted] = await db
    .delete(tracks)
    .where(eq(tracks.id, trackId))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
