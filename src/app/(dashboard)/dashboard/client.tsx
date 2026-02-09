"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FadeIn, StaggerItem, Stagger } from "@/components/ui/animated-container";
import {
  Music2,
  Plus,
  LogOut,
  Calendar,
  Music,
  MoreHorizontal,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { RehearsalSession, Track } from "@/lib/db/schema";
import { createSession } from "./actions";
import Image from "next/image";

interface DashboardClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  sessions: (RehearsalSession & { tracks: Track[] })[];
}

export function DashboardClient({ user, sessions }: DashboardClientProps) {
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    setIsCreating(true);
    try {
      await createSession(newSessionName.trim());
      setNewSessionName("");
      setShowNewSessionDialog(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
              <Music2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold leading-tight">Mousikē</span>
              <span className="text-[10px] text-muted leading-tight hidden sm:block">moo-see-KAY</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-muted hidden sm:inline">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Your Sessions</h1>
              <p className="text-muted">Manage your rehearsal sessions</p>
            </div>
            <Button variant="gradient" onClick={() => setShowNewSessionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
        </FadeIn>

        {sessions.length === 0 ? (
          <FadeIn delay={0.1}>
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
                  <Music className="h-8 w-8 text-muted" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
                <p className="text-muted text-center mb-6 max-w-sm">
                  Create your first rehearsal session to start recording with your band.
                </p>
                <Button variant="gradient" onClick={() => setShowNewSessionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <Stagger staggerDelay={0.05} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <StaggerItem key={session.id}>
                <SessionCard session={session} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </main>

      {/* New Session Dialog */}
      <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>
              Give your rehearsal session a name. You can add tracks after creating it.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="e.g., Band Practice - March 2024"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateSession();
              }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreateSession}
              disabled={!newSessionName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionCard({ session }: { session: RehearsalSession & { tracks: Track[] } }) {
  const [showMenu, setShowMenu] = useState(false);

  const copyShareLink = () => {
    const url = `${window.location.origin}/session/${session.id}`;
    navigator.clipboard.writeText(url);
    setShowMenu(false);
  };

  return (
    <Link href={`/session/${session.id}`}>
      <Card className="h-full hover:border-muted-foreground/50 transition-colors group cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg group-hover:text-accent transition-colors">
              {session.name}
            </CardTitle>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-surface p-1 shadow-xl z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-hover transition-colors"
                      onClick={copyShareLink}
                    >
                      <Copy className="h-4 w-4" />
                      Copy share link
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-hover transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/session/${session.id}`, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </button>
                    <hr className="my-1 border-border" />
                    <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-recording hover:bg-recording/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                      Delete session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <CardDescription className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(session.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Music className="h-4 w-4" />
            <span>
              {session.tracks.length} {session.tracks.length === 1 ? "track" : "tracks"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
