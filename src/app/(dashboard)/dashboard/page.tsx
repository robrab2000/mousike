import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { rehearsalSessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const sessions = await db.query.rehearsalSessions.findMany({
    where: eq(rehearsalSessions.createdById, session.user.id!),
    orderBy: desc(rehearsalSessions.createdAt),
    with: {
      tracks: true,
    },
  });

  return <DashboardClient user={session.user} sessions={sessions} />;
}
