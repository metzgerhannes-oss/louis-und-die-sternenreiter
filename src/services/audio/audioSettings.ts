export type AudioSettings = {
  enabled: boolean;
  masterVolume: number;
  ambienceVolume: number;
  effectsVolume: number;
};

const STORAGE_KEY = "sternenreiter.audio";

export const defaultAudioSettings: AudioSettings = {
  enabled: true,
  masterVolume: 0.72,
  ambienceVolume: 0.38,
  effectsVolume: 0.72
};

function clamp(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

export function loadAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return defaultAudioSettings;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAudioSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      enabled:
        typeof parsed.enabled === "boolean"
          ? parsed.enabled
          : defaultAudioSettings.enabled,
      masterVolume: clamp(
        Number(parsed.masterVolume),
        defaultAudioSettings.masterVolume
      ),
      ambienceVolume: clamp(
        Number(parsed.ambienceVolume),
        defaultAudioSettings.ambienceVolume
      ),
      effectsVolume: clamp(
        Number(parsed.effectsVolume),
        defaultAudioSettings.effectsVolume
      )
    };
  } catch {
    return defaultAudioSettings;
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("sternenreiter:audio-settings"));
}
