import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rehearsalSessions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rehearsalSession = await db.query.rehearsalSessions.findFirst({
    where: eq(rehearsalSessions.id, sessionId),
    with: {
      tracks: {
        with: {
          takes: true,
        },
      },
      createdBy: true,
    },
  });

  if (!rehearsalSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(rehearsalSession);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates = await request.json();

  const [updated] = await db
    .update(rehearsalSessions)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(rehearsalSessions.id, sessionId),
        eq(rehearsalSessions.createdById, session.user.id)
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Session not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deleted] = await db
    .delete(rehearsalSessions)
    .where(
      and(
        eq(rehearsalSessions.id, sessionId),
        eq(rehearsalSessions.createdById, session.user.id)
      )
    )
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { error: "Session not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
