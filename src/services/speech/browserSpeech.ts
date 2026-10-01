export type SpeakOptions = {
  rate?: number;
  lang?: string;
  pitch?: number;
};

class BrowserSpeechService {
  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  speak(text: string, options: SpeakOptions = {}): boolean {
    if (!this.isSupported() || !text.trim()) {
      return false;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang ?? "de-DE";
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.05;

    const voices = window.speechSynthesis.getVoices();
    const germanVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("de"));
    const preferred =
      germanVoices.find((voice) => voice.localService) ??
      germanVoices.find((voice) => voice.default) ??
      germanVoices[0];

    if (preferred) {
      utterance.voice = preferred;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  }

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const browserSpeech = new BrowserSpeechService();
