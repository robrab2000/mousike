export type AudioFormat = "webm" | "wav";

export interface RecorderOptions {
  format: AudioFormat;
  onDataAvailable?: (blob: Blob) => void;
  onStop?: (blob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
  onLevelUpdate?: (level: number) => void;
}

export interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  level: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private format: AudioFormat;
  private options: RecorderOptions;
  private animationFrameId: number | null = null;

  constructor(options: RecorderOptions) {
    this.options = options;
    this.format = options.format;
  }

  async initialize(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      const mimeType = this.getMimeType();
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
          this.options.onDataAvailable?.(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const blob = await this.createBlob();
        const duration = (Date.now() - this.startTime) / 1000;
        this.options.onStop?.(blob, duration);
        this.stopLevelMonitoring();
      };

      this.mediaRecorder.onerror = () => {
        this.options.onError?.(new Error("MediaRecorder error"));
      };
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private getMimeType(): string {
    if (this.format === "webm") {
      return "audio/webm;codecs=opus";
    }
    return "audio/wav";
  }

  private async createBlob(): Promise<Blob> {
    const mimeType = this.getMimeType();
    const blob = new Blob(this.chunks, { type: mimeType });

    if (this.format === "wav") {
      return this.convertToWav(blob);
    }

    return blob;
  }

  private async convertToWav(blob: Blob): Promise<Blob> {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();

    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const wavBuffer = this.encodeWav(audioBuffer);
      return new Blob([wavBuffer], { type: "audio/wav" });
    } catch {
      // If decoding fails, return original blob
      return blob;
    }
  }

  private encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = audioBuffer.length * blockAlign;
    const bufferSize = 44 + dataSize;

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // RIFF header
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, "WAVE");

    // fmt chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += bytesPerSample;
      }
    }

    return buffer;
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  start(): void {
    if (!this.mediaRecorder) {
      throw new Error("Recorder not initialized");
    }

    this.chunks = [];
    this.startTime = Date.now();
    this.mediaRecorder.start(100); // Collect data every 100ms
    this.startLevelMonitoring();
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
    }
  }

  private startLevelMonitoring(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedLevel = average / 255;

      this.options.onLevelUpdate?.(normalizedLevel);

      this.animationFrameId = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  private stopLevelMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy(): void {
    this.stopLevelMonitoring();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.mediaRecorder = null;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
  }

  getState(): "inactive" | "recording" | "paused" {
    return this.mediaRecorder?.state || "inactive";
  }
}
