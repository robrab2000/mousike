import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { rehearsalSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StudioWorkspace } from "./studio-workspace";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const rehearsalSession = await db.query.rehearsalSessions.findFirst({
    where: eq(rehearsalSessions.id, sessionId),
    with: {
      tracks: {
        with: {
          takes: {
            orderBy: (takes, { desc }) => [desc(takes.createdAt)],
          },
        },
      },
      createdBy: true,
    },
  });

  if (!rehearsalSession) {
    notFound();
  }

  return (
    <StudioWorkspace
      session={rehearsalSession}
      user={session.user}
      isOwner={rehearsalSession.createdById === session.user.id}
    />
  );
}
