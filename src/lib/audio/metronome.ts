export interface MetronomeOptions {
  tempo: number;
  beatsPerMeasure?: number;
  onBeat?: (beat: number) => void;
}

export class Metronome {
  private audioContext: AudioContext | null = null;
  private tempo: number;
  private beatsPerMeasure: number;
  private isPlaying: boolean = false;
  private currentBeat: number = 0;
  private nextBeatTime: number = 0;
  private schedulerTimerId: number | null = null;
  private onBeat?: (beat: number) => void;

  // How far ahead to schedule audio (seconds)
  private scheduleAheadTime = 0.1;
  // How often to call the scheduler (milliseconds)
  private schedulerInterval = 25;

  constructor(options: MetronomeOptions) {
    this.tempo = options.tempo;
    this.beatsPerMeasure = options.beatsPerMeasure || 4;
    this.onBeat = options.onBeat;

    if (typeof window !== "undefined") {
      this.audioContext = new AudioContext();
    }
  }

  private getSecondsPerBeat(): number {
    return 60.0 / this.tempo;
  }

  private scheduleNote(time: number, beat: number): void {
    if (!this.audioContext) return;

    // Create oscillator for click sound
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // First beat of measure is higher pitch
    const isDownbeat = beat === 0;
    osc.frequency.value = isDownbeat ? 1000 : 800;

    // Short click envelope
    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);

    // Trigger visual callback
    const msUntilBeat = (time - this.audioContext.currentTime) * 1000;
    setTimeout(() => {
      this.onBeat?.(beat);
    }, Math.max(0, msUntilBeat));
  }

  private scheduler(): void {
    if (!this.audioContext || !this.isPlaying) return;

    // Schedule all beats that fall within the schedule window
    while (this.nextBeatTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextBeatTime, this.currentBeat);
      this.nextBeatTime += this.getSecondsPerBeat();
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    }
  }

  start(): void {
    if (this.isPlaying || !this.audioContext) return;

    // Resume audio context if suspended
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextBeatTime = this.audioContext.currentTime;

    this.scheduler();
    this.schedulerTimerId = window.setInterval(() => this.scheduler(), this.schedulerInterval);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.schedulerTimerId !== null) {
      clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
    this.currentBeat = 0;
  }

  setTempo(tempo: number): void {
    this.tempo = Math.max(20, Math.min(300, tempo));
  }

  getTempo(): number {
    return this.tempo;
  }

  setBeatsPerMeasure(beats: number): void {
    this.beatsPerMeasure = beats;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  destroy(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
