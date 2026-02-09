"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MultiTrackPlayer } from "@/lib/audio/player";

interface Track {
  id: string;
  url: string;
  volume: number;
  isMuted: boolean;
}

export function useMultiTrackPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedTracks, setLoadedTracks] = useState<Set<string>>(new Set());

  const playerRef = useRef<MultiTrackPlayer | null>(null);

  useEffect(() => {
    playerRef.current = new MultiTrackPlayer();
    playerRef.current.setOnTimeUpdate((time) => {
      setCurrentTime(time);
    });

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  const loadTrack = useCallback(async (track: Track) => {
    if (!playerRef.current) return;

    setIsLoading(true);
    try {
      await playerRef.current.loadTrack(
        track.id,
        track.url,
        track.volume / 100,
        track.isMuted
      );
      setLoadedTracks((prev) => new Set([...prev, track.id]));
      setDuration(playerRef.current.getDuration());
    } catch (error) {
      console.error("Failed to load track:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTracks = useCallback(async (tracks: Track[]) => {
    setIsLoading(true);
    try {
      await Promise.all(tracks.map((track) => loadTrack(track)));
    } finally {
      setIsLoading(false);
    }
  }, [loadTrack]);

  const unloadTrack = useCallback((id: string) => {
    if (!playerRef.current) return;
    playerRef.current.unloadTrack(id);
    setLoadedTracks((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDuration(playerRef.current.getDuration());
  }, []);

  const play = useCallback((startOffset?: number) => {
    if (!playerRef.current) return;
    playerRef.current.play(startOffset);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const seek = useCallback((time: number) => {
    if (!playerRef.current) return;
    playerRef.current.seek(time);
    setCurrentTime(time);
  }, []);

  const setTrackVolume = useCallback((id: string, volume: number) => {
    if (!playerRef.current) return;
    playerRef.current.setTrackVolume(id, volume / 100);
  }, []);

  const setTrackMuted = useCallback((id: string, isMuted: boolean) => {
    if (!playerRef.current) return;
    playerRef.current.setTrackMuted(id, isMuted);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    loadedTracks,
    loadTrack,
    loadTracks,
    unloadTrack,
    play,
    pause,
    stop,
    seek,
    setTrackVolume,
    setTrackMuted,
    togglePlay,
  };
}
