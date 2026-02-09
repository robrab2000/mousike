"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FadeIn, PulsingDot } from "@/components/ui/animated-container";
import { useRecorder } from "@/hooks/useRecorder";
import { useMultiTrackPlayer } from "@/hooks/useMultiTrackPlayer";
import { formatDuration, formatFileSize } from "@/lib/utils";
import {
  Music2,
  ArrowLeft,
  Plus,
  Play,
  Pause,
  Square,
  Mic,
  Volume2,
  VolumeX,
  Trash2,
  Check,
  X,
  Share2,
  ChevronDown,
} from "lucide-react";
import type { RehearsalSession, Track, Take, User } from "@/lib/db/schema";
import { addTrack, updateTrackVolume, toggleTrackMute } from "@/app/(dashboard)/dashboard/actions";
import { createTake, deleteTake, setActiveTake } from "./actions";

type AudioFormat = "webm" | "wav";

interface StudioWorkspaceProps {
  session: RehearsalSession & {
    tracks: (Track & { takes: Take[] })[];
    createdBy: User;
  };
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isOwner: boolean;
}

export function StudioWorkspace({ session, user: _user, isOwner: _isOwner }: StudioWorkspaceProps) {
  const [showAddTrackDialog, setShowAddTrackDialog] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackInstrument, setNewTrackInstrument] = useState("");
  const [isAddingTrack, setIsAddingTrack] = useState(false);

  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>("webm");
  const [recordingTrackId, setRecordingTrackId] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingDuration, setPendingDuration] = useState<number>(0);
  const [showKeepDialog, setShowKeepDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>({});
  const [trackMutes, setTrackMutes] = useState<Record<string, boolean>>({});

  const player = useMultiTrackPlayer();

  const handleRecordingComplete = useCallback((blob: Blob, duration: number) => {
    setPendingBlob(blob);
    setPendingDuration(duration);
    setShowKeepDialog(true);
  }, []);

  const recorder = useRecorder({
    format: selectedFormat,
    onRecordingComplete: handleRecordingComplete,
  });

  // Initialize track volumes and mutes
  useEffect(() => {
    const volumes: Record<string, number> = {};
    const mutes: Record<string, boolean> = {};
    session.tracks.forEach((track) => {
      volumes[track.id] = track.volume;
      mutes[track.id] = track.isMuted;
    });
    setTrackVolumes(volumes);
    setTrackMutes(mutes);
  }, [session.tracks]);

  // Load tracks into player
  useEffect(() => {
    const tracksWithActiveTakes = session.tracks
      .map((track) => {
        const activeTake = track.takes.find((t) => t.isActive);
        return activeTake
          ? {
              id: track.id,
              url: activeTake.blobUrl,
              volume: trackVolumes[track.id] ?? track.volume,
              isMuted: trackMutes[track.id] ?? track.isMuted,
            }
          : null;
      })
      .filter(Boolean) as { id: string; url: string; volume: number; isMuted: boolean }[];

    if (tracksWithActiveTakes.length > 0) {
      player.loadTracks(tracksWithActiveTakes);
    }
  }, [session.tracks]);

  const handleAddTrack = async () => {
    if (!newTrackName.trim()) return;

    setIsAddingTrack(true);
    try {
      await addTrack(session.id, newTrackName.trim(), newTrackInstrument.trim() || undefined);
      setNewTrackName("");
      setNewTrackInstrument("");
      setShowAddTrackDialog(false);
    } finally {
      setIsAddingTrack(false);
    }
  };

  const handleStartRecording = async (trackId: string) => {
    // Stop playback if playing
    if (player.isPlaying) {
      player.stop();
    }

    // Mute the track being recorded
    player.setTrackMuted(trackId, true);

    // Start playback of other tracks
    player.play();

    setRecordingTrackId(trackId);
    await recorder.startRecording();
  };

  const handleStopRecording = () => {
    recorder.stopRecording();
    player.stop();

    // Unmute the track
    if (recordingTrackId) {
      player.setTrackMuted(recordingTrackId, trackMutes[recordingTrackId] ?? false);
    }
  };

  const handleKeepTake = async () => {
    if (!pendingBlob || !recordingTrackId) return;

    setIsSaving(true);
    try {
      await createTake(
        recordingTrackId,
        session.id,
        pendingBlob,
        pendingDuration,
        selectedFormat
      );
      setShowKeepDialog(false);
      setPendingBlob(null);
      setPendingDuration(0);
      setRecordingTrackId(null);
    } catch (error) {
      console.error("Failed to save take:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardTake = () => {
    setShowKeepDialog(false);
    setPendingBlob(null);
    setPendingDuration(0);
    setRecordingTrackId(null);
  };

  const handleVolumeChange = async (trackId: string, volume: number) => {
    setTrackVolumes((prev) => ({ ...prev, [trackId]: volume }));
    player.setTrackVolume(trackId, volume);
    await updateTrackVolume(trackId, volume, session.id);
  };

  const handleMuteToggle = async (trackId: string) => {
    const newMuted = !trackMutes[trackId];
    setTrackMutes((prev) => ({ ...prev, [trackId]: newMuted }));
    player.setTrackMuted(trackId, newMuted);
    await toggleTrackMute(trackId, newMuted, session.id);
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/session/${session.id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">{session.name}</h1>
              <p className="text-xs text-muted">by {session.createdBy.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Transport Controls */}
        <FadeIn>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="gradient"
                    size="icon-lg"
                    onClick={player.togglePlay}
                    disabled={player.loadedTracks.size === 0}
                  >
                    {player.isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={player.stop}
                    disabled={player.loadedTracks.size === 0}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 mx-8">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-muted w-12">
                      {formatDuration(player.currentTime)}
                    </span>
                    <Slider
                      value={player.currentTime}
                      onChange={(value) => player.seek(value)}
                      min={0}
                      max={player.duration || 100}
                      step={0.1}
                      className="flex-1"
                      disabled={player.duration === 0}
                    />
                    <span className="text-sm font-mono text-muted w-12">
                      {formatDuration(player.duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Select
                    value={selectedFormat}
                    onChange={(v) => setSelectedFormat(v as AudioFormat)}
                    options={[
                      { value: "webm", label: "WebM/Opus", description: "Smaller files" },
                      { value: "wav", label: "WAV", description: "Lossless quality" },
                    ]}
                    className="w-40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Tracks Section */}
        <FadeIn delay={0.1}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tracks</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddTrackDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Track
            </Button>
          </div>
        </FadeIn>

        {session.tracks.length === 0 ? (
          <FadeIn delay={0.2}>
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
                  <Music2 className="h-8 w-8 text-muted" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                <p className="text-muted text-center mb-6 max-w-sm">
                  Add your first track to start recording.
                </p>
                <Button variant="gradient" onClick={() => setShowAddTrackDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Track
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {session.tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TrackCard
                    track={track}
                    sessionId={session.id}
                    volume={trackVolumes[track.id] ?? track.volume}
                    isMuted={trackMutes[track.id] ?? track.isMuted}
                    isRecording={recordingTrackId === track.id && recorder.isRecording}
                    recordingLevel={recordingTrackId === track.id ? recorder.level : 0}
                    recordingDuration={recordingTrackId === track.id ? recorder.duration : 0}
                    onVolumeChange={(v) => handleVolumeChange(track.id, v)}
                    onMuteToggle={() => handleMuteToggle(track.id)}
                    onStartRecording={() => handleStartRecording(track.id)}
                    onStopRecording={handleStopRecording}
                    disabled={recorder.isRecording && recordingTrackId !== track.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add Track Dialog */}
      <Dialog open={showAddTrackDialog} onOpenChange={setShowAddTrackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Track</DialogTitle>
            <DialogDescription>
              Add a new track for an instrument part.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Track Name</label>
              <Input
                placeholder="e.g., Lead Guitar, Drums, Bass"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Instrument (optional)</label>
              <Input
                placeholder="e.g., Fender Stratocaster"
                value={newTrackInstrument}
                onChange={(e) => setNewTrackInstrument(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTrackDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleAddTrack}
              disabled={!newTrackName.trim() || isAddingTrack}
            >
              {isAddingTrack ? "Adding..." : "Add Track"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keep/Discard Dialog */}
      <Dialog open={showKeepDialog} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recording Complete</DialogTitle>
            <DialogDescription>
              Your take is {formatDuration(pendingDuration)} long
              {pendingBlob && ` (${formatFileSize(pendingBlob.size)})`}.
              Would you like to keep it?
            </DialogDescription>
          </DialogHeader>

          {pendingBlob && (
            <div className="py-4">
              <audio
                src={URL.createObjectURL(pendingBlob)}
                controls
                className="w-full"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDiscardTake}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Discard
            </Button>
            <Button
              variant="gradient"
              onClick={handleKeepTake}
              disabled={isSaving}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Keep
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TrackCardProps {
  track: Track & { takes: Take[] };
  sessionId: string;
  volume: number;
  isMuted: boolean;
  isRecording: boolean;
  recordingLevel: number;
  recordingDuration: number;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled: boolean;
}

function TrackCard({
  track,
  sessionId,
  volume,
  isMuted,
  isRecording,
  recordingLevel,
  recordingDuration,
  onVolumeChange,
  onMuteToggle,
  onStartRecording,
  onStopRecording,
  disabled,
}: TrackCardProps) {
  const [showTakes, setShowTakes] = useState(false);
  const activeTake = track.takes.find((t) => t.isActive);

  return (
    <Card className={isRecording ? "ring-2 ring-recording recording-glow" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{track.name}</h3>
              {track.instrument && (
                <span className="text-xs text-muted bg-surface-hover px-2 py-0.5 rounded">
                  {track.instrument}
                </span>
              )}
            </div>
            {activeTake ? (
              <p className="text-sm text-muted">
                {formatDuration(activeTake.duration / 1000)} • {activeTake.format.toUpperCase()}
              </p>
            ) : (
              <p className="text-sm text-muted">No takes yet</p>
            )}
          </div>

          {/* Level Meter (when recording) */}
          {isRecording && (
            <div className="w-32 h-4 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-success to-recording"
                style={{ width: `${recordingLevel * 100}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          )}

          {/* Recording Duration */}
          {isRecording && (
            <div className="flex items-center gap-2">
              <PulsingDot color="recording" />
              <span className="font-mono text-sm text-recording">
                {formatDuration(recordingDuration)}
              </span>
            </div>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-32">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMuteToggle}
              className={isMuted ? "text-muted" : ""}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={onVolumeChange}
              min={0}
              max={100}
              step={1}
              className="flex-1"
              disabled={isMuted}
            />
          </div>

          {/* Record Button */}
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled}
            className={isRecording ? "recording-glow" : ""}
          >
            {isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* Takes Dropdown */}
          {track.takes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTakes(!showTakes)}
              className="text-muted"
            >
              {track.takes.length} {track.takes.length === 1 ? "take" : "takes"}
              <ChevronDown
                className={`h-4 w-4 ml-1 transition-transform ${showTakes ? "rotate-180" : ""}`}
              />
            </Button>
          )}
        </div>

        {/* Takes List */}
        <AnimatePresence>
          {showTakes && track.takes.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {track.takes.map((take) => (
                  <TakeItem
                    key={take.id}
                    take={take}
                    trackId={track.id}
                    sessionId={sessionId}
                    isActive={take.isActive}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

interface TakeItemProps {
  take: Take;
  trackId: string;
  sessionId: string;
  isActive: boolean;
}

function TakeItem({ take, trackId, sessionId, isActive }: TakeItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingActive, setIsSettingActive] = useState(false);

  const handleSetActive = async () => {
    setIsSettingActive(true);
    try {
      await setActiveTake(take.id, trackId, sessionId);
    } finally {
      setIsSettingActive(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTake(take.id, sessionId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg ${
        isActive ? "bg-accent/10 border border-accent/20" : "bg-surface-hover"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {new Date(take.createdAt).toLocaleTimeString()}
          </span>
          {isActive && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-muted">
          {formatDuration(take.duration / 1000)} • {take.format.toUpperCase()} •{" "}
          {formatFileSize(take.fileSize)}
        </p>
      </div>

      <audio src={take.blobUrl} controls className="h-8 w-48" />

      {!isActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSetActive}
          disabled={isSettingActive}
        >
          {isSettingActive ? "..." : "Use"}
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-muted hover:text-recording"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
