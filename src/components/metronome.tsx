"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMetronome } from "@/hooks/useMetronome";
import { Play, Pause, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetronomeProps {
  initialTempo?: number;
  onTempoChange?: (tempo: number) => void;
  className?: string;
}

export function MetronomeControl({ initialTempo = 120, onTempoChange, className }: MetronomeProps) {
  const {
    isPlaying,
    tempo,
    currentBeat,
    beatsPerMeasure,
    toggle,
    setTempo,
    increaseTempo,
    decreaseTempo,
  } = useMetronome({ initialTempo, beatsPerMeasure: 4 });

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    onTempoChange?.(newTempo);
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Beat indicators */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              currentBeat === i
                ? i === 0
                  ? "bg-accent"
                  : "bg-success"
                : "bg-border"
            )}
            animate={
              currentBeat === i
                ? { scale: [1, 1.3, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* Play/Pause button */}
      <Button
        variant={isPlaying ? "destructive" : "outline"}
        size="icon-sm"
        onClick={toggle}
        className="shrink-0"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      {/* Tempo controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleTempoChange(tempo - 5)}
          disabled={tempo <= 20}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={tempo}
            onChange={(e) => handleTempoChange(parseInt(e.target.value) || 120)}
            className="w-16 h-8 text-center text-sm px-1"
            min={20}
            max={300}
          />
          <span className="text-xs text-muted">BPM</span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleTempoChange(tempo + 5)}
          disabled={tempo >= 300}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
