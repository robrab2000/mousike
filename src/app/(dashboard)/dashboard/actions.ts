"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rehearsalSessions, tracks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSession(name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [newSession] = await db
    .insert(rehearsalSessions)
    .values({
      name,
      createdById: session.user.id,
    })
    .returning();

  revalidatePath("/dashboard");
  redirect(`/session/${newSession.id}`);
}

export async function deleteSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(rehearsalSessions)
    .where(
      and(
        eq(rehearsalSessions.id, sessionId),
        eq(rehearsalSessions.createdById, session.user.id)
      )
    );

  revalidatePath("/dashboard");
}

export async function addTrack(sessionId: string, name: string, instrument?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
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

  revalidatePath(`/session/${sessionId}`);
  return newTrack;
}

export async function deleteTrack(trackId: string, sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(tracks).where(eq(tracks.id, trackId));

  revalidatePath(`/session/${sessionId}`);
}

export async function updateTrackVolume(trackId: string, volume: number, sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.update(tracks).set({ volume }).where(eq(tracks.id, trackId));

  revalidatePath(`/session/${sessionId}`);
}

export async function toggleTrackMute(trackId: string, isMuted: boolean, sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.update(tracks).set({ isMuted }).where(eq(tracks.id, trackId));

  revalidatePath(`/session/${sessionId}`);
}
