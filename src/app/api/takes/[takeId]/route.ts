import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { takes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ takeId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { takeId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const take = await db.query.takes.findFirst({
    where: eq(takes.id, takeId),
  });

  if (!take) {
    return NextResponse.json({ error: "Take not found" }, { status: 404 });
  }

  return NextResponse.json(take);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { takeId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates = await request.json();

  // If setting this take as active, deactivate others first
  if (updates.isActive === true) {
    const take = await db.query.takes.findFirst({
      where: eq(takes.id, takeId),
    });

    if (take) {
      await db
        .update(takes)
        .set({ isActive: false })
        .where(eq(takes.trackId, take.trackId));
    }
  }

  const [updated] = await db
    .update(takes)
    .set(updates)
    .where(eq(takes.id, takeId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Take not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { takeId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deleted] = await db
    .delete(takes)
    .where(eq(takes.id, takeId))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Take not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
