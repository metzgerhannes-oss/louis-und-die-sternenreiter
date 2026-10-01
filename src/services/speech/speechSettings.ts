import type { ProfileId } from "../../domain/profiles";

export type SpeechSettings = {
  autoRead: boolean;
  rate: number;
};

const DEFAULT_SETTINGS: SpeechSettings = {
  autoRead: true,
  rate: 0.95
};

function key(profileId: ProfileId): string {
  return `sternenreiter.speech.${profileId}`;
}

export function loadSpeechSettings(profileId: ProfileId): SpeechSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const raw = window.localStorage.getItem(key(profileId));
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SpeechSettings>;
    return {
      autoRead: typeof parsed.autoRead === "boolean" ? parsed.autoRead : DEFAULT_SETTINGS.autoRead,
      rate:
        typeof parsed.rate === "number" && parsed.rate >= 0.7 && parsed.rate <= 1.3
          ? parsed.rate
          : DEFAULT_SETTINGS.rate
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSpeechSettings(profileId: ProfileId, settings: SpeechSettings): void {
  window.localStorage.setItem(key(profileId), JSON.stringify(settings));
}
