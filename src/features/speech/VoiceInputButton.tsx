import { useEffect, useRef, useState } from "react";
import { browserSpeechRecognition } from "../../services/speech/browserSpeechRecognition";

type VoiceInputButtonProps = {
  onTranscript: (text: string) => void;
  onVoiceUsed?: () => void;
};

export function VoiceInputButton({ onTranscript, onVoiceUsed }: VoiceInputButtonProps) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => stopRef.current?.();
  }, []);

  if (!browserSpeechRecognition.isSupported()) {
    return (
      <span className="voice-fallback">
        Mikrofon hier nicht verfügbar – du kannst die Diktierfunktion deiner Tastatur benutzen.
      </span>
    );
  }

  const start = () => {
    setError("");
    setListening(true);
    onVoiceUsed?.();

    stopRef.current = browserSpeechRecognition.start({
      onTranscript: (text) => {
        onTranscript(text);
      },
      onError: (message) => {
        setError(message);
      },
      onEnd: () => {
        setListening(false);
        stopRef.current = null;
      }
    });
  };

  return (
    <div className="voice-input">
      <button
        type="button"
        className={listening ? "speech-button listening" : "speech-button"}
        aria-pressed={listening}
        onClick={() => {
          if (listening) {
            stopRef.current?.();
            return;
          }
          start();
        }}
      >
        {listening ? "● Ich höre zu …" : "🎙️ Erzählen"}
      </button>
      {error && <span className="voice-error">{error}</span>}
    </div>
  );
}
