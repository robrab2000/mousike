import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rehearsalSessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await db.query.rehearsalSessions.findMany({
    where: eq(rehearsalSessions.createdById, session.user.id),
    orderBy: desc(rehearsalSessions.createdAt),
    with: {
      tracks: {
        with: {
          takes: true,
        },
      },
    },
  });

  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await request.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const [newSession] = await db
    .insert(rehearsalSessions)
    .values({
      name,
      description,
      createdById: session.user.id,
    })
    .returning();

  return NextResponse.json(newSession);
}
