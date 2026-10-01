import { gameAudio } from "../audio/gameAudio";
import {
  asVoiceRole,
  coreVoiceRoles,
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

function voiceKey(voice: SpeechSynthesisVoice): string {
  return voice.voiceURI || `${voice.lang}:${voice.name}`;
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
  if (voice.default) score += 5;

  profile.preferredNames.forEach((name, index) => {
    if (normalizedName.includes(normalize(name))) {
      score += 60 - index * 5;
    }
  });

  if (/premium|enhanced|natural|neural/.test(normalizedName)) score += 24;
  if (/compact/.test(normalizedName)) score -= 10;

  return score;
}

class BrowserSpeechService {
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private initialized = false;
  private readonly assignedVoices = new Map<VoiceRole, SpeechSynthesisVoice>();
  private assignmentLanguage = "";

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  prepare(): void {
    if (!this.isSupported() || this.initialized) return;
    this.initialized = true;

    const refresh = () => {
      this.cachedVoices = window.speechSynthesis.getVoices();
      this.assignedVoices.clear();
      this.assignmentLanguage = "";
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
      Math.min(1.3, baseRate * profile.rateMultiplier)
    );
    utterance.pitch = Math.max(
      0.55,
      Math.min(1.5, options.pitch ?? profile.pitch)
    );
    utterance.volume = Math.max(0, Math.min(1, options.volume ?? 1));

    const best = this.resolveVoice(role, lang);
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

  getAssignedVoiceName(roleValue: VoiceRole | string, lang = "de-DE"): string {
    if (!this.isSupported()) return "nicht verfügbar";
    this.prepare();
    const role = asVoiceRole(roleValue);
    const voice = this.resolveVoice(role, lang);
    return voice?.name ?? "Systemstimme";
  }

  private resolveVoice(
    role: VoiceRole,
    lang: string
  ): SpeechSynthesisVoice | undefined {
    const voices =
      this.cachedVoices.length > 0
        ? this.cachedVoices
        : window.speechSynthesis.getVoices();

    if (voices.length === 0) return undefined;

    if (coreVoiceRoles.includes(role)) {
      this.assignCoreVoices(voices, lang);
      return this.assignedVoices.get(role);
    }

    return this.rankVoices(voices, role, lang)[0];
  }

  private assignCoreVoices(
    voices: SpeechSynthesisVoice[],
    lang: string
  ): void {
    const languageKey = normalize(lang).slice(0, 2);
    if (
      this.assignmentLanguage === languageKey &&
      coreVoiceRoles.every((role) => this.assignedVoices.has(role))
    ) {
      return;
    }

    this.assignmentLanguage = languageKey;
    for (const role of coreVoiceRoles) {
      this.assignedVoices.delete(role);
    }

    const languageVoices = voices.filter((voice) =>
      normalize(voice.lang).startsWith(languageKey)
    );
    const pool = languageVoices.length > 0 ? languageVoices : voices;
    const used = new Set<string>();

    for (const role of coreVoiceRoles) {
      const unused = pool.filter((voice) => !used.has(voiceKey(voice)));
      const candidates = unused.length > 0 ? unused : pool;
      const selected = this.rankVoices(candidates, role, lang)[0];

      if (selected) {
        this.assignedVoices.set(role, selected);
        used.add(voiceKey(selected));
      }
    }
  }

  private rankVoices(
    voices: SpeechSynthesisVoice[],
    role: VoiceRole,
    lang: string
  ): SpeechSynthesisVoice[] {
    return [...voices].sort(
      (a, b) => scoreVoice(b, role, lang) - scoreVoice(a, role, lang)
    );
  }
}

export const browserSpeech = new BrowserSpeechService();
