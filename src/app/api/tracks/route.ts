import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tracks, rehearsalSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, name, instrument } = await request.json();

  if (!sessionId || !name) {
    return NextResponse.json(
      { error: "Session ID and name are required" },
      { status: 400 }
    );
  }

  // Verify the session exists
  const rehearsalSession = await db.query.rehearsalSessions.findFirst({
    where: eq(rehearsalSessions.id, sessionId),
  });

  if (!rehearsalSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Get the current max order
  const existingTracks = await db.query.tracks.findMany({
    where: eq(tracks.sessionId, sessionId),
  });

  const maxOrder = existingTracks.reduce((max, t) => Math.max(max, t.order), -1);

  const [newTrack] = await db
    .insert(tracks)
    .values({
      sessionId,
      name,
      instrument,
      order: maxOrder + 1,
    })
    .returning();

  return NextResponse.json(newTrack);
}
