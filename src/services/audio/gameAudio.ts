import {
  defaultAudioSettings,
  loadAudioSettings,
  type AudioSettings
} from "./audioSettings";

export type GameSoundId =
  | "ui-click"
  | "dialog-next"
  | "scanner"
  | "starpoint"
  | "reward"
  | "travel"
  | "louis"
  | "repair-step"
  | "switch"
  | "error"
  | "system-ready"
  | "failure-burst"
  | "coolant-spray"
  | "glitch"
  | "alarm";

export type SoundscapeId =
  | "hangar"
  | "cinder"
  | "moss"
  | "junction-12"
  | "empty-path"
  | "distortion"
  | "glass-coast"
  | "cloud-ocean"
  | "scrap-ring"
  | "heart-of-ways";

type AudioContextWithWebkit = Window & {
  webkitAudioContext?: typeof AudioContext;
};

class GameAudioService {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private settings: AudioSettings = defaultAudioSettings;
  private soundscape: SoundscapeId | null = null;
  private pendingSoundscape: SoundscapeId | null = null;
  private ambienceNodes: AudioNode[] = [];
  private ambienceSources: Array<OscillatorNode | AudioBufferSourceNode> = [];
  private ambienceTimer: number | null = null;
  private ducked = false;
  private voiceActive = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.settings = loadAudioSettings();
    }
  }

  isSupported(): boolean {
    if (typeof window === "undefined") return false;
    const typedWindow = window as AudioContextWithWebkit;
    return Boolean(window.AudioContext || typedWindow.webkitAudioContext);
  }

  async unlock(): Promise<boolean> {
    const context = this.ensureContext();
    if (!context) return false;

    if (context.state !== "running") {
      try {
        await context.resume();
      } catch {
        return false;
      }
    }

    if (this.pendingSoundscape) {
      const next = this.pendingSoundscape;
      this.pendingSoundscape = null;
      this.setSoundscape(next);
    }

    return context.state === "running";
  }

  configure(settings: AudioSettings): void {
    this.settings = settings;
    this.applyMix();
  }

  setDucked(ducked: boolean): void {
    this.ducked = ducked;
    this.applyMix();
  }

  setVoiceActive(active: boolean): void {
    this.voiceActive = active;
    this.applyMix();
  }

  setSoundscape(soundscape: SoundscapeId): void {
    this.soundscape = soundscape;

    const context = this.ensureContext();
    if (!context || context.state !== "running") {
      this.pendingSoundscape = soundscape;
      return;
    }

    this.stopAmbience();
    if (!this.settings.enabled) return;

    switch (soundscape) {
      case "hangar":
        this.startAmbientBed([44], "lowpass", 360, 0.014, 0.008);
        this.ambientPulse(12000, () =>
          this.playTone(310, 0.16, "sine", 0.018, 0, 360)
        );
        break;
      case "cinder":
        this.startAmbientBed([42], "bandpass", 760, 0.062, 0.018, 0.13);
        this.ambientPulse(5200, () => this.playNoiseBurst(0.6, 520, 0.045, "bandpass"));
        break;
      case "moss":
        this.startAmbientBed([128, 192], "lowpass", 1450, 0.025, 0.016);
        this.ambientPulse(4100, () => {
          this.playTone(920, 0.12, "sine", 0.032);
          this.playTone(1240, 0.08, "sine", 0.022, 0.09);
        });
        break;
      case "junction-12":
        this.startAmbientBed([58, 116], "bandpass", 1180, 0.032, 0.026);
        this.ambientPulse(3600, () => {
          this.playTone(660, 0.06, "square", 0.018);
          this.playTone(820, 0.05, "square", 0.014, 0.08);
        });
        break;
      case "empty-path":
        this.startAmbientBed([220, 329.6], "bandpass", 2200, 0.016, 0.012);
        this.ambientPulse(6200, () => this.playTone(1320, 0.65, "sine", 0.018, 0, 990));
        break;
      case "distortion":
        this.startAmbientBed([72, 77, 143], "bandpass", 980, 0.026, 0.018);
        this.ambientPulse(4400, () => this.playTone(310, 0.32, "sawtooth", 0.018, 0, 220));
        break;
      case "glass-coast":
        this.startAmbientBed([196, 392], "highpass", 1700, 0.018, 0.012);
        this.ambientPulse(3300, () => {
          this.playTone(1046.5, 0.32, "sine", 0.028);
          this.playTone(1568, 0.45, "sine", 0.016, 0.1);
        });
        break;
      case "cloud-ocean":
        this.startAmbientBed([52, 104], "bandpass", 620, 0.07, 0.016, 0.09);
        this.ambientPulse(5800, () => this.playNoiseBurst(1.15, 880, 0.036, "bandpass"));
        break;
      case "scrap-ring":
        this.startAmbientBed([46, 92], "bandpass", 840, 0.032, 0.021);
        this.ambientPulse(4700, () => {
          this.playTone(260, 0.05, "square", 0.022);
          this.playTone(510, 0.04, "square", 0.014, 0.12);
        });
        break;
      case "heart-of-ways":
        this.startAmbientBed([44, 66, 132], "lowpass", 640, 0.024, 0.024);
        this.ambientPulse(5200, () => {
          this.playTone(264, 0.6, "sine", 0.022);
          this.playTone(396, 0.7, "sine", 0.016, 0.15);
          this.playTone(528, 0.8, "sine", 0.012, 0.3);
        });
        break;
    }
  }

  play(sound: GameSoundId): void {
    if (!this.settings.enabled) return;
    const context = this.ensureContext();
    if (!context || context.state !== "running") return;

    switch (sound) {
      case "ui-click":
        this.playTone(520, 0.045, "triangle", 0.045, 0, 430);
        break;
      case "dialog-next":
        this.playTone(610, 0.06, "sine", 0.035, 0, 720);
        break;
      case "scanner":
        this.playNoiseBurst(0.52, 1650, 0.085, "bandpass", 0, 360);
        this.playTone(330, 0.42, "sine", 0.055, 0, 1180);
        this.playTone(880, 0.24, "sine", 0.028, 0.18, 1320);
        break;
      case "starpoint":
        this.playTone(392, 0.42, "sine", 0.07);
        this.playTone(523.25, 0.46, "sine", 0.06, 0.09);
        this.playTone(783.99, 0.65, "sine", 0.055, 0.18);
        this.playNoiseBurst(0.18, 2800, 0.025, "highpass", 0.15);
        break;
      case "reward":
        this.playTone(440, 0.18, "triangle", 0.06);
        this.playTone(554.37, 0.2, "triangle", 0.055, 0.12);
        this.playTone(659.25, 0.28, "triangle", 0.05, 0.24);
        break;
      case "travel":
        this.playNoiseBurst(1.3, 520, 0.1, "lowpass", 0, 1450);
        this.playTone(62, 1.25, "sawtooth", 0.07, 0, 112);
        this.playTone(124, 0.85, "sine", 0.04, 0.25, 190);
        break;
      case "louis":
        this.playTone(392, 0.12, "sine", 0.028);
        this.playTone(523.25, 0.16, "sine", 0.022, 0.12);
        break;
      case "repair-step":
        this.playTone(330, 0.08, "triangle", 0.026);
        this.playTone(440, 0.11, "sine", 0.022, 0.07);
        break;
      case "switch":
        this.playTone(260, 0.045, "sine", 0.022);
        this.playTone(390, 0.055, "sine", 0.018, 0.045);
        break;
      case "error":
        this.playTone(180, 0.12, "sine", 0.022, 0, 150);
        break;
      case "system-ready":
        this.playTone(392, 0.16, "sine", 0.032);
        this.playTone(523.25, 0.18, "sine", 0.03, 0.12);
        this.playTone(659.25, 0.22, "sine", 0.028, 0.24);
        break;
      case "failure-burst":
        this.playNoiseBurst(0.34, 980, 0.08, "bandpass");
        this.playTone(118, 0.24, "sawtooth", 0.04, 0, 72);
        this.playTone(340, 0.09, "square", 0.022, 0.05, 180);
        break;
      case "coolant-spray":
        this.playNoiseBurst(0.58, 1850, 0.055, "highpass", 0, 820);
        this.playTone(210, 0.18, "triangle", 0.02, 0.06, 150);
        break;
      case "glitch":
        this.playTone(760, 0.05, "square", 0.02, 0, 310);
        this.playTone(410, 0.07, "square", 0.018, 0.09, 930);
        this.playNoiseBurst(0.22, 2100, 0.025, "bandpass", 0.05, 420);
        break;
      case "alarm":
        this.playTone(270, 0.12, "square", 0.026);
        this.playTone(220, 0.14, "square", 0.022, 0.15);
        break;
    }
  }

  stopAll(): void {
    this.stopAmbience();
    if (this.context) {
      this.context.suspend().catch(() => undefined);
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    if (!this.isSupported() || typeof window === "undefined") return null;

    const typedWindow = window as AudioContextWithWebkit;
    const ContextCtor = window.AudioContext ?? typedWindow.webkitAudioContext;
    if (!ContextCtor) return null;

    const context = new ContextCtor();
    const master = context.createGain();
    const ambience = context.createGain();
    const effects = context.createGain();

    ambience.connect(master);
    effects.connect(master);
    master.connect(context.destination);

    this.context = context;
    this.masterGain = master;
    this.ambienceGain = ambience;
    this.effectsGain = effects;
    this.applyMix();

    return context;
  }

  private applyMix(): void {
    const context = this.context;
    if (!context || !this.masterGain || !this.ambienceGain || !this.effectsGain) {
      return;
    }

    const now = context.currentTime;
    const masterTarget = this.settings.enabled ? this.settings.masterVolume : 0;
    const duckFactor = this.voiceActive ? 0.25 : this.ducked ? 0.42 : 1;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(masterTarget, now + 0.08);

    this.ambienceGain.gain.cancelScheduledValues(now);
    this.ambienceGain.gain.linearRampToValueAtTime(
      this.settings.ambienceVolume * duckFactor,
      now + 0.12
    );

    this.effectsGain.gain.cancelScheduledValues(now);
    this.effectsGain.gain.linearRampToValueAtTime(
      this.settings.effectsVolume,
      now + 0.08
    );
  }

  private stopAmbience(): void {
    if (this.ambienceTimer !== null && typeof window !== "undefined") {
      window.clearInterval(this.ambienceTimer);
      this.ambienceTimer = null;
    }

    for (const source of this.ambienceSources) {
      try {
        source.stop();
      } catch {
        // Node may already have stopped.
      }
    }

    for (const node of this.ambienceNodes) {
      try {
        node.disconnect();
      } catch {
        // Disconnect is best-effort during world changes.
      }
    }

    this.ambienceSources = [];
    this.ambienceNodes = [];
  }

  private startAmbientBed(
    frequencies: readonly number[],
    filterType: BiquadFilterType,
    filterFrequency: number,
    noiseLevel: number,
    oscillatorLevel: number,
    windLfoRate = 0
  ): void {
    const context = this.context;
    const bus = this.ambienceGain;
    if (!context || !bus) return;

    for (const [index, frequency] of frequencies.entries()) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = oscillatorLevel / Math.max(1, frequencies.length);
      oscillator.connect(gain);
      gain.connect(bus);
      oscillator.start();

      this.ambienceSources.push(oscillator);
      this.ambienceNodes.push(gain);
    }

    const source = context.createBufferSource();
    source.buffer = this.createNoiseBuffer(context, 2.4);
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFrequency;
    filter.Q.value = filterType === "bandpass" ? 0.72 : 0.35;

    const noiseGain = context.createGain();
    noiseGain.gain.value = noiseLevel;

    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(bus);
    source.start();

    this.ambienceSources.push(source);
    this.ambienceNodes.push(filter, noiseGain);

    if (windLfoRate > 0) {
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.type = "sine";
      lfo.frequency.value = windLfoRate;
      lfoGain.gain.value = noiseLevel * 0.35;
      lfo.connect(lfoGain);
      lfoGain.connect(noiseGain.gain);
      lfo.start();

      this.ambienceSources.push(lfo);
      this.ambienceNodes.push(lfoGain);
    }
  }

  private ambientPulse(intervalMs: number, callback: () => void): void {
    if (typeof window === "undefined") return;
    this.ambienceTimer = window.setInterval(() => {
      if (
        this.settings.enabled &&
        this.context?.state === "running" &&
        !this.voiceActive
      ) {
        callback();
      }
    }, intervalMs);
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
    endFrequency?: number
  ): void {
    const context = this.context;
    const bus = this.effectsGain;
    if (!context || !bus || context.state !== "running") return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    const end = start + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(20, endFrequency),
        end
      );
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(bus);
    oscillator.start(start);
    oscillator.stop(end + 0.03);
  }

  private playNoiseBurst(
    duration: number,
    filterFrequency: number,
    volume: number,
    filterType: BiquadFilterType,
    delay = 0,
    endFilterFrequency?: number
  ): void {
    const context = this.context;
    const bus = this.effectsGain;
    if (!context || !bus || context.state !== "running") return;

    const source = context.createBufferSource();
    source.buffer = this.createNoiseBuffer(context, Math.max(0.3, duration + 0.1));

    const filter = context.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFrequency;
    filter.Q.value = filterType === "bandpass" ? 1.1 : 0.55;

    const gain = context.createGain();
    const start = context.currentTime + delay;
    const end = start + duration;

    if (endFilterFrequency) {
      filter.frequency.setValueAtTime(filterFrequency, start);
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(30, endFilterFrequency),
        end
      );
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    source.start(start);
    source.stop(end + 0.03);
  }

  private createNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
    const length = Math.ceil(context.sampleRate * seconds);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);

    let previous = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.86 + white * 0.14;
      channel[i] = previous;
    }

    return buffer;
  }
}

export const gameAudio = new GameAudioService();
