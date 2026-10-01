import { gameAudio } from "../audio/gameAudio";
import {
  asVoiceRole,
  voiceProfiles,
  type VoiceRole
} from "./characterVoices";

export type SpeakOptions = {
  rate?: number;
  lang?: string;
  pitch?: number;
  volume?: number;
  speaker?: VoiceRole | string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[-_]/g, " ");
}

function scoreVoice(
  voice: SpeechSynthesisVoice,
  role: VoiceRole,
  lang: string
): number {
  const profile = voiceProfiles[role];
  const normalizedName = normalize(voice.name);
  const normalizedLang = normalize(voice.lang);
  const targetLang = normalize(lang).slice(0, 2);

  let score = 0;

  if (normalizedLang.startsWith(targetLang)) score += 100;
  if (voice.localService) score += 18;
  if (voice.default) score += 8;

  profile.preferredNames.forEach((name, index) => {
    if (normalizedName.includes(normalize(name))) {
      score += 48 - index * 4;
    }
  });

  if (/premium|enhanced|natural|neural/.test(normalizedName)) score += 22;
  if (/compact/.test(normalizedName)) score -= 8;

  return score;
}

class BrowserSpeechService {
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private initialized = false;

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  prepare(): void {
    if (!this.isSupported() || this.initialized) return;
    this.initialized = true;

    const refresh = () => {
      this.cachedVoices = window.speechSynthesis.getVoices();
    };

    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
  }

  speak(text: string, options: SpeakOptions = {}): boolean {
    if (!this.isSupported() || !text.trim()) return false;

    this.prepare();
    window.speechSynthesis.cancel();

    const role = asVoiceRole(options.speaker);
    const profile = voiceProfiles[role];
    const lang = options.lang ?? "de-DE";
    const baseRate = options.rate ?? 0.95;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = Math.max(
      0.65,
      Math.min(1.25, baseRate * profile.rateMultiplier)
    );
    utterance.pitch = Math.max(
      0.55,
      Math.min(1.45, options.pitch ?? profile.pitch)
    );
    utterance.volume = Math.max(0, Math.min(1, options.volume ?? 1));

    const voices =
      this.cachedVoices.length > 0
        ? this.cachedVoices
        : window.speechSynthesis.getVoices();

    const best = voices
      .filter((voice) =>
        normalize(voice.lang).startsWith(normalize(lang).slice(0, 2))
      )
      .map((voice) => ({
        voice,
        score: scoreVoice(voice, role, lang)
      }))
      .sort((a, b) => b.score - a.score)[0]?.voice;

    if (best) utterance.voice = best;

    utterance.onstart = () => gameAudio.setVoiceActive(true);
    utterance.onend = () => gameAudio.setVoiceActive(false);
    utterance.onerror = () => gameAudio.setVoiceActive(false);

    window.speechSynthesis.speak(utterance);
    return true;
  }

  stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    gameAudio.setVoiceActive(false);
  }
}

export const browserSpeech = new BrowserSpeechService();
