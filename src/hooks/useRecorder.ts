"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AudioRecorder, type AudioFormat } from "@/lib/audio/recorder";

interface UseRecorderOptions {
  format?: AudioFormat;
  onRecordingComplete?: (blob: Blob, duration: number) => void;
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const { format = "webm", onRecordingComplete } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      const recorder = new AudioRecorder({
        format,
        onLevelUpdate: setLevel,
        onStop: (blob, dur) => {
          setIsRecording(false);
          setIsPaused(false);
          setLevel(0);
          onRecordingComplete?.(blob, dur);
        },
        onError: (err) => {
          setError(err.message);
          setIsRecording(false);
        },
      });

      await recorder.initialize();
      recorderRef.current = recorder;
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize recorder");
      setIsInitialized(false);
    }
  }, [format, onRecordingComplete]);

  const startRecording = useCallback(async () => {
    if (!recorderRef.current) {
      await initialize();
    }

    if (recorderRef.current) {
      recorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
      setDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    }
  }, [initialize]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.pause();
      setIsPaused(true);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.resume();
      setIsPaused(false);

      const pausedDuration = duration;
      startTimeRef.current = Date.now() - pausedDuration * 1000;

      durationIntervalRef.current = setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    }
  }, [duration]);

  const cleanup = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.destroy();
      recorderRef.current = null;
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setIsInitialized(false);
    setIsRecording(false);
    setIsPaused(false);
    setLevel(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    isPaused,
    level,
    duration,
    error,
    isInitialized,
    initialize,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cleanup,
  };
}
