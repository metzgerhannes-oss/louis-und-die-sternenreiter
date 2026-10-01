type RecognitionAlternativeLike = {
  transcript: string;
};

type RecognitionResultLike = {
  0: RecognitionAlternativeLike;
  length: number;
};

type RecognitionResultListLike = {
  0: RecognitionResultLike;
  length: number;
};

type RecognitionEventLike = Event & {
  results: RecognitionResultListLike;
};

type RecognitionErrorEventLike = Event & {
  error?: string;
};

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type RecognitionConstructor = new () => RecognitionLike;

type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

export type RecognitionCallbacks = {
  onTranscript: (transcript: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
};

class BrowserSpeechRecognitionService {
  private getConstructor(): RecognitionConstructor | null {
    if (typeof window === "undefined") {
      return null;
    }

    const speechWindow = window as SpeechWindow;
    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
  }

  isSupported(): boolean {
    return this.getConstructor() !== null;
  }

  start(callbacks: RecognitionCallbacks): (() => void) | null {
    const Recognition = this.getConstructor();
    if (!Recognition) {
      return null;
    }

    const recognition = new Recognition();
    recognition.lang = "de-DE";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (transcript) {
        callbacks.onTranscript(transcript);
      }
    };

    recognition.onerror = (event) => {
      const error = event.error ?? "unbekannt";
      callbacks.onError(`Spracherkennung nicht möglich (${error}).`);
    };

    recognition.onend = callbacks.onEnd;
    recognition.start();

    return () => {
      recognition.abort();
    };
  }
}

export const browserSpeechRecognition = new BrowserSpeechRecognitionService();
