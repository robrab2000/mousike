"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { takes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

export async function createTake(
  trackId: string,
  sessionId: string,
  blob: Blob,
  duration: number,
  format: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Upload to Vercel Blob
  const filename = `takes/${trackId}/${Date.now()}.${format}`;
  const { url } = await put(filename, blob, {
    access: "public",
  });

  // Set all other takes for this track to inactive
  await db
    .update(takes)
    .set({ isActive: false })
    .where(eq(takes.trackId, trackId));

  // Create the new take as active
  const [newTake] = await db
    .insert(takes)
    .values({
      trackId,
      userId: session.user.id,
      blobUrl: url,
      duration: Math.round(duration * 1000), // Convert to milliseconds
      format,
      fileSize: blob.size,
      isActive: true,
    })
    .returning();

  revalidatePath(`/session/${sessionId}`);
  return newTake;
}

export async function deleteTake(takeId: string, sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the take to check if it's active
  const take = await db.query.takes.findFirst({
    where: eq(takes.id, takeId),
  });

  if (!take) {
    throw new Error("Take not found");
  }

  // Delete the take
  await db.delete(takes).where(eq(takes.id, takeId));

  // If this was the active take, set the most recent remaining take as active
  if (take.isActive) {
    const remainingTakes = await db.query.takes.findMany({
      where: eq(takes.trackId, take.trackId),
      orderBy: (takes, { desc }) => [desc(takes.createdAt)],
      limit: 1,
    });

    if (remainingTakes.length > 0) {
      await db
        .update(takes)
        .set({ isActive: true })
        .where(eq(takes.id, remainingTakes[0].id));
    }
  }

  revalidatePath(`/session/${sessionId}`);
}

export async function setActiveTake(takeId: string, trackId: string, sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Set all takes for this track to inactive
  await db
    .update(takes)
    .set({ isActive: false })
    .where(eq(takes.trackId, trackId));

  // Set the selected take as active
  await db
    .update(takes)
    .set({ isActive: true })
    .where(eq(takes.id, takeId));

  revalidatePath(`/session/${sessionId}`);
}
