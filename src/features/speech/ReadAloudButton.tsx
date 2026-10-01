import { browserSpeech } from "../../services/speech/browserSpeech";

type ReadAloudButtonProps = {
  text: string;
  rate?: number;
};

export function ReadAloudButton({ text, rate = 0.95 }: ReadAloudButtonProps) {
  if (!browserSpeech.isSupported()) {
    return null;
  }

  return (
    <button
      type="button"
      className="speech-button"
      onClick={() => browserSpeech.speak(text, { rate })}
      aria-label="Text vorlesen"
    >
      🔊 Vorlesen
    </button>
  );
}
