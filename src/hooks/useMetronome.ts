"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Metronome } from "@/lib/audio/metronome";

interface UseMetronomeOptions {
  initialTempo?: number;
  beatsPerMeasure?: number;
}

export function useMetronome(options: UseMetronomeOptions = {}) {
  const { initialTempo = 120, beatsPerMeasure = 4 } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempoState] = useState(initialTempo);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const metronomeRef = useRef<Metronome | null>(null);

  useEffect(() => {
    metronomeRef.current = new Metronome({
      tempo: initialTempo,
      beatsPerMeasure,
      onBeat: (beat) => {
        setCurrentBeat(beat);
      },
    });

    return () => {
      metronomeRef.current?.destroy();
    };
  }, [initialTempo, beatsPerMeasure]);

  const start = useCallback(() => {
    metronomeRef.current?.start();
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    metronomeRef.current?.stop();
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  const setTempo = useCallback((newTempo: number) => {
    const clampedTempo = Math.max(20, Math.min(300, newTempo));
    setTempoState(clampedTempo);
    metronomeRef.current?.setTempo(clampedTempo);
  }, []);

  const increaseTempo = useCallback((amount: number = 5) => {
    setTempo(tempo + amount);
  }, [tempo, setTempo]);

  const decreaseTempo = useCallback((amount: number = 5) => {
    setTempo(tempo - amount);
  }, [tempo, setTempo]);

  return {
    isPlaying,
    tempo,
    currentBeat,
    beatsPerMeasure,
    start,
    stop,
    toggle,
    setTempo,
    increaseTempo,
    decreaseTempo,
  };
}
