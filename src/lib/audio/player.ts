export interface TrackAudio {
  id: string;
  buffer: AudioBuffer | null;
  volume: number;
  isMuted: boolean;
  url: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
}

export class MultiTrackPlayer {
  private audioContext: AudioContext | null = null;
  private tracks: Map<string, TrackAudio> = new Map();
  private sourceNodes: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private masterGain: GainNode | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private onTimeUpdate?: (time: number) => void;
  private animationFrameId: number | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  async loadTrack(id: string, url: string, volume: number = 1, isMuted: boolean = false): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Create gain node for this track
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = isMuted ? 0 : volume;
      gainNode.connect(this.masterGain!);

      this.gainNodes.set(id, gainNode);
      this.tracks.set(id, {
        id,
        buffer: audioBuffer,
        volume,
        isMuted,
        url,
      });
    } catch (error) {
      console.error(`Failed to load track ${id}:`, error);
      throw error;
    }
  }

  unloadTrack(id: string): void {
    const sourceNode = this.sourceNodes.get(id);
    if (sourceNode) {
      try {
        sourceNode.stop();
      } catch {
        // Ignore if already stopped
      }
      sourceNode.disconnect();
      this.sourceNodes.delete(id);
    }

    const gainNode = this.gainNodes.get(id);
    if (gainNode) {
      gainNode.disconnect();
      this.gainNodes.delete(id);
    }

    this.tracks.delete(id);
  }

  play(startOffset: number = 0): void {
    if (!this.audioContext || this.isPlaying) return;

    // Resume audio context if suspended
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    const offset = startOffset || this.pauseTime;
    this.startTime = this.audioContext.currentTime - offset;

    // Create and start source nodes for all tracks
    this.tracks.forEach((track, id) => {
      if (!track.buffer) return;

      const sourceNode = this.audioContext!.createBufferSource();
      sourceNode.buffer = track.buffer;

      const gainNode = this.gainNodes.get(id);
      if (gainNode) {
        sourceNode.connect(gainNode);
      }

      sourceNode.start(0, offset);
      this.sourceNodes.set(id, sourceNode);

      // Handle track end
      sourceNode.onended = () => {
        if (this.isPlaying) {
          this.sourceNodes.delete(id);
          // Check if all tracks have ended
          if (this.sourceNodes.size === 0) {
            this.stop();
          }
        }
      };
    });

    this.isPlaying = true;
    this.startTimeUpdate();
  }

  pause(): void {
    if (!this.audioContext || !this.isPlaying) return;

    this.pauseTime = this.getCurrentTime();

    // Stop all source nodes
    this.sourceNodes.forEach((sourceNode) => {
      try {
        sourceNode.stop();
      } catch {
        // Ignore if already stopped
      }
      sourceNode.disconnect();
    });
    this.sourceNodes.clear();

    this.isPlaying = false;
    this.stopTimeUpdate();
  }

  stop(): void {
    if (!this.audioContext) return;

    // Stop all source nodes
    this.sourceNodes.forEach((sourceNode) => {
      try {
        sourceNode.stop();
      } catch {
        // Ignore if already stopped
      }
      sourceNode.disconnect();
    });
    this.sourceNodes.clear();

    this.isPlaying = false;
    this.pauseTime = 0;
    this.stopTimeUpdate();
    this.onTimeUpdate?.(0);
  }

  seek(time: number): void {
    const wasPlaying = this.isPlaying;

    if (wasPlaying) {
      this.pause();
    }

    this.pauseTime = time;

    if (wasPlaying) {
      this.play(time);
    } else {
      this.onTimeUpdate?.(time);
    }
  }

  setTrackVolume(id: string, volume: number): void {
    const track = this.tracks.get(id);
    if (track) {
      track.volume = volume;
      const gainNode = this.gainNodes.get(id);
      if (gainNode && !track.isMuted) {
        gainNode.gain.value = volume;
      }
    }
  }

  setTrackMuted(id: string, isMuted: boolean): void {
    const track = this.tracks.get(id);
    if (track) {
      track.isMuted = isMuted;
      const gainNode = this.gainNodes.get(id);
      if (gainNode) {
        gainNode.gain.value = isMuted ? 0 : track.volume;
      }
    }
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  getCurrentTime(): number {
    if (!this.audioContext || !this.isPlaying) {
      return this.pauseTime;
    }
    return this.audioContext.currentTime - this.startTime;
  }

  getDuration(): number {
    let maxDuration = 0;
    this.tracks.forEach((track) => {
      if (track.buffer && track.buffer.duration > maxDuration) {
        maxDuration = track.buffer.duration;
      }
    });
    return maxDuration;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  setOnTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdate = callback;
  }

  private startTimeUpdate(): void {
    const update = () => {
      if (this.isPlaying) {
        this.onTimeUpdate?.(this.getCurrentTime());
        this.animationFrameId = requestAnimationFrame(update);
      }
    };
    update();
  }

  private stopTimeUpdate(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.tracks.clear();
    this.gainNodes.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
